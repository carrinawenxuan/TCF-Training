"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import { ModuleTabs } from "@/components/import/ModuleTabs";
import { IMPORT_PROMPTS } from "@/lib/ai/prompts/import-templates";
import type { TCFModule } from "@/types/question";

const MODULE_TO_PROMPT_KEY: Record<TCFModule, keyof typeof IMPORT_PROMPTS> = {
  CO: "listening",
  CE: "reading",
  EE: "writing",
  EO: "speaking",
};

export default function ImportScreenshotPage() {
  const [selectedModule, setSelectedModule] = useState<TCFModule>("CE");

  const copyCurrentPrompt = useCallback(() => {
    const key = MODULE_TO_PROMPT_KEY[selectedModule];
    const text = IMPORT_PROMPTS[key];
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(text);
      const label = { CO: "听力", CE: "阅读", EO: "口语", EE: "写作" }[selectedModule];
      alert(`已复制「${label}」Prompt，请到 Claude/ChatGPT 中粘贴并上传截图，获得 JSON 后到导入中心粘贴。`);
    }
  }, [selectedModule]);

  return (
    <main className="mx-auto max-w-2xl px-4 py-8">
      <h1 className="mb-4 text-2xl font-bold text-[var(--primary)]">
        截图导入
      </h1>

      <section className="mb-6">
        <h2 className="mb-2 text-sm font-medium text-[var(--primary)]">
          选择题型（无需系统识别，按所选类型生成题目）
        </h2>
        <ModuleTabs value={selectedModule} onChange={setSelectedModule} />
      </section>

      <p className="mb-4 text-[var(--primary)]/80">
        先在上方选择「听力 / 阅读 / 口语 / 写作」，再点击下方按钮复制对应题型的 Prompt。在 Claude 或 ChatGPT 中粘贴该 Prompt 并上传截图，即可获得标准 JSON。将 JSON 粘贴到
        <Link href="/import" className="text-[var(--primary)] underline">
          导入中心
        </Link>
        即可解析并导入。
      </p>

      <button
        type="button"
        onClick={copyCurrentPrompt}
        className="rounded-lg bg-[var(--primary)] px-4 py-2 text-sm text-white hover:opacity-90"
      >
        📋 复制当前题型（{selectedModule === "CO" ? "听力" : selectedModule === "CE" ? "阅读" : selectedModule === "EO" ? "口语" : "写作"}）Prompt
      </button>

      <p className="mt-4 text-sm text-[var(--primary)]/60">
        上传截图自动解析功能将在后续版本开放，届时仍会使用您在此选择的题型，无需 AI 识别。
      </p>
    </main>
  );
}
