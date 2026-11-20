import type { ReactNode } from "react";

export function PageHeader({
  title,
  subtitle,
  icon,
  actions,
}: {
  title: string;
  subtitle?: string;
  icon?: ReactNode;
  actions?: ReactNode;
}) {
  return (
    <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
      <div className="flex items-center gap-3">
        {icon && <div className="grid h-12 w-12 place-items-center rounded-2xl border-[3px] border-night-500 bg-night-800 text-2xl">{icon}</div>}
        <div>
          <h1 className="font-display text-3xl leading-none text-white">{title}</h1>
          {subtitle && <p className="mt-1 text-sm text-mute">{subtitle}</p>}
        </div>
      </div>
      {actions && <div className="flex flex-wrap items-center gap-3">{actions}</div>}
    </div>
  );
}

export function EmptyState({ emoji = "🕳️", title, text, action }: { emoji?: string; title: string; text?: string; action?: ReactNode }) {
  return (
    <div className="rounded-[22px] border-[3px] border-dashed border-night-500 px-6 py-10 text-center">
      <div className="mb-2 text-5xl">{emoji}</div>
      <p className="font-display text-xl text-white">{title}</p>
      {text && <p className="mx-auto mt-1 max-w-sm text-sm text-mute">{text}</p>}
      {action && <div className="mt-4 flex justify-center">{action}</div>}
    </div>
  );
}

export function Badge({ children, color = "#fbbf24" }: { children: ReactNode; color?: string }) {
  return (
    <span
      className="inline-flex items-center gap-1 rounded-full border-2 px-2.5 py-0.5 text-xs font-extrabold uppercase tracking-wide"
      style={{ color, borderColor: color + "88", background: color + "22" }}
    >
      {children}
    </span>
  );
}

export function StatTile({
  label,
  children,
  tone = "default",
  row,
}: {
  label: string;
  children: ReactNode;
  tone?: "default" | "in" | "out" | "xp";
  /** Di HP: label di kiri, nilai di kanan (untuk angka rupiah panjang). */
  row?: boolean;
}) {
  const color = tone === "in" ? "text-zamrud" : tone === "out" ? "text-rubi" : tone === "xp" ? "text-volt" : "text-white";
  return (
    <div className={`rounded-2xl border-[3px] border-night-500 bg-night-900/80 px-3 py-2.5 ${row ? "flex items-center justify-between gap-2 sm:block" : ""}`}>
      <div className="text-[11px] font-extrabold uppercase tracking-wider text-mute">{label}</div>
      <div className={`whitespace-nowrap font-display text-[clamp(1rem,4.4vw,1.3rem)] sm:text-xl ${color}`}>{children}</div>
    </div>
  );
}

export function SectionTitle({ children, action }: { children: ReactNode; action?: ReactNode }) {
  return (
    <div className="mb-3 mt-6 flex items-center justify-between">
      <h2 className="font-display text-xl text-gold">{children}</h2>
      {action}
    </div>
  );
}
