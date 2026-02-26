/**
 * 客户端调用 TTS API，返回可播放的 blob URL。
 * 调用方负责 revokeObjectURL 释放（或在组件卸载时）。
 */
const cache = new Map<string, string>();

export async function getTtsAudioUrl(
  text: string,
  voiceId?: string
): Promise<string> {
  const key = `${voiceId ?? ""}:${text.slice(0, 200)}`;
  if (cache.has(key)) return cache.get(key)!;

  const res = await fetch("/api/tts/generate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text, voiceId }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error((err as { error?: string }).error ?? "TTS 请求失败");
  }

  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  cache.set(key, url);
  return url;
}
