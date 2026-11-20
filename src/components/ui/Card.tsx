"use client";

import { useRef, type CSSProperties, type ReactNode } from "react";

/** Kartu 3D: tilt ringan saat hover (desktop saja, tanpa gyro). */
export function Card({
  children,
  className = "",
  gold,
  tilt = true,
  style,
}: {
  children: ReactNode;
  className?: string;
  gold?: boolean;
  tilt?: boolean;
  style?: CSSProperties;
}) {
  const ref = useRef<HTMLDivElement>(null);

  function onMove(e: React.PointerEvent<HTMLDivElement>) {
    if (!tilt || e.pointerType !== "mouse") return;
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const r = el.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width - 0.5;
    const py = (e.clientY - r.top) / r.height - 0.5;
    el.style.setProperty("--ry", `${(px * 6).toFixed(2)}deg`);
    el.style.setProperty("--rx", `${(-py * 6).toFixed(2)}deg`);
  }
  function onLeave() {
    ref.current?.style.setProperty("--rx", "0deg");
    ref.current?.style.setProperty("--ry", "0deg");
  }

  return (
    <div className="tilt">
      <div
        ref={ref}
        onPointerMove={onMove}
        onPointerLeave={onLeave}
        style={style}
        className={`card3d ${gold ? "card-gold" : ""} ${tilt ? "" : "card-flat"} ${className}`}
      >
        {children}
      </div>
    </div>
  );
}
