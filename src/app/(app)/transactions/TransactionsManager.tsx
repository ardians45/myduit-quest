"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Filter, Pencil, Plus, Search, Trash2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { friendlyError } from "@/lib/errors";
import { fmtDay, rupiah, todayWIB } from "@/lib/format";
import { useGame } from "@/components/game/GameFeedback";
import { Can, useCan } from "@/components/layout/SessionProvider";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Field, Input, Segmented, Select } from "@/components/ui/Form";
import { ConfirmDialog, Modal } from "@/components/ui/Modal";
import { EmptyState, IconTile, StatTile } from "@/components/ui/Misc";
import { RowMenu } from "@/components/ui/RowMenu";
import { AppIcon } from "@/lib/icons";
import type { Category, Kind, Transaction } from "@/lib/types";

interface Filters { from: string; to: string; kind: string; category: string; wallet: string; q: string }
interface Form { id?: string; kind: Kind; amount: string; wallet_id: string; category_id: string; occurred_on: string; note: string }

function toQuery(f: Filters) {
  const p = new URLSearchParams();
  (Object.keys(f) as (keyof Filters)[]).forEach((k) => f[k] && p.set(k, f[k]));
  const s = p.toString();
  return s ? `?${s}` : "";
}

export function TransactionsManager({
  transactions,
  wallets,
  categories,
  userId,
  filters,
  autoOpen,
}: {
  transactions: Transaction[];
  wallets: { id: string; name: string; icon: string }[];
  categories: Category[];
  userId: string;
  filters: Filters;
  autoOpen: boolean;
}) {
  const router = useRouter();
  const { reward, toast, refresh } = useGame();
  const blank = (): Form => ({ kind: "expense", amount: "", wallet_id: wallets[0]?.id ?? "", category_id: "", occurred_on: todayWIB(), note: "" });
  const [form, setForm] = useState<Form | null>(autoOpen && wallets.length ? blank() : null);
  const [del, setDel] = useState<Transaction | null>(null);
  const [busy, setBusy] = useState(false);
  const [f, setF] = useState<Filters>(filters);
  const [showFilters, setShowFilters] = useState(Boolean(filters.from || filters.to || filters.category || filters.wallet));

  const canUpdate = useCan("transactions.update");
  const canDelete = useCan("transactions.delete");
  const income = transactions.filter((t) => t.kind === "income").reduce((s, t) => s + Number(t.amount), 0);
  const expense = transactions.filter((t) => t.kind === "expense").reduce((s, t) => s + Number(t.amount), 0);

  const groups = new Map<string, Transaction[]>();
  transactions.forEach((t) => groups.set(t.occurred_on, [...(groups.get(t.occurred_on) ?? []), t]));

  function applyFilters(next: Filters) {
    router.push(`/transactions${toQuery(next)}`);
  }
  function closeForm() {
    setForm(null);
    if (autoOpen) router.replace(`/transactions${toQuery(filters)}`);
  }

  async function save() {
    if (!form) return;
    const amount = Number(form.amount);
    if (!amount || amount <= 0) return toast("Nominal harus lebih dari 0.", "error");
    if (!form.wallet_id) return toast("Pilih dompet dulu.", "error");
    setBusy(true);
    const payload = {
      kind: form.kind,
      amount,
      wallet_id: form.wallet_id,
      category_id: form.category_id || null,
      occurred_on: form.occurred_on,
      note: form.note.trim() || null,
    };
    const sb = createClient();
    const { error } = form.id
      ? await sb.from("transactions").update(payload).eq("id", form.id)
      : await sb.from("transactions").insert({ ...payload, user_id: userId });
    setBusy(false);
    if (error) return toast(friendlyError(error), "error");
    const creating = !form.id;
    closeForm();
    toast(creating ? (form.kind === "income" ? "Loot masuk!" : "Damage tercatat.") : "Transaksi diperbarui.");
    if (creating) await reward(10);
    else refresh();
  }

  async function remove() {
    if (!del) return;
    setBusy(true);
    const { error } = await createClient().from("transactions").delete().eq("id", del.id);
    setBusy(false);
    if (error) return toast(friendlyError(error), "error");
    setDel(null);
    toast("Transaksi dihapus.");
    refresh();
  }

  const formCats = categories.filter((c) => c.kind === form?.kind);

  return (
    <>
      {/* Filter */}
      <Card className="mb-4">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            applyFilters(f);
          }}
          className="flex items-center gap-2"
        >
          <div className="relative flex-1">
            <Search size={18} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-mute" />
            <Input value={f.q} onChange={(e) => setF({ ...f, q: e.target.value })} placeholder="Cari catatan..." className="!pl-10" aria-label="Cari catatan" />
          </div>
          <Button type="button" variant="secondary" small onClick={() => setShowFilters((s) => !s)} aria-expanded={showFilters}>
            <Filter size={16} /> Filter
          </Button>
        </form>
        {showFilters && (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              applyFilters(f);
            }}
            className="mt-3 grid grid-cols-2 gap-x-3 sm:grid-cols-3"
          >
            <Field label="Dari tanggal">
              <Input type="date" value={f.from} onChange={(e) => setF({ ...f, from: e.target.value })} />
            </Field>
            <Field label="Sampai tanggal">
              <Input type="date" value={f.to} onChange={(e) => setF({ ...f, to: e.target.value })} />
            </Field>
            <Field label="Jenis">
              <Select value={f.kind} onChange={(e) => setF({ ...f, kind: e.target.value })}>
                <option value="">Semua</option>
                <option value="income">Pemasukan</option>
                <option value="expense">Pengeluaran</option>
              </Select>
            </Field>
            <Field label="Kategori">
              <Select value={f.category} onChange={(e) => setF({ ...f, category: e.target.value })}>
                <option value="">Semua</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Dompet">
              <Select value={f.wallet} onChange={(e) => setF({ ...f, wallet: e.target.value })}>
                <option value="">Semua</option>
                {wallets.map((w) => (
                  <option key={w.id} value={w.id}>
                    {w.name}
                  </option>
                ))}
              </Select>
            </Field>
            <div className="mb-3 flex items-end gap-2">
              <Button type="submit" small>
                Terapkan
              </Button>
              <Button type="button" small variant="secondary" onClick={() => { const e = { from: "", to: "", kind: "", category: "", wallet: "", q: "" }; setF(e); applyFilters(e); }}>
                Reset
              </Button>
            </div>
          </form>
        )}
      </Card>

      <div className="mb-4 grid gap-2 sm:grid-cols-3">
        <StatTile row label="Masuk" tone="in">{rupiah(income)}</StatTile>
        <StatTile row label="Keluar" tone="out">{rupiah(expense)}</StatTile>
        <StatTile row label="Selisih">{rupiah(income - expense)}</StatTile>
      </div>

      <Can perm="transactions.create">
        <div className="mb-4 hidden lg:block">
          <Button onClick={() => setForm(blank())} disabled={!wallets.length}>
            <Plus size={16} /> Catat Transaksi
          </Button>
        </div>
      </Can>

      {wallets.length === 0 && (
        <EmptyState
          icon="wallet"
          title="Belum punya dompet"
          text="Transaksi dicatat ke sebuah dompet. Buat dompet dulu ya."
          action={<Link href="/wallets" className="btn">Ke Dompet</Link>}
        />
      )}

      {wallets.length > 0 && transactions.length === 0 && (
        <EmptyState art="transactions" title="Tidak ada catatan" text="Belum ada transaksi yang cocok. Catat satu dan dapatkan +10 XP!" />
      )}

      <div className="space-y-4">
        {[...groups.entries()].map(([day, list]) => (
          <section key={day}>
            <h3 className="mb-1.5 px-1 text-[11px] font-bold uppercase tracking-[0.1em] text-mute">{fmtDay(day)}</h3>
            <Card className="divide-y divide-white/[0.06] !p-1.5">
              {list.map((t) => (
                <div key={t.id} className="flex items-center gap-3 px-2 py-2.5">
                  <IconTile icon={t.categories?.icon} color={t.categories?.color ?? "#94a3b8"} size={42} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold">{t.note || t.categories?.name || "Tanpa catatan"}</p>
                    <p className="flex items-center gap-1 truncate text-xs text-mute">
                      {t.categories?.name ?? "Tanpa kategori"} · <AppIcon name={t.wallets?.icon} size={12} className="shrink-0" /> <span className="truncate">{t.wallets?.name}</span>
                    </p>
                  </div>
                  <p className={`shrink-0 font-display text-[0.95rem] font-bold ${t.kind === "income" ? "text-emerald" : "text-rose"}`}>
                    {t.kind === "income" ? "+" : "-"}
                    {rupiah(t.amount)}
                  </p>
                  <RowMenu
                    label="Aksi transaksi"
                    items={[
                      ...(canUpdate
                        ? [{ label: "Ubah", icon: <Pencil size={16} />, onClick: () => setForm({ id: t.id, kind: t.kind, amount: String(t.amount), wallet_id: t.wallet_id, category_id: t.category_id ?? "", occurred_on: t.occurred_on, note: t.note ?? "" }) }]
                        : []),
                      ...(canDelete ? [{ label: "Hapus", icon: <Trash2 size={16} />, danger: true, onClick: () => setDel(t) }] : []),
                    ]}
                  />
                </div>
              ))}
            </Card>
          </section>
        ))}
      </div>

      <Modal
        open={!!form}
        onClose={closeForm}
        title={form?.id ? "Ubah Transaksi" : "Catat Transaksi"}
        footer={
          <>
            <Button variant="secondary" onClick={closeForm}>
              Batal
            </Button>
            <Button variant={form?.kind === "income" ? "green" : "red"} loading={busy} onClick={save}>
              {form?.id ? "Simpan" : form?.kind === "income" ? "Ambil Loot (+10 XP)" : "Catat Damage (+10 XP)"}
            </Button>
          </>
        }
      >
        {form && (
          <form onSubmit={(e) => { e.preventDefault(); save(); }}>
            <Segmented
              value={form.kind}
              onChange={(kind) => setForm({ ...form, kind, category_id: "" })}
              options={[
                { value: "expense", label: "Pengeluaran" },
                { value: "income", label: "Pemasukan" },
              ]}
            />
            <Field label="Nominal (Rp)">
              <Input type="number" inputMode="numeric" min={1} step="1" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} placeholder="0" autoFocus />
            </Field>
            <Field label="Dompet">
              <Select value={form.wallet_id} onChange={(e) => setForm({ ...form, wallet_id: e.target.value })}>
                {wallets.map((w) => (
                  <option key={w.id} value={w.id}>
                    {w.name}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Kategori">
              <Select value={form.category_id} onChange={(e) => setForm({ ...form, category_id: e.target.value })}>
                <option value="">Tanpa kategori</option>
                {formCats.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                    {c.user_id ? " (pribadi)" : ""}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Tanggal">
              <Input type="date" value={form.occurred_on} max={todayWIB()} onChange={(e) => setForm({ ...form, occurred_on: e.target.value })} />
            </Field>
            <Field label="Catatan (opsional)">
              <Input value={form.note} maxLength={120} onChange={(e) => setForm({ ...form, note: e.target.value })} placeholder="mis. makan siang" />
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
        message={
          <>
            Transaksi <b className="text-white">{del && (del.note || del.categories?.name || "ini")}</b> senilai {del && rupiah(del.amount)} akan dihapus. Saldo dompet ikut berubah.
          </>
        }
      />
    </>
  );
}
