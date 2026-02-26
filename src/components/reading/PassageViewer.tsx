"use client";

import { ClickableText } from "@/components/shared/ClickableText";
import type { VocabEntry } from "@/types/question";

interface PassageViewerProps {
  passage: string;
  passageTranslation?: string;
  keyVocabulary?: VocabEntry[];
  showTranslation?: boolean;
  className?: string;
}

export function PassageViewer({
  passage,
  passageTranslation,
  keyVocabulary = [],
  showTranslation = false,
  className = "",
}: PassageViewerProps) {
  return (
    <div className={`rounded-xl border border-[var(--primary)]/20 bg-white p-4 ${className}`}>
      <div className="prose prose-sm max-w-none text-[var(--primary)]">
        <ClickableText
          text={passage}
          preloadedVocab={keyVocabulary}
          highlightKeywords={true}
        />
      </div>
      {showTranslation && passageTranslation && (
        <div className="mt-3 border-t border-[var(--primary)]/10 pt-3">
          <p className="text-sm italic text-gray-600">{passageTranslation}</p>
        </div>
      )}
    </div>
  );
}
