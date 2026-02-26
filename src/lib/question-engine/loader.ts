"use client";

import { useEffect } from "react";
import { useQuestionStore } from "@/lib/store/question-store";
import type { AnyQuestion, TCFModule, TCFLevel } from "@/types/question";

/**
 * 从 store（localStorage）加载题目，可选按模块/等级筛选。
 */
export function useQuestions(module?: TCFModule, level?: TCFLevel): AnyQuestion[] {
  const { questions, load } = useQuestionStore();
  useEffect(() => {
    load();
  }, [load]);

  let list = questions;
  if (module) list = list.filter((q) => q.module === module);
  if (level) list = list.filter((q) => q.level === level);
  return list;
}

/**
 * 服务端或构建时加载本地 JSON 题目（可选）
 */
export async function loadQuestionsFromJson(
  module: TCFModule
): Promise<AnyQuestion[]> {
  try {
    const res = await fetch(`/data/questions/${module.toLowerCase()}/index.json`);
    if (!res.ok) return [];
    const data = await res.json();
    return Array.isArray(data) ? data : data.questions ?? [];
  } catch {
    return [];
  }
}
