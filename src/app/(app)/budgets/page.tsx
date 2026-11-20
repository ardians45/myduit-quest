import { requirePermission } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { currentMonth } from "@/lib/format";
import { PageHeader } from "@/components/ui/Misc";
import { BudgetsManager } from "./BudgetsManager";
import type { BudgetStatus, Category } from "@/lib/types";

export const metadata = { title: "Perisai HP | Myduit Gweh" };

export default async function BudgetsPage({ searchParams }: { searchParams: Promise<{ m?: string }> }) {
  const { userId } = await requirePermission("budgets.view");
  const sp = await searchParams;
  const month = /^\d{4}-\d{2}$/.test(sp.m ?? "") ? sp.m! : currentMonth();
  const supabase = await createClient();
  const [budgets, cats] = await Promise.all([
    supabase.from("budget_status").select("*").eq("user_id", userId).eq("month", month + "-01"),
    supabase.from("categories").select("*").eq("kind", "expense").order("name"),
  ]);
  return (
    <>
      <PageHeader title="Perisai HP" subtitle="Anggaran per kategori: jaga HP-mu jangan sampai habis" icon="shield-check" />
      <BudgetsManager key={month} month={month} budgets={(budgets.data ?? []) as BudgetStatus[]} categories={(cats.data ?? []) as Category[]} userId={userId} />
    </>
  );
}
