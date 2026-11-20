import { requirePermission } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/ui/Misc";
import { UsersManager } from "./UsersManager";
import type { Profile, Role } from "@/lib/types";

export const metadata = { title: "Pengguna | Myduit Gweh" };

export default async function AdminUsersPage() {
  const { userId } = await requirePermission("users.manage");
  const supabase = await createClient();
  const [users, roles] = await Promise.all([
    supabase.from("profiles").select("*").order("created_at"),
    supabase.from("roles").select("*").order("created_at"),
  ]);
  return (
    <>
      <PageHeader title="Pengguna" subtitle="Atur role dan status akun para pemain" icon="crown" />
      <UsersManager users={(users.data ?? []) as Profile[]} roles={(roles.data ?? []) as Role[]} selfId={userId} />
    </>
  );
}
