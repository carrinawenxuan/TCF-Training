"use client";

import { useState } from "react";
import { WordByWordView } from "./WordByWordView";
import { GrammarTooltip } from "./GrammarTooltip";
import type { AssistData } from "@/types/question";

interface AssistPanelProps {
  assist: AssistData;
  /** 题目原文（法语），用于展示在面板上方 */
  questionText?: string;
  /** 是否强制显示翻译（例如 A1 或难度超出 2 级） */
  forceShowTranslation?: boolean;
  /** 当前用户辅助模式：控制默认展开项 */
  showTranslation?: boolean;
  showWordByWord?: boolean;
  showGrammarNotes?: boolean;
  className?: string;
}

export function AssistPanel({
  assist,
  questionText,
  forceShowTranslation = false,
  showTranslation: defaultShowTranslation = true,
  showWordByWord: defaultShowWordByWord = false,
  showGrammarNotes: defaultShowGrammarNotes = true,
  className = "",
}: AssistPanelProps) {
  const [showTranslation, setShowTranslation] = useState(
    forceShowTranslation || defaultShowTranslation
  );
  const [showWordByWord, setShowWordByWord] = useState(defaultShowWordByWord);
  const [showGrammar, setShowGrammar] = useState(defaultShowGrammarNotes);

  return (
    <div className={`assist-panel rounded-xl border border-[var(--primary)]/20 p-4 ${className}`}>
      {questionText && (
        <p className="mb-2 text-[var(--primary)]">
          {questionText}
        </p>
      )}
      <p className="mb-3 text-xs text-[var(--primary)]/70">
        ← 点击任意单词即可查看释义 →
      </p>

      <div className="mb-3 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setShowTranslation((v) => !v)}
          className={`rounded px-2 py-1 text-sm ${
            showTranslation ? "bg-[var(--primary)]/20 text-[var(--primary)]" : "bg-white/80 text-[var(--primary)]/80"
          }`}
        >
          📖 翻译
        </button>
        <button
          type="button"
          onClick={() => setShowWordByWord((v) => !v)}
          className={`rounded px-2 py-1 text-sm ${
            showWordByWord ? "bg-[var(--primary)]/20 text-[var(--primary)]" : "bg-white/80 text-[var(--primary)]/80"
          }`}
        >
          🔤 逐词
        </button>
        <button
          type="button"
          onClick={() => setShowGrammar((v) => !v)}
          className={`rounded px-2 py-1 text-sm ${
            showGrammar ? "bg-[var(--primary)]/20 text-[var(--primary)]" : "bg-white/80 text-[var(--primary)]/80"
          }`}
        >
          📝 语法
        </button>
      </div>

      {showTranslation && assist.questionTranslation && (
        <div className="mb-3 rounded border border-[var(--primary)]/10 bg-white p-2">
          <p className="text-sm italic text-gray-700">{assist.questionTranslation}</p>
        </div>
      )}

      {showWordByWord && assist.wordByWord?.length > 0 && (
        <div className="mb-3">
          <WordByWordView items={assist.wordByWord} />
        </div>
      )}

      {showGrammar && assist.grammarNotes?.length > 0 && (
        <div className="space-y-2">
          {assist.grammarNotes.map((n, i) => (
            <GrammarTooltip key={i} note={n} />
          ))}
        </div>
      )}
    </div>
  );
}
