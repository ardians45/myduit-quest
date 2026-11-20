"use client";

import { createContext, useCallback, useContext, useMemo, useRef, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { createClient } from "@/lib/supabase/client";
import { useSession } from "@/components/layout/SessionProvider";
import { levelTitle } from "@/lib/format";
import { Button } from "@/components/ui/Button";
import type { Achievement } from "@/lib/types";

type ToastKind = "success" | "error" | "info";
interface ToastItem { id: number; kind: ToastKind; text: string }
interface Pop { id: number; xp: number }
type QueueItem = { type: "level"; level: number } | { type: "ach"; ach: Achievement };

interface GameApi {
  /** Panggil setelah aksi yang memberi XP: popup +XP, cek achievement, level-up, lalu refresh data. */
  reward: (xp: number) => Promise<void>;
  toast: (text: string, kind?: ToastKind) => void;
  /** Hanya refresh data server (tanpa XP). */
  refresh: () => void;
  celebrate: () => void;
}

const Ctx = createContext<GameApi | null>(null);

export function useGame(): GameApi {
  const v = useContext(Ctx);
  if (!v) throw new Error("useGame harus dipakai di dalam GameFeedbackProvider");
  return v;
}

let seq = 1;

export function GameFeedbackProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const { profile } = useSession();
  const reduce = useReducedMotion();
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const [pops, setPops] = useState<Pop[]>([]);
  const [queue, setQueue] = useState<QueueItem[]>([]);
  const levelRef = useRef(profile.level);

  const celebrate = useCallback(() => {
    if (reduce) return;
    import("canvas-confetti").then(({ default: confetti }) => {
      const colors = ["#fbbf24", "#10b981", "#38bdf8", "#f43f5e", "#a78bfa"];
      confetti({ particleCount: 90, spread: 80, origin: { y: 0.6 }, colors, disableForReducedMotion: true });
      setTimeout(() => confetti({ particleCount: 50, angle: 60, spread: 60, origin: { x: 0, y: 0.7 }, colors }), 180);
      setTimeout(() => confetti({ particleCount: 50, angle: 120, spread: 60, origin: { x: 1, y: 0.7 }, colors }), 300);
    });
  }, [reduce]);

  const toast = useCallback((text: string, kind: ToastKind = "success") => {
    const id = seq++;
    setToasts((t) => [...t, { id, kind, text }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3500);
  }, []);

  const refresh = useCallback(() => router.refresh(), [router]);

  const reward = useCallback(
    async (xp: number) => {
      if (xp > 0) {
        const id = seq++;
        setPops((p) => [...p, { id, xp }]);
        setTimeout(() => setPops((p) => p.filter((x) => x.id !== id)), 1600);
      }
      try {
        const sb = createClient();
        const { data: ach } = await sb.rpc("check_achievements");
        const { data: me } = await sb.from("profiles").select("level").eq("id", profile.id).maybeSingle();
        const items: QueueItem[] = [];
        if (me && me.level > levelRef.current) items.push({ type: "level", level: me.level });
        if (me) levelRef.current = me.level;
        for (const a of (ach as Achievement[] | null) ?? []) items.push({ type: "ach", ach: a });
        if (items.length) {
          setQueue((q) => [...q, ...items]);
          celebrate();
        }
      } catch {
        /* umpan balik gamifikasi tidak boleh menggagalkan aksi utama */
      }
      router.refresh();
    },
    [celebrate, profile.id, router],
  );

  const api = useMemo(() => ({ reward, toast, refresh, celebrate }), [reward, toast, refresh, celebrate]);
  const current = queue[0];

  return (
    <Ctx.Provider value={api}>
      {children}

      {/* Popup +XP */}
      <div className="pointer-events-none fixed inset-x-0 top-24 z-[95] flex flex-col items-center gap-1" aria-live="polite">
        {pops.map((p) => (
          <div key={p.id} className="xp-pop">
            +{p.xp} XP
          </div>
        ))}
      </div>

      {/* Toast */}
      <div className="pointer-events-none fixed inset-x-0 bottom-28 z-[95] flex flex-col items-center gap-2 px-4 lg:bottom-6" role="status">
        <AnimatePresence>
          {toasts.map((t) => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, y: 16, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10 }}
              className={`pointer-events-auto max-w-sm rounded-2xl border-[3px] px-4 py-2.5 text-sm font-extrabold shadow-xl ${
                t.kind === "error"
                  ? "border-rubi bg-[#3a0d1c] text-rose-100"
                  : t.kind === "info"
                    ? "border-volt bg-[#0c2a45] text-sky-100"
                    : "border-zamrud bg-[#06352a] text-emerald-100"
              }`}
            >
              {t.text}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Level-up / achievement */}
      <AnimatePresence>
        {current && (
          <motion.div
            key={current.type === "level" ? `l${current.level}` : current.ach.id}
            className="fixed inset-0 z-[90] grid place-items-center bg-black/75 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              initial={reduce ? false : { scale: 0.6, rotate: -4, opacity: 0 }}
              animate={{ scale: 1, rotate: 0, opacity: 1 }}
              transition={{ type: "spring", damping: 12, stiffness: 220 }}
              className="card3d card-gold card-flat w-full max-w-sm text-center"
              role="dialog"
              aria-modal="true"
            >
              {current.type === "level" ? (
                <>
                  <div className="font-display text-sm uppercase tracking-widest text-volt">Level Up!</div>
                  <div className="my-2 font-display text-7xl text-gold drop-shadow-[0_4px_0_#7c2d12]">{current.level}</div>
                  <p className="font-display text-2xl text-white">{levelTitle(current.level)}</p>
                  <p className="mt-1 text-sm text-amber-100/80">Keren! Terus catat keuanganmu biar makin sakti.</p>
                </>
              ) : (
                <>
                  <div className="font-display text-sm uppercase tracking-widest text-volt">Achievement Terbuka!</div>
                  <div className="my-3 text-7xl">{current.ach.icon}</div>
                  <p className="font-display text-2xl text-white">{current.ach.name}</p>
                  <p className="mt-1 text-sm text-amber-100/80">{current.ach.description}</p>
                  {current.ach.xp_reward > 0 && <p className="mt-2 font-display text-xl text-volt">+{current.ach.xp_reward} XP</p>}
                </>
              )}
              <div className="mt-5 flex justify-center">
                <Button
                  onClick={() => {
                    if (queue.length > 1) celebrate();
                    setQueue((q) => q.slice(1));
                  }}
                >Mantap!</Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </Ctx.Provider>
  );
}
