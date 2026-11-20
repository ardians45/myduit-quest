import { useId } from "react";

/** Peti harta untuk saldo/dompet. */
export function Chest({ size = 64, className }: { size?: number; className?: string }) {
  const id = useId();
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" className={className} aria-hidden>
      <defs>
        <linearGradient id={`${id}-w`} x1="0" y1="0" x2="0" y2="1">
          <stop stopColor="#7B5BE6" />
          <stop offset="1" stopColor="#3B2A9B" />
        </linearGradient>
        <linearGradient id={`${id}-l`} x1="0" y1="0" x2="0" y2="1">
          <stop stopColor="#9B7DF5" />
          <stop offset="1" stopColor="#5B3FD0" />
        </linearGradient>
        <linearGradient id={`${id}-g`} x1="0" y1="0" x2="1" y2="1">
          <stop stopColor="#FFE08A" />
          <stop offset="1" stopColor="#D98F10" />
        </linearGradient>
      </defs>
      <ellipse cx="26" cy="22" rx="8" ry="3.2" fill="#F5B83D" />
      <ellipse cx="38" cy="20" rx="7" ry="3" fill="#FFE08A" />
      <path d="M8 30 H56 V54 C56 56 54 58 52 58 H12 C10 58 8 56 8 54 Z" fill={`url(#${id}-w)`} />
      <path d="M8 30 C8 18 18 12 32 12 C46 12 56 18 56 30 Z" fill={`url(#${id}-l)`} />
      <path d="M8 30 H56" stroke="#1B1250" strokeOpacity="0.55" strokeWidth="2" />
      <rect x="15" y="13" width="6" height="45" rx="1" fill={`url(#${id}-g)`} />
      <rect x="43" y="13" width="6" height="45" rx="1" fill={`url(#${id}-g)`} />
      <rect x="27" y="26" width="10" height="13" rx="3" fill={`url(#${id}-g)`} stroke="#8A5206" strokeOpacity="0.5" />
      <circle cx="32" cy="31.5" r="1.8" fill="#5B3A06" />
      <rect x="31.2" y="32" width="1.6" height="4" rx="0.8" fill="#5B3A06" />
      <path d="M12 16 C16 13 22 12 26 12" stroke="#fff" strokeOpacity="0.35" strokeWidth="2" strokeLinecap="round" fill="none" />
    </svg>
  );
}
