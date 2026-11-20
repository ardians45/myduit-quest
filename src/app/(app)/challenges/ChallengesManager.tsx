"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { friendlyError } from "@/lib/errors";
import { useGame } from "@/components/game/GameFeedback";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { EmojiPicker, Field, Input, TextArea } from "@/components/ui/Form";
import { ConfirmDialog, Modal } from "@/components/ui/Modal";
import { Badge, EmptyState } from "@/components/ui/Misc";
import type { Challenge } from "@/lib/types";

interface Form { id?: string; title: string; description: string; icon: string; xp_reward: string; is_active: boolean }

export function ChallengesManager({
  challenges,
  claimedToday,
  totalClaims,
  canClaim,
  canManage,
}: {
  challenges: Challenge[];
  claimedToday: string[];
  totalClaims: Record<string, number>;
  canClaim: boolean;
  canManage: boolean;
}) {
  const { reward, toast, refresh } = useGame();
  const [form, setForm] = useState<Form | null>(null);
  const [del, setDel] = useState<Challenge | null>(null);
  const [busy, setBusy] = useState(false);
  const [claiming, setClaiming] = useState<string | null>(null);

  const list = canManage ? challenges : challenges.filter((c) => c.is_active);

  async function claim(c: Challenge) {
    setClaiming(c.id);
    const { error } = await createClient().rpc("claim_challenge", { p_challenge_id: c.id });
    setClaiming(null);
    if (error) return toast(friendlyError(error), "error");
    toast(`Tantangan "${c.title}" selesai!`);
    await reward(c.xp_reward);
  }

  async function save() {
    if (!form) return;
    const xp = Number(form.xp_reward);
    if (!form.title.trim()) return toast("Judul tantangan wajib diisi.", "error");
    if (!xp || xp < 1 || xp > 1000) return toast("XP harus antara 1 dan 1000.", "error");
    setBusy(true);
    const payload = { title: form.title.trim(), description: form.description.trim() || null, icon: form.icon, xp_reward: xp, is_active: form.is_active };
    const sb = createClient();
    const { error } = form.id ? await sb.from("challenges").update(payload).eq("id", form.id) : await sb.from("challenges").insert(payload);
    setBusy(false);
    if (error) return toast(friendlyError(error), "error");
    setForm(null);
    toast(form.id ? "Tantangan diperbarui." : "Tantangan baru dibuat.");
    refresh();
  }

  async function remove() {
    if (!del) return;
    setBusy(true);
    const { error } = await createClient().from("challenges").delete().eq("id", del.id);
    setBusy(false);
    if (error) return toast(friendlyError(error), "error");
    setDel(null);
    toast("Tantangan dihapus.");
    refresh();
  }

  return (
    <>
      {canManage && (
        <div className="mb-4">
          <Button onClick={() => setForm({ title: "", description: "", icon: "🎯", xp_reward: "25", is_active: true })}>+ Tantangan Baru</Button>
        </div>
      )}

      {list.length === 0 && <EmptyState emoji="🎯" title="Belum ada tantangan" text={canManage ? "Buat tantangan harian pertama untuk para pemain." : "Mentor belum menerbitkan tantangan. Cek lagi nanti!"} />}

      <div className="grid gap-4 sm:grid-cols-2">
        {list.map((c) => {
          const done = claimedToday.includes(c.id);
          return (
            <Card key={c.id} className={!c.is_active ? "opacity-60" : ""}>
              <div className="flex items-start gap-3">
                <span className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl border-[3px] border-night-500 bg-black/25 text-3xl">{c.icon}</span>
                <div className="min-w-0 flex-1">
                  <p className="font-display text-xl leading-tight">{c.title}</p>
                  <div className="mt-1 flex flex-wrap gap-2">
                    <Badge color="#38bdf8">+{c.xp_reward} XP</Badge>
                    {!c.is_active && <Badge color="#94a3b8">Nonaktif</Badge>}
                    {canManage && <Badge color="#a78bfa">{totalClaims[c.id] ?? 0}x diklaim</Badge>}
                  </div>
                </div>
              </div>
              {c.description && <p className="mt-2 text-sm text-mute">{c.description}</p>}
              <div className="mt-3 flex flex-wrap gap-2">
                {canClaim && (
                  <Button small variant="green" disabled={done || !c.is_active} loading={claiming === c.id} onClick={() => claim(c)}>
                    {done ? "Sudah diklaim hari ini" : `Klaim +${c.xp_reward} XP`}
                  </Button>
                )}
                {canManage && (
                  <>
                    <Button small variant="blue" onClick={() => setForm({ id: c.id, title: c.title, description: c.description ?? "", icon: c.icon, xp_reward: String(c.xp_reward), is_active: c.is_active })}>
                      Ubah
                    </Button>
                    <Button small variant="red" onClick={() => setDel(c)}>
                      Hapus
                    </Button>
                  </>
                )}
              </div>
            </Card>
          );
        })}
      </div>

      <Modal
        open={!!form}
        onClose={() => setForm(null)}
        title={form?.id ? "Ubah Tantangan" : "Tantangan Baru"}
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
            <Field label="Judul">
              <Input value={form.title} maxLength={60} onChange={(e) => setForm({ ...form, title: e.target.value })} autoFocus />
            </Field>
            <Field label="Deskripsi">
              <TextArea value={form.description} maxLength={200} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            </Field>
            <Field label="Hadiah XP">
              <Input type="number" min={1} max={1000} value={form.xp_reward} onChange={(e) => setForm({ ...form, xp_reward: e.target.value })} />
            </Field>
            <EmojiPicker value={form.icon} onChange={(icon) => setForm({ ...form, icon })} options={["🎯", "📝", "🛡️", "🧘", "🐷", "🗂️", "🔥", "💡", "☕", "🚀"]} />
            <label className="mb-2 flex items-center gap-3 font-bold">
              <input type="checkbox" className="h-5 w-5 accent-amber-400" checked={form.is_active} onChange={(e) => setForm({ ...form, is_active: e.target.checked })} />
              Aktif (bisa diklaim pemain)
            </label>
            <button type="submit" className="hidden" />
          </form>
        )}
      </Modal>

      <ConfirmDialog open={!!del} loading={busy} onClose={() => setDel(null)} onConfirm={remove} message={<>Tantangan <b className="text-white">{del?.title}</b> dan riwayat klaimnya akan dihapus.</>} />
    </>
  );
}
