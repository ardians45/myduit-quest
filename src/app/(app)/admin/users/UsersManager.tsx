"use client";

import { useState } from "react";
import { Search } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { friendlyError } from "@/lib/errors";
import { fmtDate, levelTitle, num } from "@/lib/format";
import { useGame } from "@/components/game/GameFeedback";
import { Can } from "@/components/layout/SessionProvider";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input, Select } from "@/components/ui/Form";
import { ConfirmDialog } from "@/components/ui/Modal";
import { Badge, EmptyState } from "@/components/ui/Misc";
import type { Profile, Role } from "@/lib/types";

export function UsersManager({ users, roles, selfId }: { users: Profile[]; roles: Role[]; selfId: string }) {
  const { toast, refresh } = useGame();
  const [q, setQ] = useState("");
  const [target, setTarget] = useState<Profile | null>(null);
  const [busy, setBusy] = useState(false);

  const list = users.filter((u) => (u.display_name + " " + (u.email ?? "")).toLowerCase().includes(q.toLowerCase()));

  async function setRole(u: Profile, roleId: string) {
    const { error } = await createClient().from("profiles").update({ role_id: roleId }).eq("id", u.id);
    if (error) return toast(friendlyError(error), "error");
    toast(`Role ${u.display_name} diperbarui.`);
    refresh();
  }

  async function setActive(u: Profile, active: boolean) {
    setBusy(true);
    const { error } = await createClient().from("profiles").update({ is_active: active }).eq("id", u.id);
    setBusy(false);
    if (error) return toast(friendlyError(error), "error");
    setTarget(null);
    toast(active ? `${u.display_name} diaktifkan kembali.` : `${u.display_name} dinonaktifkan.`);
    refresh();
  }

  return (
    <>
      <div className="relative mb-4">
        <Search size={18} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-mute" />
        <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Cari nama atau email..." className="!pl-10" aria-label="Cari pengguna" />
      </div>

      {list.length === 0 && <EmptyState emoji="🔍" title="Pengguna tidak ditemukan" />}

      <div className="grid gap-3">
        {list.map((u) => {
          const self = u.id === selfId;
          return (
            <Card key={u.id} tilt={false} className={u.is_active ? "" : "opacity-60"}>
              <div className="flex flex-wrap items-center gap-3">
                <span className="grid h-12 w-12 place-items-center rounded-2xl border-[3px] border-night-500 bg-black/25 text-2xl">{u.avatar}</span>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-display text-lg leading-tight">
                    {u.display_name} {self && <Badge color="#38bdf8">Kamu</Badge>} {!u.is_active && <Badge color="#f43f5e">Nonaktif</Badge>}
                  </p>
                  <p className="truncate text-xs text-mute">
                    {u.email} · gabung {fmtDate(u.created_at)} · Lv {u.level} {levelTitle(u.level)} · {num(u.xp)} XP
                  </p>
                </div>
                <div className="flex w-full items-center gap-2 sm:w-auto">
                  <Select
                    aria-label={`Role ${u.display_name}`}
                    value={u.role_id ?? ""}
                    disabled={self}
                    onChange={(e) => setRole(u, e.target.value)}
                    className="sm:!w-48"
                  >
                    {!u.role_id && <option value="">(tanpa role)</option>}
                    {roles.map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.name}
                      </option>
                    ))}
                  </Select>
                  <Can perm="users.manage">
                    {u.is_active ? (
                      <Button small variant="red" disabled={self} onClick={() => setTarget(u)}>
                        Nonaktifkan
                      </Button>
                    ) : (
                      <Button small variant="green" loading={busy} onClick={() => setActive(u, true)}>
                        Aktifkan
                      </Button>
                    )}
                  </Can>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      <ConfirmDialog
        open={!!target}
        loading={busy}
        title="Nonaktifkan akun?"
        confirmLabel="Ya, nonaktifkan"
        onClose={() => setTarget(null)}
        onConfirm={() => target && setActive(target, false)}
        message={<><b className="text-white">{target?.display_name}</b> tidak akan bisa masuk atau mengakses data lagi sampai diaktifkan kembali. Datanya tetap aman.</>}
      />
    </>
  );
}
