import { useId } from "react";

/** Api bergradien untuk streak. `lit=false` menjadi padam (abu-abu). */
export function StreakFlame({ size = 24, lit = true, className }: { size?: number; lit?: boolean; className?: string }) {
  const id = useId();
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" className={className} aria-hidden>
      <defs>
        <linearGradient id={`${id}-o`} x1="32" y1="60" x2="32" y2="4" gradientUnits="userSpaceOnUse">
          <stop stopColor={lit ? "#FB7185" : "#4A5170"} />
          <stop offset="0.55" stopColor={lit ? "#FB923C" : "#667091"} />
          <stop offset="1" stopColor={lit ? "#FBBF24" : "#8A93B2"} />
        </linearGradient>
        <linearGradient id={`${id}-i`} x1="32" y1="58" x2="32" y2="28" gradientUnits="userSpaceOnUse">
          <stop stopColor={lit ? "#FDE68A" : "#8A93B2"} />
          <stop offset="1" stopColor={lit ? "#FFF7D1" : "#B4BBD3"} />
        </linearGradient>
      </defs>
      <path d="M32 3 C35 16 51 22 51 40 C51 52 43 61 32 61 C21 61 13 52 13 40 C13 32 18 27 22 21 C23 27 26 30 28.5 30 C27 20 28.5 10 32 3 Z" fill={`url(#${id}-o)`} />
      <path d="M32 29 C34.5 37 42 40 42 49 C42 55 37.5 58.5 32 58.5 C26.5 58.5 22 55 22 49 C22 43 29 40 32 29 Z" fill={`url(#${id}-i)`} />
    </svg>
  );
}
