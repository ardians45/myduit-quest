"use client";

import { useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { monthLabel, rupiah, shiftMonth } from "@/lib/format";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Select } from "@/components/ui/Form";
import { EmptyState, SectionTitle, StatTile } from "@/components/ui/Misc";
import { AppIcon } from "@/lib/icons";
import { Avatar } from "@/components/art";

export interface PlayerOption { id: string; display_name: string; avatar: string }
export interface CashflowRow { month: string; income: number; expense: number }
export interface CategoryRow { name: string; icon: string; color: string; total: number }
export interface DailyRow { day: number; income: number; expense: number }

const axis = { stroke: "#8a93b2", fontSize: 12, tickLine: false, axisLine: false };
const GRID = "rgba(255,255,255,0.06)";
const tooltipStyle = { background: "#0d1126", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 12, color: "#e8ecf8", fontWeight: 600, fontSize: 13 };
const short = (n: number) => (n >= 1_000_000 ? `${(n / 1_000_000).toFixed(1).replace(".0", "")} jt` : n >= 1000 ? `${Math.round(n / 1000)} rb` : String(n));

export function ReportView({
  viewAll,
  players,
  target,
  month,
  cashflow,
  categories,
  daily,
  balance,
}: {
  viewAll: boolean;
  players: PlayerOption[];
  target: string;
  month: string;
  cashflow: CashflowRow[];
  categories: CategoryRow[];
  daily: DailyRow[];
  balance: number;
}) {
  const router = useRouter();
  const go = (user: string, m: string) => router.push(`/reports?${new URLSearchParams({ ...(user ? { user } : {}), m }).toString()}`);

  const cur = cashflow.find((c) => c.month.slice(0, 7) === month);
  const income = cur?.income ?? 0;
  const expense = cur?.expense ?? 0;
  const totalCat = categories.reduce((s, c) => s + c.total, 0);
  const flowData = cashflow.map((c) => ({ name: monthLabel(c.month).split(" ")[0].slice(0, 3), Pemasukan: c.income, Pengeluaran: c.expense }));
  const dailyData = daily.map((d) => ({ name: d.day, Pengeluaran: d.expense, Pemasukan: d.income }));

  return (
    <>
      <Card className="mb-4">
        <div className="flex flex-wrap items-end justify-between gap-3">
          {viewAll && (
            <div className="min-w-48 flex-1">
              <span className="mb-1.5 flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.08em] text-mute">{players.find((p) => p.id === target) && <Avatar name={players.find((p) => p.id === target)!.avatar} size={20} />}Pemain</span>
              <Select value={target} onChange={(e) => go(e.target.value, month)} aria-label="Pilih pemain">
                {players.length === 0 && <option value="">Belum ada pemain</option>}
                {players.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.display_name}
                  </option>
                ))}
              </Select>
            </div>
          )}
          <div className="flex items-center gap-2">
            <Button small variant="secondary" aria-label="Bulan sebelumnya" onClick={() => go(viewAll ? target : "", shiftMonth(month, -1))}>
              <ChevronLeft size={18} />
            </Button>
            <span className="min-w-36 text-center font-display text-lg font-bold">{monthLabel(month)}</span>
            <Button small variant="secondary" aria-label="Bulan berikutnya" onClick={() => go(viewAll ? target : "", shiftMonth(month, 1))}>
              <ChevronRight size={18} />
            </Button>
          </div>
        </div>
      </Card>

      {!target ? (
        <EmptyState icon="trending-up" title="Belum ada data pemain" />
      ) : (
        <>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <StatTile label="Pemasukan" tone="in">{rupiah(income)}</StatTile>
            <StatTile label="Pengeluaran" tone="out">{rupiah(expense)}</StatTile>
            <StatTile label="Selisih bulan ini">{rupiah(income - expense)}</StatTile>
            <StatTile label="Total saldo">{rupiah(balance)}</StatTile>
          </div>

          <SectionTitle>Arus Kas 6 Bulan</SectionTitle>
          <Card>
            {flowData.length === 0 ? (
              <p className="py-8 text-center text-mute">Belum ada transaksi.</p>
            ) : (
              <div role="img" aria-label="Grafik batang pemasukan dan pengeluaran per bulan">
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={flowData} margin={{ left: -10, right: 8, top: 8 }}>
                    <CartesianGrid stroke={GRID} vertical={false} />
                    <XAxis dataKey="name" {...axis} />
                    <YAxis {...axis} tickFormatter={short} />
                    <Tooltip contentStyle={tooltipStyle} formatter={(v) => rupiah(Number(v))} cursor={{ fill: "rgba(255,255,255,0.05)" }} />
                    <Legend wrapperStyle={{ color: "#8a93b2", fontSize: 12 }} />
                    <Bar dataKey="Pemasukan" fill="#34d399" radius={[8, 8, 0, 0]} />
                    <Bar dataKey="Pengeluaran" fill="#fb7185" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </Card>

          <div className="grid gap-4 lg:grid-cols-2">
            <div>
              <SectionTitle>Pengeluaran per Kategori</SectionTitle>
              <Card>
                {categories.length === 0 ? (
                  <p className="py-8 text-center text-mute">Tidak ada pengeluaran bulan ini.</p>
                ) : (
                  <>
                    <div role="img" aria-label="Grafik donat pengeluaran per kategori">
                      <ResponsiveContainer width="100%" height={220}>
                        <PieChart>
                          <Pie data={categories} dataKey="total" nameKey="name" innerRadius={55} outerRadius={90} paddingAngle={2} stroke="#0d1126" strokeWidth={3}>
                            {categories.map((c, i) => (
                              <Cell key={i} fill={c.color} />
                            ))}
                          </Pie>
                          <Tooltip contentStyle={tooltipStyle} formatter={(v) => rupiah(Number(v))} />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                    <ul className="mt-2 space-y-1.5 text-sm">
                      {categories.map((c, i) => (
                        <li key={i} className="flex items-center gap-2">
                          <span className="h-3 w-3 rounded-full" style={{ background: c.color }} />
                          <AppIcon name={c.icon} size={15} className="shrink-0 text-mute" />
                          <span className="flex-1 truncate">{c.name}</span>
                          <b>{rupiah(c.total)}</b>
                          <span className="w-10 text-right text-xs text-mute">{Math.round((c.total / totalCat) * 100)}%</span>
                        </li>
                      ))}
                    </ul>
                  </>
                )}
              </Card>
            </div>

            <div>
              <SectionTitle>Pergerakan Harian</SectionTitle>
              <Card>
                {dailyData.length === 0 ? (
                  <p className="py-8 text-center text-mute">Belum ada transaksi bulan ini.</p>
                ) : (
                  <div role="img" aria-label="Grafik area transaksi harian">
                    <ResponsiveContainer width="100%" height={260}>
                      <AreaChart data={dailyData} margin={{ left: -10, right: 8, top: 8 }}>
                        <defs>
                          <linearGradient id="gExp" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#fb7185" stopOpacity={0.45} />
                            <stop offset="100%" stopColor="#fb7185" stopOpacity={0} />
                          </linearGradient>
                          <linearGradient id="gInc" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#34d399" stopOpacity={0.45} />
                            <stop offset="100%" stopColor="#34d399" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid stroke={GRID} vertical={false} />
                        <XAxis dataKey="name" {...axis} />
                        <YAxis {...axis} tickFormatter={short} />
                        <Tooltip contentStyle={tooltipStyle} formatter={(v) => rupiah(Number(v))} labelFormatter={(l) => `Tanggal ${l}`} />
                        <Legend wrapperStyle={{ color: "#8a93b2", fontSize: 12 }} />
                        <Area type="monotone" dataKey="Pemasukan" stroke="#34d399" strokeWidth={2.5} fill="url(#gInc)" />
                        <Area type="monotone" dataKey="Pengeluaran" stroke="#fb7185" strokeWidth={2.5} fill="url(#gExp)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </Card>
            </div>
          </div>
        </>
      )}
    </>
  );
}
