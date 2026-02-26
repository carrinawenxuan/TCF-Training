import { NextResponse } from "next/server";
import { buildAssistCompletePrompt } from "@/lib/ai/prompts/question-explainer";

const COOLDOWN_MS = 3000;
const lastCall: Record<string, number> = {};

function getProvider(): "openai" | "anthropic" | null {
  const provider = process.env.AI_PROVIDER?.toLowerCase();
  if (provider === "claude" || provider === "anthropic") {
    return process.env.ANTHROPIC_API_KEY ? "anthropic" : null;
  }
  if (provider === "openai") {
    return process.env.OPENAI_API_KEY ? "openai" : null;
  }
  if (process.env.ANTHROPIC_API_KEY) return "anthropic";
  if (process.env.OPENAI_API_KEY) return "openai";
  return null;
}

/** 调用 OpenAI 返回助手补全 JSON */
async function callOpenAI(prompt: string): Promise<string> {
  const key = process.env.OPENAI_API_KEY;
  if (!key) throw new Error("OPENAI_API_KEY not set");

  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${key}`,
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

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`OpenAI API error: ${res.status} ${err}`);
  }

  const data = (await res.json()) as { choices?: { message?: { content?: string } }[] };
  const content = data.choices?.[0]?.message?.content?.trim();
  if (!content) throw new Error("Empty OpenAI response");
  return content;
}

/** 调用 Anthropic Claude 返回助手补全 JSON */
async function callAnthropic(prompt: string): Promise<string> {
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) throw new Error("ANTHROPIC_API_KEY not set");

  const res = await fetch(
    "https://api.anthropic.com/v1/messages",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": key,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: process.env.ANTHROPIC_MODEL || "claude-3-5-haiku-20241022",
        max_tokens: 4096,
        messages: [{ role: "user", content: prompt }],
        system: "你只输出有效的 JSON，不要 markdown 代码块或前后说明文字。",
      }),
    }
  );

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Anthropic API error: ${res.status} ${err}`);
  }

  const data = (await res.json()) as { content?: { text?: string }[] };
  const text = data.content?.[0]?.text?.trim();
  if (!text) throw new Error("Empty Anthropic response");
  return text;
}

/** 从 AI 返回文本中提取 JSON */
function extractJson(text: string): Record<string, unknown> {
  const trimmed = text.trim();
  const codeBlock = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/);
  const raw = codeBlock ? codeBlock[1].trim() : trimmed;
  return JSON.parse(raw) as Record<string, unknown>;
}

export async function POST(request: Request) {
  try {
    const now = Date.now();
    const key = "complete-assist";
    if (lastCall[key] && now - lastCall[key] < COOLDOWN_MS) {
      return NextResponse.json(
        { error: "请求过于频繁，请稍后再试" },
        { status: 429 }
      );
    }
    lastCall[key] = now;

    const body = await request.json();
    const question = body?.question ?? body;
    if (!question || typeof question !== "object") {
      return NextResponse.json(
        { error: "请提供 question 对象" },
        { status: 400 }
      );
    }

    const provider = getProvider();
    if (!provider) {
      return NextResponse.json(
        { error: "未配置 AI：请设置 OPENAI_API_KEY 或 ANTHROPIC_API_KEY 及 AI_PROVIDER" },
        { status: 503 }
      );
    }

    const prompt = buildAssistCompletePrompt(JSON.stringify(question, null, 2));
    const rawResponse =
      provider === "openai"
        ? await callOpenAI(prompt)
        : await callAnthropic(prompt);

    const patch = extractJson(rawResponse);

    // 合并到题目：assist 与 explanation
    const assist = {
      ...(typeof question.assist === "object" ? question.assist : {}),
      ...(patch.questionTranslation !== undefined && {
        questionTranslation: String(patch.questionTranslation),
      }),
      ...(Array.isArray(patch.optionTranslations) && {
        optionTranslations: patch.optionTranslations.map(String),
      }),
      ...(patch.passageTranslation !== undefined && {
        passageTranslation: String(patch.passageTranslation),
      }),
      ...(Array.isArray(patch.wordByWord) && { wordByWord: patch.wordByWord }),
      ...(Array.isArray(patch.grammarNotes) && { grammarNotes: patch.grammarNotes }),
      ...(Array.isArray(patch.keyVocabulary) && { keyVocabulary: patch.keyVocabulary }),
    };

    const explanation =
      patch.explanation !== undefined
        ? String(patch.explanation)
        : question.explanation;

    const merged = {
      ...question,
      assist,
      explanation: explanation || question.explanation,
    };

    return NextResponse.json({ question: merged });
  } catch (e) {
    const message = e instanceof Error ? e.message : "补全失败";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
