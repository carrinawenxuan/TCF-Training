import type { AnyQuestion, QuestionSource, QuestionStatus } from "@/types/question";

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  autoFixable: string[];
}

const REQUIRED_TOP_LEVEL = ["id", "module", "level", "question", "options", "correctAnswer", "assist"] as const;
const REQUIRED_ASSIST = ["questionTranslation", "keyVocabulary"] as const;
const OPTIONAL_ASSIST = ["optionTranslations", "passageTranslation", "wordByWord", "grammarNotes"] as const;
const MIN_OPTIONS = 3;

/**
 * 校验题目 JSON。用户粘贴的设为 screenshot_import + approved；API 生成的由调用方设置。
 */
export function validateQuestion(
  raw: unknown,
  options: { setSourceAsScreenshotImport?: boolean } = {}
): { data: AnyQuestion | null; result: ValidationResult } {
  const result: ValidationResult = {
    isValid: true,
    errors: [],
    warnings: [],
    autoFixable: [],
  };

  if (raw === null || typeof raw !== "object") {
    result.isValid = false;
    result.errors.push("输入不是有效的 JSON 对象");
    return { data: null, result };
  }

  const obj = raw as Record<string, unknown>;

  // 必填顶层字段
  for (const key of REQUIRED_TOP_LEVEL) {
    if (!(key in obj) || obj[key] === undefined) {
      result.isValid = false;
      result.errors.push(`缺少必填字段: ${key}`);
    }
  }

  if (!result.isValid) return { data: null, result };

  const optionsArr = obj.options as unknown;
  if (!Array.isArray(optionsArr) || optionsArr.length < MIN_OPTIONS) {
    result.isValid = false;
    result.errors.push(`options 至少需要 ${MIN_OPTIONS} 个选项`);
  }

  const correctAnswer = obj.correctAnswer as string;
  if (optionsArr && Array.isArray(optionsArr)) {
    const ids = (optionsArr as { id?: string }[]).map((o) => o?.id).filter(Boolean);
    if (correctAnswer && !ids.includes(correctAnswer)) {
      result.isValid = false;
      result.errors.push(`correctAnswer "${correctAnswer}" 不在 options 的 id 中`);
    }
  }

  const assist = obj.assist as Record<string, unknown> | undefined;
  if (!assist || typeof assist !== "object") {
    result.isValid = false;
    result.errors.push("缺少 assist 对象（A1 用户必需）");
  } else {
    for (const key of REQUIRED_ASSIST) {
      if (!(key in assist) || assist[key] === undefined) {
        result.isValid = false;
        result.errors.push(`assist 缺少必填: ${key}`);
      }
    }
    if (!Array.isArray(assist.keyVocabulary)) {
      result.isValid = false;
      result.errors.push("assist.keyVocabulary 必须为数组");
    }
    for (const key of OPTIONAL_ASSIST) {
      if (!(key in assist) || assist[key] === undefined) result.autoFixable.push(`assist.${key}`);
    }
  }

  if (!(obj.explanation as string)?.trim()) result.autoFixable.push("explanation");
  if (obj.module === "CO" && !(obj as Record<string, unknown>).distractorAnalysis)
    result.autoFixable.push("distractorAnalysis");

  if (!result.isValid) return { data: null, result };

  // 建议有但可自动补全
  if (!(assist?.optionTranslations as string[] | undefined)?.length) result.warnings.push("建议补全 assist.optionTranslations");
  if (!(assist?.wordByWord as unknown[] | undefined)?.length) result.warnings.push("建议补全 assist.wordByWord");
  if (!(assist?.grammarNotes as unknown[] | undefined)?.length) result.warnings.push("建议补全 assist.grammarNotes");

  // 规范化 source / status（用户粘贴的题目）
  const normalized = { ...obj } as Record<string, unknown>;
  if (options.setSourceAsScreenshotImport) {
    normalized.source = "screenshot_import" as QuestionSource;
    normalized.status = "approved" as QuestionStatus;
  }
  if (!normalized.source) normalized.source = "screenshot_import" as QuestionSource;
  if (!normalized.status) normalized.status = "approved" as QuestionStatus;
  if (!normalized.createdAt) normalized.createdAt = new Date().toISOString();
  if (!normalized.sourceNote) normalized.sourceNote = "";
  if (!normalized.tags) normalized.tags = [];
  if (!normalized.knowledgePoints) normalized.knowledgePoints = [];
  if (typeof normalized.difficulty !== "number") normalized.difficulty = 5;

  return { data: normalized as AnyQuestion, result };
}

/**
 * 解析可能为单题或题目数组的 JSON 字符串
 */
export function parseImportJson(
  jsonString: string,
  setSourceAsScreenshotImport: boolean
): { questions: AnyQuestion[]; results: ValidationResult[] } {
  const questions: AnyQuestion[] = [];
  const results: ValidationResult[] = [];
  let parsed: unknown;
  try {
    parsed = JSON.parse(jsonString);
  } catch {
    return {
      questions: [],
      results: [{ isValid: false, errors: ["JSON 解析失败"], warnings: [], autoFixable: [] }],
    };
  }

  const arr = Array.isArray(parsed) ? parsed : [parsed];
  for (const item of arr) {
    const { data, result } = validateQuestion(item, { setSourceAsScreenshotImport });
    results.push(result);
    if (data) questions.push(data);
  }
  return { questions, results };
}
