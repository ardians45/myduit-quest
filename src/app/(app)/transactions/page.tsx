import { requirePermission } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/ui/Misc";
import { TransactionsManager } from "./TransactionsManager";
import type { Category, Transaction } from "@/lib/types";

export const metadata = { title: "Loot & Damage | Myduit Gweh" };

type SP = { from?: string; to?: string; kind?: string; category?: string; wallet?: string; q?: string; new?: string };

export default async function TransactionsPage({ searchParams }: { searchParams: Promise<SP> }) {
  const { userId } = await requirePermission("transactions.view");
  const sp = await searchParams;
  const supabase = await createClient();

  let query = supabase
    .from("transactions")
    .select("*, categories(name, icon, color), wallets(name, icon)")
    .eq("user_id", userId)
    .order("occurred_on", { ascending: false })
    .order("created_at", { ascending: false })
    .limit(300);
  if (sp.from) query = query.gte("occurred_on", sp.from);
  if (sp.to) query = query.lte("occurred_on", sp.to);
  if (sp.kind === "income" || sp.kind === "expense") query = query.eq("kind", sp.kind);
  if (sp.category) query = query.eq("category_id", sp.category);
  if (sp.wallet) query = query.eq("wallet_id", sp.wallet);
  if (sp.q) query = query.ilike("note", `%${sp.q.replace(/[%,]/g, " ")}%`);

  const [tx, wallets, cats] = await Promise.all([
    query,
    supabase.from("wallets").select("id, name, icon").eq("user_id", userId).order("created_at"),
    supabase.from("categories").select("*").order("name"),
  ]);

  return (
    <>
      <PageHeader title="Loot & Damage" subtitle="Catat pemasukan (loot) dan pengeluaran (damage)" icon="swords" />
      <TransactionsManager
        key={sp.new === "1" ? "new" : "list"}
        transactions={(tx.data ?? []) as Transaction[]}
        wallets={(wallets.data ?? []) as { id: string; name: string; icon: string }[]}
        categories={(cats.data ?? []) as Category[]}
        userId={userId}
        filters={{ from: sp.from ?? "", to: sp.to ?? "", kind: sp.kind ?? "", category: sp.category ?? "", wallet: sp.wallet ?? "", q: sp.q ?? "" }}
        autoOpen={sp.new === "1"}
      />
    </>
  );
}
