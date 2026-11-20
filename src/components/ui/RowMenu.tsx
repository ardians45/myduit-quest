"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { MoreHorizontal } from "lucide-react";

export interface RowMenuItem {
  label: string;
  icon?: ReactNode;
  onClick: () => void;
  danger?: boolean;
}

/** Menu aksi baris (ikon titik tiga). Posisi fixed supaya tidak terpotong kartu. */
export function RowMenu({ items, label = "Aksi" }: { items: RowMenuItem[]; label?: string }) {
  const [pos, setPos] = useState<{ top: number; right: number } | null>(null);
  const btn = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!pos) return;
    const close = () => setPos(null);
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && close();
    window.addEventListener("keydown", onKey);
    window.addEventListener("scroll", close, true);
    window.addEventListener("resize", close);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("scroll", close, true);
      window.removeEventListener("resize", close);
    };
  }, [pos]);

  if (items.length === 0) return null;

  return (
    <>
      <button
        ref={btn}
        type="button"
        aria-label={label}
        aria-haspopup="menu"
        aria-expanded={!!pos}
        onClick={() => {
          const r = btn.current?.getBoundingClientRect();
          if (!r) return;
          setPos(pos ? null : { top: r.bottom + 6, right: Math.max(8, window.innerWidth - r.right) });
        }}
        className="grid h-9 w-9 shrink-0 place-items-center rounded-xl text-mute transition hover:bg-white/10 hover:text-white"
      >
        <MoreHorizontal size={20} />
      </button>
      {pos && (
        <>
          <div className="fixed inset-0 z-[70]" onClick={() => setPos(null)} aria-hidden />
          <div
            role="menu"
            style={{ top: pos.top, right: pos.right }}
            className="glass fixed z-[71] min-w-40 overflow-hidden rounded-2xl border border-white/10 p-1.5 shadow-2xl"
          >
            {items.map((it) => (
              <button
                key={it.label}
                role="menuitem"
                onClick={() => {
                  setPos(null);
                  it.onClick();
                }}
                className={`flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-left text-sm font-semibold transition hover:bg-white/10 ${
                  it.danger ? "text-rose" : "text-ink"
                }`}
              >
                {it.icon}
                {it.label}
              </button>
            ))}
          </div>
        </>
      )}
    </>
  );
}
