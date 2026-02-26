"use client";

import { useState, useCallback } from "react";
import type { VocabEntry } from "@/types/question";

interface ClickableTextProps {
  text: string;
  preloadedVocab?: VocabEntry[];
  highlightKeywords?: boolean;
  onWordClick?: (word: string) => void;
  onAddToFlashcard?: (vocab: VocabEntry) => void;
  className?: string;
}

/** 将法语文本按空格/标点拆成可点击的 token */
function tokenize(text: string): string[] {
  const tokens: string[] = [];
  let current = "";
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (/[\s,.;:!?()«»—–]/.test(c)) {
      if (current) {
        tokens.push(current);
        current = "";
      }
      tokens.push(c);
    } else {
      current += c;
    }
  }
  if (current) tokens.push(current);
  return tokens;
}

function normalize(word: string): string {
  return word.toLowerCase().replace(/[^\wàâäéèêëïîôùûüç]/g, "");
}

export function ClickableText({
  text,
  preloadedVocab = [],
  highlightKeywords = true,
  onWordClick,
  onAddToFlashcard,
  className = "",
}: ClickableTextProps) {
  const [tooltip, setTooltip] = useState<{
    word: string;
    entry: VocabEntry | null;
    x: number;
    y: number;
  } | null>(null);

  const vocabMap = new Map<string, VocabEntry>();
  for (const v of preloadedVocab) {
    vocabMap.set(normalize(v.word), v);
  }

  const handleClick = useCallback(
    (token: string) => {
      const key = normalize(token);
      if (!key) return;
      const entry = vocabMap.get(key) ?? null;
      onWordClick?.(token);
      setTooltip((prev) => {
        if (prev?.word === token) return null;
        return { word: token, entry: entry, x: 0, y: 0 };
      });
    },
    [vocabMap, onWordClick]
  );

  const tokens = tokenize(text);

  return (
    <div className={`relative ${className}`}>
      <span className="inline">
        {tokens.map((token, i) => {
          const key = normalize(token);
          const isWord = key.length > 0 && /[\wàâäéèêëïîôùûüç]/.test(key);
          const entry = isWord ? vocabMap.get(key) : null;
          const isKey = highlightKeywords && entry !== undefined;

          if (!isWord) {
            return <span key={i}>{token}</span>;
          }

          return (
            <button
              key={i}
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleClick(token);
              }}
              className={`mx-0.5 rounded px-0.5 py-0.5 text-left align-baseline hover:bg-[var(--vocab-bg)] ${
                isKey ? "vocab-highlight bg-[var(--vocab-bg)]/60" : ""
              }`}
            >
              {token}
            </button>
          );
        })}
      </span>

      {tooltip && (
        <div
          className="fixed z-50 min-w-[200px] max-w-[320px] rounded-lg border border-[var(--primary)]/20 bg-white p-3 shadow-lg"
          style={{ left: tooltip.x || 16, top: tooltip.y || 16 }}
        >
          <p className="font-medium text-[var(--primary)]">{tooltip.word}</p>
          {tooltip.entry ? (
            <>
              <p className="text-sm text-gray-700">{tooltip.entry.meaning}</p>
              {tooltip.entry.pos && (
                <p className="text-xs text-gray-500">{tooltip.entry.pos}</p>
              )}
              {tooltip.entry.example && (
                <p className="mt-1 text-xs italic text-gray-600">{tooltip.entry.example}</p>
              )}
              {onAddToFlashcard && (
                <button
                  type="button"
                  onClick={() => {
                    onAddToFlashcard(tooltip.entry!);
                    setTooltip(null);
                  }}
                  className="mt-2 rounded bg-[var(--accent)]/30 px-2 py-1 text-xs text-[var(--primary)]"
                >
                  加入生词本 📝
                </button>
              )}
            </>
          ) : (
            <p className="text-sm text-gray-500">暂无释义，可稍后接入 AI 查询</p>
          )}
          <button
            type="button"
            onClick={() => setTooltip(null)}
            className="absolute right-2 top-2 text-gray-400 hover:text-[var(--primary)]"
          >
            ×
          </button>
        </div>
      )}
    </div>
  );
}
