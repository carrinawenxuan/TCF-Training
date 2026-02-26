import type { Metadata } from "next";
import "./globals.css";
import { Navbar } from "@/components/shared/Navbar";

export const metadata: Metadata = {
  title: "TCF 刷题训练系统",
  description: "TCF 法语考试全模块训练 — 听力·阅读·写作·口语",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body className="min-h-screen antialiased">
        <Navbar />
        {children}
      </body>
    </html>
  );
}
