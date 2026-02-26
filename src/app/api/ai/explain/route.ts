import { NextResponse } from "next/server";
import { buildAssistCompletePrompt } from "@/lib/ai/prompts/question-explainer";

/**
 * 题目讲解：返回「仅中文解析」文本，供「帮我读懂这题」等场景使用。
 * 若前端需要完整 assist 结构，请调用 /api/ai/complete-assist。
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const question = body?.question ?? body;
    if (!question || typeof question !== "object") {
      return NextResponse.json(
        { error: "请提供 question 对象" },
        { status: 400 }
      );
    }

    const key =
      process.env.AI_PROVIDER === "openai"
        ? process.env.OPENAI_API_KEY
        : process.env.ANTHROPIC_API_KEY;
    if (!key) {
      return NextResponse.json(
        { error: "未配置 AI API Key" },
        { status: 503 }
      );
    }

    const prompt = buildAssistCompletePrompt(JSON.stringify(question, null, 2));

    if (process.env.AI_PROVIDER === "openai" || process.env.OPENAI_API_KEY) {
      const res = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
          model: process.env.OPENAI_MODEL || "gpt-4o-mini",
          messages: [
            { role: "system", content: "你只输出有效的 JSON，不要 markdown 或多余文字。" },
            { role: "user", content: prompt },
          ],
          temperature: 0.3,
        }),
      });
      if (!res.ok) throw new Error(`OpenAI: ${res.status}`);
      const data = (await res.json()) as { choices?: { message?: { content?: string } }[] };
      const content = data.choices?.[0]?.message?.content?.trim() ?? "";
      const raw = content.replace(/```(?:json)?\s*/g, "").replace(/```/g, "").trim();
      try {
        const parsed = JSON.parse(raw) as { explanation?: string };
        return NextResponse.json({ explanation: parsed.explanation ?? content });
      } catch {
        return NextResponse.json({ explanation: content });
      }
    }

    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY!,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: process.env.ANTHROPIC_MODEL || "claude-3-5-haiku-20241022",
        max_tokens: 4096,
        messages: [{ role: "user", content: prompt }],
        system: "你只输出有效的 JSON。",
      }),
    });
    if (!res.ok) throw new Error(`Anthropic: ${res.status}`);
    const data = (await res.json()) as { content?: { text?: string }[] };
    const text = data.content?.[0]?.text?.trim() ?? "";
    const raw = text.replace(/```(?:json)?\s*/g, "").replace(/```/g, "").trim();
    try {
      const parsed = JSON.parse(raw) as { explanation?: string };
      return NextResponse.json({ explanation: parsed.explanation ?? text });
    } catch {
      return NextResponse.json({ explanation: text });
    }
  } catch (e) {
    const message = e instanceof Error ? e.message : "讲解失败";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
