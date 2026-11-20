import { LinkButton } from "@/components/ui/Button";
import { Cube3D } from "@/components/ui/Coin";

export const metadata = { title: "Area Terkunci | Myduit Gweh" };

export default function ForbiddenPage() {
  return (
    <div className="mx-auto flex max-w-md flex-col items-center py-10 text-center">
      <Cube3D size={96} emoji="🔒" />
      <p className="mt-8 font-display text-sm uppercase tracking-widest text-rubi">Error 403</p>
      <h1 className="font-display text-5xl text-white">Area Terkunci</h1>
      <p className="mt-3 text-mute">
        Role-mu belum punya kunci untuk ruangan ini. Minta Game Master menambahkan izinnya, atau kembali ke Markas dan lanjut main.
      </p>
      <div className="mt-6">
        <LinkButton href="/">Kembali ke Markas</LinkButton>
      </div>
    </div>
  );
}
