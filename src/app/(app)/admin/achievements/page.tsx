import { requirePermission } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/ui/Misc";
import { AchievementsManager } from "./AchievementsManager";
import type { Achievement } from "@/lib/types";

export const metadata = { title: "Achievement | Myduit Gweh" };

export default async function AdminAchievementsPage() {
  await requirePermission("achievements.manage");
  const supabase = await createClient();
  const [ach, ua] = await Promise.all([
    supabase.from("achievements").select("*").order("threshold"),
    supabase.from("user_achievements").select("achievement_id"),
  ]);
  const unlocked: Record<string, number> = {};
  (ua.data ?? []).forEach((u) => (unlocked[u.achievement_id] = (unlocked[u.achievement_id] ?? 0) + 1));
  return (
    <>
      <PageHeader title="Achievement" subtitle="Master lencana yang bisa dibuka pemain" icon="trophy" />
      <AchievementsManager achievements={(ach.data ?? []) as Achievement[]} unlocked={unlocked} />
    </>
  );
}
