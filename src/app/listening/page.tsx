"use client";

import Link from "next/link";

export default function ListeningPage() {
  return (
    <main className="mx-auto max-w-2xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold text-[var(--primary)]">听力 · CO</h1>
      <p className="mb-6 text-[var(--primary)]/80">
        听录音做选择题，配合辅助理解（翻译 / 逐词 / 语法）。需配置 ELEVENLABS_API_KEY 使用 TTS。
      </p>
      <ul className="space-y-2">
        <li>
          <Link
            href="/listening/practice"
            className="block rounded-lg border border-[var(--co)]/30 bg-[var(--co)]/10 px-4 py-3 text-[var(--primary)] hover:bg-[var(--co)]/20"
          >
            练习模式
          </Link>
        </li>
        <li>
          <Link
            href="/listening/exam"
            className="block rounded-lg border border-[var(--primary)]/20 px-4 py-3 text-[var(--primary)]/80 hover:bg-[var(--primary)]/5"
          >
            考试模式（即将开放）
          </Link>
        </li>
      </ul>
    </main>
  );
}
