import Link from "next/link";
import { requirePermission } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { fmtDateTime } from "@/lib/format";
import { Card } from "@/components/ui/Card";
import { Badge, EmptyState, PageHeader } from "@/components/ui/Misc";
import type { ActivityLog } from "@/lib/types";

export const metadata = { title: "Log Aktivitas | Myduit Gweh" };

const ENTITIES = ["transactions", "wallets", "budgets", "savings_goals", "goal_deposits", "categories", "challenges", "challenge_claims", "achievements", "roles", "role_permissions", "profiles"];
const ACTION_COLOR: Record<string, string> = { create: "#34d399", update: "#22d3ee", delete: "#fb7185", unlock: "#f5b83d" };
const ACTION_LABEL: Record<string, string> = { create: "Buat", update: "Ubah", delete: "Hapus", unlock: "Buka" };

function summary(l: ActivityLog): string {
  const d = l.detail ?? {};
  const bits = [d.name, d.title, d.note, d.display_name, d.code, d.amount !== undefined ? `Rp ${d.amount}` : null].filter(Boolean);
  return bits.slice(0, 2).join(" · ");
}

export default async function AdminLogsPage({ searchParams }: { searchParams: Promise<{ entity?: string }> }) {
  await requirePermission("logs.view");
  const sp = await searchParams;
  const entity = ENTITIES.includes(sp.entity ?? "") ? sp.entity : undefined;
  const supabase = await createClient();
  let q = supabase.from("activity_logs").select("*").order("created_at", { ascending: false }).limit(150);
  if (entity) q = q.eq("entity", entity);
  const { data } = await q;
  const logs = (data ?? []) as ActivityLog[];

  return (
    <>
      <PageHeader title="Log Aktivitas" subtitle="Jejak semua aksi (150 terbaru). Hanya bisa dibaca." icon="scroll-text" />
      <div className="mb-4 flex flex-wrap gap-2">
        <Link href="/admin/logs" className={`btn btn-sm ${entity ? "btn-secondary" : ""}`}>Semua</Link>
        {ENTITIES.map((e) => (
          <Link key={e} href={`/admin/logs?entity=${e}`} className={`btn btn-sm ${entity === e ? "" : "btn-secondary"}`}>
            {e}
          </Link>
        ))}
      </div>
      {logs.length === 0 ? (
        <EmptyState icon="scroll-text" title="Belum ada log" />
      ) : (
        <Card className="!p-2">
          <ul className="divide-y divide-white/[0.06]">
            {logs.map((l) => (
              <li key={l.id} className="flex flex-wrap items-center gap-x-3 gap-y-1 px-2 py-2.5 text-sm">
                <Badge color={ACTION_COLOR[l.action] ?? "#94a3b8"}>{ACTION_LABEL[l.action] ?? l.action}</Badge>
                <span className="font-display text-[13px] font-semibold text-white">{l.entity}</span>
                <span className="min-w-0 flex-1 truncate text-mute">{summary(l)}</span>
                <span className="num text-xs text-mute">
                  {l.actor_name ?? "Sistem"} · {fmtDateTime(l.created_at)}
                </span>
              </li>
            ))}
          </ul>
        </Card>
      )}
    </>
  );
}
