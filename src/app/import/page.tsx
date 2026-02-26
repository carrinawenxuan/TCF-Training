"use client";

import { useState, useCallback } from "react";
import { JsonPreview } from "@/components/import/JsonPreview";
import { ModuleTabs } from "@/components/import/ModuleTabs";
import { parseImportJson, validateQuestion } from "@/lib/question-engine/validator";
import { useQuestionStore } from "@/lib/store/question-store";
import { IMPORT_PROMPTS, type ImportPromptKey } from "@/lib/ai/prompts/import-templates";
import type { AnyQuestion, TCFModule } from "@/types/question";

const MODULE_TO_PROMPT_KEY: Record<TCFModule, ImportPromptKey> = {
  CO: "listening",
  CE: "reading",
  EE: "writing",
  EO: "speaking",
};

function getSampleUrl(module: TCFModule): string {
  const m = module.toLowerCase();
  return `/data/questions/${m}/sample.json`;
}

export default function ImportPage() {
  const [selectedModule, setSelectedModule] = useState<TCFModule>("CE");
  const [pasteValue, setPasteValue] = useState("");
  const [questions, setQuestions] = useState<AnyQuestion[]>([]);
  const [results, setResults] = useState<ReturnType<typeof parseImportJson>["results"]>([]);
  const [firstError, setFirstError] = useState<ReturnType<typeof parseImportJson>["firstError"] | null>(null);
  const [parseError, setParseError] = useState<string | null>(null);
  const [loadingSample, setLoadingSample] = useState(false);
  const [completingIndex, setCompletingIndex] = useState<number | null>(null);
  const [completeError, setCompleteError] = useState<string | null>(null);

  const handleParse = useCallback(() => {
    setParseError(null);
    setCompleteError(null);
    if (!pasteValue.trim()) {
      setParseError("请先粘贴 JSON");
      return;
    }
    const { questions: qs, results: rs, firstError: fe } = parseImportJson(
      pasteValue.trim(),
      true
    );
    setQuestions(qs);
    setResults(rs);
    setFirstError(fe ?? null);
  }, [pasteValue]);

  const addQuestions = useQuestionStore((s) => s.add);

  const handleConfirmImport = useCallback(() => {
    addQuestions(questions);
    setPasteValue("");
    setQuestions([]);
    setResults([]);
    setFirstError(null);
    const total = useQuestionStore.getState().questions.length;
    alert(`已导入 ${questions.length} 题，当前题库共 ${total} 题。`);
  }, [questions, addQuestions]);

  const handleAutoComplete = useCallback(async (index: number) => {
    const q = questions[index];
    if (!q) return;
    setCompletingIndex(index);
    setCompleteError(null);
    try {
      const res = await fetch("/api/ai/complete-assist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: q }),
      });
      const data = await res.json();
      if (!res.ok) {
        setCompleteError(data?.error ?? `请求失败 ${res.status}`);
        return;
      }
      const updated = data.question as AnyQuestion;
      const next = [...questions];
      next[index] = updated;
      setQuestions(next);
      const { result } = validateQuestion(updated, { setSourceAsScreenshotImport: true });
      const nextResults = [...results];
      nextResults[index] = result;
      setResults(nextResults);
    } catch (e) {
      setCompleteError(e instanceof Error ? e.message : "补全请求异常");
    } finally {
      setCompletingIndex(null);
    }
  }, [questions, results]);

  const loadSample = useCallback(async () => {
    setLoadingSample(true);
    setParseError(null);
    setCompleteError(null);
    try {
      const res = await fetch(getSampleUrl(selectedModule));
      if (!res.ok) throw new Error(`加载失败: ${res.status}`);
      const data = await res.json();
      setPasteValue(JSON.stringify(Array.isArray(data) ? data : [data], null, 2));
      setQuestions([]);
      setResults([]);
      setFirstError(null);
    } catch (e) {
      const moduleLabel = { CO: "听力", CE: "阅读", EO: "口语", EE: "写作" }[selectedModule];
      const msg = e instanceof Error ? e.message : "加载示例题失败";
      setParseError(
        msg.includes("404") || msg.includes("加载失败")
          ? `暂无「${moduleLabel}」示例题，请使用下方「复制当前题型 Prompt」从截图生成。`
          : msg
      );
    } finally {
      setLoadingSample(false);
    }
  }, [selectedModule]);

  const handleEdit = useCallback(
    (index: number) => {
      const q = questions[index];
      if (q) setPasteValue(JSON.stringify(q, null, 2));
      setQuestions([]);
      setResults([]);
      setFirstError(null);
    },
    [questions]
  );

  const copyCurrentPrompt = useCallback(() => {
    const key = MODULE_TO_PROMPT_KEY[selectedModule];
    const text = IMPORT_PROMPTS[key];
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(text);
      const label = { CO: "听力", CE: "阅读", EO: "口语", EE: "写作" }[selectedModule];
      alert(`已复制「${label}」Prompt，请到 Claude/ChatGPT 中粘贴并上传截图。`);
    }
  }, [selectedModule]);

  return (
    <main className="mx-auto max-w-3xl px-4 py-6">
        <h1 className="mb-6 text-2xl font-bold text-[var(--primary)]">
          📥 题目导入中心
        </h1>

        <section className="mb-6">
          <h2 className="mb-2 text-sm font-medium text-[var(--primary)]">选择题型（导入 / 截图出题时按此类型，无需系统识别）</h2>
          <ModuleTabs value={selectedModule} onChange={setSelectedModule} />
        </section>

        <div className="mb-6 flex flex-wrap gap-2">
          <a
            href="/import/screenshot"
            className="rounded-lg border border-[var(--primary)]/30 px-4 py-2 text-sm text-[var(--primary)] hover:bg-[var(--primary)]/5"
          >
            上传截图
          </a>
          <a
            href="/import/manual"
            className="rounded-lg border border-[var(--primary)]/30 px-4 py-2 text-sm text-[var(--primary)] hover:bg-[var(--primary)]/5"
          >
            手动录入
          </a>
          <a
            href="/import/review"
            className="rounded-lg border border-[var(--primary)]/30 px-4 py-2 text-sm text-[var(--primary)] hover:bg-[var(--primary)]/5"
          >
            审核队列
          </a>
        </div>

        <section className="mb-6">
          <h2 className="mb-2 text-lg font-medium text-[var(--primary)]">
            粘贴 JSON 模式
          </h2>
          <p className="mb-2 text-sm text-[var(--primary)]/70">
            📋 粘贴从 AI 获得的 JSON（支持单题或批量）
          </p>
          <textarea
            value={pasteValue}
            onChange={(e) => setPasteValue(e.target.value)}
            placeholder='{"id":"CE-001-01","module":"CE",...}'
            className="min-h-[200px] w-full rounded-lg border border-[var(--primary)]/20 bg-white p-3 font-mono text-sm"
            spellCheck={false}
          />
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={handleParse}
              className="rounded-lg bg-[var(--primary)] px-4 py-2 text-sm text-white hover:opacity-90"
            >
              解析
            </button>
            <button
              type="button"
              onClick={loadSample}
              disabled={loadingSample}
              className="rounded-lg border border-[var(--primary)]/30 px-4 py-2 text-sm text-[var(--primary)] hover:bg-[var(--primary)]/5 disabled:opacity-50"
            >
              {loadingSample ? "加载中…" : "加载示例题"}
            </button>
          </div>
          {parseError && (
            <p className="mt-2 text-sm text-[var(--error)]">{parseError}</p>
          )}
          {/* 解析后 0 条通过时：展示第一条失败结果的错误（红）与警告（黄） */}
          {firstError && questions.length === 0 && (
            <div className="mt-4 space-y-2">
              {firstError.errors.map((err, i) => (
                <div
                  key={i}
                  className="flex items-center gap-1 text-sm text-[var(--error)]"
                >
                  <span>❌</span> {err}
                </div>
              ))}
              {firstError.warnings.map((warn, i) => (
                <div
                  key={i}
                  className="flex items-center gap-1 text-sm text-amber-600"
                >
                  <span>⚠️</span> {warn}
                </div>
              ))}
            </div>
          )}
          {results.length > 0 && questions.length > 0 && (
            <p className="mt-2 text-sm text-[var(--success)]">
              ✅ 解析通过 {questions.length} 条，可在下方确认后导入
            </p>
          )}
        </section>

        {completeError && (
          <p className="mb-2 text-sm text-[var(--error)]">{completeError}</p>
        )}
        {questions.length > 0 && (
          <section className="mb-6">
            <JsonPreview
              questions={questions}
              results={results}
              onConfirmImport={handleConfirmImport}
              onAutoComplete={handleAutoComplete}
              onEdit={handleEdit}
              completingIndex={completingIndex}
            />
          </section>
        )}

        <section className="rounded-xl border border-[var(--primary)]/20 bg-[var(--assist-bg)]/50 p-4">
          <h2 className="mb-2 text-lg font-medium text-[var(--primary)]">
            复制 Prompt 模板
          </h2>
          <p className="mb-3 text-sm text-[var(--primary)]/80">
            根据上方选中的题型复制 Prompt，在 Claude/ChatGPT 中粘贴并上传截图即可获得对应题型的 JSON（无需 AI 自动识别题型）。
          </p>
          <button
            type="button"
            onClick={copyCurrentPrompt}
            className="rounded-lg bg-[var(--primary)] px-4 py-2 text-sm text-white hover:opacity-90"
          >
            📋 复制当前题型（{selectedModule === "CO" ? "听力" : selectedModule === "CE" ? "阅读" : selectedModule === "EO" ? "口语" : "写作"}）Prompt
          </button>
        </section>
    </main>
  );
}
