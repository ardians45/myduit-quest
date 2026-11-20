"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AlertCircle, Crown, GraduationCap, LogIn, Swords } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Field, Input } from "@/components/ui/Form";

const DEMO = [
  { label: "Admin", email: "admin@myduitgweh.app", Icon: Crown },
  { label: "Mentor", email: "mentor@myduitgweh.app", Icon: GraduationCap },
  { label: "Pemain", email: "pemain@myduitgweh.app", Icon: Swords },
];

export function LoginForm({ nonaktif }: { nonaktif: boolean }) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(nonaktif ? "Akunmu dinonaktifkan oleh Game Master." : null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const { error } = await createClient().auth.signInWithPassword({ email: email.trim(), password });
    if (error) {
      setLoading(false);
      setError(error.message === "Invalid login credentials" ? "Email atau password salah." : error.message);
      return;
    }
    router.replace("/");
    router.refresh();
  }

  return (
    <>
      <Card hero className="!p-6">
        <h2 className="mb-1 font-display text-xl font-bold text-white">Masuk ke Markas</h2>
        <p className="mb-5 text-sm text-mute">Lanjutkan petualangan keuanganmu.</p>
        <form onSubmit={submit}>
          <Field label="Email">
            <Input type="email" required autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="kamu@email.com" />
          </Field>
          <Field label="Password">
            <Input type="password" required autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password kamu" />
          </Field>
          {error && (
            <p role="alert" className="mb-3 flex items-start gap-2 rounded-xl border border-rose/30 bg-rose/10 px-3 py-2 text-sm font-medium text-rose-200">
              <AlertCircle size={16} className="mt-0.5 shrink-0" /> {error}
            </p>
          )}
          <Button type="submit" loading={loading} className="w-full">
            <LogIn size={17} /> Masuk
          </Button>
        </form>
        <p className="mt-5 text-center text-sm text-mute">
          Belum punya akun?{" "}
          <Link href="/register" className="font-semibold text-cyan hover:underline">
            Daftar dulu
          </Link>
        </p>
      </Card>

      <div className="mt-4 rounded-2xl border border-dashed border-white/15 p-3.5">
        <p className="mb-2.5 text-center text-xs text-mute">
          <span className="font-semibold uppercase tracking-widest">Akun demo</span> · password <code className="rounded bg-white/10 px-1.5 py-0.5 font-mono text-gold">Demo12345!</code>
        </p>
        <div className="grid grid-cols-3 gap-2">
          {DEMO.map(({ label, email: em, Icon }) => (
            <Button
              key={em}
              type="button"
              variant="secondary"
              small
              className="!px-2"
              onClick={() => {
                setEmail(em);
                setPassword("Demo12345!");
              }}
            >
              <Icon size={14} /> {label}
            </Button>
          ))}
        </div>
      </div>
    </>
  );
}
