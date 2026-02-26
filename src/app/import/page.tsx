"use client";

import { useState, useCallback } from "react";
import { JsonPreview } from "@/components/import/JsonPreview";
import { parseImportJson, validateQuestion } from "@/lib/question-engine/validator";
import { useQuestionStore } from "@/lib/store/question-store";
import { IMPORT_PROMPTS, type ImportPromptKey } from "@/lib/ai/prompts/import-templates";
import type { AnyQuestion } from "@/types/question";

const SAMPLE_JSON_URL = "/data/questions/reading/sample.json";

export default function ImportPage() {
  const [pasteValue, setPasteValue] = useState("");
  const [questions, setQuestions] = useState<AnyQuestion[]>([]);
  const [results, setResults] = useState<ReturnType<typeof parseImportJson>["results"]>([]);
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
    const { questions: qs, results: rs } = parseImportJson(pasteValue.trim(), true);
    setQuestions(qs);
    setResults(rs);
    if (qs.length === 0 && rs[0]?.errors?.length) {
      setParseError(rs[0].errors.join("；"));
    }
  }, [pasteValue]);

  const addQuestions = useQuestionStore((s) => s.add);

  const handleConfirmImport = useCallback(() => {
    addQuestions(questions);
    setPasteValue("");
    setQuestions([]);
    setResults([]);
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
      const res = await fetch(SAMPLE_JSON_URL);
      if (!res.ok) throw new Error(`加载失败: ${res.status}`);
      const data = await res.json();
      setPasteValue(JSON.stringify(Array.isArray(data) ? data : [data], null, 2));
      setQuestions([]);
      setResults([]);
    } catch (e) {
      setParseError(e instanceof Error ? e.message : "加载示例题失败");
    } finally {
      setLoadingSample(false);
    }
  }, []);

  const handleEdit = useCallback(
    (index: number) => {
      const q = questions[index];
      if (q) setPasteValue(JSON.stringify(q, null, 2));
      setQuestions([]);
      setResults([]);
    },
    [questions]
  );

  const copyPrompt = useCallback((key: ImportPromptKey) => {
    const text = IMPORT_PROMPTS[key];
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(text);
      alert("已复制到剪贴板，请到 Claude/ChatGPT 中粘贴并上传截图。");
    }
  }, []);

  return (
    <main className="mx-auto max-w-3xl px-4 py-6">
        <h1 className="mb-6 text-2xl font-bold text-[var(--primary)]">
          📥 题目导入中心
        </h1>

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
            需要让 AI 帮你解析截图？复制下面的 Prompt，在对话中粘贴并上传截图即可获得 JSON。
          </p>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => copyPrompt("listening")}
              className="rounded-lg bg-[var(--primary)]/10 px-3 py-2 text-sm text-[var(--primary)] hover:bg-[var(--primary)]/20"
            >
              📋 复制听力题 Prompt
            </button>
            <button
              type="button"
              onClick={() => copyPrompt("reading")}
              className="rounded-lg bg-[var(--primary)]/10 px-3 py-2 text-sm text-[var(--primary)] hover:bg-[var(--primary)]/20"
            >
              📋 复制阅读题 Prompt
            </button>
            <button
              type="button"
              onClick={() => copyPrompt("writing")}
              className="rounded-lg bg-[var(--primary)]/10 px-3 py-2 text-sm text-[var(--primary)] hover:bg-[var(--primary)]/20"
            >
              📋 复制写作题 Prompt
            </button>
            <button
              type="button"
              onClick={() => copyPrompt("speaking")}
              className="rounded-lg bg-[var(--primary)]/10 px-3 py-2 text-sm text-[var(--primary)] hover:bg-[var(--primary)]/20"
            >
              📋 复制口语题 Prompt
            </button>
          </div>
        </section>
    </main>
  );
}
