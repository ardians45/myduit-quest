"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { friendlyError } from "@/lib/errors";
import { rupiah } from "@/lib/format";
import { useGame } from "@/components/game/GameFeedback";
import { Can } from "@/components/layout/SessionProvider";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { AnimatedNumber } from "@/components/ui/AnimatedNumber";
import { ColorPicker, EmojiPicker, Field, Input, Select } from "@/components/ui/Form";
import { ConfirmDialog, Modal } from "@/components/ui/Modal";
import { EmptyState, StatTile } from "@/components/ui/Misc";
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
const EMPTY: Form = { name: "", type: "cash", icon: "👛", color: "#fbbf24", initial_balance: "0" };

export function WalletsManager({ wallets, userId }: { wallets: WalletBalance[]; userId: string }) {
  const { reward, toast, refresh } = useGame();
  const [form, setForm] = useState<Form | null>(null);
  const [del, setDel] = useState<WalletBalance | null>(null);
  const [busy, setBusy] = useState(false);
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
      <div className="mb-4 grid grid-cols-2 gap-3">
        <StatTile label="Total saldo">
          <AnimatedNumber value={total} money />
        </StatTile>
        <div className="flex items-center justify-end">
          <Can perm="wallets.create">
            <Button onClick={() => setForm({ ...EMPTY })}>+ Dompet Baru</Button>
          </Can>
        </div>
      </div>

      {wallets.length === 0 ? (
        <EmptyState
          emoji="👛"
          title="Inventory masih kosong"
          text="Buat dompet pertamamu (tunai, rekening, atau e-wallet) untuk mulai mencatat. Punya 3 dompet membuka achievement Kolektor!"
          action={
            <Can perm="wallets.create">
              <Button onClick={() => setForm({ ...EMPTY })}>Buat Dompet</Button>
            </Can>
          }
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {wallets.map((w) => (
            <Card key={w.id}>
              <div className="flex items-start gap-3">
                <span className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl border-[3px] text-3xl" style={{ borderColor: w.color, background: w.color + "22" }}>
                  {w.icon}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-display text-xl">{w.name}</p>
                  <p className="text-xs font-bold uppercase tracking-wide text-mute">{TYPES.find((t) => t.value === w.type)?.label}</p>
                </div>
              </div>
              <p className={`mt-3 font-display text-3xl ${Number(w.balance) < 0 ? "text-rubi" : "text-gold"}`}>
                <AnimatedNumber value={Number(w.balance)} money />
              </p>
              <p className="text-xs text-mute">
                Awal {rupiah(w.initial_balance)} · masuk <span className="text-zamrud">{rupiah(w.total_income)}</span> · keluar{" "}
                <span className="text-rubi">{rupiah(w.total_expense)}</span>
              </p>
              <div className="mt-3 flex gap-2">
                <Can perm="wallets.update">
                  <Button small variant="blue" onClick={() => setForm({ id: w.id, name: w.name, type: w.type, icon: w.icon, color: w.color, initial_balance: String(w.initial_balance) })}>
                    Ubah
                  </Button>
                </Can>
                <Can perm="wallets.delete">
                  <Button small variant="red" onClick={() => setDel(w)}>
                    Hapus
                  </Button>
                </Can>
              </div>
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
            <EmojiPicker value={form.icon} onChange={(icon) => setForm({ ...form, icon })} options={["👛", "🏦", "📱", "💳", "🐷", "🎒", "💰", "🪙"]} />
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
