"use client";

import { createContext, useContext, useMemo, type ReactNode } from "react";
import type { Profile } from "@/lib/types";

export interface ClientSession {
  profile: Profile;
  role: { code: string; name: string } | null;
  permissions: string[];
}

const Ctx = createContext<ClientSession | null>(null);

export function SessionProvider({ value, children }: { value: ClientSession; children: ReactNode }) {
  const memo = useMemo(() => value, [value]);
  return <Ctx.Provider value={memo}>{children}</Ctx.Provider>;
}

export function useSession(): ClientSession {
  const v = useContext(Ctx);
  if (!v) throw new Error("useSession harus dipakai di dalam SessionProvider");
  return v;
}

/** Cek permission di komponen klien. Terima satu kode atau beberapa (salah satu cukup). */
export function useCan(perm: string | string[]): boolean {
  const { permissions } = useSession();
  const list = Array.isArray(perm) ? perm : [perm];
  return list.some((p) => permissions.includes(p));
}

/** Render children hanya kalau user punya permission. */
export function Can({
  perm,
  children,
  fallback = null,
}: {
  perm: string | string[];
  children: ReactNode;
  fallback?: ReactNode;
}) {
  return useCan(perm) ? <>{children}</> : <>{fallback}</>;
}
