import { useId } from "react";
import { levelTitle } from "@/lib/format";

export type Tier = "rookie" | "saver" | "treasurer" | "knight" | "legend";

export function tierOf(level: number): Tier {
  const t = levelTitle(level);
  return t === "Rookie" ? "rookie" : t === "Saver" ? "saver" : t === "Treasurer" ? "treasurer" : t === "Wealth Knight" ? "knight" : "legend";
}

const TIERS: Record<Tier, { a: string; b: string; c: string }> = {
  rookie: { a: "#E5E9F5", b: "#9AA3BD", c: "#5C6585" },
  saver: { a: "#8DF0C4", b: "#34D399", c: "#0F7A55" },
  treasurer: { a: "#FFE9A6", b: "#F5B83D", c: "#A8620B" },
  knight: { a: "#C4B0FF", b: "#8B5CF6", c: "#4B2BB5" },
  legend: { a: "#22D3EE", b: "#8B5CF6", c: "#FB7185" },
};

/** Perisai heksagon bertingkat; warna berubah sesuai gelar. */
export function LevelEmblem({ level, size = 56, className }: { level: number; size?: number; className?: string }) {
  const id = useId();
  const tier = tierOf(level);
  const t = TIERS[tier];
  const digits = String(level).length;
  const fs = digits >= 3 ? 20 : digits === 2 ? 25 : 30;
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" className={className} role="img" aria-label={`Level ${level}, ${levelTitle(level)}`}>
      <defs>
        <linearGradient id={`${id}-g`} x1="12" y1="6" x2="52" y2="60" gradientUnits="userSpaceOnUse">
          <stop stopColor={t.a} />
          <stop offset="0.5" stopColor={t.b} />
          <stop offset="1" stopColor={t.c} />
        </linearGradient>
        <linearGradient id={`${id}-in`} x1="32" y1="10" x2="32" y2="56" gradientUnits="userSpaceOnUse">
          <stop stopColor="#0B1022" stopOpacity="0.55" />
          <stop offset="1" stopColor="#0B1022" stopOpacity="0.85" />
        </linearGradient>
      </defs>
      <polygon points="32,3 58,17.5 58,46.5 32,61 6,46.5 6,17.5" fill={`url(#${id}-g)`} />
      <polygon points="32,3 58,17.5 58,46.5 32,61 6,46.5 6,17.5" fill="none" stroke="#fff" strokeOpacity="0.35" strokeWidth="1" />
      <polygon points="32,10 52,21 52,43 32,54 12,43 12,21" fill={`url(#${id}-in)`} stroke="#fff" strokeOpacity="0.18" />
      {tier !== "rookie" && <path d="M32 3 L58 17.5 L32 32 L6 17.5 Z" fill="#fff" fillOpacity="0.12" />}
      {(tier === "knight" || tier === "legend") && <polygon points="32,0 36,6 28,6" fill={t.a} />}
      <text x="32" y="38.5" textAnchor="middle" fontSize={fs} fontWeight="800" fill="#fff" style={{ fontFamily: "var(--font-display), system-ui, sans-serif" }}>
        {level}
      </text>
    </svg>
  );
}
