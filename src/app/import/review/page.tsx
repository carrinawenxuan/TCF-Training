export default function ImportReviewPage() {
  return (
    <main className="mx-auto max-w-2xl px-4 py-8">
      <h1 className="mb-4 text-2xl font-bold text-[var(--primary)]">
        AI 生成题审核队列
      </h1>
      <p className="text-[var(--primary)]/80">
        暂无待审核题目。当通过 API 自动生成题目时，会在此处进行质量审核后再入库。
      </p>
    </main>
  );
}
