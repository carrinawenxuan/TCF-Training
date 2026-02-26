"use client";

import type { GrammarNote } from "@/types/question";

interface GrammarTooltipProps {
  note: GrammarNote;
  className?: string;
}

export function GrammarTooltip({ note, className = "" }: GrammarTooltipProps) {
  return (
    <div
      className={`rounded-lg border border-[var(--primary)]/20 bg-[var(--assist-bg)] p-3 ${className}`}
    >
      <p className="font-medium text-[var(--primary)]">「{note.pattern}」</p>
      <p className="mt-1 text-sm text-[var(--primary)]/90">{note.explanation}</p>
      <p className="mt-2 text-sm text-[var(--primary)]">{note.example}</p>
      <p className="text-sm italic text-gray-600">{note.exampleTranslation}</p>
      <p className="mt-1 text-xs text-gray-500">📊 {note.level} 级语法</p>
    </div>
  );
}
