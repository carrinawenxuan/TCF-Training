"use client";

import Link from "next/link";

export default function ReadingPage() {
  return (
    <main className="mx-auto max-w-2xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold text-[var(--primary)]">
        阅读 · CE
      </h1>
      <p className="mb-6 text-[var(--primary)]/80">
        选择题、同义替换专项，配合辅助理解（翻译 / 逐词 / 语法）刷题。
      </p>
      <ul className="space-y-2">
        <li>
          <Link
            href="/reading/practice"
            className="block rounded-lg border border-[var(--ce)]/30 bg-[var(--ce)]/10 px-4 py-3 text-[var(--primary)] hover:bg-[var(--ce)]/20"
          >
            练习模式
          </Link>
        </li>
        <li>
          <Link
            href="/reading/exam"
            className="block rounded-lg border border-[var(--primary)]/20 px-4 py-3 text-[var(--primary)]/80 hover:bg-[var(--primary)]/5"
          >
            考试模式（即将开放）
          </Link>
        </li>
        <li>
          <Link
            href="/reading/synonym"
            className="block rounded-lg border border-[var(--primary)]/20 px-4 py-3 text-[var(--primary)]/80 hover:bg-[var(--primary)]/5"
          >
            同义替换专项（即将开放）
          </Link>
        </li>
      </ul>
    </main>
  );
}
