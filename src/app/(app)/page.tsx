import Link from "next/link";
import { ArrowDownLeft, ArrowUpRight, ChevronRight, Flag, Plus, Sparkles } from "lucide-react";
import { can, requirePermission } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { currentMonth, fmtDate, fmtDateTime, levelProgress, levelTitle, monthLabel, num, rupiah, todayWIB } from "@/lib/format";
import { Card } from "@/components/ui/Card";
import { HpBar } from "@/components/ui/HPBar";
import { AnimatedNumber } from "@/components/ui/AnimatedNumber";
import { LinkButton } from "@/components/ui/Button";
import { Badge, EmptyState, IconTile, SectionTitle, Sparkline, StatTile } from "@/components/ui/Misc";
import { Avatar, BossSigil, Chest, HpShield, LevelEmblem, StreakFlame, XpBar } from "@/components/art";
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
      <Card hero className="!p-5">
        <div className="flex items-center gap-4">
          <Avatar name={profile.avatar} size={68} ring />
          <div className="min-w-0 flex-1">
            <p className="text-xs font-medium text-mute">Selamat datang kembali</p>
            <p className="truncate font-display text-[1.4rem] font-bold leading-tight text-white">{profile.display_name}</p>
            <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
              <Badge color="#f5b83d">{session.role?.name ?? "Tanpa role"}</Badge>
              <Badge color="#fb923c">
                <StreakFlame size={13} lit={profile.streak > 0} /> {profile.streak} hari
              </Badge>
            </div>
          </div>
          <LevelEmblem level={lp.level} size={72} className="shrink-0" />
        </div>
        <div className="mt-5">
          <div className="mb-1.5 flex items-end justify-between gap-2 text-xs font-semibold">
            <span className="text-white">
              {levelTitle(lp.level)} <span className="text-mute">· Level {lp.level}</span>
            </span>
            <span className="num text-mute">
              <span className="text-violet-300">{num(profile.xp)} XP</span> · {num(lp.toNext)} lagi ke Lv {lp.level + 1}
            </span>
          </div>
          <XpBar pct={lp.pct} height={12} />
        </div>
      </Card>

      {isPlayer && <PlayerBoard userId={profile.id} month={month} supabase={supabase} canCreate={can(session, "transactions.create")} canClaim={can(session, "challenges.claim")} />}
      {isGuild && <GuildBoard supabase={supabase} month={month} showLogs={can(session, "logs.view")} />}
      {!isPlayer && !isGuild && <EmptyState art="locked" title="Markas masih kosong" text="Role-mu belum punya akses ke fitur lain. Hubungi Game Master." />}
    </div>
  );
}

type SB = Awaited<ReturnType<typeof createClient>>;

function MoreLink({ href, children }: { href: string; children: string }) {
  return (
    <Link href={href} className="inline-flex items-center gap-0.5 text-sm font-semibold text-cyan hover:text-white">
      {children} <ChevronRight size={15} />
    </Link>
  );
}

async function PlayerBoard({ userId, month, supabase, canCreate, canClaim }: { userId: string; month: string; supabase: SB; canCreate: boolean; canClaim: boolean }) {
  const today = todayWIB();
  const [wallets, flow, series, budgets, cats, goals, recent, challenges, claims] = await Promise.all([
    supabase.from("wallet_balances").select("*").eq("user_id", userId),
    supabase.from("monthly_cashflow").select("income, expense").eq("user_id", userId).eq("month", month + "-01").maybeSingle(),
    supabase.from("monthly_cashflow").select("month, income, expense").eq("user_id", userId).order("month", { ascending: false }).limit(6),
    supabase.from("budget_status").select("*").eq("user_id", userId).eq("month", month + "-01"),
    supabase.from("categories").select("id, name, icon, color"),
    supabase.from("goal_progress").select("*").eq("user_id", userId).eq("status", "active").order("created_at"),
    supabase.from("transactions").select("*, categories(name, icon, color), wallets(name, icon)").eq("user_id", userId).order("occurred_on", { ascending: false }).order("created_at", { ascending: false }).limit(5),
    canClaim ? supabase.from("challenges").select("id").eq("is_active", true) : Promise.resolve({ data: [] as { id: string }[] }),
    canClaim ? supabase.from("challenge_claims").select("challenge_id").eq("user_id", userId).eq("claim_date", today) : Promise.resolve({ data: [] as { challenge_id: string }[] }),
  ]);

  const w = (wallets.data ?? []) as WalletBalance[];
  const total = w.reduce((s, x) => s + Number(x.balance), 0);
  const income = Number(flow.data?.income ?? 0);
  const expense = Number(flow.data?.expense ?? 0);
  const hist = ((series.data ?? []) as { month: string; income: number; expense: number }[]).slice().reverse();
  const catMap = new Map(((cats.data ?? []) as Pick<Category, "id" | "name" | "icon" | "color">[]).map((c) => [c.id, c]));
  const b = ((budgets.data ?? []) as BudgetStatus[]).sort((x, y) => Number(y.spent) / Number(y.limit_amount) - Number(x.spent) / Number(x.limit_amount));
  const g = (goals.data ?? []) as GoalProgress[];
  const tx = (recent.data ?? []) as Transaction[];
  const unclaimed = (challenges.data?.length ?? 0) - (claims.data?.length ?? 0);

  return (
    <>
      <div className="grid gap-3 lg:grid-cols-12">
        <Card className="lg:col-span-7">
          <div className="flex items-center gap-4">
            <Chest size={72} className="shrink-0" />
            <div className="min-w-0">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-mute">Total saldo · {w.length} dompet</p>
              <p className="truncate font-display text-[2rem] font-extrabold leading-tight text-white sm:text-4xl">
                <AnimatedNumber value={total} money />
              </p>
            </div>
          </div>
          {canCreate && (
            <div className="mt-4">
              <LinkButton href="/transactions?new=1" className="w-full">
                <Plus size={17} /> Catat Transaksi <span className="rounded-full bg-white/20 px-2 py-0.5 text-[11px]">+10 XP</span>
              </LinkButton>
            </div>
          )}
        </Card>

        <Card className="lg:col-span-5">
          <p className="mb-3 text-[11px] font-semibold uppercase tracking-wider text-mute">Bulan ini · {monthLabel(month)}</p>
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-3">
              <div className="flex items-center gap-1 text-xs font-semibold text-emerald">
                <ArrowDownLeft size={14} /> Masuk
              </div>
              <p className="mt-1 truncate font-display text-[clamp(0.95rem,4vw,1.15rem)] font-bold text-white">{rupiah(income)}</p>
              <div className="mt-1.5">
                <Sparkline values={hist.map((h) => Number(h.income))} color="#34d399" width={90} />
              </div>
            </div>
            <div className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-3">
              <div className="flex items-center gap-1 text-xs font-semibold text-rose">
                <ArrowUpRight size={14} /> Keluar
              </div>
              <p className="mt-1 truncate font-display text-[clamp(0.95rem,4vw,1.15rem)] font-bold text-white">{rupiah(expense)}</p>
              <div className="mt-1.5">
                <Sparkline values={hist.map((h) => Number(h.expense))} color="#fb7185" width={90} />
              </div>
            </div>
          </div>
        </Card>
      </div>

      {canClaim && unclaimed > 0 && (
        <Link href="/challenges" className="mt-3 flex items-center gap-3 rounded-2xl border border-cyan/25 bg-cyan/[0.07] px-4 py-3 text-sm font-semibold text-cyan-100 transition hover:bg-cyan/10">
          <Flag size={18} className="shrink-0 text-cyan" />
          <span className="flex-1">
            Ada <b className="text-cyan">{unclaimed}</b> tantangan harian yang belum kamu klaim hari ini.
          </span>
          <ChevronRight size={16} />
        </Link>
      )}

      <div className="grid gap-x-3 lg:grid-cols-2">
        <div>
          <SectionTitle action={<MoreLink href="/budgets">Semua</MoreLink>}>Anggaran kritis</SectionTitle>
          {b.length === 0 ? (
            <EmptyState icon="shield-check" title="Belum ada perisai" text="Buat anggaran per kategori supaya pengeluaranmu terjaga." />
          ) : (
            <div className="space-y-3">
              {b.slice(0, 3).map((x) => {
                const c = catMap.get(x.category_id);
                const left = Math.max(0, 100 - (Number(x.spent) / Number(x.limit_amount)) * 100);
                return (
                  <Card key={x.id} className="flex items-center gap-3.5">
                    <HpShield pct={left} size={46} />
                    <div className="min-w-0 flex-1">
                      <div className="mb-1.5 flex items-center justify-between gap-2">
                        <span className="flex min-w-0 items-center gap-2 font-display text-sm font-semibold">
                          <IconTile icon={c?.icon} color={c?.color ?? "#8b5cf6"} size={24} />
                          <span className="truncate">{c?.name ?? "Kategori"}</span>
                        </span>
                        <span className="num shrink-0 text-xs font-semibold text-mute">{Math.round(left)}% HP</span>
                      </div>
                      <HpBar pct={left} />
                      <p className="num mt-1.5 text-xs text-mute">
                        {rupiah(x.spent)} dari {rupiah(x.limit_amount)}
                      </p>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </div>

        <div>
          <SectionTitle action={<MoreLink href="/goals">Semua</MoreLink>}>Quest aktif</SectionTitle>
          {g.length === 0 ? (
            <EmptyState art="quest" title="Belum ada boss" text="Buat quest tabungan, lalu serang dengan setoran." />
          ) : (
            <div className="space-y-3">
              {g.slice(0, 3).map((x) => {
                const pct = (Number(x.saved) / Number(x.target_amount)) * 100;
                return (
                  <Card key={x.id} className="flex items-center gap-3.5">
                    <BossSigil pct={100 - pct} size={64} />
                    <div className="min-w-0 flex-1">
                      <div className="mb-1.5 flex items-center justify-between gap-2">
                        <span className="truncate font-display text-sm font-semibold">{x.name}</span>
                        <span className="num shrink-0 text-xs font-semibold text-mute">{Math.round(pct)}%</span>
                      </div>
                      <HpBar pct={100 - pct} tone="boss" />
                      <p className="num mt-1.5 text-xs text-mute">
                        Terkumpul {rupiah(x.saved)} / {rupiah(x.target_amount)}
                      </p>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <SectionTitle action={<MoreLink href="/transactions">Semua</MoreLink>}>Transaksi terbaru</SectionTitle>
      {tx.length === 0 ? (
        <EmptyState art="transactions" title="Belum ada catatan" text="Catat transaksi pertamamu dan dapatkan achievement Langkah Pertama." />
      ) : (
        <Card className="divide-y divide-white/[0.06] !p-1.5">
          {tx.map((t) => (
            <div key={t.id} className="flex items-center gap-3 px-2.5 py-2.5">
              <IconTile icon={t.categories?.icon} color={t.categories?.color ?? "#94a3b8"} />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-white">{t.note || t.categories?.name || "Transaksi"}</p>
                <p className="truncate text-xs text-mute">
                  {fmtDate(t.occurred_on)} · {t.wallets?.name}
                </p>
              </div>
              <span className={`num shrink-0 font-display text-sm font-bold ${t.kind === "income" ? "text-emerald" : "text-rose"}`}>
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
      <SectionTitle action={<MoreLink href="/reports">Laporan</MoreLink>}>Ringkasan guild · {monthLabel(month)}</SectionTitle>
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatTile label="Pemain aktif">{p.length}</StatTile>
        <StatTile label="Transaksi">{txCount}</StatTile>
        <StatTile label="Pemasukan" tone="in">
          {rupiah(income)}
        </StatTile>
        <StatTile label="Pengeluaran" tone="out">
          {rupiah(expense)}
        </StatTile>
      </div>

      <div className="grid gap-x-3 lg:grid-cols-2">
        <div>
          <SectionTitle>Papan peringkat</SectionTitle>
          {p.length === 0 ? (
            <EmptyState icon="crown" title="Belum ada pemain" />
          ) : (
            <Card className="divide-y divide-white/[0.06] !p-1.5">
              {p.slice(0, 8).map((x, i) => (
                <div key={x.id} className="flex items-center gap-3 px-2.5 py-2.5">
                  <span className={`w-6 text-center font-display text-sm font-bold ${i === 0 ? "text-gold" : "text-mute"}`}>{i + 1}</span>
                  <Avatar name={x.avatar} size={38} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-white">{x.display_name}</p>
                    <p className="flex items-center gap-1 text-xs text-mute">
                      Lv {x.level} · {levelTitle(x.level)} · <StreakFlame size={12} lit={x.streak > 0} /> {x.streak}
                    </p>
                  </div>
                  <span className="num flex items-center gap-1 font-display text-sm font-bold text-violet-300">
                    <Sparkles size={13} /> {num(x.xp)}
                  </span>
                </div>
              ))}
            </Card>
          )}
        </div>

        {showLogs && (
          <div>
            <SectionTitle action={<MoreLink href="/admin/logs">Semua</MoreLink>}>Aktivitas terbaru</SectionTitle>
            <Card className="divide-y divide-white/[0.06] !p-1.5">
              {l.length === 0 && <p className="p-3 text-sm text-mute">Belum ada aktivitas.</p>}
              {l.map((x) => (
                <div key={x.id} className="flex items-center justify-between gap-3 px-2.5 py-2.5 text-sm">
                  <span className="min-w-0 truncate">
                    <b className="font-semibold text-white">{x.actor_name ?? "Sistem"}</b> <span className="text-mute">· {x.action} {x.entity}</span>
                  </span>
                  <span className="shrink-0 text-xs text-mute">{fmtDateTime(x.created_at)}</span>
                </div>
              ))}
            </Card>
          </div>
        )}
      </div>
    </>
  );
}
