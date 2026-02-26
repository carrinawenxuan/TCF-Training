"use client";

import { create } from "zustand";
import type { AnyQuestion, TCFModule, TCFLevel } from "@/types/question";

const STORAGE_KEY = "tcf_imported_questions";

function loadFromStorage(): AnyQuestion[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

function saveToStorage(questions: AnyQuestion[]) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(questions));
  } catch {
    // ignore
  }
}

interface QuestionStore {
  questions: AnyQuestion[];
  load: () => void;
  add: (q: AnyQuestion | AnyQuestion[]) => void;
  remove: (id: string) => void;
  getByModule: (module: TCFModule) => AnyQuestion[];
  getByModuleAndLevel: (module: TCFModule, level: TCFLevel) => AnyQuestion[];
  getById: (id: string) => AnyQuestion | undefined;
}

export const useQuestionStore = create<QuestionStore>((set, get) => ({
  questions: [],

  load() {
    set({ questions: loadFromStorage() });
  },

  add(q) {
    const list = Array.isArray(q) ? q : [q];
    const next = [...get().questions];
    for (const item of list) {
      const idx = next.findIndex((x) => x.id === item.id);
      if (idx >= 0) next[idx] = item;
      else next.push(item);
    }
    set({ questions: next });
    saveToStorage(next);
  },

  remove(id) {
    const next = get().questions.filter((x) => x.id !== id);
    set({ questions: next });
    saveToStorage(next);
  },

  getByModule(module) {
    return get().questions.filter((x) => x.module === module);
  },

  getByModuleAndLevel(module, level) {
    return get().questions.filter((x) => x.module === module && x.level === level);
  },

  getById(id) {
    return get().questions.find((x) => x.id === id);
  },
}));
