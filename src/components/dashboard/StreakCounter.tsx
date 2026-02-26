"use client";

import { useUserStore } from "@/lib/store/user-store";

export function StreakCounter() {
  const streak = useUserStore((s) => s.profile.streak);

  return (
    <div className="rounded-xl border border-[var(--accent)]/30 bg-[var(--accent)]/10 px-4 py-3 text-center">
      <p className="text-2xl font-bold text-[var(--primary)]">{streak}</p>
      <p className="text-sm text-[var(--primary)]/70">连续学习天数</p>
    </div>
  );
}
