export default function ImportScreenshotPage() {
  return (
    <main className="mx-auto max-w-2xl px-4 py-8">
      <h1 className="mb-4 text-2xl font-bold text-[var(--primary)]">
        截图导入
      </h1>
      <p className="text-[var(--primary)]/80">
        上传截图功能将在后续版本开放。请先在
        <a href="/import" className="text-[var(--primary)] underline">
          导入中心
        </a>
        使用「复制 Prompt 模板」→ 在 Claude/ChatGPT 中上传截图获得 JSON → 粘贴回导入中心。
      </p>
    </main>
  );
}
