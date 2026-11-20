import { can, requirePermission } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { currentMonth, shiftMonth } from "@/lib/format";
import { PageHeader } from "@/components/ui/Misc";
import { ReportView, type CashflowRow, type CategoryRow, type DailyRow, type PlayerOption } from "./ReportView";

export const metadata = { title: "Laporan | Myduit Gweh" };

export default async function ReportsPage({ searchParams }: { searchParams: Promise<{ user?: string; m?: string }> }) {
  const session = await requirePermission(["reports.view_own", "reports.view_all"]);
  const sp = await searchParams;
  const supabase = await createClient();
  const viewAll = can(session, "reports.view_all");
  const month = /^\d{4}-\d{2}$/.test(sp.m ?? "") ? sp.m! : currentMonth();

  let players: PlayerOption[] = [];
  let target = session.userId;
  if (viewAll) {
    const { data } = await supabase.from("profiles").select("id, display_name, avatar, roles!inner(code)").eq("roles.code", "pemain").order("display_name");
    players = ((data ?? []) as unknown as PlayerOption[]).map((p) => ({ id: p.id, display_name: p.display_name, avatar: p.avatar }));
    target = players.find((p) => p.id === sp.user)?.id ?? players[0]?.id ?? "";
  }
  if (!target) {
    return (
      <>
        <PageHeader title="Laporan" subtitle="Grafik keuangan pemain" icon="📊" />
        <ReportView viewAll players={players} target="" month={month} cashflow={[]} categories={[]} daily={[]} balance={0} />
      </>
    );
  }

  const nextMonth = shiftMonth(month, 1);
  const [flow, cat, tx, wallets] = await Promise.all([
    supabase.from("monthly_cashflow").select("month, income, expense").eq("user_id", target).gte("month", shiftMonth(month, -5) + "-01").lte("month", month + "-01").order("month"),
    supabase.from("category_spending").select("category_name, category_icon, category_color, total").eq("user_id", target).eq("month", month + "-01").eq("kind", "expense").order("total", { ascending: false }),
    supabase.from("transactions").select("occurred_on, amount, kind").eq("user_id", target).gte("occurred_on", month + "-01").lt("occurred_on", nextMonth + "-01"),
    supabase.from("wallet_balances").select("balance").eq("user_id", target),
  ]);

  const dailyMap = new Map<string, { income: number; expense: number }>();
  (tx.data ?? []).forEach((t) => {
    const d = dailyMap.get(t.occurred_on) ?? { income: 0, expense: 0 };
    d[t.kind as "income" | "expense"] += Number(t.amount);
    dailyMap.set(t.occurred_on, d);
  });
  const daily: DailyRow[] = [...dailyMap.entries()].sort(([a], [b]) => a.localeCompare(b)).map(([date, v]) => ({ day: Number(date.slice(8)), ...v }));
  const balance = (wallets.data ?? []).reduce((s, w) => s + Number(w.balance), 0);

  return (
    <>
      <PageHeader title="Laporan" subtitle={viewAll ? "Pantau perkembangan semua pemain (hanya lihat)" : "Perjalanan keuanganmu dalam grafik"} icon="📊" />
      <ReportView
        viewAll={viewAll}
        players={players}
        target={target}
        month={month}
        cashflow={(flow.data ?? []).map((r) => ({ month: r.month as string, income: Number(r.income), expense: Number(r.expense) })) as CashflowRow[]}
        categories={(cat.data ?? []).map((c) => ({ name: c.category_name as string, icon: c.category_icon as string, color: c.category_color as string, total: Number(c.total) })) as CategoryRow[]}
        daily={daily}
        balance={balance}
      />
    </>
  );
}
