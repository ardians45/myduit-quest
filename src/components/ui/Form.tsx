"use client";

import { Check } from "lucide-react";
import type { InputHTMLAttributes, ReactNode, SelectHTMLAttributes, TextareaHTMLAttributes } from "react";
import { AppIcon, ICON_GROUPS, isIconKey, type IconKey } from "@/lib/icons";

const LABEL = "mb-1.5 block text-[11px] font-bold uppercase tracking-[0.08em] text-mute";

export function Field({ label, hint, children }: { label: string; hint?: string; children: ReactNode }) {
  return (
    <label className="mb-3.5 block">
      <span className={LABEL}>{label}</span>
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

export const COLORS = ["#f5b83d", "#f97316", "#fb7185", "#e879f9", "#a78bfa", "#38bdf8", "#22d3ee", "#34d399", "#84cc16", "#94a3b8"];

/** Pemilih ikon: grid dari registry, dikelompokkan. Nilai lama yang bukan kunci tidak ada yang terpilih. */
export function IconPicker({
  value,
  onChange,
  groups = ICON_GROUPS,
  label = "Ikon",
}: {
  value: string;
  onChange: (v: IconKey) => void;
  groups?: { label: string; keys: IconKey[] }[];
  label?: string;
}) {
  return (
    <div className="mb-3.5">
      <span className={LABEL}>{label}</span>
      <div className="max-h-52 space-y-2.5 overflow-y-auto rounded-xl border border-white/[0.08] bg-white/[0.03] p-2.5">
        {groups.map((g) => (
          <div key={g.label}>
            {groups.length > 1 && <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-mute/80">{g.label}</p>}
            <div className="grid grid-cols-6 gap-1.5 sm:grid-cols-8">
              {g.keys.map((k) => {
                const on = isIconKey(value) && value === k;
                return (
                  <button
                    type="button"
                    key={k}
                    onClick={() => onChange(k)}
                    aria-pressed={on}
                    aria-label={k}
                    title={k}
                    className={`grid h-10 place-items-center rounded-xl border transition ${
                      on
                        ? "border-violet bg-violet/25 text-white shadow-[0_0_14px_-3px_rgba(139,92,246,0.9)]"
                        : "border-transparent bg-white/[0.04] text-mute hover:bg-white/10 hover:text-white"
                    }`}
                  >
                    <AppIcon name={k} size={19} />
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function ColorPicker({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <div className="mb-3.5">
      <span className={LABEL}>Warna</span>
      <div className="flex flex-wrap gap-2.5">
        {COLORS.map((c) => (
          <button
            type="button"
            key={c}
            aria-label={`Warna ${c}`}
            aria-pressed={value === c}
            onClick={() => onChange(c)}
            style={{ background: c }}
            className={`grid h-8 w-8 place-items-center rounded-full ring-offset-2 ring-offset-[#0d1126] transition ${
              value === c ? "ring-2 ring-white" : "opacity-80 hover:opacity-100"
            }`}
          >
            {value === c && <Check size={15} strokeWidth={3} className="text-black/70" />}
          </button>
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
    <div className="mb-3.5 flex gap-1 rounded-xl border border-white/[0.08] bg-white/[0.04] p-1">
      {options.map((o) => (
        <button
          type="button"
          key={o.value}
          onClick={() => onChange(o.value)}
          aria-pressed={value === o.value}
          className={`min-h-9 flex-1 rounded-lg px-3 py-1.5 font-display text-sm font-semibold transition ${
            value === o.value ? "bg-violet/90 text-white shadow-[0_2px_10px_-2px_rgba(139,92,246,0.8)]" : "text-mute hover:text-white"
          }`}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

/** Switch modern (pengganti checkbox mentah). */
export function Switch({
  checked,
  onChange,
  label,
  disabled,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className="switch"
    />
  );
}
