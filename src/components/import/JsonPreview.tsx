"use client";

import type { AnyQuestion } from "@/types/question";
import type { ValidationResult } from "@/lib/question-engine/validator";

interface JsonPreviewProps {
  questions: AnyQuestion[];
  results: ValidationResult[];
  onConfirmImport: () => void;
  onAutoComplete: (index: number) => void;
  onEdit: (index: number) => void;
}

export function JsonPreview({
  questions,
  results,
  onConfirmImport,
  onAutoComplete,
  onEdit,
}: JsonPreviewProps) {
  if (questions.length === 0) return null;

  const allValid = results.every((r) => r.isValid);
  const moduleLabel: Record<string, string> = {
    CO: "听力",
    CE: "阅读",
    EE: "写作",
    EO: "口语",
  };

  return (
    <div className="rounded-xl border border-[var(--primary)]/20 bg-white p-4 shadow-sm">
      <p className="mb-3 text-sm text-[var(--primary)]">
        ✅ 解析成功：{moduleLabel[questions[0].module] ?? questions[0].module} 题 x {questions.length}
      </p>
      <ul className="space-y-3">
        {questions.map((q, index) => {
          const res = results[index];
          const hasMissing =
            (res?.autoFixable?.length ?? 0) > 0 || (res?.warnings?.length ?? 0) > 0;
          return (
            <li
              key={q.id}
              className="rounded-lg border border-[var(--primary)]/10 bg-[var(--bg)] p-3"
            >
              <div className="flex flex-wrap items-center gap-2 text-sm">
                <span className="font-medium text-[var(--primary)]">
                  {q.id} | {q.level}
                </span>
                {q.tags?.length > 0 && (
                  <span className="text-[var(--primary)]/70">{q.tags.join(" · ")}</span>
                )}
              </div>
              <p className="mt-1 line-clamp-2 text-[var(--primary)]/90">
                Q: {q.question}
              </p>
              {q.assist?.questionTranslation && (
                <p className="mt-1 text-sm italic text-gray-600">
                  → {q.assist.questionTranslation}
                </p>
              )}
              <div className="mt-2 flex flex-wrap gap-2 text-xs">
                {q.assist?.questionTranslation ? (
                  <span className="rounded bg-[var(--success)]/20 px-1.5 py-0.5 text-[var(--success)]">翻译</span>
                ) : (
                  <span className="rounded bg-[var(--error)]/20 text-[var(--error)]">缺翻译</span>
                )}
                {(q.assist?.keyVocabulary?.length ?? 0) > 0 ? (
                  <span className="rounded bg-[var(--success)]/20 px-1.5 py-0.5 text-[var(--success)]">词汇</span>
                ) : (
                  <span className="rounded bg-[var(--error)]/20 text-[var(--error)]">缺词汇</span>
                )}
                {(q.assist?.grammarNotes?.length ?? 0) > 0 ? (
                  <span className="rounded bg-[var(--success)]/20 px-1.5 py-0.5 text-[var(--success)]">语法</span>
                ) : (
                  <span className="rounded bg-amber-200/80 text-amber-800">缺语法</span>
                )}
                {(q.assist?.wordByWord?.length ?? 0) > 0 ? (
                  <span className="rounded bg-[var(--success)]/20 px-1.5 py-0.5 text-[var(--success)]">逐词</span>
                ) : (
                  <span className="rounded bg-amber-200/80 text-amber-800">缺逐词</span>
                )}
              </div>
              {hasMissing && (
                <p className="mt-1 text-xs text-amber-700">
                  ⚠️ 可补全: {[...(res?.autoFixable ?? []), ...(res?.warnings ?? [])].slice(0, 5).join(", ")}
                </p>
              )}
              <div className="mt-2 flex gap-2">
                {hasMissing && (
                  <button
                    type="button"
                    onClick={() => onAutoComplete(index)}
                    className="rounded bg-[var(--accent)]/20 px-2 py-1 text-xs text-[var(--primary)] hover:bg-[var(--accent)]/30"
                  >
                    补全缺失数据
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
        })}
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
