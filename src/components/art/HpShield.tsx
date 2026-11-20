import { useId } from "react";

const SHIELD = "M32 4 L54 12 V32 C54 46 44 56 32 61 C20 56 10 46 10 32 V12 Z";

/** Perisai anggaran. `pct` = sisa HP (0-100); warna hijau, kuning, lalu merah. */
export function HpShield({ pct, size = 44, className }: { pct: number; size?: number; className?: string }) {
  const id = useId();
  const v = Math.max(0, Math.min(100, pct));
  const [a, b] = v > 50 ? ["#6EE7B7", "#10B981"] : v > 25 ? ["#FDE68A", "#F59E0B"] : ["#FDA4AF", "#E11D48"];
  const top = 58 - (v / 100) * 52;
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" className={className} role="img" aria-label={`Sisa HP ${Math.round(v)} persen`}>
      <defs>
        <clipPath id={`${id}-c`}>
          <path d={SHIELD} />
        </clipPath>
        <linearGradient id={`${id}-f`} x1="0" y1="0" x2="0" y2="1">
          <stop stopColor={a} />
          <stop offset="1" stopColor={b} />
        </linearGradient>
      </defs>
      <path d={SHIELD} fill="#0B1022" />
      <g clipPath={`url(#${id}-c)`}>
        <rect x="8" y={top} width="48" height={66 - top} fill={`url(#${id}-f)`} />
        <rect x="8" y={top} width="48" height="2.5" fill="#fff" fillOpacity="0.45" />
      </g>
      <path d={SHIELD} fill="none" stroke="#fff" strokeOpacity="0.4" strokeWidth="2" />
      <path d="M32 11 V54" stroke="#fff" strokeOpacity="0.14" strokeWidth="1.5" />
    </svg>
  );
}
