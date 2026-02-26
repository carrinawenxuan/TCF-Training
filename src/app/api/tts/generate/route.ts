import { NextRequest, NextResponse } from "next/server";

/**
 * ElevenLabs TTS：根据文本生成法语朗读音频。
 * 环境变量：ELEVENLABS_API_KEY，ELEVENLABS_VOICE_ID_FR（可选，请求可覆盖）
 */
export async function POST(request: NextRequest) {
  const apiKey = process.env.ELEVENLABS_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "未配置 ELEVENLABS_API_KEY" },
      { status: 503 }
    );
  }

  let body: { text: string; voiceId?: string; speed?: number };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "请求体须为 JSON，包含 text" },
      { status: 400 }
    );
  }

  const text = body?.text?.trim();
  if (!text || typeof text !== "string") {
    return NextResponse.json(
      { error: "缺少或无效的 text 字段" },
      { status: 400 }
    );
  }

  const voiceId =
    body.voiceId ||
    process.env.ELEVENLABS_VOICE_ID_FR ||
    "EXAVITQu4vr4xnSDxMaL"; // 默认法语友好 voice

  try {
    const res = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "xi-api-key": apiKey,
          Accept: "audio/mpeg",
        },
        body: JSON.stringify({
          text,
          model_id: process.env.ELEVENLABS_MODEL_ID || "eleven_multilingual_v2",
        }),
      }
    );

    if (!res.ok) {
      const err = await res.text();
      return NextResponse.json(
        { error: `ElevenLabs 错误: ${res.status} ${err}` },
        { status: res.status === 401 ? 401 : 502 }
      );
    }

    const blob = await res.blob();
    return new NextResponse(blob, {
      headers: {
        "Content-Type": "audio/mpeg",
        "Cache-Control": "private, max-age=86400",
      },
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : "TTS 请求失败";
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}
