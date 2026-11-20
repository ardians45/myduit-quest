"use client";

import { useEffect, useRef, useState } from "react";
import { animate, useReducedMotion } from "framer-motion";
import { num, rupiah } from "@/lib/format";

/** Angka yang berhitung bergulir ke nilai baru. `money` = format Rp. */
export function AnimatedNumber({
  value,
  money = false,
  className = "",
  suffix = "",
}: {
  value: number;
  money?: boolean;
  className?: string;
  suffix?: string;
}) {
  const reduce = useReducedMotion();
  const [animated, setShown] = useState(0);
  const shown = reduce ? value : animated;
  const prev = useRef(reduce ? value : 0);

  useEffect(() => {
    if (reduce) {
      prev.current = value;
      return;
    }
    const controls = animate(prev.current, value, {
      duration: 0.9,
      ease: "easeOut",
      onUpdate: (v) => setShown(v),
      onComplete: () => {
        prev.current = value;
      },
    });
    return () => controls.stop();
  }, [value, reduce]);

  return (
    <span className={className} aria-label={money ? rupiah(value) : String(value)}>
      {money ? rupiah(shown) : num(shown)}
      {suffix}
    </span>
  );
}
