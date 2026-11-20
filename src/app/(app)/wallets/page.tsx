import { requirePermission } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/ui/Misc";
import { WalletsManager } from "./WalletsManager";
import type { WalletBalance } from "@/lib/types";

export const metadata = { title: "Dompet | Myduit Gweh" };

export default async function WalletsPage() {
  const { userId } = await requirePermission("wallets.view");
  const supabase = await createClient();
  const { data } = await supabase.from("wallet_balances").select("*").eq("user_id", userId).order("created_at");
  return (
    <>
      <PageHeader title="Dompet" subtitle="Inventory: tempat semua hartamu disimpan" icon="👛" />
      <WalletsManager wallets={(data ?? []) as WalletBalance[]} userId={userId} />
    </>
  );
}
