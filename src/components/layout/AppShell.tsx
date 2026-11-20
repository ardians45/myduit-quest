"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogOut, Plus } from "lucide-react";
import type { ReactNode } from "react";
import { motion } from "framer-motion";
import { useSession } from "./SessionProvider";
import { NAV, visibleNav, type NavItem } from "@/lib/nav";
import { Avatar, CoinMark, LevelEmblem, StreakFlame, XpBar } from "@/components/art";
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

function Logo({ size = 36 }: { size?: number }) {
  return (
    <Link href="/" className="flex items-center gap-2.5" aria-label="Myduit Gweh, ke Markas">
      <CoinMark size={size} />
      <span className="font-display text-[1.05rem] font-extrabold leading-none tracking-tight text-white">
        Myduit <span className="text-gold">Gweh</span>
      </span>
    </Link>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const { profile, role, permissions } = useSession();
  const items = visibleNav(permissions);
  const lp = levelProgress(profile.xp);
  const has = (p: string) => permissions.includes(p);
  const byHref = (h: string) => NAV.find((n) => n.href === h)!;
  const allowed = (h: string) => items.some((i) => i.href === h);

  // Tab bawah HP: Markas, Loot/Laporan, [+], Quest/Tantangan/Log, Profil
  const tabs: (NavItem | "plus")[] = [];
  tabs.push(byHref("/"));
  const t2 = ["/transactions", "/reports"].find(allowed);
  if (t2) tabs.push(byHref(t2));
  if (has("transactions.create")) tabs.push("plus");
  const t4 = ["/goals", "/challenges", "/admin/logs"].find(allowed);
  if (t4) tabs.push(byHref(t4));
  tabs.push(byHref("/profile"));

  return (
    <div className="min-h-dvh lg:pl-[260px]">
      {/* Sidebar desktop */}
      <aside className="glass fixed inset-y-0 left-0 z-40 hidden w-[260px] flex-col border-r border-white/[0.07] p-4 lg:flex">
        <div className="mb-6 mt-1 px-1.5">
          <Logo size={38} />
        </div>
        <nav className="flex-1 space-y-1 overflow-y-auto pr-1" aria-label="Navigasi utama">
          {(["main", "admin"] as const).map((g) => {
            const list = items.filter((i) => i.group === g);
            if (!list.length) return null;
            return (
              <div key={g} className="mb-3">
                <p className="mb-1.5 mt-3 px-3 text-[10px] font-bold uppercase tracking-[0.14em] text-mute/80">{g === "admin" ? "Ruang Game Master" : "Menu"}</p>
                {list.map((n) => {
                  const Icon = n.icon;
                  const active = isActive(pathname, n.href);
                  return (
                    <Link
                      key={n.href}
                      href={n.href}
                      aria-current={active ? "page" : undefined}
                      className={`relative flex items-center gap-3 rounded-xl px-3 py-2 transition ${
                        active ? "bg-violet/15 text-white" : "text-mute hover:bg-white/5 hover:text-white"
                      }`}
                    >
                      {active && <span className="absolute -left-1 top-2 bottom-2 w-1 rounded-full bg-violet shadow-[0_0_12px_2px_rgba(139,92,246,0.8)]" />}
                      <span className={`grid h-8 w-8 place-items-center rounded-lg ${active ? "bg-violet/30 text-[#d9ccff]" : "bg-white/[0.04]"}`}>
                        <Icon size={17} />
                      </span>
                      <span className="min-w-0">
                        <span className="block font-display text-[0.86rem] font-semibold leading-tight">{n.label}</span>
                        <span className="block truncate text-[11px] leading-tight opacity-60">{n.sub}</span>
                      </span>
                    </Link>
                  );
                })}
              </div>
            );
          })}
        </nav>
        <div className="mt-3 rounded-2xl border border-white/10 bg-white/[0.04] p-3">
          <div className="flex items-center gap-2.5">
            <Avatar name={profile.avatar} size={40} />
            <div className="min-w-0 flex-1">
              <p className="truncate font-display text-sm font-bold leading-tight text-white">{profile.display_name}</p>
              <p className="truncate text-xs text-mute">{role?.name ?? "Tanpa role"}</p>
            </div>
            <LevelEmblem level={lp.level} size={34} />
          </div>
          <div className="mt-2.5 flex items-center justify-between text-[11px] font-semibold text-mute">
            <span>{levelTitle(lp.level)}</span>
            <span className="num text-violet-300">{num(profile.xp)} XP</span>
          </div>
          <XpBar pct={lp.pct} height={7} className="mt-1" />
          <a href="/auth/signout" className="mt-3 flex items-center justify-center gap-2 rounded-xl py-1.5 text-sm font-semibold text-mute transition hover:bg-white/10 hover:text-white">
            <LogOut size={15} /> Keluar
          </a>
        </div>
      </aside>

      {/* Top bar HP */}
      <header className="glass sticky top-0 z-30 flex items-center justify-between gap-3 border-b border-white/[0.07] px-4 py-2.5 lg:hidden">
        <Logo size={32} />
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1 rounded-full border border-orange-400/30 bg-orange-500/10 py-0.5 pl-1.5 pr-2.5 font-display text-sm font-bold text-orange-300">
            <StreakFlame size={18} lit={profile.streak > 0} /> {profile.streak}
          </span>
          <span className="flex items-center gap-1 rounded-full border border-violet/30 bg-violet/10 py-0.5 pl-1 pr-2.5 font-display text-sm font-bold text-violet-200">
            <LevelEmblem level={lp.level} size={22} /> Lv {lp.level}
          </span>
        </div>
      </header>

      <main className="mx-auto w-full max-w-[1200px] px-4 pb-32 pt-5 lg:px-8 lg:pb-12 lg:pt-8">{children}</main>

      {/* Bottom nav HP: pill melayang */}
      <nav aria-label="Navigasi bawah" className="safe-bottom pointer-events-none fixed inset-x-0 bottom-3 z-40 px-3 lg:hidden">
        <ul className="glass pointer-events-auto mx-auto flex max-w-md items-center justify-around rounded-full border border-white/10 px-2 py-1.5 shadow-[0_16px_40px_-12px_rgba(0,0,0,0.8)]">
          {tabs.map((t) => {
            if (t === "plus") {
              return (
                <li key="plus" className="flex flex-1 justify-center">
                  <Link href="/transactions?new=1" aria-label="Catat transaksi baru" onClick={buzz} className="btn nav-plus">
                    <Plus size={28} strokeWidth={2.6} />
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
                  className={`relative flex flex-col items-center gap-0.5 rounded-full py-1 font-display text-[11px] font-semibold transition ${
                    active ? "text-white" : "text-mute"
                  }`}
                >
                  <span className="relative grid h-8 w-12 place-items-center">
                    {active && <motion.span layoutId="tab-glow" className="nav-active-glow absolute inset-0 rounded-full bg-violet/25" transition={{ type: "spring", damping: 26, stiffness: 340 }} />}
                    <Icon size={20} className="relative" />
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
