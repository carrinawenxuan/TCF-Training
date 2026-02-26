"use client";

import { useEffect } from "react";
import Link from "next/link";
import { ModuleSelector } from "@/components/dashboard/ModuleSelector";
import { DailyPlan } from "@/components/dashboard/DailyPlan";
import { StreakCounter } from "@/components/dashboard/StreakCounter";
import { useUserStore } from "@/lib/store/user-store";

export default function DashboardPage() {
  const load = useUserStore((s) => s.load);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <main className="mx-auto max-w-4xl px-4 py-8">
      <h1 className="mb-2 text-2xl font-bold text-[var(--primary)]">
        TCF 刷题训练
      </h1>
      <p className="mb-6 text-[var(--primary)]/80">
        真题 → 错题分析 → 强化练习 → 间隔重复 · 从 A1 冲刺 B2
      </p>

      <div className="mb-8 grid gap-4 sm:grid-cols-2">
        <StreakCounter />
        <DailyPlan />
      </div>

      <section className="mb-6">
        <h2 className="mb-3 font-medium text-[var(--primary)]">模块入口</h2>
        <ModuleSelector />
      </section>

      <section className="rounded-xl border border-[var(--primary)]/20 bg-[var(--assist-bg)]/30 p-4">
        <h2 className="mb-2 font-medium text-[var(--primary)]">题目导入</h2>
        <p className="mb-3 text-sm text-[var(--primary)]/80">
          通过截图 + AI 对话获得 JSON，或手动录入题目。导入的题目会进入对应模块练习。
        </p>
        <Link
          href="/import"
          className="inline-block rounded-lg bg-[var(--primary)] px-4 py-2 text-sm text-white hover:opacity-90"
        >
          前往导入中心
        </Link>
      </section>
    </main>
  );
}
