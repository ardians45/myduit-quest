"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Flame, LogOut, Plus } from "lucide-react";
import type { ReactNode } from "react";
import { useSession } from "./SessionProvider";
import { NAV, visibleNav, type NavItem } from "@/lib/nav";
import { Coin3D } from "@/components/ui/Coin";
import { HpBar } from "@/components/ui/HPBar";
import { levelProgress, levelTitle, num } from "@/lib/format";

function isActive(pathname: string, href: string) {
  return href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(href + "/");
}

function buzz() {
  try {
    navigator.vibrate?.(10);
  } catch {
    /* abaikan */
  }
}

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const { profile, role, permissions } = useSession();
  const items = visibleNav(permissions);
  const lp = levelProgress(profile.xp);
  const has = (p: string) => permissions.includes(p);
  const byHref = (h: string) => NAV.find((n) => n.href === h)!;
  const allowed = (h: string) => items.some((i) => i.href === h);

  // Tab bawah HP (maks 5): Markas, Loot/Laporan, [+], Quest/Tantangan/Log, Profil
  const tabs: (NavItem | "plus")[] = [];
  tabs.push(byHref("/"));
  const t2 = ["/transactions", "/reports"].find(allowed);
  if (t2) tabs.push(byHref(t2));
  if (has("transactions.create")) tabs.push("plus");
  const t4 = ["/goals", "/challenges", "/admin/logs"].find(allowed);
  if (t4) tabs.push(byHref(t4));
  tabs.push(byHref("/profile"));

  return (
    <div className="min-h-dvh lg:pl-64">
      {/* Sidebar desktop */}
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 flex-col border-r-[3px] border-night-600 bg-night-950/80 p-4 backdrop-blur lg:flex">
        <Link href="/" className="mb-5 flex items-center gap-3">
          <Coin3D size={42} />
          <span className="font-display text-2xl leading-none text-gold">
            Myduit
            <br />
            Gweh
          </span>
        </Link>
        <nav className="flex-1 space-y-1 overflow-y-auto" aria-label="Navigasi utama">
          {(["main", "admin"] as const).map((g) => {
            const list = items.filter((i) => i.group === g);
            if (!list.length) return null;
            return (
              <div key={g} className="mb-3">
                {g === "admin" && <p className="mb-1 mt-2 px-3 text-[11px] font-extrabold uppercase tracking-widest text-mute">Ruang Game Master</p>}
                {list.map((n) => {
                  const Icon = n.icon;
                  const active = isActive(pathname, n.href);
                  return (
                    <Link
                      key={n.href}
                      href={n.href}
                      aria-current={active ? "page" : undefined}
                      className={`flex items-center gap-3 rounded-2xl border-[3px] px-3 py-2 transition ${
                        active
                          ? "border-gold/70 bg-gold/15 text-gold"
                          : "border-transparent text-mute hover:bg-white/5 hover:text-white"
                      }`}
                    >
                      <Icon size={20} />
                      <span className="font-display text-lg leading-none">{n.label}</span>
                      <span className="ml-auto text-[11px] opacity-60">{n.sub}</span>
                    </Link>
                  );
                })}
              </div>
            );
          })}
        </nav>
        <div className="mt-3 rounded-2xl border-[3px] border-night-500 bg-night-800/80 p-3">
          <div className="flex items-center gap-2">
            <span className="text-2xl">{profile.avatar}</span>
            <div className="min-w-0">
              <p className="truncate font-display text-lg leading-none text-white">{profile.display_name}</p>
              <p className="truncate text-xs text-mute">{role?.name ?? "Tanpa role"}</p>
            </div>
          </div>
          <div className="mt-2 flex items-center justify-between text-xs font-extrabold text-volt">
            <span>
              Lv {lp.level} · {levelTitle(lp.level)}
            </span>
            <span>{num(profile.xp)} XP</span>
          </div>
          <HpBar pct={lp.pct} tone="xp" className="mt-1" />
          <a href="/auth/signout" className="mt-3 flex items-center justify-center gap-2 rounded-xl py-1.5 text-sm font-bold text-mute hover:bg-white/10 hover:text-white">
            <LogOut size={16} /> Keluar
          </a>
        </div>
      </aside>

      {/* Header HP */}
      <header className="sticky top-0 z-30 flex items-center justify-between gap-3 border-b-[3px] border-night-600 bg-night-950/85 px-4 py-2.5 backdrop-blur lg:hidden">
        <Link href="/" className="flex items-center gap-2">
          <Coin3D size={30} />
          <span className="font-display text-xl text-gold">Myduit Gweh</span>
        </Link>
        <div className="flex items-center gap-2 text-sm font-extrabold">
          <span className="flex items-center gap-1 rounded-full border-2 border-orange-400/60 bg-orange-500/15 px-2 py-0.5 text-orange-300">
            <Flame size={14} /> {profile.streak}
          </span>
          <span className="rounded-full border-2 border-volt/60 bg-volt/15 px-2 py-0.5 text-volt">Lv {lp.level}</span>
        </div>
      </header>

      <main className="mx-auto w-full max-w-5xl px-4 pb-32 pt-5 lg:px-8 lg:pb-12 lg:pt-8">{children}</main>

      {/* Bottom nav HP */}
      <nav
        aria-label="Navigasi bawah"
        className="safe-bottom fixed inset-x-0 bottom-0 z-40 border-t-[3px] border-night-500 bg-night-950/95 backdrop-blur lg:hidden"
      >
        <ul className="mx-auto flex max-w-md items-end justify-around px-2 pb-1.5 pt-1.5">
          {tabs.map((t) => {
            if (t === "plus") {
              return (
                <li key="plus" className="flex-1">
                  <Link href="/transactions?new=1" aria-label="Catat transaksi baru" onClick={buzz} className="btn3d nav-plus mx-auto">
                    <Plus size={34} strokeWidth={3.5} />
                  </Link>
                </li>
              );
            }
            const Icon = t.icon;
            const active = isActive(pathname, t.href);
            return (
              <li key={t.href} className="flex-1">
                <Link
                  href={t.href}
                  aria-current={active ? "page" : undefined}
                  className={`flex flex-col items-center gap-0.5 rounded-xl py-1 font-display text-[13px] transition ${
                    active ? "text-gold" : "text-mute"
                  }`}
                >
                  <span className={`grid h-9 w-9 place-items-center rounded-xl transition ${active ? "bg-gold/20 -translate-y-0.5" : ""}`}>
                    <Icon size={22} />
                  </span>
                  {t.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
}
