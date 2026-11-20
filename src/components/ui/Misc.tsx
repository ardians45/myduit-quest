import type { ReactNode } from "react";
import { AppIcon } from "@/lib/icons";
import { EmptyLocked, EmptyQuest, EmptyTransactions } from "@/components/art";

export function PageHeader({
  title,
  subtitle,
  icon,
  actions,
}: {
  title: string;
  subtitle?: string;
  /** Kunci ikon dari registry. */
  icon?: string;
  actions?: ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
      <div className="flex min-w-0 items-center gap-3.5">
        {icon && (
          <div className="tile !h-11 !w-11 !rounded-[14px] bg-gradient-to-br from-violet/35 to-cyan/15 text-violet-200 shadow-[0_8px_24px_-10px_rgba(139,92,246,0.8)]">
            <AppIcon name={icon} size={22} className="text-[#d9ccff]" />
          </div>
        )}
        <div className="min-w-0">
          <h1 className="font-display text-[1.6rem] font-bold leading-tight tracking-tight text-white">{title}</h1>
          {subtitle && <p className="mt-0.5 text-sm text-mute">{subtitle}</p>}
        </div>
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2.5">{actions}</div>}
    </div>
  );
}

export function EmptyState({
  art,
  icon = "circle-dot",
  title,
  text,
  action,
}: {
  art?: "transactions" | "quest" | "locked";
  icon?: string;
  title: string;
  text?: string;
  action?: ReactNode;
}) {
  return (
    <div className="rounded-[20px] border border-dashed border-white/15 bg-white/[0.02] px-6 py-9 text-center">
      <div className="mb-3 flex justify-center">
        {art === "transactions" ? (
          <EmptyTransactions size={150} />
        ) : art === "quest" ? (
          <EmptyQuest size={150} />
        ) : art === "locked" ? (
          <EmptyLocked size={150} />
        ) : (
          <div className="tile !h-14 !w-14 !rounded-2xl bg-violet/15 text-violet-200">
            <AppIcon name={icon} size={26} className="text-[#cdbbff]" />
          </div>
        )}
      </div>
      <p className="font-display text-lg font-semibold text-white">{title}</p>
      {text && <p className="mx-auto mt-1 max-w-sm text-sm leading-relaxed text-mute">{text}</p>}
      {action && <div className="mt-4 flex justify-center">{action}</div>}
    </div>
  );
}

/** Chip kecil berwarna. */
export function Badge({ children, color = "#f5b83d" }: { children: ReactNode; color?: string }) {
  return (
    <span
      className="inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[11px] font-semibold tracking-wide"
      style={{ color, borderColor: color + "55", background: color + "1f" }}
    >
      {children}
    </span>
  );
}

/** Tile ikon 40px: gradien warna pada opacity rendah, ikon berwarna penuh. */
export function IconTile({ icon, color = "#8b5cf6", size = 40 }: { icon: string | null | undefined; color?: string; size?: number }) {
  return (
    <span
      className="tile"
      style={{ width: size, height: size, background: `linear-gradient(145deg, ${color}38, ${color}10)`, borderColor: color + "40" }}
    >
      <AppIcon name={icon} size={Math.round(size * 0.5)} color={color} />
    </span>
  );
}

export function StatTile({
  label,
  children,
  tone = "default",
  row,
  icon,
}: {
  label: string;
  children: ReactNode;
  tone?: "default" | "in" | "out" | "xp";
  /** Di HP: label di kiri, nilai di kanan (untuk angka rupiah panjang). */
  row?: boolean;
  icon?: ReactNode;
}) {
  const color = tone === "in" ? "text-emerald" : tone === "out" ? "text-rose" : tone === "xp" ? "text-violet-300" : "text-white";
  return (
    <div className={`rounded-2xl border border-white/[0.08] bg-white/[0.04] px-3.5 py-3 ${row ? "flex items-center justify-between gap-2 sm:block" : ""}`}>
      <div className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-mute">
        {icon}
        {label}
      </div>
      <div className={`mt-0.5 whitespace-nowrap font-display text-[clamp(1rem,4.4vw,1.25rem)] font-bold sm:text-xl ${color}`}>{children}</div>
    </div>
  );
}

export function SectionTitle({ children, action }: { children: ReactNode; action?: ReactNode }) {
  return (
    <div className="mb-3 mt-7 flex items-center justify-between">
      <h2 className="font-display text-base font-bold tracking-tight text-white">{children}</h2>
      {action}
    </div>
  );
}

/** Sparkline kecil dari deret angka. */
export function Sparkline({ values, color = "#34d399", width = 72, height = 26 }: { values: number[]; color?: string; width?: number; height?: number }) {
  if (values.length < 2) return null;
  const max = Math.max(...values);
  const min = Math.min(...values);
  const span = max - min || 1;
  const pts = values.map((v, i) => `${(i / (values.length - 1)) * width},${height - 3 - ((v - min) / span) * (height - 6)}`);
  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} aria-hidden>
      <polyline points={pts.join(" ")} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
