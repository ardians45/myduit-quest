"use client";

import { useState } from "react";
import Link from "next/link";
import { LogOut } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { friendlyError } from "@/lib/errors";
import { useGame } from "@/components/game/GameFeedback";
import { useSession } from "@/components/layout/SessionProvider";
import { visibleNav } from "@/lib/nav";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { EmojiPicker, Field, Input } from "@/components/ui/Form";
import { Modal } from "@/components/ui/Modal";
import { Badge } from "@/components/ui/Misc";

const AVATARS = ["🦊", "🐱", "🐼", "🦁", "🐲", "🦉", "🧙", "🥷", "🤖", "👾"];

export function ProfileEditor() {
  const { profile, role } = useSession();
  const { toast, refresh } = useGame();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState(profile.display_name);
  const [avatar, setAvatar] = useState(profile.avatar);
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
        <div className="grid h-20 w-20 shrink-0 place-items-center rounded-3xl border-[3px] border-gold/70 bg-black/30 text-5xl">{profile.avatar}</div>
        <div className="min-w-0 flex-1">
          <p className="truncate font-display text-3xl leading-tight text-white">{profile.display_name}</p>
          <p className="truncate text-sm text-amber-100/70">{profile.email}</p>
          <div className="mt-1">
            <Badge>{role?.name ?? "Tanpa role"}</Badge>
          </div>
        </div>
        <Button small variant="ghost" onClick={() => setOpen(true)}>
          Ubah
        </Button>
      </div>
      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="Ubah Profil"
        footer={
          <>
            <Button variant="ghost" onClick={() => setOpen(false)}>
              Batal
            </Button>
            <Button loading={busy} onClick={save}>
              Simpan
            </Button>
          </>
        }
      >
        <form onSubmit={(e) => { e.preventDefault(); save(); }}>
          <Field label="Nama Hero">
            <Input value={name} maxLength={40} onChange={(e) => setName(e.target.value)} autoFocus />
          </Field>
          <EmojiPicker value={avatar} onChange={setAvatar} options={AVATARS} />
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
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {items.map((n) => {
          const Icon = n.icon;
          return (
            <Link key={n.href} href={n.href}>
              <Card className="!p-3">
                <Icon size={24} className="text-gold" />
                <p className="mt-1 font-display text-lg leading-tight">{n.label}</p>
                <p className="text-xs text-mute">{n.sub}</p>
              </Card>
            </Link>
          );
        })}
      </div>
      <div className="mt-6 flex justify-center">
        <a href="/auth/signout" className="btn3d btn-red">
          <LogOut size={18} /> Keluar
        </a>
      </div>
    </>
  );
}
