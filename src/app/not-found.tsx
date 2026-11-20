import { LinkButton } from "@/components/ui/Button";
import { Coin3D } from "@/components/ui/Coin";

export default function NotFound() {
  return (
    <div className="mx-auto flex min-h-dvh max-w-md flex-col items-center justify-center px-6 text-center">
      <Coin3D size={80} label="?" />
      <p className="mt-8 font-display text-sm uppercase tracking-widest text-volt">Error 404</p>
      <h1 className="font-display text-5xl text-white">Peta Tidak Ketemu</h1>
      <p className="mt-3 text-mute">Halaman yang kamu cari tidak ada di dunia ini. Mungkin sudah dijarah monster.</p>
      <div className="mt-6">
        <LinkButton href="/">Kembali ke Markas</LinkButton>
      </div>
    </div>
  );
}
