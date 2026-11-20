"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { friendlyError } from "@/lib/errors";
import { useGame } from "@/components/game/GameFeedback";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { EmojiPicker, Field, Input, Select, TextArea } from "@/components/ui/Form";
import { ConfirmDialog, Modal } from "@/components/ui/Modal";
import { Badge, EmptyState } from "@/components/ui/Misc";
import type { Achievement } from "@/lib/types";

const CONDITIONS: { value: string; label: string; unit: string }[] = [
  { value: "tx_count", label: "Jumlah transaksi", unit: "transaksi" },
  { value: "streak", label: "Streak harian (rekor)", unit: "hari" },
  { value: "budget_guard", label: "Anggaran bulan lalu terjaga", unit: "anggaran" },
  { value: "goals_completed", label: "Quest tabungan selesai", unit: "quest" },
  { value: "wallet_count", label: "Jumlah dompet", unit: "dompet" },
  { value: "level", label: "Mencapai level", unit: "level" },
  { value: "challenge_claims", label: "Klaim tantangan harian", unit: "klaim" },
];

interface Form { id?: string; code: string; name: string; description: string; icon: string; condition_type: string; threshold: string; xp_reward: string; is_active: boolean }

export function AchievementsManager({ achievements, unlocked }: { achievements: Achievement[]; unlocked: Record<string, number> }) {
  const { toast, refresh } = useGame();
  const [form, setForm] = useState<Form | null>(null);
  const [del, setDel] = useState<Achievement | null>(null);
  const [busy, setBusy] = useState(false);

  const blank = (): Form => ({ code: "", name: "", description: "", icon: "🏆", condition_type: "tx_count", threshold: "1", xp_reward: "50", is_active: true });

  async function save() {
    if (!form) return;
    const threshold = Number(form.threshold);
    const xp = Number(form.xp_reward);
    if (!form.name.trim()) return toast("Nama achievement wajib diisi.", "error");
    if (!form.id && !/^[a-z0-9_]+$/.test(form.code)) return toast("Kode hanya huruf kecil, angka, underscore.", "error");
    if (!threshold || threshold < 1) return toast("Ambang minimal 1.", "error");
    setBusy(true);
    const payload = {
      name: form.name.trim(),
      description: form.description.trim() || null,
      icon: form.icon,
      condition_type: form.condition_type,
      threshold,
      xp_reward: Math.max(0, xp || 0),
      is_active: form.is_active,
    };
    const sb = createClient();
    const { error } = form.id ? await sb.from("achievements").update(payload).eq("id", form.id) : await sb.from("achievements").insert({ ...payload, code: form.code });
    setBusy(false);
    if (error) return toast(error.code === "23505" ? "Kode achievement sudah dipakai." : friendlyError(error), "error");
    setForm(null);
    toast(form.id ? "Achievement diperbarui." : "Achievement baru ditambahkan.");
    refresh();
  }

  async function remove() {
    if (!del) return;
    setBusy(true);
    const { error } = await createClient().from("achievements").delete().eq("id", del.id);
    setBusy(false);
    if (error) return toast(friendlyError(error), "error");
    setDel(null);
    toast("Achievement dihapus.");
    refresh();
  }

  const unit = (t: string) => CONDITIONS.find((c) => c.value === t)?.unit ?? "";

  return (
    <>
      <div className="mb-4">
        <Button onClick={() => setForm(blank())}>+ Achievement Baru</Button>
      </div>
      {achievements.length === 0 && <EmptyState emoji="🏆" title="Belum ada achievement" />}
      <div className="grid gap-3 sm:grid-cols-2">
        {achievements.map((a) => (
          <Card key={a.id} tilt={false} className={a.is_active ? "" : "opacity-60"}>
            <div className="flex items-start gap-3">
              <span className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl border-[3px] border-gold/60 bg-gold/10 text-3xl">{a.icon}</span>
              <div className="min-w-0 flex-1">
                <p className="font-display text-lg leading-tight">{a.name}</p>
                <p className="text-sm text-mute">{a.description}</p>
                <div className="mt-1 flex flex-wrap gap-2">
                  <Badge color="#38bdf8">
                    {a.threshold} {unit(a.condition_type)}
                  </Badge>
                  <Badge color="#fbbf24">+{a.xp_reward} XP</Badge>
                  <Badge color="#a78bfa">{unlocked[a.id] ?? 0} pemain</Badge>
                  {!a.is_active && <Badge color="#94a3b8">Nonaktif</Badge>}
                </div>
              </div>
            </div>
            <div className="mt-3 flex gap-2">
              <Button
                small
                variant="blue"
                onClick={() => setForm({ id: a.id, code: a.code, name: a.name, description: a.description ?? "", icon: a.icon, condition_type: a.condition_type, threshold: String(a.threshold), xp_reward: String(a.xp_reward), is_active: a.is_active })}
              >
                Ubah
              </Button>
              <Button small variant="red" onClick={() => setDel(a)}>
                Hapus
              </Button>
            </div>
          </Card>
        ))}
      </div>

      <Modal
        open={!!form}
        onClose={() => setForm(null)}
        title={form?.id ? "Ubah Achievement" : "Achievement Baru"}
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
            <Field label="Kode" hint="Unik. Tidak bisa diubah setelah dibuat.">
              <Input value={form.code} disabled={!!form.id} onChange={(e) => setForm({ ...form, code: e.target.value.toLowerCase() })} placeholder="mis. hemat_banget" />
            </Field>
            <Field label="Nama">
              <Input value={form.name} maxLength={50} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </Field>
            <Field label="Deskripsi">
              <TextArea value={form.description} maxLength={160} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            </Field>
            <Field label="Syarat">
              <Select value={form.condition_type} onChange={(e) => setForm({ ...form, condition_type: e.target.value })}>
                {CONDITIONS.map((c) => (
                  <option key={c.value} value={c.value}>
                    {c.label}
                  </option>
                ))}
              </Select>
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label={`Ambang (${unit(form.condition_type)})`}>
                <Input type="number" min={1} value={form.threshold} onChange={(e) => setForm({ ...form, threshold: e.target.value })} />
              </Field>
              <Field label="Hadiah XP">
                <Input type="number" min={0} value={form.xp_reward} onChange={(e) => setForm({ ...form, xp_reward: e.target.value })} />
              </Field>
            </div>
            <EmojiPicker value={form.icon} onChange={(icon) => setForm({ ...form, icon })} options={["🏆", "👣", "📒", "📜", "🔥", "☄️", "🛡️", "🐉", "🎒", "🎯", "💎", "⭐"]} />
            <label className="mb-2 flex items-center gap-3 font-bold">
              <input type="checkbox" className="h-5 w-5 accent-amber-400" checked={form.is_active} onChange={(e) => setForm({ ...form, is_active: e.target.checked })} />
              Aktif
            </label>
            <button type="submit" className="hidden" />
          </form>
        )}
      </Modal>

      <ConfirmDialog open={!!del} loading={busy} onClose={() => setDel(null)} onConfirm={remove} message={<>Achievement <b className="text-white">{del?.name}</b> akan dihapus, termasuk catatan siapa saja yang sudah membukanya.</>} />
    </>
  );
}
