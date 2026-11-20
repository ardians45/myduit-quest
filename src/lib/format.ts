const nf = new Intl.NumberFormat("id-ID", { maximumFractionDigits: 0 });

/** Format uang: Rp 1.250.000 */
export function rupiah(n: number | string | null | undefined): string {
  const v = Math.round(Number(n) || 0);
  return (v < 0 ? "-Rp " : "Rp ") + nf.format(Math.abs(v));
}

export const num = (n: number) => nf.format(Math.round(n));

const dateFmt = new Intl.DateTimeFormat("id-ID", { day: "numeric", month: "short", year: "numeric", timeZone: "Asia/Jakarta" });
const dayFmt = new Intl.DateTimeFormat("id-ID", { weekday: "long", day: "numeric", month: "long", timeZone: "Asia/Jakarta" });
const monthFmt = new Intl.DateTimeFormat("id-ID", { month: "long", year: "numeric", timeZone: "UTC" });
const dateTimeFmt = new Intl.DateTimeFormat("id-ID", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit", timeZone: "Asia/Jakarta" });

/** Tanggal 'YYYY-MM-DD' -> '12 Nov 2026' */
export function fmtDate(d: string): string {
  return dateFmt.format(new Date(d.length === 10 ? d + "T12:00:00+07:00" : d));
}
export function fmtDay(d: string): string {
  return dayFmt.format(new Date(d + "T12:00:00+07:00"));
}
export function fmtDateTime(d: string): string {
  return dateTimeFmt.format(new Date(d));
}
/** 'YYYY-MM' atau 'YYYY-MM-01' -> 'November 2026' */
export function monthLabel(m: string): string {
  return monthFmt.format(new Date(m.slice(0, 7) + "-01T00:00:00Z"));
}

/** Tanggal hari ini (WIB) sebagai 'YYYY-MM-DD'. */
export function todayWIB(): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Jakarta" }).format(new Date());
}
export function currentMonth(): string {
  return todayWIB().slice(0, 7);
}
export function shiftMonth(m: string, delta: number): string {
  const [y, mo] = m.split("-").map(Number);
  const d = new Date(Date.UTC(y, mo - 1 + delta, 1));
  return d.toISOString().slice(0, 7);
}

// ---- Gamifikasi (harus sama dengan rumus di SQL) ----
export const levelFromXp = (xp: number) => Math.floor(Math.sqrt(Math.max(0, xp) / 50)) + 1;
export const xpForLevel = (level: number) => 50 * (level - 1) ** 2;

export function levelProgress(xp: number) {
  const level = levelFromXp(xp);
  const start = xpForLevel(level);
  const next = xpForLevel(level + 1);
  return { level, start, next, pct: Math.min(100, ((xp - start) / (next - start)) * 100), toNext: next - xp };
}

export function levelTitle(level: number): string {
  if (level <= 2) return "Rookie";
  if (level <= 4) return "Saver";
  if (level <= 6) return "Treasurer";
  if (level <= 9) return "Wealth Knight";
  return "Legend";
}
