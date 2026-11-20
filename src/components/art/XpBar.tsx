"use client";

import { motion, useReducedMotion } from "framer-motion";

/** Bar XP bersegmen dengan kilau bergerak. `pct` 0-100. */
export function XpBar({ pct, height = 10, className = "" }: { pct: number; height?: number; className?: string }) {
  const reduce = useReducedMotion();
  const v = Math.max(0, Math.min(100, pct));
  return (
    <div
      className={`relative overflow-hidden rounded-full bg-white/[0.07] ${className}`}
      style={{ height }}
      role="progressbar"
      aria-label="Progres XP"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(v)}
    >
      <motion.div
        className="xp-fill relative h-full rounded-full"
        initial={reduce ? false : { width: "0%" }}
        animate={{ width: `${v}%` }}
        transition={{ duration: reduce ? 0 : 0.9, ease: [0.22, 1, 0.36, 1] }}
      >
        <span className="xp-shine" />
      </motion.div>
      <span className="xp-segments pointer-events-none absolute inset-0" />
    </div>
  );
}
