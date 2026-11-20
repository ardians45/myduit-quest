"use client";

import { useState } from "react";
import Link from "next/link";
import { Check, LogOut, Pencil } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { friendlyError } from "@/lib/errors";
import { useGame } from "@/components/game/GameFeedback";
import { useSession } from "@/components/layout/SessionProvider";
import { visibleNav } from "@/lib/nav";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Field, Input } from "@/components/ui/Form";
import { Modal } from "@/components/ui/Modal";
import { Badge } from "@/components/ui/Misc";
import { AVATAR_KEYS, AVATAR_LABELS, Avatar, isAvatarKey } from "@/components/art";

export function ProfileEditor() {
  const { profile, role } = useSession();
  const { toast, refresh } = useGame();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState(profile.display_name);
  const [avatar, setAvatar] = useState<string>(isAvatarKey(profile.avatar) ? profile.avatar : "knight");
  const [busy, setBusy] = useState(false);

  async function save() {
    if (!name.trim()) return toast("Nama tidak boleh kosong.", "error");
    setBusy(true);
    const { error } = await createClient().from("profiles").update({ display_name: name.trim(), avatar }).eq("id", profile.id);
    setBusy(false);
    if (error) return toast(friendlyError(error), "error");
    setOpen(false);
    toast("Profil diperbarui.");
    refresh();
  }

  return (
    <>
      <div className="flex items-center gap-4">
        <Avatar name={profile.avatar} size={84} ring />
        <div className="min-w-0 flex-1">
          <p className="truncate font-display text-2xl font-bold leading-tight text-white">{profile.display_name}</p>
          <p className="truncate text-sm text-mute">{profile.email}</p>
          <div className="mt-1.5">
            <Badge>{role?.name ?? "Tanpa role"}</Badge>
          </div>
        </div>
        <Button small variant="secondary" onClick={() => setOpen(true)}>
          <Pencil size={14} /> Ubah
        </Button>
      </div>
      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="Ubah Profil"
        footer={
          <>
            <Button variant="secondary" onClick={() => setOpen(false)}>
              Batal
            </Button>
            <Button loading={busy} onClick={save}>
              Simpan
            </Button>
          </>
        }
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            save();
          }}
        >
          <Field label="Nama Hero">
            <Input value={name} maxLength={40} onChange={(e) => setName(e.target.value)} autoFocus />
          </Field>
          <span className="mb-1.5 block text-[11px] font-bold uppercase tracking-[0.08em] text-mute">Pilih avatar</span>
          <div className="grid grid-cols-4 gap-2.5">
            {AVATAR_KEYS.map((k) => {
              const on = avatar === k;
              return (
                <button
                  type="button"
                  key={k}
                  onClick={() => setAvatar(k)}
                  aria-pressed={on}
                  aria-label={AVATAR_LABELS[k]}
                  className={`relative flex flex-col items-center gap-1 rounded-2xl border p-1.5 transition ${
                    on ? "border-violet bg-violet/15 shadow-[0_0_18px_-4px_rgba(139,92,246,0.9)]" : "border-transparent hover:bg-white/5"
                  }`}
                >
                  <Avatar name={k} size={56} />
                  <span className={`text-[11px] font-semibold ${on ? "text-white" : "text-mute"}`}>{AVATAR_LABELS[k]}</span>
                  {on && (
                    <span className="absolute right-1 top-1 grid h-4 w-4 place-items-center rounded-full bg-violet text-white">
                      <Check size={11} strokeWidth={3.5} />
                    </span>
                  )}
                </button>
              );
            })}
          </div>
          <button type="submit" className="hidden" />
        </form>
      </Modal>
    </>
  );
}

export function GuildMenu() {
  const { permissions } = useSession();
  const items = visibleNav(permissions).filter((i) => i.href !== "/profile");
  return (
    <>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {items.map((n) => {
          const Icon = n.icon;
          return (
            <Link key={n.href} href={n.href}>
              <Card lift className="!p-3.5">
                <span className="tile mb-2 bg-violet/15">
                  <Icon size={19} className="text-[#cdbbff]" />
                </span>
                <p className="font-display text-sm font-bold leading-tight text-white">{n.label}</p>
                <p className="text-xs text-mute">{n.sub}</p>
              </Card>
            </Link>
          );
        })}
      </div>
      <div className="mt-6 flex justify-center">
        <a href="/auth/signout" className="btn btn-danger">
          <LogOut size={17} /> Keluar
        </a>
      </div>
    </>
  );
}
