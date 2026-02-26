"use client";

import Link from "next/link";

const modules = [
  { id: "CO", name: "听力", href: "/listening", color: "co" },
  { id: "CE", name: "阅读", href: "/reading", color: "ce" },
  { id: "EE", name: "写作", href: "/writing", color: "ee" },
  { id: "EO", name: "口语", href: "/speaking", color: "eo" },
] as const;

export function ModuleSelector() {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {modules.map((m) => (
        <Link
          key={m.id}
          href={m.href}
          className="rounded-xl border-2 px-4 py-4 text-center font-medium text-[var(--primary)] transition hover:opacity-90"
          style={{
            borderColor: `var(--${m.color})`,
            backgroundColor: `color-mix(in srgb, var(--${m.color}) 15%, transparent)`,
          }}
        >
          <span className="block text-2xl">{m.id}</span>
          <span>{m.name}</span>
        </Link>
      ))}
    </div>
  );
}
