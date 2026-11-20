"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { friendlyError } from "@/lib/errors";
import { useGame } from "@/components/game/GameFeedback";
import { Can } from "@/components/layout/SessionProvider";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { ColorPicker, EmojiPicker, Field, Input, Segmented } from "@/components/ui/Form";
import { ConfirmDialog, Modal } from "@/components/ui/Modal";
import { Badge, EmptyState, SectionTitle } from "@/components/ui/Misc";
import type { Category, Kind } from "@/lib/types";

interface Form { id?: string; scope: "personal" | "global"; name: string; icon: string; color: string; kind: Kind }

export function CategoriesManager({
  global,
  personal,
  userId,
  canPersonal,
  canGlobal,
}: {
  global: Category[];
  personal: Category[];
  userId: string;
  canPersonal: boolean;
  canGlobal: boolean;
}) {
  const { toast, refresh } = useGame();
  const [form, setForm] = useState<Form | null>(null);
  const [del, setDel] = useState<Category | null>(null);
  const [busy, setBusy] = useState(false);

  async function save() {
    if (!form) return;
    if (!form.name.trim()) return toast("Nama kategori wajib diisi.", "error");
    setBusy(true);
    const payload = { name: form.name.trim(), icon: form.icon, color: form.color, kind: form.kind };
    const sb = createClient();
    const { error } = form.id
      ? await sb.from("categories").update(payload).eq("id", form.id)
      : await sb.from("categories").insert({ ...payload, user_id: form.scope === "global" ? null : userId });
    setBusy(false);
    if (error) return toast(error.code === "23505" ? "Nama kategori itu sudah ada." : friendlyError(error), "error");
    setForm(null);
    toast(form.id ? "Kategori diperbarui." : "Kategori baru ditambahkan.");
    refresh();
  }

  async function remove() {
    if (!del) return;
    setBusy(true);
    const { error } = await createClient().from("categories").delete().eq("id", del.id);
    setBusy(false);
    if (error) return toast(friendlyError(error), "error");
    setDel(null);
    toast("Kategori dihapus. Transaksi lama jadi Tanpa kategori.");
    refresh();
  }

  const row = (c: Category, editable: boolean, perms: { update: string; delete: string }) => (
    <div key={c.id} className="flex items-center gap-3 px-2 py-2.5">
      <span className="grid h-10 w-10 place-items-center rounded-xl text-xl" style={{ background: c.color + "33", border: `2px solid ${c.color}` }}>
        {c.icon}
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate font-bold">{c.name}</p>
        <Badge color={c.kind === "income" ? "#10b981" : "#f43f5e"}>{c.kind === "income" ? "Pemasukan" : "Pengeluaran"}</Badge>
      </div>
      {editable && (
        <div className="flex gap-3 text-xs font-extrabold">
          <Can perm={perms.update}>
            <button className="text-volt hover:underline" onClick={() => setForm({ id: c.id, scope: c.user_id ? "personal" : "global", name: c.name, icon: c.icon, color: c.color, kind: c.kind })}>
              Ubah
            </button>
          </Can>
          <Can perm={perms.delete}>
            <button className="text-rubi hover:underline" onClick={() => setDel(c)}>
              Hapus
            </button>
          </Can>
        </div>
      )}
    </div>
  );

  return (
    <>
      <div className="mb-2 flex flex-wrap gap-3">
        {canPersonal && <Button onClick={() => setForm({ scope: "personal", name: "", icon: "🪙", color: "#fbbf24", kind: "expense" })}>+ Kategori Pribadi</Button>}
        {canGlobal && (
          <Button variant="blue" onClick={() => setForm({ scope: "global", name: "", icon: "🪙", color: "#fbbf24", kind: "expense" })}>
            + Kategori Global
          </Button>
        )}
      </div>

      {canPersonal && (
        <>
          <SectionTitle>Kategori Pribadi</SectionTitle>
          {personal.length === 0 ? (
            <EmptyState emoji="🏷️" title="Belum ada kategori pribadi" text="Tambahkan label khusus, mis. Kopi Sore atau Freelance." />
          ) : (
            <Card tilt={false} className="divide-y divide-white/10 !p-2">
              {personal.map((c) => row(c, true, { update: "categories.update", delete: "categories.delete" }))}
            </Card>
          )}
        </>
      )}

      <SectionTitle>Kategori Global {canGlobal ? "" : "(bawaan)"}</SectionTitle>
      <Card tilt={false} className="divide-y divide-white/10 !p-2">
        {global.map((c) => row(c, canGlobal, { update: "categories.manage_global", delete: "categories.manage_global" }))}
      </Card>

      <Modal
        open={!!form}
        onClose={() => setForm(null)}
        title={form?.id ? "Ubah Kategori" : form?.scope === "global" ? "Kategori Global Baru" : "Kategori Baru"}
        footer={
          <>
            <Button variant="ghost" onClick={() => setForm(null)}>
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
            <Segmented
              value={form.kind}
              onChange={(kind) => setForm({ ...form, kind })}
              options={[
                { value: "expense", label: "Pengeluaran" },
                { value: "income", label: "Pemasukan" },
              ]}
            />
            <Field label="Nama kategori">
              <Input value={form.name} maxLength={40} onChange={(e) => setForm({ ...form, name: e.target.value })} autoFocus />
            </Field>
            <EmojiPicker value={form.icon} onChange={(icon) => setForm({ ...form, icon })} />
            <ColorPicker value={form.color} onChange={(color) => setForm({ ...form, color })} />
            <button type="submit" className="hidden" />
          </form>
        )}
      </Modal>

      <ConfirmDialog open={!!del} loading={busy} onClose={() => setDel(null)} onConfirm={remove} message={<>Kategori <b className="text-white">{del?.name}</b> akan dihapus. Anggaran di kategori ini ikut terhapus.</>} />
    </>
  );
}
