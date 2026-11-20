import { can, requirePermission } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/ui/Misc";
import { CategoriesManager } from "./CategoriesManager";
import type { Category } from "@/lib/types";

export const metadata = { title: "Kategori | Myduit Gweh" };

export default async function CategoriesPage() {
  const session = await requirePermission(["categories.view", "categories.manage_global"]);
  const supabase = await createClient();
  const { data } = await supabase.from("categories").select("*").order("kind").order("name");
  const all = (data ?? []) as Category[];
  return (
    <>
      <PageHeader title="Kategori" subtitle="Label untuk loot dan damage-mu" icon="coins" />
      <CategoriesManager
        global={all.filter((c) => !c.user_id)}
        personal={all.filter((c) => c.user_id === session.userId)}
        userId={session.userId}
        canPersonal={can(session, "categories.create")}
        canGlobal={can(session, "categories.manage_global")}
      />
    </>
  );
}
