import { redirect } from "next/navigation";
import { getSessionProfile } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { fmtDate, levelProgress, levelTitle, num } from "@/lib/format";
import { Card } from "@/components/ui/Card";
import { PageHeader, SectionTitle, StatTile } from "@/components/ui/Misc";
import { AchievementBadge, StreakFlame, XpBar } from "@/components/art";
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
      <PageHeader title="Profil" subtitle="Karakter, lencana, dan semua ruangan" icon="crown" />
      <Card hero className="!p-5">
        <ProfileEditor />
        <div className="mt-5">
          <div className="mb-1.5 flex items-end justify-between gap-2 text-xs font-semibold">
            <span className="text-white">
              Level {lp.level} <span className="text-mute">· {levelTitle(lp.level)}</span>
            </span>
            <span className="num text-violet-300">{num(profile.xp)} XP</span>
          </div>
          <XpBar pct={lp.pct} height={12} />
          <p className="mt-1.5 text-xs text-mute">{num(lp.toNext)} XP lagi menuju Level {lp.level + 1}</p>
        </div>
        <div className="mt-4 grid grid-cols-3 gap-2.5">
          <StatTile label="Streak" tone="xp">
            <span className="inline-flex items-center gap-1">
              <StreakFlame size={20} lit={profile.streak > 0} /> {profile.streak}
            </span>
          </StatTile>
          <StatTile label="Rekor">{profile.longest_streak} hari</StatTile>
          <StatTile label="Lencana">
            {unlocked.size}/{list.length}
          </StatTile>
        </div>
      </Card>

      <SectionTitle>Achievement</SectionTitle>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {list.map((a) => {
          const at = unlocked.get(a.id);
          return (
            <Card key={a.id} className={`flex items-center gap-3.5 ${at ? "" : "opacity-70"}`}>
              <AchievementBadge icon={a.icon} locked={!at} size={60} />
              <div className="min-w-0">
                <p className="font-display text-sm font-bold leading-tight text-white">{a.name}</p>
                <p className="mt-0.5 text-xs leading-snug text-mute">{a.description}</p>
                <p className={`mt-1 text-xs font-semibold ${at ? "text-emerald" : "text-cyan"}`}>{at ? `Terbuka ${fmtDate(at)}` : `Hadiah +${a.xp_reward} XP`}</p>
              </div>
            </Card>
          );
        })}
      </div>

      <SectionTitle>Ruang lainnya</SectionTitle>
      <GuildMenu />
    </>
  );
}
