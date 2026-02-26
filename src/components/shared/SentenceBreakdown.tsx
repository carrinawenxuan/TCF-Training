"use client";

import type { WordAnnotation } from "@/types/question";

interface SentenceBreakdownProps {
  /** 与 WordByWordView 共用 wordByWord 数据，此处仅展示句子级拆解 */
  sentences: { french: string; translation: string }[];
  className?: string;
}

export function SentenceBreakdown({ sentences, className = "" }: SentenceBreakdownProps) {
  if (!sentences?.length) return null;

  return (
    <div className={`space-y-2 ${className}`}>
      {sentences.map((s, i) => (
        <div key={i} className="flex flex-col gap-0.5 rounded border border-[var(--primary)]/10 bg-white p-2">
          <p className="text-sm text-[var(--primary)]">{s.french}</p>
          <p className="text-sm italic text-gray-600">{s.translation}</p>
        </div>
      ))}
    </div>
  );
}
