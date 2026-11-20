import { cache } from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { Profile } from "@/lib/types";

export interface SessionProfile {
  userId: string;
  profile: Profile;
  role: { code: string; name: string } | null;
  permissions: string[];
}

/**
 * Mengambil profil user yang sedang login + daftar kode permission-nya.
 * Dicache per request. Mengembalikan null kalau belum login.
 */
export const getSessionProfile = cache(async (): Promise<SessionProfile | null> => {
  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return null;

  const [{ data: profile }, { data: perms }] = await Promise.all([
    supabase.from("profiles").select("*, roles(code, name)").eq("id", auth.user.id).maybeSingle(),
    supabase.rpc("my_permissions"),
  ]);
  if (!profile) return null;

  const { roles, ...rest } = profile as Profile & { roles: { code: string; name: string } | null };
  return {
    userId: auth.user.id,
    profile: rest as Profile,
    role: roles ?? null,
    permissions: (perms as string[] | null) ?? [],
  };
});

export function can(session: SessionProfile, perm: string | string[]): boolean {
  const list = Array.isArray(perm) ? perm : [perm];
  return list.some((p) => session.permissions.includes(p));
}

/**
 * Dipakai di Server Component / Server Action: pastikan user login dan punya
 * (salah satu) permission. Kalau tidak: ke /login atau halaman 403 "Area Terkunci".
 */
export async function requirePermission(perm: string | string[]): Promise<SessionProfile> {
  const session = await getSessionProfile();
  if (!session) redirect("/login");
  if (!session.profile.is_active) redirect("/auth/signout?reason=nonaktif");
  if (!can(session, perm)) redirect("/403");
  return session;
}
