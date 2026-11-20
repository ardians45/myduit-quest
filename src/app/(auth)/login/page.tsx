import { LoginForm } from "./LoginForm";

export const metadata = { title: "Masuk | Myduit Gweh" };

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ msg?: string }> }) {
  const sp = await searchParams;
  return <LoginForm nonaktif={sp.msg === "nonaktif"} />;
}
