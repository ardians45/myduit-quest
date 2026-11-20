import { useId } from "react";

/** Koin emas bertepi dengan monogram "G". Dipakai sebagai logo/brand. */
export function CoinMark({ size = 40, className }: { size?: number; className?: string }) {
  const id = useId();
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" className={className} role="img" aria-label="Myduit Gweh">
      <defs>
        <linearGradient id={`${id}-rim`} x1="10" y1="6" x2="54" y2="60" gradientUnits="userSpaceOnUse">
          <stop stopColor="#FFE9A6" />
          <stop offset="0.5" stopColor="#F5B83D" />
          <stop offset="1" stopColor="#B8730F" />
        </linearGradient>
        <linearGradient id={`${id}-face`} x1="16" y1="10" x2="48" y2="56" gradientUnits="userSpaceOnUse">
          <stop stopColor="#FBD369" />
          <stop offset="1" stopColor="#E09A1B" />
        </linearGradient>
        <radialGradient id={`${id}-glow`} cx="0.3" cy="0.22" r="0.7">
          <stop stopColor="#fff" stopOpacity="0.55" />
          <stop offset="1" stopColor="#fff" stopOpacity="0" />
        </radialGradient>
      </defs>
      <circle cx="32" cy="32" r="29" fill={`url(#${id}-rim)`} />
      <circle cx="32" cy="32" r="24" fill={`url(#${id}-face)`} stroke="#9A5B08" strokeOpacity="0.5" strokeWidth="1.2" />
      <circle cx="32" cy="32" r="20" fill="none" stroke="#FFF3C4" strokeOpacity="0.55" strokeWidth="1" strokeDasharray="1.5 3" />
      <path d="M41.6 24 A12.5 12.5 0 1 0 44.5 32 H33.5" fill="none" stroke="#7A4A06" strokeWidth="5.2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M41.6 24 A12.5 12.5 0 1 0 44.5 32 H33.5" fill="none" stroke="#FFF1B8" strokeOpacity="0.55" strokeWidth="1.4" strokeLinecap="round" transform="translate(-0.8 -0.9)" />
      <circle cx="32" cy="32" r="29" fill={`url(#${id}-glow)`} />
    </svg>
  );
}
