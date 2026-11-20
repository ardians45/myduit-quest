import { can, requirePermission } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { todayWIB } from "@/lib/format";
import { PageHeader } from "@/components/ui/Misc";
import { ChallengesManager } from "./ChallengesManager";
import type { Challenge } from "@/lib/types";

export const metadata = { title: "Tantangan Harian | Myduit Gweh" };

export default async function ChallengesPage() {
  const session = await requirePermission(["challenges.view", "challenges.manage"]);
  const supabase = await createClient();
  const today = todayWIB();
  const canClaim = can(session, "challenges.claim");
  const canManage = can(session, "challenges.manage");

  const [ch, mine, all] = await Promise.all([
    supabase.from("challenges").select("*").order("created_at", { ascending: false }),
    canClaim ? supabase.from("challenge_claims").select("challenge_id, claim_date").eq("user_id", session.userId) : Promise.resolve({ data: [] as { challenge_id: string; claim_date: string }[] }),
    canManage ? supabase.from("challenge_claims").select("challenge_id") : Promise.resolve({ data: [] as { challenge_id: string }[] }),
  ]);

  const claimedToday = new Set((mine.data ?? []).filter((c) => c.claim_date === today).map((c) => c.challenge_id));
  const totalClaims: Record<string, number> = {};
  (all.data ?? []).forEach((c) => (totalClaims[c.challenge_id] = (totalClaims[c.challenge_id] ?? 0) + 1));

  return (
    <>
      <PageHeader title="Tantangan Harian" subtitle="Selesaikan misi dari Mentor, klaim XP-nya sekali per hari" icon="🎯" />
      <ChallengesManager challenges={(ch.data ?? []) as Challenge[]} claimedToday={[...claimedToday]} totalClaims={totalClaims} canClaim={canClaim} canManage={canManage} />
    </>
  );
}
