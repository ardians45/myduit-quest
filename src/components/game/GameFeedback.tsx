"use client";

import { createContext, useCallback, useContext, useMemo, useRef, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { AlertCircle, CheckCircle2, Info, Sparkles } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useSession } from "@/components/layout/SessionProvider";
import { levelTitle } from "@/lib/format";
import { Button } from "@/components/ui/Button";
import { AchievementBadge, LevelEmblem } from "@/components/art";
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

const TOAST_STYLE: Record<ToastKind, string> = {
  success: "border-emerald/30 bg-[#0b2a24]/95 text-emerald-100",
  error: "border-rose/35 bg-[#33111f]/95 text-rose-100",
  info: "border-cyan/30 bg-[#0b2433]/95 text-cyan-100",
};
const TOAST_ICON = { success: CheckCircle2, error: AlertCircle, info: Info } as const;

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
      const colors = ["#8b5cf6", "#22d3ee", "#f5b83d", "#34d399", "#fb7185"];
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

      {/* Toast +XP: pill violet */}
      <div className="pointer-events-none fixed inset-x-0 top-20 z-[95] flex flex-col items-center gap-2" aria-live="polite">
        {pops.map((p) => (
          <div
            key={p.id}
            className="xp-pop flex items-center gap-1.5 rounded-full border border-violet/50 bg-gradient-to-r from-[#5b45e0] to-[#8b5cf6] px-4 py-1.5 font-display text-sm font-bold text-white shadow-[0_10px_30px_-8px_rgba(139,92,246,0.9)]"
          >
            <Sparkles size={15} /> +{p.xp} XP
          </div>
        ))}
      </div>

      {/* Toast umum */}
      <div className="pointer-events-none fixed inset-x-0 bottom-28 z-[95] flex flex-col items-center gap-2 px-4 lg:bottom-6" role="status">
        <AnimatePresence>
          {toasts.map((t) => {
            const Icon = TOAST_ICON[t.kind];
            return (
              <motion.div
                key={t.id}
                initial={{ opacity: 0, y: 16, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10 }}
                transition={{ type: "spring", damping: 24, stiffness: 320 }}
                className={`pointer-events-auto flex max-w-sm items-center gap-2.5 rounded-2xl border px-4 py-2.5 text-sm font-semibold shadow-2xl backdrop-blur-md ${TOAST_STYLE[t.kind]}`}
              >
                <Icon size={18} className="shrink-0" />
                {t.text}
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Level-up / achievement */}
      <AnimatePresence>
        {current && (
          <motion.div
            key={current.type === "level" ? `l${current.level}` : current.ach.id}
            className="fixed inset-0 z-[90] grid place-items-center bg-[#03050d]/80 p-4 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              initial={reduce ? false : { scale: 0.85, y: 16, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              transition={{ type: "spring", damping: 18, stiffness: 260 }}
              className="card card-hero w-full max-w-sm px-6 py-7 text-center"
              role="dialog"
              aria-modal="true"
            >
              {current.type === "level" ? (
                <>
                  <div className="text-xs font-bold uppercase tracking-[0.18em] text-cyan">Level Up</div>
                  <motion.div
                    className="mx-auto my-3 w-fit"
                    initial={reduce ? false : { scale: 0.3, rotate: -15 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: "spring", damping: 10, stiffness: 180, delay: 0.1 }}
                  >
                    <LevelEmblem level={current.level} size={132} />
                  </motion.div>
                  <p className="font-display text-2xl font-bold text-white">{levelTitle(current.level)}</p>
                  <p className="mt-1 text-sm text-mute">Keren! Terus catat keuanganmu biar makin sakti.</p>
                </>
              ) : (
                <>
                  <div className="text-xs font-bold uppercase tracking-[0.18em] text-gold">Achievement Terbuka</div>
                  <motion.div
                    className="mx-auto my-4 w-fit"
                    initial={reduce ? false : { scale: 0.2, rotate: -240, opacity: 0 }}
                    animate={{ scale: 1, rotate: 0, opacity: 1 }}
                    transition={{ type: "spring", damping: 12, stiffness: 120, delay: 0.1 }}
                  >
                    <AchievementBadge icon={current.ach.icon} size={112} />
                  </motion.div>
                  <p className="font-display text-xl font-bold text-white">{current.ach.name}</p>
                  <p className="mt-1 text-sm text-mute">{current.ach.description}</p>
                  {current.ach.xp_reward > 0 && (
                    <p className="mt-3 inline-flex items-center gap-1 rounded-full bg-violet/20 px-3 py-1 font-display text-sm font-bold text-violet-200">
                      <Sparkles size={14} /> +{current.ach.xp_reward} XP
                    </p>
                  )}
                </>
              )}
              <div className="mt-6 flex justify-center">
                <Button
                  onClick={() => {
                    if (queue.length > 1) celebrate();
                    setQueue((q) => q.slice(1));
                  }}
                >
                  Mantap
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </Ctx.Provider>
  );
}
