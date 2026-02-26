"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useQuestions } from "@/lib/question-engine/loader";
import { ReadingQuestion } from "@/components/reading/ReadingQuestion";
import type { ReadingQuestion as ReadingQuestionType } from "@/types/question";

export default function ReadingPracticePage() {
  const questions = useQuestions("CE");
  const [index, setIndex] = useState(0);
  const [showResult, setShowResult] = useState(false);

  const current = questions[index] as ReadingQuestionType | undefined;

  useEffect(() => {
    setIndex(0);
    setShowResult(false);
  }, [questions.length]);

  if (questions.length === 0) {
    return (
      <main className="mx-auto max-w-2xl px-4 py-8">
        <h1 className="mb-4 text-2xl font-bold text-[var(--primary)]">
          阅读练习
        </h1>
        <p className="mb-4 text-[var(--primary)]/80">
          暂无阅读题。请先在
          <Link href="/import" className="text-[var(--primary)] underline">
            题目导入
          </Link>
          中粘贴或导入 CE 阅读题 JSON。
        </p>
        <Link
          href="/reading"
          className="rounded-lg bg-[var(--primary)]/10 px-4 py-2 text-[var(--primary)]"
        >
          返回阅读
        </Link>
      </main>
    );
  }

  const handleAnswer = (_selectedId: string, _correct: boolean) => {
    setShowResult(true);
  };

  const goNext = () => {
    setShowResult(false);
    setIndex((i) => Math.min(i + 1, questions.length - 1));
  };

  const goPrev = () => {
    setShowResult(false);
    setIndex((i) => Math.max(i - 1, 0));
  };

  return (
    <main className="mx-auto max-w-2xl px-4 py-6">
      <div className="mb-4 flex items-center justify-between">
        <Link href="/reading" className="text-sm text-[var(--primary)]/70 hover:underline">
          ← 返回阅读
        </Link>
        <span className="text-sm text-[var(--primary)]/70">
          第 {index + 1} / {questions.length} 题
        </span>
      </div>

      <ReadingQuestion
        question={current!}
        onAnswer={handleAnswer}
        showResult={showResult}
      />

      <div className="mt-6 flex justify-between">
        <button
          type="button"
          onClick={goPrev}
          disabled={index === 0}
          className="rounded-lg border border-[var(--primary)]/30 px-4 py-2 text-sm text-[var(--primary)] disabled:opacity-50"
        >
          上一题
        </button>
        <button
          type="button"
          onClick={goNext}
          disabled={index >= questions.length - 1}
          className="rounded-lg bg-[var(--primary)] px-4 py-2 text-sm text-white disabled:opacity-50"
        >
          下一题
        </button>
      </div>
    </main>
  );
}
