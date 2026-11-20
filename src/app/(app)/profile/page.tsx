import { Flame, Lock } from "lucide-react";
import { getSessionProfile } from "@/lib/auth";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { fmtDate, levelProgress, levelTitle, num } from "@/lib/format";
import { Card } from "@/components/ui/Card";
import { HpBar } from "@/components/ui/HPBar";
import { PageHeader, SectionTitle, StatTile } from "@/components/ui/Misc";
import { ProfileEditor, GuildMenu } from "./ProfileClient";
import type { Achievement } from "@/lib/types";

export const metadata = { title: "Profil | Myduit Gweh" };

export default async function ProfilePage() {
  const session = await getSessionProfile();
  if (!session) redirect("/login");
  const { profile } = session;
  const supabase = await createClient();
  const [ach, mine] = await Promise.all([
    supabase.from("achievements").select("*").eq("is_active", true).order("threshold"),
    supabase.from("user_achievements").select("achievement_id, unlocked_at").eq("user_id", profile.id),
  ]);
  const unlocked = new Map((mine.data ?? []).map((u) => [u.achievement_id as string, u.unlocked_at as string]));
  const list = (ach.data ?? []) as Achievement[];
  const lp = levelProgress(profile.xp);

  return (
    <>
      <PageHeader title="Profil" subtitle="Guild Hall: karakter, lencana, dan semua ruangan" icon="🏰" />
      <Card gold>
        <ProfileEditor />
        <div className="mt-4">
          <div className="mb-1 flex justify-between text-sm font-extrabold text-amber-100">
            <span>
              Level {lp.level} · {levelTitle(lp.level)}
            </span>
            <span>{num(profile.xp)} XP</span>
          </div>
          <HpBar pct={lp.pct} tone="xp" />
          <p className="mt-1 text-xs text-amber-100/70">{num(lp.toNext)} XP lagi menuju Level {lp.level + 1}</p>
        </div>
        <div className="mt-4 grid grid-cols-3 gap-2">
          <StatTile label="Streak" tone="xp">
            <span className="inline-flex items-center gap-1">
              <Flame size={18} className="text-orange-400" /> {profile.streak}
            </span>
          </StatTile>
          <StatTile label="Rekor streak">{profile.longest_streak} hari</StatTile>
          <StatTile label="Lencana">
            {unlocked.size}/{list.length}
          </StatTile>
        </div>
      </Card>

      <SectionTitle>Achievement</SectionTitle>
      <div className="grid gap-3 sm:grid-cols-2">
        {list.map((a) => {
          const at = unlocked.get(a.id);
          return (
            <Card key={a.id} tilt={false} className={at ? "" : "opacity-60"}>
              <div className="flex items-center gap-3">
                <span className={`grid h-14 w-14 shrink-0 place-items-center rounded-2xl border-[3px] text-3xl ${at ? "border-gold bg-gold/15" : "border-night-500 bg-black/30 grayscale"}`}>
                  {at ? a.icon : <Lock size={22} />}
                </span>
                <div className="min-w-0">
                  <p className="font-display text-lg leading-tight">{a.name}</p>
                  <p className="text-sm text-mute">{a.description}</p>
                  <p className="mt-0.5 text-xs font-extrabold text-volt">{at ? `Terbuka ${fmtDate(at)}` : `Hadiah +${a.xp_reward} XP`}</p>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      <SectionTitle>Guild Hall</SectionTitle>
      <GuildMenu />
    </>
  );
}
