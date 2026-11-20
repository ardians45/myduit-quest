import { Coin3D } from "@/components/ui/Coin";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-md flex-col justify-center px-5 py-8">
      <div className="mb-6 flex flex-col items-center text-center">
        <Coin3D size={72} />
        <h1 className="mt-4 font-display text-5xl leading-none text-gold drop-shadow-[0_4px_0_#7c2d12]">Myduit Gweh</h1>
        <p className="mt-2 text-mute">Catat duit, kumpulkan XP, jadi legenda.</p>
      </div>
      {children}
    </main>
  );
}
