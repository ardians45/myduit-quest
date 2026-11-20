"use client";

import { motion, useReducedMotion } from "framer-motion";

/**
 * Bar progres beranimasi. `pct` = sisa HP (0-100).
 * tone "auto": hijau > 50, kuning > 25, merah selebihnya.
 */
export function HpBar({
  pct,
  tone = "auto",
  className = "",
}: {
  pct: number;
  tone?: "auto" | "xp" | "boss";
  className?: string;
}) {
  const reduce = useReducedMotion();
  const v = Math.max(0, Math.min(100, pct));
  const cls = tone === "xp" ? "xp" : tone === "boss" ? "boss" : v > 50 ? "" : v > 25 ? "warn" : "danger";
  return (
    <div className={`hp ${className}`} role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(v)}>
      <motion.div
        className={`hp-fill ${cls}`}
        initial={reduce ? false : { width: "0%" }}
        animate={{ width: `${v}%` }}
        transition={{ duration: reduce ? 0 : 0.9, ease: [0.22, 1, 0.36, 1] }}
      />
    </div>
  );
}
