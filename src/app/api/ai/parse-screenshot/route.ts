import { NextResponse } from "next/server";

/**
 * 截图解析占位：后续可接收图片 base64 或 URL，调用视觉模型输出题目 JSON。
 * Phase 1 建议流程：用户复制 Prompt 到外部 AI → 上传截图 → 获得 JSON → 粘贴到导入中心。
 */
export async function POST() {
  return NextResponse.json(
    {
      error: "截图解析 API 尚未开放，请使用「复制 Prompt 模板」在 Claude/ChatGPT 中上传截图获得 JSON。",
    },
    { status: 501 }
  );
}
