"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Field, Input } from "@/components/ui/Form";

const DEMO = [
  { label: "Game Master", email: "admin@myduitgweh.app" },
  { label: "Mentor", email: "mentor@myduitgweh.app" },
  { label: "Pemain", email: "pemain@myduitgweh.app" },
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
      <Card tilt={false}>
        <h2 className="mb-4 font-display text-2xl text-white">Masuk ke Markas</h2>
        <form onSubmit={submit}>
          <Field label="Email">
            <Input type="email" required autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="kamu@email.com" />
          </Field>
          <Field label="Password">
            <Input type="password" required autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" />
          </Field>
          {error && <p role="alert" className="mb-3 rounded-xl border-2 border-rubi bg-rubi/15 px-3 py-2 text-sm font-bold text-rose-200">{error}</p>}
          <Button type="submit" loading={loading} className="w-full">
            Masuk
          </Button>
        </form>
        <p className="mt-4 text-center text-sm text-mute">
          Belum punya akun?{" "}
          <Link href="/register" className="font-extrabold text-volt underline">
            Daftar dulu
          </Link>
        </p>
      </Card>

      <div className="mt-5 rounded-2xl border-[3px] border-dashed border-night-500 p-3">
        <p className="mb-2 text-center text-xs font-extrabold tracking-wide text-mute">
          <span className="uppercase tracking-widest">Akun demo</span> · password <code className="text-gold">Demo12345!</code>
        </p>
        <div className="grid grid-cols-3 gap-2">
          {DEMO.map((d) => (
            <Button
              key={d.email}
              type="button"
              variant="ghost"
              small
              onClick={() => {
                setEmail(d.email);
                setPassword("Demo12345!");
              }}
            >
              {d.label}
            </Button>
          ))}
        </div>
      </div>
    </>
  );
}
