import { requirePermission } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/ui/Misc";
import { RolesManager } from "./RolesManager";
import type { Permission, Role } from "@/lib/types";

export const metadata = { title: "Role & Akses | Myduit Gweh" };

export default async function AdminRolesPage() {
  await requirePermission("rbac.manage");
  const supabase = await createClient();
  const [roles, perms, rp, users] = await Promise.all([
    supabase.from("roles").select("*").order("created_at"),
    supabase.from("permissions").select("*").order("code"),
    supabase.from("role_permissions").select("role_id, permission_id"),
    supabase.from("profiles").select("role_id"),
  ]);
  const userCount: Record<string, number> = {};
  (users.data ?? []).forEach((u) => u.role_id && (userCount[u.role_id] = (userCount[u.role_id] ?? 0) + 1));
  return (
    <>
      <PageHeader title="Role & Akses" subtitle="Kelola role dan matriks permission. Perubahan langsung tersimpan." icon="shield-check" />
      <RolesManager
        roles={(roles.data ?? []) as Role[]}
        permissions={(perms.data ?? []) as Permission[]}
        granted={(rp.data ?? []).map((r) => `${r.role_id}:${r.permission_id}`)}
        userCount={userCount}
      />
    </>
  );
}
