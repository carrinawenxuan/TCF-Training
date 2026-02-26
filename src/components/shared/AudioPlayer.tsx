"use client";

import { useRef, useState, useEffect } from "react";
import { getTtsAudioUrl } from "@/lib/tts/client";

interface AudioPlayerProps {
  /** 已有音频 URL 时直接使用 */
  src?: string | null;
  /** 无 src 时用 TTS 根据此文本生成 */
  ttsText?: string;
  voiceId?: string;
  className?: string;
}

export function AudioPlayer({
  src,
  ttsText,
  voiceId,
  className = "",
}: AudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [blobUrl, setBlobUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);

  const effectiveSrc = src || blobUrl;

  useEffect(() => {
    if (src || !ttsText) return;
    let cancelled = false;
    setLoading(true);
    setError(null);
    getTtsAudioUrl(ttsText, voiceId)
      .then((url) => {
        if (!cancelled) {
          setBlobUrl(url);
          setLoading(false);
        } else {
          URL.revokeObjectURL(url);
        }
      })
      .catch((e) => {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : "生成音频失败");
          setLoading(false);
        }
      });
    return () => {
      cancelled = true;
      setBlobUrl((u) => {
        if (u) URL.revokeObjectURL(u);
        return null;
      });
    };
  }, [src, ttsText, voiceId]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !effectiveSrc) return;

    const onTimeUpdate = () => setProgress(audio.currentTime);
    const onDurationChange = () => setDuration(audio.duration || 0);
    const onEnded = () => setPlaying(false);
    const onPlay = () => setPlaying(true);
    const onPause = () => setPlaying(false);

    audio.addEventListener("timeupdate", onTimeUpdate);
    audio.addEventListener("durationchange", onDurationChange);
    audio.addEventListener("ended", onEnded);
    audio.addEventListener("play", onPlay);
    audio.addEventListener("pause", onPause);
    return () => {
      audio.removeEventListener("timeupdate", onTimeUpdate);
      audio.removeEventListener("durationchange", onDurationChange);
      audio.removeEventListener("ended", onEnded);
      audio.removeEventListener("play", onPlay);
      audio.removeEventListener("pause", onPause);
    };
  }, [effectiveSrc]);

  const handlePlayPause = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (playing) audio.pause();
    else audio.play();
  };

  if (error) {
    return (
      <div className={`rounded-lg border border-[var(--error)]/50 bg-[var(--error)]/10 p-3 text-sm text-[var(--error)] ${className}`}>
        {error}
      </div>
    );
  }

  if (loading && !effectiveSrc) {
    return (
      <div className={`flex items-center gap-2 rounded-lg border border-[var(--primary)]/20 bg-[var(--primary)]/5 px-4 py-3 ${className}`}>
        <span className="text-sm text-[var(--primary)]/80">正在生成音频…</span>
      </div>
    );
  }

  if (!effectiveSrc) return null;

  const percent = duration > 0 ? (progress / duration) * 100 : 0;

  return (
    <div className={`flex flex-col gap-2 rounded-lg border border-[var(--primary)]/20 bg-[var(--primary)]/5 p-3 ${className}`}>
      <audio ref={audioRef} src={effectiveSrc} preload="metadata" />
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={handlePlayPause}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--primary)] text-white hover:opacity-90"
          aria-label={playing ? "暂停" : "播放"}
        >
          {playing ? (
            <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
              <rect x="6" y="4" width="4" height="16" rx="1" />
              <rect x="14" y="4" width="4" height="16" rx="1" />
            </svg>
          ) : (
            <svg className="ml-0.5 h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z" />
            </svg>
          )}
        </button>
        <div className="min-w-0 flex-1">
          <div className="h-2 w-full overflow-hidden rounded-full bg-[var(--primary)]/20">
            <div
              className="h-full rounded-full bg-[var(--primary)] transition-all duration-150"
              style={{ width: `${percent}%` }}
            />
          </div>
          <p className="mt-1 text-xs text-[var(--primary)]/70">
            {formatTime(progress)} / {formatTime(duration)}
          </p>
        </div>
      </div>
    </div>
  );
}

function formatTime(s: number): string {
  if (!Number.isFinite(s) || s < 0) return "0:00";
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${sec.toString().padStart(2, "0")}`;
}
