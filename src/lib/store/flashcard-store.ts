"use client";

import { create } from "zustand";
import { nextSm2State, nextReviewDate, initialSm2State } from "@/lib/sm2";
import type { Flashcard } from "@/types/flashcard";
import type { VocabEntry } from "@/types/question";

const STORAGE_KEY = "tcf_flashcards";

function loadFromStorage(): Flashcard[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

function saveToStorage(cards: Flashcard[]) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cards));
  } catch {
    // ignore
  }
}

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

/** 从题目的 keyVocabulary 生成一张生词卡 */
export function createFlashcardFromVocab(
  entry: VocabEntry,
  sourceQuestionId: string,
  level: Flashcard["level"]
): Flashcard {
  const id = `fc-${sourceQuestionId}-${entry.word}-${Date.now()}`;
  const state = initialSm2State();
  return {
    id,
    front: entry.word,
    back: `${entry.meaning}（${entry.pos}）`,
    context: entry.example || "",
    sourceQuestionId,
    knowledgePointId: sourceQuestionId,
    level,
    interval: state.interval,
    easeFactor: state.easeFactor,
    repetitions: state.repetitions,
    nextReview: today(),
  };
}

interface FlashcardStore {
  cards: Flashcard[];
  load: () => void;
  add: (card: Flashcard) => void;
  addFromVocab: (entry: VocabEntry, sourceQuestionId: string, level: Flashcard["level"]) => void;
  remove: (id: string) => void;
  getDue: () => Flashcard[];
  recordReview: (id: string, quality: number) => void;
}

export const useFlashcardStore = create<FlashcardStore>((set, get) => ({
  cards: [],

  load() {
    set({ cards: loadFromStorage() });
  },

  add(card) {
    const next = [...get().cards, card];
    set({ cards: next });
    saveToStorage(next);
  },

  addFromVocab(entry, sourceQuestionId, level) {
    const card = createFlashcardFromVocab(entry, sourceQuestionId, level);
    const existing = get().cards.some(
      (c) => c.sourceQuestionId === sourceQuestionId && c.front === entry.word
    );
    if (existing) return;
    get().add(card);
  },

  remove(id) {
    const next = get().cards.filter((c) => c.id !== id);
    set({ cards: next });
    saveToStorage(next);
  },

  getDue() {
    const now = today();
    return get().cards.filter((c) => c.nextReview <= now);
  },

  recordReview(id, quality) {
    const cards = get().cards;
    const idx = cards.findIndex((c) => c.id === id);
    if (idx < 0) return;
    const card = cards[idx];
    const state = nextSm2State(
      {
        interval: card.interval,
        easeFactor: card.easeFactor,
        repetitions: card.repetitions,
      },
      quality
    );
    const nextCard: Flashcard = {
      ...card,
      ...state,
      nextReview: nextReviewDate(state.interval),
      lastReview: today(),
    };
    const next = [...cards];
    next[idx] = nextCard;
    set({ cards: next });
    saveToStorage(next);
  },
}));
