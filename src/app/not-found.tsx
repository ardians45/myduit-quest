import { LinkButton } from "@/components/ui/Button";
import { CoinMark } from "@/components/art";

export default function NotFound() {
  return (
    <div className="mx-auto flex min-h-dvh max-w-md flex-col items-center justify-center px-6 text-center">
      <div className="relative">
        <span className="absolute inset-0 -z-10 scale-150 rounded-full bg-violet/25 blur-2xl" aria-hidden />
        <div className="opacity-90 [filter:grayscale(0.35)]">
          <CoinMark size={92} />
        </div>
      </div>
      <p className="mt-8 text-xs font-bold uppercase tracking-[0.2em] text-cyan">Error 404</p>
      <h1 className="mt-1 font-display text-4xl font-extrabold tracking-tight text-white">Peta Tidak Ketemu</h1>
      <p className="mt-3 text-mute">Halaman yang kamu cari tidak ada di dunia ini. Mungkin sudah dijarah monster.</p>
      <div className="mt-6">
        <LinkButton href="/">Kembali ke Markas</LinkButton>
      </div>
    </div>
  );
}
