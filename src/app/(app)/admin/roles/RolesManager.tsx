"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { friendlyError } from "@/lib/errors";
import { useGame } from "@/components/game/GameFeedback";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Field, Input, Switch, TextArea } from "@/components/ui/Form";
import { ConfirmDialog, Modal } from "@/components/ui/Modal";
import { Badge, SectionTitle } from "@/components/ui/Misc";
import { RowMenu } from "@/components/ui/RowMenu";
import { ArrowLeftRight, BarChart3, Circle, Flag, KeyRound, LayoutDashboard, Pencil, Plus, ScrollText, ShieldHalf, Tags, Target, Trash2, Trophy, Users, Wallet, type LucideIcon } from "lucide-react";
import type { Permission, Role } from "@/lib/types";

const MODULE_ICON: Record<string, LucideIcon> = {
  dashboard: LayoutDashboard,
  wallets: Wallet,
  transactions: ArrowLeftRight,
  budgets: ShieldHalf,
  goals: Target,
  categories: Tags,
  challenges: Flag,
  reports: BarChart3,
  users: Users,
  rbac: KeyRound,
  achievements: Trophy,
  logs: ScrollText,
};

interface Form { id?: string; code: string; name: string; description: string; system: boolean }

export function RolesManager({
  roles,
  permissions,
  granted,
  userCount,
}: {
  roles: Role[];
  permissions: Permission[];
  granted: string[];
  userCount: Record<string, number>;
}) {
  const { toast, refresh } = useGame();
  const [set, setSet] = useState<Set<string>>(new Set(granted));
  const [pending, setPending] = useState<string | null>(null);
  const [form, setForm] = useState<Form | null>(null);
  const [del, setDel] = useState<Role | null>(null);
  const [busy, setBusy] = useState(false);

  const modules = [...new Set(permissions.map((p) => p.module))];

  async function toggle(role: Role, perm: Permission) {
    const key = `${role.id}:${perm.id}`;
    const has = set.has(key);
    setPending(key);
    const sb = createClient();
    const { error } = has
      ? await sb.from("role_permissions").delete().eq("role_id", role.id).eq("permission_id", perm.id)
      : await sb.from("role_permissions").insert({ role_id: role.id, permission_id: perm.id });
    setPending(null);
    if (error) return toast(friendlyError(error), "error");
    const next = new Set(set);
    if (has) next.delete(key);
    else next.add(key);
    setSet(next);
    toast(`${has ? "Dicabut" : "Diberikan"}: ${perm.code} untuk ${role.name}`, "info");
    refresh();
  }

  async function save() {
    if (!form) return;
    if (!form.name.trim()) return toast("Nama role wajib diisi.", "error");
    if (!form.id && !/^[a-z0-9_]+$/.test(form.code)) return toast("Kode role hanya huruf kecil, angka, dan underscore.", "error");
    setBusy(true);
    const sb = createClient();
    const { error } = form.id
      ? await sb.from("roles").update({ name: form.name.trim(), description: form.description.trim() || null }).eq("id", form.id)
      : await sb.from("roles").insert({ code: form.code, name: form.name.trim(), description: form.description.trim() || null });
    setBusy(false);
    if (error) return toast(error.code === "23505" ? "Kode role itu sudah dipakai." : friendlyError(error), "error");
    setForm(null);
    toast(form.id ? "Role diperbarui." : "Role baru dibuat. Atur izinnya di matriks.");
    refresh();
  }

  async function remove() {
    if (!del) return;
    setBusy(true);
    const { error } = await createClient().from("roles").delete().eq("id", del.id);
    setBusy(false);
    if (error) return toast(error.code === "23503" ? "Role masih dipakai pengguna. Pindahkan penggunanya dulu." : friendlyError(error), "error");
    setDel(null);
    toast("Role dihapus.");
    refresh();
  }

  return (
    <>
      <div className="mb-4">
        <Button onClick={() => setForm({ code: "", name: "", description: "", system: false })}>
          <Plus size={16} /> Role Baru
        </Button>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {roles.map((r) => (
          <Card key={r.id}>
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="font-display text-lg font-bold leading-tight">{r.name}</p>
                <p className="num mt-0.5 text-xs font-semibold text-cyan">
                  {r.code} · {userCount[r.id] ?? 0} pengguna
                </p>
              </div>
              <div className="flex items-center gap-1">
                {r.is_system && <Badge color="#8b5cf6">Bawaan</Badge>}
                <RowMenu
                  items={[
                    { label: "Ubah", icon: <Pencil size={15} />, onClick: () => setForm({ id: r.id, code: r.code, name: r.name, description: r.description ?? "", system: r.is_system }) },
                    ...(r.is_system ? [] : [{ label: "Hapus", icon: <Trash2 size={15} />, danger: true, onClick: () => setDel(r) }]),
                  ]}
                />
              </div>
            </div>
            <p className="mt-2 min-h-10 text-sm text-mute">{r.description}</p>
          </Card>
        ))}
      </div>

      <SectionTitle>Matriks Permission</SectionTitle>
      <Card className="!p-0">
        <div className="max-h-[70vh] overflow-auto rounded-[20px]">
          <table className="w-full min-w-[520px] border-collapse text-sm">
            <thead>
              <tr>
                <th className="sticky left-0 top-0 z-30 border-b border-white/10 bg-[#0d1126] px-3 py-3 text-left font-display text-sm font-bold">Permission</th>
                {roles.map((r) => (
                  <th key={r.id} className="sticky top-0 z-20 whitespace-nowrap border-b border-white/10 bg-[#0d1126] px-3 py-3 text-center font-display text-sm font-bold">
                    {r.name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {modules.map((m) => (
                <PermGroup key={m} module={m} perms={permissions.filter((p) => p.module === m)} roles={roles} set={set} pending={pending} onToggle={toggle} />
              ))}
            </tbody>
          </table>
        </div>
      </Card>
      <p className="mt-2 text-xs text-mute">Role Game Master tidak bisa kehilangan izin rbac.manage (dijaga di database dan UI).</p>

      <Modal
        open={!!form}
        onClose={() => setForm(null)}
        title={form?.id ? "Ubah Role" : "Role Baru"}
        footer={
          <>
            <Button variant="secondary" onClick={() => setForm(null)}>
              Batal
            </Button>
            <Button loading={busy} onClick={save}>
              Simpan
            </Button>
          </>
        }
      >
        {form && (
          <form onSubmit={(e) => { e.preventDefault(); save(); }}>
            <Field label="Kode" hint="Huruf kecil, angka, underscore. Tidak bisa diubah setelah dibuat.">
              <Input value={form.code} disabled={!!form.id} onChange={(e) => setForm({ ...form, code: e.target.value.toLowerCase() })} placeholder="mis. bendahara" />
            </Field>
            <Field label="Nama tampilan">
              <Input value={form.name} maxLength={40} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </Field>
            <Field label="Deskripsi">
              <TextArea value={form.description} maxLength={200} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            </Field>
            <button type="submit" className="hidden" />
          </form>
        )}
      </Modal>

      <ConfirmDialog open={!!del} loading={busy} onClose={() => setDel(null)} onConfirm={remove} message={<>Role <b className="text-white">{del?.name}</b> akan dihapus beserta pengaturan izinnya. Role yang masih dipakai pengguna tidak bisa dihapus.</>} />
    </>
  );
}

function PermGroup({
  module,
  perms,
  roles,
  set,
  pending,
  onToggle,
}: {
  module: string;
  perms: Permission[];
  roles: Role[];
  set: Set<string>;
  pending: string | null;
  onToggle: (r: Role, p: Permission) => void;
}) {
  const Icon = MODULE_ICON[module] ?? Circle;
  return (
    <>
      <tr className="bg-[#0a0e1f]">
        <td colSpan={roles.length + 1} className="px-3 py-2 text-[11px] font-bold uppercase tracking-[0.14em] text-gold">
          <span className="inline-flex items-center gap-2">
            <Icon size={14} /> {module}
          </span>
        </td>
      </tr>
      {perms.map((p) => (
        <tr key={p.id} className="border-t border-white/[0.06] hover:bg-white/[0.03]">
          <td className="sticky left-0 z-10 bg-[#0d1126] px-3 py-2">
            <code className="text-[13px] font-semibold text-white">{p.code}</code>
            <div className="text-xs text-mute">{p.description}</div>
          </td>
          {roles.map((r) => {
            const key = `${r.id}:${p.id}`;
            const locked = r.code === "admin" && p.code === "rbac.manage";
            return (
              <td key={r.id} className="px-3 py-2 text-center">
                <span title={locked ? "Tidak boleh dicabut" : undefined} className="inline-flex">
                  <Switch
                    checked={set.has(key)}
                    disabled={locked || pending === key}
                    label={`${p.code} untuk ${r.name}`}
                    onChange={() => onToggle(r, p)}
                  />
                </span>
              </td>
            );
          })}
        </tr>
      ))}
    </>
  );
}
