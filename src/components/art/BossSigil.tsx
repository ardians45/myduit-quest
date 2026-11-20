import { useId } from "react";

/** Boss abstrak geometris dengan ring HP. `pct` = sisa HP boss (0-100). */
export function BossSigil({ pct, size = 72, defeated = false, className }: { pct: number; size?: number; defeated?: boolean; className?: string }) {
  const id = useId();
  const v = defeated ? 0 : Math.max(0, Math.min(100, pct));
  const R = 45;
  const C = 2 * Math.PI * R;
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" className={className} role="img" aria-label={defeated ? "Boss kalah" : `Sisa HP boss ${Math.round(v)} persen`}>
      <defs>
        <linearGradient id={`${id}-ring`} x1="0" y1="0" x2="100" y2="100" gradientUnits="userSpaceOnUse">
          <stop stopColor="#FB7185" />
          <stop offset="1" stopColor="#E11D48" />
        </linearGradient>
        <linearGradient id={`${id}-body`} x1="50" y1="20" x2="50" y2="86" gradientUnits="userSpaceOnUse">
          <stop stopColor={defeated ? "#4A5170" : "#6D4BD8"} />
          <stop offset="1" stopColor={defeated ? "#2A3050" : "#2A1B6B"} />
        </linearGradient>
        <linearGradient id={`${id}-horn`} x1="0" y1="0" x2="0" y2="1">
          <stop stopColor={defeated ? "#8A93B2" : "#F5B83D"} />
          <stop offset="1" stopColor={defeated ? "#5C6585" : "#B8730F"} />
        </linearGradient>
      </defs>
      <circle cx="50" cy="50" r={R} fill="#0B1022" stroke="#fff" strokeOpacity="0.08" strokeWidth="7" />
      <circle
        cx="50"
        cy="50"
        r={R}
        fill="none"
        stroke={defeated ? "#34D399" : `url(#${id}-ring)`}
        strokeWidth="7"
        strokeLinecap="round"
        strokeDasharray={`${defeated ? C : (v / 100) * C} ${C}`}
        transform="rotate(-90 50 50)"
      />
      <polygon points="30,34 25,14 42,27" fill={`url(#${id}-horn)`} />
      <polygon points="70,34 75,14 58,27" fill={`url(#${id}-horn)`} />
      <polygon points="50,24 72,36 72,60 50,78 28,60 28,36" fill={`url(#${id}-body)`} stroke="#fff" strokeOpacity="0.25" strokeWidth="1.5" />
      <polygon points="50,24 72,36 50,48 28,36" fill="#fff" fillOpacity="0.1" />
      {defeated ? (
        <path d="M35 45 L45 49 M65 45 L55 49" stroke="#C7CCE0" strokeWidth="3" strokeLinecap="round" />
      ) : (
        <>
          <polygon points="34,44 46,48 44,54 34,50" fill="#22D3EE" />
          <polygon points="66,44 54,48 56,54 66,50" fill="#22D3EE" />
        </>
      )}
      <path d="M40 64 L44 69 L48 64 L52 69 L56 64" fill="none" stroke={defeated ? "#8A93B2" : "#E8ECF8"} strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  );
}
