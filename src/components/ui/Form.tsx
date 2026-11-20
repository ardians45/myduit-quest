"use client";

import type { InputHTMLAttributes, ReactNode, SelectHTMLAttributes, TextareaHTMLAttributes } from "react";

export function Field({ label, hint, children }: { label: string; hint?: string; children: ReactNode }) {
  return (
    <label className="mb-3 block">
      <span className="mb-1 block text-sm font-extrabold uppercase tracking-wide text-mute">{label}</span>
      {children}
      {hint && <span className="mt-1 block text-xs text-mute">{hint}</span>}
    </label>
  );
}

export function Input(props: InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={`field ${props.className ?? ""}`} />;
}

export function TextArea(props: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea rows={3} {...props} className={`field ${props.className ?? ""}`} />;
}

export function Select(props: SelectHTMLAttributes<HTMLSelectElement>) {
  return <select {...props} className={`field ${props.className ?? ""}`} />;
}

export const EMOJIS = ["🪙", "💰", "🍜", "☕", "🚌", "🛍️", "🧾", "🎮", "💊", "📚", "🎁", "💼", "🎒", "🛠️", "💻", "🏠", "✈️", "🎧", "🐷", "🐉"];
export const COLORS = ["#fbbf24", "#f97316", "#f43f5e", "#e879f9", "#a78bfa", "#38bdf8", "#22d3ee", "#34d399", "#84cc16", "#94a3b8"];

export function EmojiPicker({ value, onChange, options = EMOJIS }: { value: string; onChange: (v: string) => void; options?: string[] }) {
  return (
    <div className="mb-3">
      <span className="mb-1 block text-sm font-extrabold uppercase tracking-wide text-mute">Ikon</span>
      <div className="flex flex-wrap gap-2">
        {options.map((e) => (
          <button
            type="button"
            key={e}
            onClick={() => onChange(e)}
            aria-pressed={value === e}
            className={`grid h-10 w-10 place-items-center rounded-xl border-2 text-xl transition ${
              value === e ? "border-gold bg-gold/20 scale-110" : "border-night-500 bg-night-900 hover:border-white/50"
            }`}
          >
            {e}
          </button>
        ))}
      </div>
    </div>
  );
}

export function ColorPicker({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <div className="mb-3">
      <span className="mb-1 block text-sm font-extrabold uppercase tracking-wide text-mute">Warna</span>
      <div className="flex flex-wrap gap-2">
        {COLORS.map((c) => (
          <button
            type="button"
            key={c}
            aria-label={`Warna ${c}`}
            aria-pressed={value === c}
            onClick={() => onChange(c)}
            style={{ background: c }}
            className={`h-8 w-8 rounded-full border-[3px] transition ${value === c ? "scale-110 border-white" : "border-black/40"}`}
          />
        ))}
      </div>
    </div>
  );
}

export function Segmented<T extends string>({
  value,
  onChange,
  options,
}: {
  value: T;
  onChange: (v: T) => void;
  options: { value: T; label: string }[];
}) {
  return (
    <div className="mb-3 grid gap-2" style={{ gridTemplateColumns: `repeat(${options.length}, minmax(0, 1fr))` }}>
      {options.map((o) => (
        <button
          type="button"
          key={o.value}
          onClick={() => onChange(o.value)}
          aria-pressed={value === o.value}
          className={`rounded-xl border-[3px] px-3 py-2 font-display transition ${
            value === o.value ? "border-gold bg-gold/20 text-gold" : "border-night-500 bg-night-900 text-mute hover:text-white"
          }`}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}
