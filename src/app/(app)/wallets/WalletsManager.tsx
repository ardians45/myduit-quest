"use client";

import { useState } from "react";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { friendlyError } from "@/lib/errors";
import { rupiah } from "@/lib/format";
import { useGame } from "@/components/game/GameFeedback";
import { Can, useCan } from "@/components/layout/SessionProvider";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { AnimatedNumber } from "@/components/ui/AnimatedNumber";
import { ColorPicker, Field, IconPicker, Input, Select } from "@/components/ui/Form";
import { RowMenu } from "@/components/ui/RowMenu";
import { Chest } from "@/components/art";
import { PICKER_SETS } from "@/lib/icons";
import { ConfirmDialog, Modal } from "@/components/ui/Modal";
import { EmptyState, IconTile } from "@/components/ui/Misc";
import type { WalletBalance } from "@/lib/types";

const TYPES = [
  { value: "cash", label: "Tunai" },
  { value: "bank", label: "Rekening Bank" },
  { value: "ewallet", label: "E-Wallet" },
  { value: "other", label: "Lainnya" },
];

interface Form {
  id?: string;
  name: string;
  type: string;
  icon: string;
  color: string;
  initial_balance: string;
}
const EMPTY: Form = { name: "", type: "cash", icon: "wallet", color: "#f5b83d", initial_balance: "0" };

export function WalletsManager({ wallets, userId }: { wallets: WalletBalance[]; userId: string }) {
  const { reward, toast, refresh } = useGame();
  const [form, setForm] = useState<Form | null>(null);
  const [del, setDel] = useState<WalletBalance | null>(null);
  const [busy, setBusy] = useState(false);
  const canUpdate = useCan("wallets.update");
  const canDelete = useCan("wallets.delete");
  const can = (p: string) => (p === "wallets.update" ? canUpdate : canDelete);
  const total = wallets.reduce((s, w) => s + Number(w.balance), 0);

  async function save() {
    if (!form) return;
    if (!form.name.trim()) return toast("Nama dompet wajib diisi.", "error");
    setBusy(true);
    const sb = createClient();
    const payload = {
      name: form.name.trim(),
      type: form.type,
      icon: form.icon,
      color: form.color,
      initial_balance: Number(form.initial_balance) || 0,
    };
    const { error } = form.id
      ? await sb.from("wallets").update(payload).eq("id", form.id)
      : await sb.from("wallets").insert({ ...payload, user_id: userId });
    setBusy(false);
    if (error) return toast(friendlyError(error), "error");
    const creating = !form.id;
    setForm(null);
    toast(creating ? "Dompet baru masuk inventory!" : "Dompet diperbarui.");
    if (creating) await reward(0);
    else refresh();
  }

  async function remove() {
    if (!del) return;
    setBusy(true);
    const { error } = await createClient().from("wallets").delete().eq("id", del.id);
    setBusy(false);
    if (error) return toast(friendlyError(error), "error");
    setDel(null);
    toast("Dompet dihapus.");
    refresh();
  }

  return (
    <>
      <Card hero className="mb-5 flex items-center gap-4">
        <Chest size={64} />
        <div className="min-w-0 flex-1">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-mute">Total saldo {wallets.length} dompet</p>
          <p className="truncate font-display text-3xl font-bold text-gold">
            <AnimatedNumber value={total} money />
          </p>
        </div>
        <Can perm="wallets.create">
          <Button onClick={() => setForm({ ...EMPTY })} className="hidden sm:inline-flex">
            <Plus size={16} /> Dompet Baru
          </Button>
        </Can>
      </Card>
      <Can perm="wallets.create">
        <Button onClick={() => setForm({ ...EMPTY })} className="mb-5 w-full sm:hidden">
          <Plus size={16} /> Dompet Baru
        </Button>
      </Can>

      {wallets.length === 0 ? (
        <EmptyState
          icon="wallet"
          title="Inventory masih kosong"
          text="Buat dompet pertamamu (tunai, rekening, atau e-wallet) untuk mulai mencatat. Punya 3 dompet membuka achievement Kolektor!"
          action={
            <Can perm="wallets.create">
              <Button onClick={() => setForm({ ...EMPTY })}>
                <Plus size={16} /> Buat Dompet
              </Button>
            </Can>
          }
        />
      ) : (
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {wallets.map((w) => (
            <Card key={w.id} lift>
              <div className="flex items-center gap-3">
                <IconTile icon={w.icon} color={w.color} size={44} />
                <div className="min-w-0 flex-1">
                  <p className="truncate font-display text-base font-bold">{w.name}</p>
                  <p className="text-xs text-mute">{TYPES.find((t) => t.value === w.type)?.label}</p>
                </div>
                <RowMenu
                  label={`Aksi ${w.name}`}
                  items={[
                    ...(can("wallets.update")
                      ? [{ label: "Ubah", icon: <Pencil size={16} />, onClick: () => setForm({ id: w.id, name: w.name, type: w.type, icon: w.icon, color: w.color, initial_balance: String(w.initial_balance) }) }]
                      : []),
                    ...(can("wallets.delete") ? [{ label: "Hapus", icon: <Trash2 size={16} />, danger: true, onClick: () => setDel(w) }] : []),
                  ]}
                />
              </div>
              <p className={`mt-4 font-display text-2xl font-bold ${Number(w.balance) < 0 ? "text-rose" : "text-white"}`}>
                <AnimatedNumber value={Number(w.balance)} money />
              </p>
              <p className="mt-1 text-xs text-mute">
                Awal {rupiah(w.initial_balance)} · masuk <span className="text-emerald">{rupiah(w.total_income)}</span> · keluar{" "}
                <span className="text-rose">{rupiah(w.total_expense)}</span>
              </p>
            </Card>
          ))}
        </div>
      )}

      <Modal
        open={!!form}
        onClose={() => setForm(null)}
        title={form?.id ? "Ubah Dompet" : "Dompet Baru"}
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
            <Field label="Nama dompet">
              <Input value={form.name} maxLength={40} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="mis. Dompet Tunai" autoFocus />
            </Field>
            <Field label="Jenis">
              <Select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
                {TYPES.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Saldo awal (Rp)" hint="Saldo sekarang = saldo awal + pemasukan - pengeluaran.">
              <Input type="number" inputMode="numeric" step="1" value={form.initial_balance} onChange={(e) => setForm({ ...form, initial_balance: e.target.value })} />
            </Field>
            <IconPicker value={form.icon} onChange={(icon) => setForm({ ...form, icon })} groups={PICKER_SETS.wallet} />
            <ColorPicker value={form.color} onChange={(color) => setForm({ ...form, color })} />
            <button type="submit" className="hidden" />
          </form>
        )}
      </Modal>

      <ConfirmDialog
        open={!!del}
        loading={busy}
        onClose={() => setDel(null)}
        onConfirm={remove}
        message={
          <>
            Dompet <b className="text-white">{del?.name}</b> beserta SEMUA transaksi di dalamnya akan dihapus permanen. Lanjutkan?
          </>
        }
      />
    </>
  );
}
