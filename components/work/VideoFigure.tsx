"use client";

import { useRef, useState } from "react";
import { PLAY_TRIANGLE_PATH } from "@/components/work/play-icon";

export default function VideoFigure({
  poster,
  ratio,
  videoSrc,
  altSrc,
  altType,
  narrow,
}: {
  poster: string;
  ratio?: string;
  videoSrc: string;
  altSrc?: string;
  altType?: string;
  narrow?: boolean;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);

  return (
    <div className={`relative w-full ${narrow ? "max-w-[360px]" : ""}`}>
      <video
        ref={videoRef}
        controls
        preload="none"
        poster={poster}
        style={ratio ? { aspectRatio: ratio } : undefined}
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        className="h-auto w-full rounded-(--radius) border border-(--color-faint)"
      >
        {altSrc && <source src={altSrc} type={altType} />}
        <source src={videoSrc} type="video/mp4" />
      </video>
      <span
        className={`pointer-events-none absolute inset-0 flex items-center justify-center transition-opacity duration-(--dur-fast) ease-(--ease-out) ${
          playing ? "opacity-0" : "opacity-100"
        }`}
        aria-hidden={playing}
      >
        <button
          type="button"
          aria-label="Play video"
          disabled={playing}
          onClick={() => videoRef.current?.play()}
          className="pointer-events-auto flex h-12 w-12 items-center justify-center rounded-full border border-(--color-faint) bg-[rgb(3_5_16/.72)] backdrop-blur-[2px] transition-colors duration-(--dur-fast) ease-(--ease-out) hover:border-[rgb(232_185_97/.55)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--color-c2) disabled:pointer-events-none"
        >
          <svg
            viewBox="0 0 24 24"
            className="ml-0.5 h-5 w-5 fill-(--color-ink)"
            aria-hidden
          >
            <path d={PLAY_TRIANGLE_PATH} />
          </svg>
        </button>
      </span>
    </div>
  );
}
