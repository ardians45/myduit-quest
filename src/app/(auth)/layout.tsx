import { CoinMark } from "@/components/art";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-md flex-col justify-center px-5 py-8">
      <div className="mb-7 flex flex-col items-center text-center">
        <div className="relative">
          <span className="absolute inset-0 -z-10 scale-150 rounded-full bg-violet/30 blur-2xl" aria-hidden />
          <CoinMark size={76} />
        </div>
        <h1 className="mt-4 font-display text-4xl font-extrabold leading-none tracking-tight text-white">
          Myduit <span className="text-gold">Gweh</span>
        </h1>
        <p className="mt-2.5 text-sm text-mute">Catat duit, kumpulkan XP, jadi legenda.</p>
      </div>
      {children}
    </main>
  );
}
