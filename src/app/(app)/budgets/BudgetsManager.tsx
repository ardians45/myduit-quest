"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight, Pencil, Plus, Trash2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { friendlyError } from "@/lib/errors";
import { monthLabel, rupiah, shiftMonth } from "@/lib/format";
import { useGame } from "@/components/game/GameFeedback";
import { Can, useCan } from "@/components/layout/SessionProvider";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Field, Input, Select } from "@/components/ui/Form";
import { HpBar } from "@/components/ui/HPBar";
import { ConfirmDialog, Modal } from "@/components/ui/Modal";
import { Badge, EmptyState, IconTile } from "@/components/ui/Misc";
import { RowMenu } from "@/components/ui/RowMenu";
import { HpShield } from "@/components/art";
import type { BudgetStatus, Category } from "@/lib/types";

interface Form { id?: string; category_id: string; limit_amount: string }

export function BudgetsManager({ month, budgets, categories, userId }: { month: string; budgets: BudgetStatus[]; categories: Category[]; userId: string }) {
  const router = useRouter();
  const { reward, toast, refresh } = useGame();
  const [form, setForm] = useState<Form | null>(null);
  const [del, setDel] = useState<BudgetStatus | null>(null);
  const [busy, setBusy] = useState(false);
  const canUpdate = useCan("budgets.update");
  const canDelete = useCan("budgets.delete");
  const catMap = new Map(categories.map((c) => [c.id, c]));
  const used = new Set(budgets.map((b) => b.category_id));
  const available = categories.filter((c) => !used.has(c.id));

  async function save() {
    if (!form) return;
    const limit = Number(form.limit_amount);
    if (!form.category_id) return toast("Pilih kategori dulu.", "error");
    if (!limit || limit <= 0) return toast("Batas anggaran harus lebih dari 0.", "error");
    setBusy(true);
    const sb = createClient();
    const { error } = form.id
      ? await sb.from("budgets").update({ limit_amount: limit }).eq("id", form.id)
      : await sb.from("budgets").insert({ user_id: userId, category_id: form.category_id, month: month + "-01", limit_amount: limit });
    setBusy(false);
    if (error) return toast(error.code === "23505" ? "Kategori ini sudah punya anggaran di bulan ini." : friendlyError(error), "error");
    const creating = !form.id;
    setForm(null);
    toast(creating ? "Perisai baru terpasang!" : "Anggaran diperbarui.");
    if (creating) await reward(20);
    else refresh();
  }

  async function remove() {
    if (!del) return;
    setBusy(true);
    const { error } = await createClient().from("budgets").delete().eq("id", del.id);
    setBusy(false);
    if (error) return toast(friendlyError(error), "error");
    setDel(null);
    toast("Anggaran dihapus.");
    refresh();
  }

  return (
    <>
      <div className="mb-4 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Button small variant="secondary" aria-label="Bulan sebelumnya" onClick={() => router.push(`/budgets?m=${shiftMonth(month, -1)}`)}>
            <ChevronLeft size={18} />
          </Button>
          <span className="min-w-36 text-center font-display text-lg font-bold">{monthLabel(month)}</span>
          <Button small variant="secondary" aria-label="Bulan berikutnya" onClick={() => router.push(`/budgets?m=${shiftMonth(month, 1)}`)}>
            <ChevronRight size={18} />
          </Button>
        </div>
        <Can perm="budgets.create">
          <Button disabled={!available.length} onClick={() => setForm({ category_id: available[0]?.id ?? "", limit_amount: "" })}>
            <Plus size={16} /> Anggaran (+20 XP)
          </Button>
        </Can>
      </div>

      {budgets.length === 0 ? (
        <EmptyState icon="shield-check" title="Belum ada perisai bulan ini" text="Pasang anggaran untuk kategori pengeluaran. Makin banyak kamu belanja, makin turun HP-nya." />
      ) : (
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {budgets.map((b) => {
            const c = catMap.get(b.category_id);
            const ratio = Number(b.spent) / Number(b.limit_amount);
            const left = Math.max(0, 100 - ratio * 100);
            const over = Number(b.spent) > Number(b.limit_amount);
            const tone = over || left <= 25 ? "#fb7185" : left <= 50 ? "#f5b83d" : "#34d399";
            return (
              <Card key={b.id} lift>
                <div className="flex items-center gap-3">
                  <HpShield pct={left} size={44} />
                  <div className="min-w-0 flex-1">
                    <p className="flex items-center gap-2 font-display text-base font-bold">
                      <IconTile icon={c?.icon} color={c?.color ?? "#94a3b8"} size={26} />
                      <span className="truncate">{c?.name ?? "Kategori"}</span>
                    </p>
                    <div className="mt-1">
                      <Badge color={tone}>{over ? "HP habis" : `${Math.round(left)}% HP`}</Badge>
                    </div>
                  </div>
                  <RowMenu
                    label={`Aksi ${c?.name ?? "anggaran"}`}
                    items={[
                      ...(canUpdate ? [{ label: "Ubah", icon: <Pencil size={16} />, onClick: () => setForm({ id: b.id, category_id: b.category_id, limit_amount: String(b.limit_amount) }) }] : []),
                      ...(canDelete ? [{ label: "Hapus", icon: <Trash2 size={16} />, danger: true, onClick: () => setDel(b) }] : []),
                    ]}
                  />
                </div>
                <div className="mt-4">
                  <HpBar pct={left} />
                </div>
                <p className="mt-2 text-sm text-mute">
                  <b className="font-display text-white">{rupiah(b.spent)}</b> dari {rupiah(b.limit_amount)}
                </p>
                <p className={`text-xs font-semibold ${over ? "text-rose" : "text-mute"}`}>
                  {over ? `Lewat ${rupiah(Number(b.spent) - Number(b.limit_amount))}` : `Sisa ${rupiah(Number(b.limit_amount) - Number(b.spent))}`}
                </p>
              </Card>
            );
          })}
        </div>
      )}

      <Modal
        open={!!form}
        onClose={() => setForm(null)}
        title={form?.id ? "Ubah Anggaran" : `Anggaran ${monthLabel(month)}`}
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
            <Field label="Kategori pengeluaran">
              <Select value={form.category_id} disabled={!!form.id} onChange={(e) => setForm({ ...form, category_id: e.target.value })}>
                {(form.id ? categories : available).map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Batas per bulan (Rp)">
              <Input type="number" inputMode="numeric" min={1} step="1" value={form.limit_amount} onChange={(e) => setForm({ ...form, limit_amount: e.target.value })} autoFocus placeholder="500000" />
            </Field>
            <button type="submit" className="hidden" />
          </form>
        )}
      </Modal>

      <ConfirmDialog
        open={!!del}
        loading={busy}
        onClose={() => setDel(null)}
        onConfirm={remove}
        message={<>Anggaran <b className="text-white">{del && catMap.get(del.category_id)?.name}</b> bulan ini akan dihapus. Transaksinya tidak ikut terhapus.</>}
      />
    </>
  );
}
