import { redirect } from "next/navigation";
import { getSessionProfile } from "@/lib/auth";
import { SessionProvider } from "@/components/layout/SessionProvider";
import { AppShell } from "@/components/layout/AppShell";
import { GameFeedbackProvider } from "@/components/game/GameFeedback";

export const dynamic = "force-dynamic";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await getSessionProfile();
  if (!session) redirect("/login");
  if (!session.profile.is_active) redirect("/auth/signout?reason=nonaktif");

  return (
    <SessionProvider value={{ profile: session.profile, role: session.role, permissions: session.permissions }}>
      <GameFeedbackProvider>
        <AppShell>{children}</AppShell>
      </GameFeedbackProvider>
    </SessionProvider>
  );
}
