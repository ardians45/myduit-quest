import Link from "next/link";
import { Flame } from "lucide-react";
import { can, requirePermission } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { currentMonth, fmtDate, fmtDateTime, levelProgress, levelTitle, monthLabel, num, rupiah, todayWIB } from "@/lib/format";
import { Card } from "@/components/ui/Card";
import { HpBar } from "@/components/ui/HPBar";
import { AnimatedNumber } from "@/components/ui/AnimatedNumber";
import { Coin3D } from "@/components/ui/Coin";
import { LinkButton } from "@/components/ui/Button";
import { Badge, EmptyState, SectionTitle, StatTile } from "@/components/ui/Misc";
import type { ActivityLog, BudgetStatus, Category, GoalProgress, Transaction, WalletBalance } from "@/lib/types";

export const metadata = { title: "Markas | Myduit Gweh" };

export default async function DashboardPage() {
  const session = await requirePermission("dashboard.view");
  const { profile } = session;
  const supabase = await createClient();
  const month = currentMonth();
  const lp = levelProgress(profile.xp);
  const isPlayer = can(session, "wallets.view");
  const isGuild = can(session, "reports.view_all");

  return (
    <div className="space-y-2">
      {/* Kartu hero */}
      <Card gold>
        <div className="flex items-center gap-4">
          <div className="grid h-16 w-16 shrink-0 place-items-center rounded-2xl border-[3px] border-gold/70 bg-black/30 text-4xl">{profile.avatar}</div>
          <div className="min-w-0 flex-1">
            <p className="truncate font-display text-2xl leading-tight text-white">Halo, {profile.display_name}!</p>
            <div className="mt-1 flex flex-wrap items-center gap-2">
              <Badge color="#fbbf24">{session.role?.name ?? "Tanpa role"}</Badge>
              <Badge color="#38bdf8">
                Lv {lp.level} · {levelTitle(lp.level)}
              </Badge>
              <Badge color="#fb923c">
                <Flame size={12} /> {profile.streak} hari
              </Badge>
            </div>
          </div>
        </div>
        <div className="mt-4">
          <div className="mb-1 flex justify-between text-xs font-extrabold text-amber-100/90">
            <span>{num(profile.xp)} XP</span>
            <span>{num(lp.toNext)} XP lagi ke Lv {lp.level + 1}</span>
          </div>
          <HpBar pct={lp.pct} tone="xp" />
        </div>
      </Card>

      {isPlayer && <PlayerBoard userId={profile.id} month={month} supabase={supabase} canCreate={can(session, "transactions.create")} canClaim={can(session, "challenges.claim")} />}
      {isGuild && <GuildBoard supabase={supabase} month={month} showLogs={can(session, "logs.view")} />}
      {!isPlayer && !isGuild && <EmptyState emoji="🧭" title="Markas masih kosong" text="Role-mu belum punya akses ke fitur lain. Hubungi Game Master." />}
    </div>
  );
}

type SB = Awaited<ReturnType<typeof createClient>>;

async function PlayerBoard({ userId, month, supabase, canCreate, canClaim }: { userId: string; month: string; supabase: SB; canCreate: boolean; canClaim: boolean }) {
  const today = todayWIB();
  const [wallets, flow, budgets, cats, goals, recent, challenges, claims] = await Promise.all([
    supabase.from("wallet_balances").select("*").eq("user_id", userId),
    supabase.from("monthly_cashflow").select("income, expense").eq("user_id", userId).eq("month", month + "-01").maybeSingle(),
    supabase.from("budget_status").select("*").eq("user_id", userId).eq("month", month + "-01"),
    supabase.from("categories").select("id, name, icon"),
    supabase.from("goal_progress").select("*").eq("user_id", userId).eq("status", "active").order("created_at"),
    supabase.from("transactions").select("*, categories(name, icon, color), wallets(name, icon)").eq("user_id", userId).order("occurred_on", { ascending: false }).order("created_at", { ascending: false }).limit(5),
    canClaim ? supabase.from("challenges").select("id").eq("is_active", true) : Promise.resolve({ data: [] as { id: string }[] }),
    canClaim ? supabase.from("challenge_claims").select("challenge_id").eq("user_id", userId).eq("claim_date", today) : Promise.resolve({ data: [] as { challenge_id: string }[] }),
  ]);

  const w = (wallets.data ?? []) as WalletBalance[];
  const total = w.reduce((s, x) => s + Number(x.balance), 0);
  const income = Number(flow.data?.income ?? 0);
  const expense = Number(flow.data?.expense ?? 0);
  const catMap = new Map(((cats.data ?? []) as Pick<Category, "id" | "name" | "icon">[]).map((c) => [c.id, c]));
  const b = ((budgets.data ?? []) as BudgetStatus[]).sort((x, y) => Number(y.spent) / Number(y.limit_amount) - Number(x.spent) / Number(x.limit_amount));
  const g = (goals.data ?? []) as GoalProgress[];
  const tx = (recent.data ?? []) as Transaction[];
  const unclaimed = (challenges.data?.length ?? 0) - (claims.data?.length ?? 0);

  return (
    <>
      <SectionTitle>Harta Karun</SectionTitle>
      <Card>
        <div className="flex items-center gap-4">
          <Coin3D size={54} />
          <div className="min-w-0">
            <p className="text-xs font-extrabold uppercase tracking-wider text-mute">Total saldo {w.length} dompet</p>
            <p className="truncate font-display text-3xl text-gold sm:text-4xl">
              <AnimatedNumber value={total} money />
            </p>
          </div>
        </div>
        <div className="mt-3 grid grid-cols-2 gap-3">
          <StatTile label={`Masuk · ${monthLabel(month)}`} tone="in">
            +{rupiah(income)}
          </StatTile>
          <StatTile label="Keluar bulan ini" tone="out">
            -{rupiah(expense)}
          </StatTile>
        </div>
        {canCreate && (
          <div className="mt-4">
            <LinkButton href="/transactions?new=1" variant="green" className="w-full">
              + Catat Transaksi (+10 XP)
            </LinkButton>
          </div>
        )}
      </Card>

      {canClaim && unclaimed > 0 && (
        <Link href="/challenges" className="mt-4 block rounded-2xl border-[3px] border-volt/60 bg-volt/10 px-4 py-3 font-bold text-sky-100 hover:bg-volt/20">
          🎯 Ada <b className="text-volt">{unclaimed}</b> tantangan harian yang belum kamu klaim hari ini.
        </Link>
      )}

      <SectionTitle action={<Link href="/budgets" className="text-sm font-bold text-volt">Semua</Link>}>Perisai HP · Anggaran</SectionTitle>
      {b.length === 0 ? (
        <EmptyState emoji="🛡️" title="Belum ada perisai" text="Buat anggaran per kategori supaya pengeluaranmu terjaga." />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {b.slice(0, 4).map((x) => {
            const c = catMap.get(x.category_id);
            const left = Math.max(0, 100 - (Number(x.spent) / Number(x.limit_amount)) * 100);
            return (
              <Card key={x.id}>
                <div className="mb-2 flex items-center justify-between">
                  <span className="font-display text-lg">{c?.icon} {c?.name ?? "Kategori"}</span>
                  <span className="text-xs font-extrabold text-mute">{Math.round(left)}% HP</span>
                </div>
                <HpBar pct={left} />
                <p className="mt-1.5 text-xs text-mute">
                  {rupiah(x.spent)} dari {rupiah(x.limit_amount)}
                </p>
              </Card>
            );
          })}
        </div>
      )}

      <SectionTitle action={<Link href="/goals" className="text-sm font-bold text-volt">Semua</Link>}>Boss Aktif</SectionTitle>
      {g.length === 0 ? (
        <EmptyState emoji="🐉" title="Belum ada boss" text="Buat quest tabungan, lalu serang dengan setoran." />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {g.slice(0, 4).map((x) => (
            <Card key={x.id}>
              <div className="mb-2 flex items-center justify-between">
                <span className="font-display text-lg">{x.icon} {x.name}</span>
                <span className="text-xs font-extrabold text-mute">{Math.round((Number(x.saved) / Number(x.target_amount)) * 100)}%</span>
              </div>
              <HpBar pct={100 - (Number(x.saved) / Number(x.target_amount)) * 100} tone="boss" />
              <p className="mt-1.5 text-xs text-mute">
                Terkumpul {rupiah(x.saved)} / {rupiah(x.target_amount)}
              </p>
            </Card>
          ))}
        </div>
      )}

      <SectionTitle action={<Link href="/transactions" className="text-sm font-bold text-volt">Semua</Link>}>Loot Terbaru</SectionTitle>
      {tx.length === 0 ? (
        <EmptyState emoji="📜" title="Belum ada catatan" text="Catat transaksi pertamamu dan dapatkan achievement Langkah Pertama." />
      ) : (
        <Card tilt={false} className="divide-y divide-white/10 !p-2">
          {tx.map((t) => (
            <div key={t.id} className="flex items-center gap-3 px-2 py-2.5">
              <span className="grid h-10 w-10 place-items-center rounded-xl text-xl" style={{ background: (t.categories?.color ?? "#94a3b8") + "33" }}>
                {t.categories?.icon ?? "🪙"}
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate font-bold">{t.note || t.categories?.name || "Transaksi"}</p>
                <p className="text-xs text-mute">{fmtDate(t.occurred_on)} · {t.wallets?.name}</p>
              </div>
              <span className={`font-display text-lg ${t.kind === "income" ? "text-zamrud" : "text-rubi"}`}>
                {t.kind === "income" ? "+" : "-"}
                {rupiah(t.amount)}
              </span>
            </div>
          ))}
        </Card>
      )}
    </>
  );
}

async function GuildBoard({ supabase, month, showLogs }: { supabase: SB; month: string; showLogs: boolean }) {
  const [players, flow, logs] = await Promise.all([
    supabase.from("profiles").select("id, display_name, avatar, xp, level, streak, roles!inner(code)").eq("roles.code", "pemain").order("xp", { ascending: false }),
    supabase.from("monthly_cashflow").select("income, expense, tx_count").eq("month", month + "-01"),
    showLogs ? supabase.from("activity_logs").select("*").order("created_at", { ascending: false }).limit(6) : Promise.resolve({ data: [] as ActivityLog[] }),
  ]);
  const p = (players.data ?? []) as unknown as { id: string; display_name: string; avatar: string; xp: number; level: number; streak: number }[];
  const rows = (flow.data ?? []) as { income: number; expense: number; tx_count: number }[];
  const income = rows.reduce((s, r) => s + Number(r.income), 0);
  const expense = rows.reduce((s, r) => s + Number(r.expense), 0);
  const txCount = rows.reduce((s, r) => s + Number(r.tx_count), 0);
  const l = (logs.data ?? []) as ActivityLog[];

  return (
    <>
      <SectionTitle action={<Link href="/reports" className="text-sm font-bold text-volt">Laporan</Link>}>Ringkasan Guild · {monthLabel(month)}</SectionTitle>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatTile label="Pemain aktif">{p.length}</StatTile>
        <StatTile label="Transaksi">{txCount}</StatTile>
        <StatTile label="Pemasukan" tone="in">{rupiah(income)}</StatTile>
        <StatTile label="Pengeluaran" tone="out">{rupiah(expense)}</StatTile>
      </div>

      <SectionTitle>Papan Peringkat</SectionTitle>
      {p.length === 0 ? (
        <EmptyState emoji="🏟️" title="Belum ada pemain" />
      ) : (
        <Card tilt={false} className="divide-y divide-white/10 !p-2">
          {p.slice(0, 8).map((x, i) => (
            <div key={x.id} className="flex items-center gap-3 px-2 py-2.5">
              <span className="w-6 text-center font-display text-lg text-gold">{i + 1}</span>
              <span className="text-2xl">{x.avatar}</span>
              <div className="min-w-0 flex-1">
                <p className="truncate font-bold">{x.display_name}</p>
                <p className="text-xs text-mute">Lv {x.level} · {levelTitle(x.level)} · 🔥 {x.streak}</p>
              </div>
              <span className="font-display text-volt">{num(x.xp)} XP</span>
            </div>
          ))}
        </Card>
      )}

      {showLogs && (
        <>
          <SectionTitle action={<Link href="/admin/logs" className="text-sm font-bold text-volt">Semua</Link>}>Aktivitas Terbaru</SectionTitle>
          <Card tilt={false} className="divide-y divide-white/10 !p-2">
            {l.length === 0 && <p className="p-3 text-sm text-mute">Belum ada aktivitas.</p>}
            {l.map((x) => (
              <div key={x.id} className="flex items-center justify-between gap-3 px-2 py-2 text-sm">
                <span className="min-w-0 truncate">
                  <b>{x.actor_name ?? "Sistem"}</b> · {x.action} {x.entity}
                </span>
                <span className="shrink-0 text-xs text-mute">{fmtDateTime(x.created_at)}</span>
              </div>
            ))}
          </Card>
        </>
      )}
    </>
  );
}
