import { LinkButton } from "@/components/ui/Button";
import { EmptyLocked } from "@/components/art";

export const metadata = { title: "Area Terkunci | Myduit Gweh" };

export default function ForbiddenPage() {
  return (
    <div className="mx-auto flex max-w-md flex-col items-center py-10 text-center">
      <EmptyLocked size={220} />
      <p className="mt-4 text-xs font-bold uppercase tracking-[0.2em] text-rose">Error 403</p>
      <h1 className="mt-1 font-display text-4xl font-extrabold tracking-tight text-white">Area Terkunci</h1>
      <p className="mt-3 text-mute">
        Role-mu belum punya kunci untuk ruangan ini. Minta Game Master menambahkan izinnya, atau kembali ke Markas dan lanjut main.
      </p>
      <div className="mt-6">
        <LinkButton href="/">Kembali ke Markas</LinkButton>
      </div>
    </div>
  );
}
