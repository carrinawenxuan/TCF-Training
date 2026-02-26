"use client";

import type {
  AnyQuestion,
  AssistData,
  ListeningQuestion,
  ReadingQuestion,
  WritingTask,
  SpeakingTask,
  TCFModule,
} from "@/types/question";
import {
  isMultipleChoice,
  isWriting,
  isSpeaking,
} from "@/types/question";
import type { ValidationResult } from "@/lib/question-engine/validator";

interface JsonPreviewProps {
  questions: AnyQuestion[];
  results: ValidationResult[];
  onConfirmImport: () => void;
  onAutoComplete: (index: number) => void;
  onEdit: (index: number) => void;
  completingIndex?: number | null;
}

const MODULE_LABEL: Record<TCFModule, string> = {
  CO: "听力",
  CE: "阅读",
  EE: "写作",
  EO: "口语",
};

function LevelBadge({ level }: { level: string }) {
  return (
    <span className="rounded bg-[var(--primary)]/10 px-1.5 py-0.5 text-xs font-medium text-[var(--primary)]">
      {level}
    </span>
  );
}

function ModuleBadge({ module }: { module: TCFModule }) {
  return (
    <span className="rounded bg-[var(--accent)]/20 px-1.5 py-0.5 text-xs text-[var(--primary)]">
      {MODULE_LABEL[module]}
    </span>
  );
}

function MultipleChoicePreview({
  question,
}: {
  question: ListeningQuestion | ReadingQuestion;
}) {
  return (
    <>
      <p className="font-medium text-[var(--primary)]">{question.question}</p>
      {question.assist?.questionTranslation && (
        <p className="mt-1 text-sm italic text-gray-600">
          {question.assist.questionTranslation}
        </p>
      )}
      <div className="mt-2 space-y-1">
        {question.options.map((opt) => (
          <div
            key={opt.id}
            className={`text-sm ${
              opt.id === question.correctAnswer ? "font-medium text-[var(--success)]" : ""
            }`}
          >
            {opt.id}. {opt.text}
            {opt.id === question.correctAnswer && " ✓"}
          </div>
        ))}
      </div>
    </>
  );
}

function WritingPreview({ task }: { task: WritingTask }) {
  return (
    <>
      <p className="font-medium text-[var(--primary)]">
        Tâche {task.taskLevel} — {task.taskType}
      </p>
      <p className="mt-1 text-sm">{task.prompt}</p>
      {task.assist?.questionTranslation && (
        <p className="mt-1 text-sm italic text-gray-600">
          {task.assist.questionTranslation}
        </p>
      )}
      <p className="mt-1 text-xs text-gray-500">
        字数: {task.wordRange.min}-{task.wordRange.max} | 要点:{" "}
        {task.requiredPoints?.length ?? 0} 个
      </p>
    </>
  );
}

function SpeakingPreview({ task }: { task: SpeakingTask }) {
  return (
    <>
      <p className="font-medium text-[var(--primary)]">Tâche {task.taskLevel}</p>
      <p className="mt-1 text-sm">{task.scenario}</p>
      {task.assist?.questionTranslation && (
        <p className="mt-1 text-sm italic text-gray-600">
          {task.assist.questionTranslation}
        </p>
      )}
      <p className="mt-1 text-xs text-gray-500">
        准备: {task.prepTime} 秒 | 作答: {task.speakTime} 秒
        {task.guidedQuestions?.length
          ? ` | 引导问题: ${task.guidedQuestions.length} 个`
          : ""}
      </p>
    </>
  );
}

function AssistStatus({
  assist,
  module,
}: { assist: AssistData; module: TCFModule }) {
  const checks: { label: string; ok: boolean }[] = [
    { label: "翻译", ok: !!assist.questionTranslation },
    {
      label: "词汇",
      ok: !!(assist.keyVocabulary && assist.keyVocabulary.length > 0),
    },
    {
      label: "语法",
      ok: !!(assist.grammarNotes && assist.grammarNotes.length > 0),
    },
    {
      label: "逐词",
      ok: !!(assist.wordByWord && assist.wordByWord.length > 0),
    },
  ];
  if (module === "CO" || module === "CE") {
    checks.push({
      label: "选项翻译",
      ok: !!(assist.optionTranslations && assist.optionTranslations.length > 0),
    });
  }

  return (
    <div className="mt-3 flex flex-wrap gap-2">
      {checks.map((c) => (
        <span
          key={c.label}
          className={`rounded px-2 py-0.5 text-xs ${
            c.ok ? "bg-[var(--success)]/20 text-[var(--success)]" : "bg-gray-100 text-gray-500"
          }`}
        >
          {c.ok ? "✅" : "⬜"} {c.label}
        </span>
      ))}
    </div>
  );
}

function QuestionPreviewCard({
  question,
  result,
  index,
  onAutoComplete,
  onEdit,
  completingIndex,
}: {
  question: AnyQuestion;
  result: ValidationResult;
  index: number;
  onAutoComplete: (i: number) => void;
  onEdit: (i: number) => void;
  completingIndex: number | null;
}) {
  const hasMissing =
    (result.autoFixable?.length ?? 0) > 0 || (result.warnings?.length ?? 0) > 0;

  return (
    <li className="rounded-lg border border-[var(--primary)]/10 bg-[var(--bg)] p-3">
      <div className="mb-2 flex flex-wrap items-center gap-2">
        <LevelBadge level={question.level} />
        <ModuleBadge module={question.module} />
        <span className="text-sm text-gray-500">{question.id}</span>
        {question.tags?.length > 0 && (
          <span className="text-xs text-[var(--primary)]/70">
            {question.tags.join(" · ")}
          </span>
        )}
      </div>

      {isMultipleChoice(question) && (
        <MultipleChoicePreview question={question} />
      )}
      {isWriting(question) && <WritingPreview task={question} />}
      {isSpeaking(question) && <SpeakingPreview task={question} />}

      <AssistStatus assist={question.assist} module={question.module} />

      {/* 错误：红色 */}
      {result.errors.length > 0 && (
        <div className="mt-2 space-y-1">
          {result.errors.map((err, i) => (
            <div
              key={i}
              className="flex items-center gap-1 text-sm text-[var(--error)]"
            >
              <span>❌</span> {err}
            </div>
          ))}
        </div>
      )}

      {/* 警告：黄色 */}
      {result.warnings.length > 0 && (
        <div className="mt-1 space-y-1">
          {result.warnings.map((warn, i) => (
            <div
              key={i}
              className="flex items-center gap-1 text-sm text-amber-600"
            >
              <span>⚠️</span> {warn}
            </div>
          ))}
        </div>
      )}

      {hasMissing && result.isValid && (
        <p className="mt-1 text-xs text-amber-700">
          可补全: {[...(result.autoFixable ?? []), ...(result.warnings ?? [])].slice(0, 5).join(", ")}
        </p>
      )}

      <div className="mt-2 flex gap-2">
        {hasMissing && result.isValid && (
          <button
            type="button"
            onClick={() => onAutoComplete(index)}
            disabled={completingIndex !== null}
            className="rounded bg-[var(--accent)]/20 px-2 py-1 text-xs text-[var(--primary)] hover:bg-[var(--accent)]/30 disabled:opacity-50"
          >
            {completingIndex === index ? "补全中…" : "补全缺失数据"}
          </button>
        )}
        <button
          type="button"
          onClick={() => onEdit(index)}
          className="rounded border border-[var(--primary)]/30 px-2 py-1 text-xs text-[var(--primary)] hover:bg-[var(--primary)]/5"
        >
          编辑
        </button>
      </div>
    </li>
  );
}

export function JsonPreview({
  questions,
  results,
  onConfirmImport,
  onAutoComplete,
  onEdit,
  completingIndex = null,
}: JsonPreviewProps) {
  if (questions.length === 0) return null;

  const allValid = results.every((r) => r.isValid);

  return (
    <div className="rounded-xl border border-[var(--primary)]/20 bg-white p-4 shadow-sm">
      <p className="mb-3 text-sm text-[var(--primary)]">
        解析成功：{MODULE_LABEL[questions[0].module]} 题 x {questions.length}
      </p>
      <ul className="space-y-3">
        {questions.map((q, index) => (
          <QuestionPreviewCard
            key={q.id}
            question={q}
            result={results[index] ?? { isValid: false, errors: [], warnings: [], autoFixable: [] }}
            index={index}
            onAutoComplete={onAutoComplete}
            onEdit={onEdit}
            completingIndex={completingIndex}
          />
        ))}
      </ul>
      {allValid && (
        <button
          type="button"
          onClick={onConfirmImport}
          className="mt-4 w-full rounded-lg bg-[var(--primary)] py-2.5 text-white hover:opacity-90"
        >
          确认导入到题库
        </button>
      )}
    </div>
  );
}
