"use client";

import { useState, useCallback } from "react";
import { AssistPanel } from "@/components/shared/AssistPanel";
import { AudioPlayer } from "@/components/shared/AudioPlayer";
import { HighlightableText } from "@/components/reading/HighlightableText";
import { useUserStore } from "@/lib/store/user-store";
import { useFlashcardStore } from "@/lib/store/flashcard-store";
import { shouldForceFullAssist } from "@/types/user";
import type { ListeningQuestion as ListeningQuestionType } from "@/types/question";

interface ListeningQuestionProps {
  question: ListeningQuestionType;
  onAnswer?: (selectedId: string, correct: boolean) => void;
  showResult?: boolean;
  className?: string;
}

export function ListeningQuestion({
  question,
  onAnswer,
  showResult = false,
  className = "",
}: ListeningQuestionProps) {
  const [selected, setSelected] = useState<string | null>(null);
  const profile = useUserStore((s) => s.profile);
  const forceAssist = shouldForceFullAssist(profile.currentLevel, question.level);
  const { assistMode } = profile;

  const handleSelect = (optionId: string) => {
    if (selected !== null) return;
    setSelected(optionId);
    const correct = optionId === question.correctAnswer;
    onAnswer?.(optionId, correct);
  };

  const addToFlashcard = useCallback(
    (entry: import("@/types/question").VocabEntry) => {
      useFlashcardStore.getState().addFromVocab(entry, question.id, question.level);
    },
    [question.id, question.level]
  );

  return (
    <div className={`space-y-4 ${className}`}>
      <div>
        <p className="mb-2 text-sm font-medium text-[var(--primary)]">听录音</p>
        <AudioPlayer
          src={question.audioUrl}
          ttsText={question.audioText}
          voiceId={question.audioConfig?.voiceId}
        />
      </div>

      <div className="rounded-xl border border-[var(--primary)]/20 bg-white p-4">
        <p className="mb-2 font-medium text-[var(--primary)]">题目</p>
        <HighlightableText
          text={question.question}
          preloadedVocab={question.assist.keyVocabulary}
          onAddToFlashcard={addToFlashcard}
        />

        <AssistPanel
          assist={question.assist}
          questionText={undefined}
          forceShowTranslation={forceAssist || assistMode.showTranslation === "always"}
          showTranslation={
            forceAssist || assistMode.showTranslation === "always" || assistMode.showTranslation === "on-demand"
          }
          showWordByWord={assistMode.showWordByWord === "always" || assistMode.showWordByWord === "on-demand"}
          showGrammarNotes={assistMode.showGrammarNotes}
        />
      </div>

      <div className="space-y-2">
        <p className="text-sm font-medium text-[var(--primary)]">选项</p>
        {question.options.map((opt) => {
          const isSelected = selected === opt.id;
          const isCorrect = question.correctAnswer === opt.id;
          const showCorrect = showResult && selected !== null;

          return (
            <div
              key={opt.id}
              role="button"
              tabIndex={0}
              onClick={() => selected === null && handleSelect(opt.id)}
              onKeyDown={(e) => {
                if (selected === null && (e.key === "Enter" || e.key === " ")) {
                  e.preventDefault();
                  handleSelect(opt.id);
                }
              }}
              className={`flex w-full cursor-pointer items-start gap-2 rounded-lg border p-3 text-left transition ${
                showResult
                  ? isCorrect
                    ? "border-[var(--success)] bg-[var(--success)]/10"
                    : isSelected && !isCorrect
                      ? "border-[var(--error)] bg-[var(--error)]/10"
                      : "border-[var(--primary)]/20"
                  : isSelected
                    ? "border-[var(--primary)] bg-[var(--primary)]/5"
                    : "border-[var(--primary)]/20 hover:bg-[var(--bg)]"
              } ${selected !== null ? "cursor-default" : ""}`}
            >
              <span className="font-medium text-[var(--primary)]">{opt.id}.</span>
              <span className="flex-1">
                <HighlightableText
                  text={opt.text}
                  preloadedVocab={question.assist.keyVocabulary}
                  onAddToFlashcard={addToFlashcard}
                />
              </span>
              {showCorrect && isCorrect && (
                <span className="ml-auto text-[var(--success)]">✓</span>
              )}
            </div>
          );
        })}
      </div>

      {showResult && selected !== null && (
        <div className="rounded-lg border border-[var(--primary)]/20 bg-[var(--assist-bg)]/50 p-4">
          <p className="font-medium text-[var(--primary)]">解析</p>
          <p className="mt-1 text-sm text-[var(--primary)]/90">{question.explanation}</p>
        </div>
      )}
    </div>
  );
}
