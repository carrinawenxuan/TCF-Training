"use client";

import type { TCFModule } from "@/types/question";

const MODULE_TABS: { value: TCFModule; label: string }[] = [
  { value: "CO", label: "听力" },
  { value: "CE", label: "阅读" },
  { value: "EO", label: "口语" },
  { value: "EE", label: "写作" },
];

interface ModuleTabsProps {
  value: TCFModule;
  onChange: (module: TCFModule) => void;
  className?: string;
}

export function ModuleTabs({ value, onChange, className = "" }: ModuleTabsProps) {
  return (
    <div
      className={`flex rounded-lg border border-[var(--primary)]/20 bg-[var(--primary)]/5 p-1 ${className}`}
      role="tablist"
      aria-label="选择题型"
    >
      {MODULE_TABS.map(({ value: v, label }) => (
        <button
          key={v}
          type="button"
          role="tab"
          aria-selected={value === v}
          onClick={() => onChange(v)}
          className={`flex-1 rounded-md px-3 py-2 text-sm font-medium transition ${
            value === v
              ? "bg-[var(--primary)] text-white"
              : "text-[var(--primary)]/80 hover:bg-[var(--primary)]/10"
          }`}
        >
          {label}
        </button>
      ))}
    </div>
  );
}

export { MODULE_TABS };
