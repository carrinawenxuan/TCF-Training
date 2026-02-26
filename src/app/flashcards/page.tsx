"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useFlashcardStore } from "@/lib/store/flashcard-store";

export default function FlashcardsPage() {
  const { cards, load, getDue, recordReview } = useFlashcardStore();
  const [due, setDue] = useState<ReturnType<typeof getDue>>([]);
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    setDue(getDue());
    setIndex(0);
    setFlipped(false);
  }, [cards, getDue]);

  const current = due[index];

  const handleRate = (quality: number) => {
    if (!current) return;
    recordReview(current.id, quality);
    setFlipped(false);
    setDue(getDue());
    setIndex(0);
  };

  if (cards.length === 0) {
    return (
      <main className="mx-auto max-w-2xl px-4 py-8">
        <h1 className="mb-6 text-2xl font-bold text-[var(--primary)]">记忆卡片</h1>
        <p className="mb-4 text-[var(--primary)]/80">
          暂无卡片。在
          <Link href="/reading/practice" className="text-[var(--primary)] underline">阅读练习</Link>
          或
          <Link href="/listening/practice" className="text-[var(--primary)] underline">听力练习</Link>
          中点击生词可「加入卡片」，或从错题生词批量添加（即将开放）。
        </p>
        <Link
          href="/"
          className="rounded-lg bg-[var(--primary)]/10 px-4 py-2 text-[var(--primary)]"
        >
          返回首页
        </Link>
      </main>
    );
  }

  if (due.length === 0) {
    return (
      <main className="mx-auto max-w-2xl px-4 py-8">
        <h1 className="mb-6 text-2xl font-bold text-[var(--primary)]">记忆卡片</h1>
        <p className="mb-4 text-[var(--primary)]/80">
          今日复习已完成，共 {cards.length} 张卡片。
        </p>
        <p className="mb-4 text-sm text-[var(--primary)]/70">
          明日将根据 SM-2 间隔推送到期卡片
        </p>
        <Link
          href="/"
          className="rounded-lg bg-[var(--primary)]/10 px-4 py-2 text-[var(--primary)]"
        >
          返回首页
        </Link>
      </main>
    );
  }

  const card = current;
  if (!card) return null;

  return (
    <main className="mx-auto max-w-2xl px-4 py-8">
      <div className="mb-4 flex items-center justify-between">
        <Link href="/" className="text-sm text-[var(--primary)]/70 hover:underline">
          ← 返回首页
        </Link>
        <span className="text-sm text-[var(--primary)]/70">
          今日剩余 {due.length - index} 张
        </span>
      </div>

      <div
        role="button"
        tabIndex={0}
        onClick={() => setFlipped((f) => !f)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            setFlipped((f) => !f);
          }
        }}
        className="min-h-[200px] cursor-pointer rounded-xl border-2 border-[var(--primary)]/30 bg-white p-6 shadow-sm transition hover:border-[var(--primary)]/50"
      >
        <p className="mb-2 text-xs text-[var(--primary)]/60">{card.level}</p>
        {!flipped ? (
          <p className="text-xl font-medium text-[var(--primary)]">{card.front}</p>
        ) : (
          <div>
            <p className="text-lg font-medium text-[var(--primary)]">{card.back}</p>
            {card.context && (
              <p className="mt-2 text-sm text-[var(--primary)]/70">{card.context}</p>
            )}
          </div>
        )}
        <p className="mt-4 text-xs text-[var(--primary)]/50">
          点击翻转 · 下方选择掌握程度
        </p>
      </div>

      {flipped && (
        <div className="mt-6 grid grid-cols-2 gap-2 sm:grid-cols-4">
          <button
            type="button"
            onClick={() => handleRate(1)}
            className="rounded-lg border border-[var(--error)]/50 bg-[var(--error)]/10 px-3 py-2 text-sm text-[var(--error)]"
          >
            忘记
          </button>
          <button
            type="button"
            onClick={() => handleRate(2)}
            className="rounded-lg border border-[var(--ee)]/50 bg-[var(--ee)]/10 px-3 py-2 text-sm text-[var(--ee)]"
          >
            困难
          </button>
          <button
            type="button"
            onClick={() => handleRate(4)}
            className="rounded-lg border border-[var(--primary)]/50 bg-[var(--primary)]/10 px-3 py-2 text-sm text-[var(--primary)]"
          >
            掌握
          </button>
          <button
            type="button"
            onClick={() => handleRate(5)}
            className="rounded-lg border border-[var(--success)]/50 bg-[var(--success)]/10 px-3 py-2 text-sm text-[var(--success)]"
          >
            简单
          </button>
        </div>
      )}
    </main>
  );
}
