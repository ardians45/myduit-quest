import { requirePermission } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/ui/Misc";
import { GoalsManager } from "./GoalsManager";
import type { GoalDeposit, GoalProgress } from "@/lib/types";

export const metadata = { title: "Quest Tabungan | Myduit Gweh" };

export default async function GoalsPage() {
  const { userId } = await requirePermission("goals.view");
  const supabase = await createClient();
  const [goals, deposits] = await Promise.all([
    supabase.from("goal_progress").select("*").eq("user_id", userId).order("created_at"),
    supabase.from("goal_deposits").select("id, goal_id, amount, note, deposited_on").eq("user_id", userId).order("deposited_on", { ascending: false }).order("created_at", { ascending: false }),
  ]);
  return (
    <>
      <PageHeader title="Quest Tabungan" subtitle="Tiap target adalah boss. Setor dana untuk mengurangi HP-nya!" icon="🐉" />
      <GoalsManager goals={(goals.data ?? []) as GoalProgress[]} deposits={(deposits.data ?? []) as GoalDeposit[]} userId={userId} />
    </>
  );
}
