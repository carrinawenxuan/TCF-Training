import Link from "next/link";

const nav = [
  { href: "/", label: "首页" },
  { href: "/import", label: "题目导入" },
  { href: "/reading", label: "阅读" },
  { href: "/listening", label: "听力" },
  { href: "/writing", label: "写作" },
  { href: "/speaking", label: "口语" },
  { href: "/flashcards", label: "记忆卡片" },
  { href: "/analytics", label: "数据" },
];

export function Navbar() {
  return (
    <nav className="sticky top-0 z-50 border-b border-[var(--primary)]/20 bg-[var(--bg)] px-4 py-3">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-2">
        <Link href="/" className="text-lg font-semibold text-[var(--primary)]">
          TCF 刷题训练
        </Link>
        <ul className="flex flex-wrap gap-4">
          {nav.map(({ href, label }) => (
            <li key={href}>
              <Link
                href={href}
                className="text-sm text-[var(--primary)]/80 hover:text-[var(--primary)] hover:underline"
              >
                {label}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
}
