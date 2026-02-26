"use client";

import { ClickableText } from "@/components/shared/ClickableText";
import type { VocabEntry } from "@/types/question";

interface HighlightableTextProps {
  text: string;
  preloadedVocab?: VocabEntry[];
  onWordClick?: (word: string) => void;
  onAddToFlashcard?: (vocab: VocabEntry) => void;
  className?: string;
}

export function HighlightableText({
  text,
  preloadedVocab = [],
  onWordClick,
  onAddToFlashcard,
  className = "",
}: HighlightableTextProps) {
  return (
    <ClickableText
      text={text}
      preloadedVocab={preloadedVocab}
      highlightKeywords={true}
      onWordClick={onWordClick}
      onAddToFlashcard={onAddToFlashcard}
      className={className}
    />
  );
}
