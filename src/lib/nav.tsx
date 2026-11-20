import {
  Home, Wallet, Swords, ShieldHalf, Skull, Tags, Target, BarChart3, User, Users, KeyRound, Trophy, ScrollText,
  type LucideIcon,
} from "lucide-react";

export interface NavItem {
  href: string;
  label: string;
  sub: string;
  icon: LucideIcon;
  /** Salah satu permission cukup. Kosong = semua user login. */
  perm?: string[];
  group: "main" | "admin";
}

export const NAV: NavItem[] = [
  { href: "/", label: "Markas", sub: "Dashboard", icon: Home, perm: ["dashboard.view"], group: "main" },
  { href: "/transactions", label: "Loot", sub: "Transaksi", icon: Swords, perm: ["transactions.view"], group: "main" },
  { href: "/wallets", label: "Dompet", sub: "Inventory", icon: Wallet, perm: ["wallets.view"], group: "main" },
  { href: "/budgets", label: "Perisai HP", sub: "Anggaran", icon: ShieldHalf, perm: ["budgets.view"], group: "main" },
  { href: "/goals", label: "Quest", sub: "Tabungan & boss", icon: Skull, perm: ["goals.view"], group: "main" },
  { href: "/challenges", label: "Tantangan", sub: "Harian", icon: Target, perm: ["challenges.view", "challenges.manage"], group: "main" },
  { href: "/categories", label: "Kategori", sub: "Label loot", icon: Tags, perm: ["categories.view", "categories.manage_global"], group: "main" },
  { href: "/reports", label: "Laporan", sub: "Grafik", icon: BarChart3, perm: ["reports.view_own", "reports.view_all"], group: "main" },
  { href: "/profile", label: "Profil", sub: "Guild Hall", icon: User, group: "main" },
  { href: "/admin/users", label: "Pengguna", sub: "Kelola akun", icon: Users, perm: ["users.manage"], group: "admin" },
  { href: "/admin/roles", label: "Role & Akses", sub: "RBAC", icon: KeyRound, perm: ["rbac.manage"], group: "admin" },
  { href: "/admin/achievements", label: "Achievement", sub: "Master lencana", icon: Trophy, perm: ["achievements.manage"], group: "admin" },
  { href: "/admin/logs", label: "Log Aktivitas", sub: "Jejak aksi", icon: ScrollText, perm: ["logs.view"], group: "admin" },
];

export function visibleNav(permissions: string[]): NavItem[] {
  return NAV.filter((n) => !n.perm || n.perm.some((p) => permissions.includes(p)));
}
