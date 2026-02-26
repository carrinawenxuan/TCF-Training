"use client";

import { create } from "zustand";
import type { UserProfile, AssistMode } from "@/types/user";
import { getDefaultAssistMode } from "@/types/user";

const STORAGE_KEY = "tcf_user_profile";

function loadProfile(): UserProfile {
  if (typeof window === "undefined") {
    return {
      currentLevel: "A1",
      targetLevel: "B2",
      assistMode: getDefaultAssistMode("A1"),
      weaknesses: [],
      strengths: [],
      dailyGoalMinutes: 30,
      streak: 0,
    };
  }
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return getDefaultProfile();
    const parsed = JSON.parse(raw) as Partial<UserProfile>;
    return {
      ...getDefaultProfile(),
      ...parsed,
      assistMode: { ...getDefaultAssistMode(parsed.currentLevel ?? "A1"), ...parsed.assistMode },
    };
  } catch {
    return getDefaultProfile();
  }
}

function getDefaultProfile(): UserProfile {
  return {
    currentLevel: "A1",
    targetLevel: "B2",
    assistMode: getDefaultAssistMode("A1"),
    weaknesses: [],
    strengths: [],
    dailyGoalMinutes: 30,
    streak: 0,
  };
}

function saveProfile(profile: UserProfile) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
  } catch {
    // ignore
  }
}

interface UserStore {
  profile: UserProfile;
  load: () => void;
  setProfile: (patch: Partial<UserProfile>) => void;
  setAssistMode: (mode: Partial<AssistMode>) => void;
}

export const useUserStore = create<UserStore>((set, get) => ({
  profile: getDefaultProfile(),

  load() {
    set({ profile: loadProfile() });
  },

  setProfile(patch) {
    const next = { ...get().profile, ...patch };
    set({ profile: next });
    saveProfile(next);
  },

  setAssistMode(mode) {
    const next = { ...get().profile, assistMode: { ...get().profile.assistMode, ...mode } };
    set({ profile: next });
    saveProfile(next);
  },
}));
