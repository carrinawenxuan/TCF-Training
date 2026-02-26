"use client";

import type { WordAnnotation } from "@/types/question";

interface WordByWordViewProps {
  items: WordAnnotation[];
  className?: string;
}

export function WordByWordView({ items, className = "" }: WordByWordViewProps) {
  if (!items?.length) return null;

  return (
    <div className={`space-y-3 ${className}`}>
      {items.map((ann, i) => (
        <div key={i} className="rounded-lg border border-[var(--primary)]/10 bg-white p-2">
          <p className="mb-2 text-sm font-medium text-[var(--primary)]">{ann.sentence}</p>
          <ul className="space-y-1 text-sm">
            {ann.words.map((w, j) => (
              <li key={j} className="flex flex-wrap gap-2">
                <span className="font-medium text-[var(--primary)]">{w.french}</span>
                <span className="text-gray-600">→ {w.meaning}</span>
                {w.pos && (
                  <span className="rounded bg-gray-100 px-1 text-xs text-gray-500">
                    {w.pos}
                  </span>
                )}
                {w.isKey && (
                  <span className="rounded bg-[var(--vocab-bg)] px-1 text-xs">关键词</span>
                )}
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}
