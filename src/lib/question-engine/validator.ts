import type { AnyQuestion, QuestionSource, QuestionStatus } from "@/types/question";

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  autoFixable: string[];
}

const BASE_REQUIRED = [
  "id",
  "module",
  "level",
  "tags",
  "knowledgePoints",
  "difficulty",
  "source",
  "status",
  "sourceNote",
  "explanation",
  "createdAt",
  "assist",
] as const;

function hasValue(v: unknown): boolean {
  if (v === undefined || v === null) return false;
  if (typeof v === "string" && v.trim() === "") return false;
  return true;
}

function validateListening(
  obj: Record<string, unknown>,
  errors: string[],
  warnings: string[]
): void {
  const required = [
    "audioText",
    "transcript",
    "question",
    "options",
    "correctAnswer",
    "distractorAnalysis",
  ];
  for (const f of required) {
    if (!hasValue(obj[f])) errors.push(`听力题缺少: ${f}`);
  }
  const optionsArr = obj.options as unknown;
  if (Array.isArray(optionsArr) && optionsArr.length < 3) {
    errors.push("选项不足3个");
  }
  if (Array.isArray(optionsArr) && obj.correctAnswer) {
    const validIds = (optionsArr as { id?: string }[]).map((o) => o?.id).filter(Boolean);
    if (!validIds.includes(obj.correctAnswer as string)) {
      errors.push(`correctAnswer "${obj.correctAnswer}" 不在选项中`);
    }
  }
  const assist = obj.assist as Record<string, unknown> | undefined;
  if (assist && typeof assist === "object") {
    if (!(assist.optionTranslations as unknown[]?.length)) {
      errors.push("听力题缺少 assist.optionTranslations");
    }
    if (!hasValue(assist.passageTranslation)) {
      errors.push("听力题缺少 assist.passageTranslation（对话翻译）");
    }
  }
  const transcript = obj.transcript as unknown[] | undefined;
  if (Array.isArray(transcript)) {
    const missing = transcript.some(
      (t: { translation?: string }) => !(t && hasValue(t.translation))
    );
    if (missing) warnings.push("部分 transcript 段落缺少 translation");
  }
}

function validateReading(
  obj: Record<string, unknown>,
  errors: string[],
  warnings: string[]
): void {
  const required = ["passage", "passageType", "question", "options", "correctAnswer", "synonymMap", "distractorAnalysis"];
  for (const f of required) {
    if (!(f in obj) || obj[f] === undefined) errors.push(`阅读题缺少: ${f}`);
  }
  const optionsArr = obj.options as unknown;
  if (Array.isArray(optionsArr) && optionsArr.length < 3) {
    errors.push("选项不足3个");
  }
  const synonymMap = obj.synonymMap as unknown[] | undefined;
  if (Array.isArray(synonymMap) && synonymMap.length === 0) {
    errors.push("阅读题 synonymMap 应至少有 1 个同义替换");
  }
  if (obj.passageType && !["notice", "email", "ad", "news", "essay", "letter"].includes(obj.passageType as string)) {
    warnings.push(`passageType "${obj.passageType}" 不在标准列表中`);
  }
  const assist = obj.assist as Record<string, unknown> | undefined;
  if (assist && typeof assist === "object") {
    if (!(assist.optionTranslations as unknown[]?.length)) {
      errors.push("阅读题缺少 assist.optionTranslations");
    }
    if (!hasValue(assist.passageTranslation)) {
      errors.push("阅读题缺少 assist.passageTranslation（文章翻译）");
    }
  }
}

function validateWriting(
  obj: Record<string, unknown>,
  errors: string[],
  warnings: string[]
): void {
  const required = [
    "prompt",
    "taskLevel",
    "wordRange",
    "taskType",
    "requiredPoints",
    "formatRequirements",
    "sampleAnswer",
    "scoringRubric",
  ];
  for (const f of required) {
    if (!hasValue(obj[f])) errors.push(`写作题缺少: ${f}`);
  }
  const taskLevel = obj.taskLevel as number | undefined;
  if (taskLevel !== undefined && ![1, 2, 3].includes(taskLevel)) {
    errors.push(`taskLevel 应为 1/2/3，当前: ${taskLevel}`);
  }
  const wordRange = obj.wordRange as { min?: number; max?: number } | undefined;
  if (wordRange && (typeof wordRange.min !== "number" || typeof wordRange.max !== "number")) {
    errors.push("wordRange 必须包含 min 和 max");
  }
  if (obj.taskType && !["letter", "article", "essay", "message"].includes(obj.taskType as string)) {
    warnings.push(`taskType "${obj.taskType}" 不在标准列表中`);
  }
  const assist = obj.assist as Record<string, unknown> | undefined;
  if (assist && typeof assist === "object") {
    if (!hasValue(assist.passageTranslation)) {
      errors.push("写作题缺少 assist.passageTranslation（范文翻译）");
    }
    if (!(assist.grammarNotes as unknown[]?.length)) {
      errors.push("写作题缺少 assist.grammarNotes");
    }
    if (assist.optionTranslations !== undefined) {
      warnings.push("写作题不需要 optionTranslations，可以移除");
    }
  }
}

function validateSpeaking(
  obj: Record<string, unknown>,
  errors: string[],
  warnings: string[]
): void {
  const required = [
    "scenario",
    "taskLevel",
    "prepTime",
    "speakTime",
    "sampleResponse",
    "keyPhrases",
    "evaluationCriteria",
  ];
  for (const f of required) {
    if (!hasValue(obj[f])) errors.push(`口语题缺少: ${f}`);
  }
  const taskLevel = obj.taskLevel as number | undefined;
  if (taskLevel !== undefined && ![1, 2, 3].includes(taskLevel)) {
    errors.push(`taskLevel 应为 1/2/3，当前: ${taskLevel}`);
  }
  const assist = obj.assist as Record<string, unknown> | undefined;
  if (assist && typeof assist === "object") {
    if (!hasValue(assist.passageTranslation)) {
      errors.push("口语题缺少 assist.passageTranslation（引导问题翻译）");
    }
    if (!(assist.grammarNotes as unknown[]?.length)) {
      errors.push("口语题缺少 assist.grammarNotes");
    }
    if (assist.optionTranslations !== undefined) {
      warnings.push("口语题不需要 optionTranslations，可以移除");
    }
  }
}

/**
 * 校验题目 JSON。按 module 分支：CO/CE 要求 question/options/correctAnswer；EE/EO 不要求。
 * 用户粘贴的可设为 screenshot_import + approved。
 */
export function validateQuestion(
  raw: unknown,
  options: { setSourceAsScreenshotImport?: boolean } = {}
): { data: AnyQuestion | null; result: ValidationResult } {
  const errors: string[] = [];
  const warnings: string[] = [];
  const autoFixable: string[] = [];

  if (raw === null || typeof raw !== "object") {
    return {
      data: null,
      result: { isValid: false, errors: ["输入不是有效的 JSON 对象"], warnings: [], autoFixable: [] },
    };
  }

  const obj = raw as Record<string, unknown>;

  // ===== 通用基础字段 =====
  for (const field of BASE_REQUIRED) {
    if (!(field in obj) || obj[field] === undefined) {
      errors.push(`缺少必填字段: ${field}`);
    } else if ((field === "sourceNote" || field === "explanation") && !hasValue(obj[field])) {
      errors.push(`缺少必填字段: ${field}`);
    }
  }

  if (obj.module && !["CO", "CE", "EE", "EO"].includes(obj.module as string)) {
    errors.push(`module 值无效: "${obj.module}"，应为 CO/CE/EE/EO`);
    return { data: null, result: { isValid: false, errors, warnings, autoFixable } };
  }

  if (obj.level && !["A1", "A2", "B1", "B2", "C1", "C2"].includes(obj.level as string)) {
    errors.push(`level 值无效: "${obj.level}"`);
  }

  // tags 建议 2-5 个（schema 一）
  const tagsArr = obj.tags as unknown[] | undefined;
  if (Array.isArray(tagsArr) && (tagsArr.length < 2 || tagsArr.length > 5)) {
    warnings.push("tags 建议 2-5 个");
  }

  const assist = obj.assist as Record<string, unknown> | undefined;
  if (assist && typeof assist === "object") {
    if (!hasValue(assist.questionTranslation)) {
      errors.push("缺少 assist.questionTranslation（题目翻译）");
    }
    if (!Array.isArray(assist.keyVocabulary)) {
      errors.push("assist.keyVocabulary 必须为数组");
    } else if (assist.keyVocabulary.length < 3) {
      errors.push("assist.keyVocabulary 至少需要 3 个");
    }
    const module = obj.module as string;
    if (module === "CO" || module === "CE") {
      if (!(assist.optionTranslations as unknown[]?.length)) autoFixable.push("assist.optionTranslations");
    }
    if (!(assist.wordByWord as unknown[]?.length)) autoFixable.push("assist.wordByWord");
    if (!(assist.grammarNotes as unknown[]?.length) && (module === "EE" || module === "EO")) {
      autoFixable.push("assist.grammarNotes");
    }
    if (!hasValue(assist.passageTranslation)) autoFixable.push("assist.passageTranslation");
  }

  if (!hasValue(obj.explanation)) autoFixable.push("explanation");
  if (obj.module === "CO" && !(obj as Record<string, unknown>).distractorAnalysis) {
    autoFixable.push("distractorAnalysis");
  }

  // ===== 按模块校验专属字段 =====
  const module = obj.module as string;
  switch (module) {
    case "CO":
      validateListening(obj, errors, warnings);
      break;
    case "CE":
      validateReading(obj, errors, warnings);
      break;
    case "EE":
      validateWriting(obj, errors, warnings);
      break;
    case "EO":
      validateSpeaking(obj, errors, warnings);
      break;
  }

  const isValid = errors.length === 0;
  const result: ValidationResult = {
    isValid,
    errors,
    warnings,
    autoFixable,
  };

  if (!isValid) return { data: null, result };

  // 规范化 source / status
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
    const errResult: ValidationResult = {
      isValid: false,
      errors: ["JSON 解析失败"],
      warnings: [],
      autoFixable: [],
    };
    return { questions: [], results: [errResult], firstError: errResult };
  }

  const arr = Array.isArray(parsed) ? parsed : [parsed];
  let firstError: ValidationResult | null = null;
  for (const item of arr) {
    const { data, result } = validateQuestion(item, { setSourceAsScreenshotImport });
    if (data) {
      questions.push(data);
      results.push(result);
    } else if (!firstError) {
      firstError = result;
    }
  }
  return { questions, results, firstError: firstError ?? undefined };
}
