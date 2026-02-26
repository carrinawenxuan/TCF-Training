"use client";

import { useUserStore } from "@/lib/store/user-store";

export function DailyPlan() {
  const profile = useUserStore((s) => s.profile);

  return (
    <div className="rounded-xl border border-[var(--primary)]/20 bg-white p-4">
      <h2 className="mb-2 font-medium text-[var(--primary)]">今日计划</h2>
      <p className="text-sm text-[var(--primary)]/80">
        目标学习 <strong>{profile.dailyGoalMinutes}</strong> 分钟 · 当前等级 {profile.currentLevel} → 目标 {profile.targetLevel}
      </p>
      <p className="mt-2 text-xs text-[var(--primary)]/60">
        完成各模块练习与记忆卡片复习即可计入每日目标。
      </p>
    </div>
  );
}
