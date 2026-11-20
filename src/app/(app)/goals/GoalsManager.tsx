"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { friendlyError } from "@/lib/errors";
import { fmtDate, rupiah, todayWIB } from "@/lib/format";
import { useGame } from "@/components/game/GameFeedback";
import { Can, useCan } from "@/components/layout/SessionProvider";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { IconPicker, Field, Input } from "@/components/ui/Form";
import { RowMenu } from "@/components/ui/RowMenu";
import { BossSigil } from "@/components/art";
import { PICKER_SETS } from "@/lib/icons";
import { History, Pencil, Plus, Swords, Trash2 } from "lucide-react";
import { HpBar } from "@/components/ui/HPBar";
import { ConfirmDialog, Modal } from "@/components/ui/Modal";
import { Badge, EmptyState, SectionTitle } from "@/components/ui/Misc";
import type { GoalDeposit, GoalProgress } from "@/lib/types";

interface GoalForm { id?: string; name: string; icon: string; target_amount: string; deadline: string }
interface DepForm { goal: GoalProgress; amount: string; note: string; deposited_on: string }

export function GoalsManager({ goals, deposits, userId }: { goals: GoalProgress[]; deposits: GoalDeposit[]; userId: string }) {
  const { reward, toast, refresh, celebrate } = useGame();
  const [form, setForm] = useState<GoalForm | null>(null);
  const [dep, setDep] = useState<DepForm | null>(null);
  const [delGoal, setDelGoal] = useState<GoalProgress | null>(null);
  const [delDep, setDelDep] = useState<GoalDeposit | null>(null);
  const [open, setOpen] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const canUpdate = useCan("goals.update");
  const canDelete = useCan("goals.delete");
  const active = goals.filter((g) => g.status === "active");
  const done = goals.filter((g) => g.status === "completed");

  async function saveGoal() {
    if (!form) return;
    const target = Number(form.target_amount);
    if (!form.name.trim()) return toast("Nama quest wajib diisi.", "error");
    if (!target || target <= 0) return toast("Target harus lebih dari 0.", "error");
    setBusy(true);
    const payload = { name: form.name.trim(), icon: form.icon, target_amount: target, deadline: form.deadline || null };
    const sb = createClient();
    const { error } = form.id
      ? await sb.from("savings_goals").update(payload).eq("id", form.id)
      : await sb.from("savings_goals").insert({ ...payload, user_id: userId });
    setBusy(false);
    if (error) return toast(friendlyError(error), "error");
    setForm(null);
    toast(form.id ? "Quest diperbarui." : "Quest baru dimulai. Boss muncul!");
    refresh();
  }

  async function deposit() {
    if (!dep) return;
    const amount = Number(dep.amount);
    if (!amount || amount <= 0) return toast("Nominal setoran harus lebih dari 0.", "error");
    setBusy(true);
    const sb = createClient();
    const { error } = await sb.from("goal_deposits").insert({
      user_id: userId,
      goal_id: dep.goal.id,
      amount,
      note: dep.note.trim() || null,
      deposited_on: dep.deposited_on,
    });
    if (error) {
      setBusy(false);
      return toast(friendlyError(error), "error");
    }
    const { data: after } = await sb.from("goal_progress").select("status").eq("id", dep.goal.id).maybeSingle();
    setBusy(false);
    const defeated = after?.status === "completed" && dep.goal.status !== "completed";
    setDep(null);
    if (defeated) {
      toast(`Boss ${dep.goal.name} kalah! +100 XP bonus`, "success");
      celebrate();
      await reward(115);
    } else {
      toast("Serangan masuk! HP boss berkurang.");
      await reward(15);
    }
  }

  async function removeGoal() {
    if (!delGoal) return;
    setBusy(true);
    const { error } = await createClient().from("savings_goals").delete().eq("id", delGoal.id);
    setBusy(false);
    if (error) return toast(friendlyError(error), "error");
    setDelGoal(null);
    toast("Quest dihapus.");
    refresh();
  }

  async function removeDep() {
    if (!delDep) return;
    setBusy(true);
    const { error } = await createClient().from("goal_deposits").delete().eq("id", delDep.id);
    setBusy(false);
    if (error) return toast(friendlyError(error), "error");
    setDelDep(null);
    toast("Setoran dihapus.");
    refresh();
  }

  const renderGoal = (g: GoalProgress) => {
    const saved = Number(g.saved);
    const target = Number(g.target_amount);
    const pct = Math.min(100, (saved / target) * 100);
    const list = deposits.filter((d) => d.goal_id === g.id);
    const completed = g.status === "completed";
    return (
      <Card key={g.id} hero={completed}>
        <div className="flex items-start gap-3">
          <BossSigil pct={100 - pct} defeated={completed} size={68} />
          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between gap-1">
              <p className="truncate font-display text-lg font-bold">{g.name}</p>
              <RowMenu
                items={[
                  ...(canUpdate ? [{ label: "Ubah", icon: <Pencil size={15} />, onClick: () => setForm({ id: g.id, name: g.name, icon: g.icon, target_amount: String(g.target_amount), deadline: g.deadline ?? "" }) }] : []),
                  ...(canDelete ? [{ label: "Hapus", icon: <Trash2 size={15} />, danger: true, onClick: () => setDelGoal(g) }] : []),
                ]}
              />
            </div>
            <div className="mt-0.5 flex flex-wrap gap-1.5">
              {completed ? <Badge color="#34d399">Boss kalah</Badge> : <Badge color="#fb7185">Boss HP {Math.round(100 - pct)}%</Badge>}
              {g.deadline && <Badge color="#22d3ee">Tenggat {fmtDate(g.deadline)}</Badge>}
            </div>
          </div>
        </div>
        <div className="mt-3">
          <HpBar pct={100 - pct} tone="boss" />
          <p className="mt-1.5 text-sm text-mute">
            Terkumpul <b className="text-white">{rupiah(saved)}</b> dari {rupiah(target)}
            {!completed && <> · sisa {rupiah(Math.max(0, target - saved))}</>}
          </p>
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          {!completed && (
            <Can perm="goals.create">
              <Button small variant="success" onClick={() => setDep({ goal: g, amount: "", note: "", deposited_on: todayWIB() })}>
                <Swords size={15} /> Setor (+15 XP)
              </Button>
            </Can>
          )}
          <Button small variant="secondary" onClick={() => setOpen(open === g.id ? null : g.id)} aria-expanded={open === g.id}>
            <History size={15} /> Riwayat ({list.length})
          </Button>
        </div>
        {open === g.id && (
          <ul className="mt-3 divide-y divide-white/10 rounded-xl bg-white/[0.04] px-3 text-sm">
            {list.length === 0 && <li className="py-2 text-mute">Belum ada setoran.</li>}
            {list.map((d) => (
              <li key={d.id} className="flex items-center justify-between gap-2 py-2">
                <span className="min-w-0 truncate">
                  {fmtDate(d.deposited_on)} {d.note && <span className="text-mute">· {d.note}</span>}
                </span>
                <span className="flex items-center gap-3">
                  <b className="text-emerald">+{rupiah(d.amount)}</b>
                  <Can perm="goals.delete">
                    <button aria-label="Hapus setoran" className="grid h-7 w-7 place-items-center rounded-lg text-rose hover:bg-white/10" onClick={() => setDelDep(d)}>
                      <Trash2 size={14} />
                    </button>
                  </Can>
                </span>
              </li>
            ))}
          </ul>
        )}
      </Card>
    );
  }

  return (
    <>
      <Can perm="goals.create">
        <div className="mb-4">
          <Button onClick={() => setForm({ name: "", icon: "skull", target_amount: "", deadline: "" })}><Plus size={16} /> Tambah Quest</Button>
        </div>
      </Can>

      {goals.length === 0 && <EmptyState art="quest" title="Belum ada boss" text="Buat quest tabungan (mis. Laptop Baru), lalu setor sedikit demi sedikit sampai boss tumbang." />}

      {active.length > 0 && (
        <div className="grid gap-4 md:grid-cols-2">
          {active.map(renderGoal)}
        </div>
      )}
      {done.length > 0 && (
        <>
          <SectionTitle>Boss yang Sudah Dikalahkan</SectionTitle>
          <div className="grid gap-4 md:grid-cols-2">
            {done.map(renderGoal)}
          </div>
        </>
      )}

      <Modal
        open={!!form}
        onClose={() => setForm(null)}
        title={form?.id ? "Ubah Quest" : "Quest Baru"}
        footer={
          <>
            <Button variant="secondary" onClick={() => setForm(null)}>
              Batal
            </Button>
            <Button loading={busy} onClick={saveGoal}>
              Simpan
            </Button>
          </>
        }
      >
        {form && (
          <form onSubmit={(e) => { e.preventDefault(); saveGoal(); }}>
            <Field label="Nama quest">
              <Input value={form.name} maxLength={50} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="mis. Laptop Baru" autoFocus />
            </Field>
            <Field label="Target dana (Rp)">
              <Input type="number" inputMode="numeric" min={1} step="1" value={form.target_amount} onChange={(e) => setForm({ ...form, target_amount: e.target.value })} />
            </Field>
            <Field label="Tenggat (opsional)">
              <Input type="date" value={form.deadline} onChange={(e) => setForm({ ...form, deadline: e.target.value })} />
            </Field>
            <IconPicker value={form.icon} onChange={(icon) => setForm({ ...form, icon })} groups={PICKER_SETS.goal} />
            <button type="submit" className="hidden" />
          </form>
        )}
      </Modal>

      <Modal
        open={!!dep}
        onClose={() => setDep(null)}
        title={`Serang ${dep?.goal.name ?? "boss"}`}
        footer={
          <>
            <Button variant="secondary" onClick={() => setDep(null)}>
              Batal
            </Button>
            <Button variant="success" loading={busy} onClick={deposit}>
              Setor Dana
            </Button>
          </>
        }
      >
        {dep && (
          <form onSubmit={(e) => { e.preventDefault(); deposit(); }}>
            <p className="mb-3 text-sm text-mute">
              Sisa HP boss setara <b className="text-white">{rupiah(Math.max(0, Number(dep.goal.target_amount) - Number(dep.goal.saved)))}</b>. Setoran mencapai target = boss kalah (+100 XP).
            </p>
            <Field label="Nominal setoran (Rp)">
              <Input type="number" inputMode="numeric" min={1} step="1" value={dep.amount} onChange={(e) => setDep({ ...dep, amount: e.target.value })} autoFocus />
            </Field>
            <Field label="Tanggal">
              <Input type="date" value={dep.deposited_on} max={todayWIB()} onChange={(e) => setDep({ ...dep, deposited_on: e.target.value })} />
            </Field>
            <Field label="Catatan (opsional)">
              <Input value={dep.note} maxLength={100} onChange={(e) => setDep({ ...dep, note: e.target.value })} />
            </Field>
            <button type="submit" className="hidden" />
          </form>
        )}
      </Modal>

      <ConfirmDialog open={!!delGoal} loading={busy} onClose={() => setDelGoal(null)} onConfirm={removeGoal} message={<>Quest <b className="text-white">{delGoal?.name}</b> beserta semua riwayat setorannya akan dihapus permanen.</>} />
      <ConfirmDialog open={!!delDep} loading={busy} onClose={() => setDelDep(null)} onConfirm={removeDep} message={<>Setoran sebesar <b className="text-white">{delDep && rupiah(delDep.amount)}</b> akan dihapus dan progres quest berkurang.</>} />
    </>
  );
}
