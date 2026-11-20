"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AlertCircle, CheckCircle2, Rocket } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Field, Input } from "@/components/ui/Form";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (password.length < 8) {
      setError("Password minimal 8 karakter.");
      return;
    }
    setLoading(true);
    const { data, error } = await createClient().auth.signUp({
      email: email.trim(),
      password,
      options: { data: { display_name: name.trim() } },
    });
    setLoading(false);
    if (error) {
      setError(error.message);
      return;
    }
    if (data.session) {
      router.replace("/");
      router.refresh();
    } else {
      setInfo("Pendaftaran berhasil! Cek emailmu untuk konfirmasi, lalu masuk.");
    }
  }

  return (
    <Card hero className="!p-6">
      <h2 className="mb-1 font-display text-xl font-bold text-white">Buat Karakter Baru</h2>
      <p className="mb-5 text-sm text-mute">Akun baru otomatis jadi Hero / Pemain.</p>
      {info ? (
        <div>
          <p role="status" className="mb-4 flex items-start gap-2 rounded-xl border border-emerald/30 bg-emerald/10 px-3 py-2 text-sm font-medium text-emerald-200">
            <CheckCircle2 size={16} className="mt-0.5 shrink-0" /> {info}
          </p>
          <Link href="/login" className="font-semibold text-cyan hover:underline">
            Ke halaman masuk
          </Link>
        </div>
      ) : (
        <form onSubmit={submit}>
          <Field label="Nama Hero">
            <Input required maxLength={40} value={name} onChange={(e) => setName(e.target.value)} placeholder="Nama panggilanmu" />
          </Field>
          <Field label="Email">
            <Input type="email" required autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="kamu@email.com" />
          </Field>
          <Field label="Password" hint="Minimal 8 karakter">
            <Input type="password" required minLength={8} autoComplete="new-password" value={password} onChange={(e) => setPassword(e.target.value)} />
          </Field>
          {error && (
            <p role="alert" className="mb-3 flex items-start gap-2 rounded-xl border border-rose/30 bg-rose/10 px-3 py-2 text-sm font-medium text-rose-200">
              <AlertCircle size={16} className="mt-0.5 shrink-0" /> {error}
            </p>
          )}
          <Button type="submit" variant="success" loading={loading} className="w-full">
            <Rocket size={17} /> Mulai Petualangan
          </Button>
          <p className="mt-5 text-center text-sm text-mute">
            Sudah punya akun?{" "}
            <Link href="/login" className="font-semibold text-cyan hover:underline">
              Masuk
            </Link>
          </p>
        </form>
      )}
    </Card>
  );
}
