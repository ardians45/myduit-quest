"use client";

import { useEffect, type ReactNode } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { X } from "lucide-react";
import { Button } from "./Button";

/** Modal: bottom-sheet di HP, dialog di tengah di desktop. */
export function Modal({
  open,
  onClose,
  title,
  children,
  footer,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  footer?: ReactNode;
}) {
  const reduce = useReducedMotion();

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[80] flex items-end justify-center sm:items-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: reduce ? 0 : 0.15 }}
        >
          <div className="absolute inset-0 bg-black/70 backdrop-blur-[2px]" onClick={onClose} aria-hidden />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label={title}
            className="card3d card-flat relative flex max-h-[92dvh] w-full max-w-lg flex-col rounded-b-none sm:rounded-b-[22px]"
            initial={reduce ? false : { y: 60, opacity: 0, scale: 0.97 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={reduce ? { opacity: 0 } : { y: 60, opacity: 0 }}
            transition={{ type: "spring", damping: 24, stiffness: 320 }}
          >
            <div className="mb-3 flex items-center justify-between gap-3">
              <h2 className="font-display text-2xl text-gold">{title}</h2>
              <button onClick={onClose} aria-label="Tutup" className="rounded-xl p-2 text-mute hover:bg-white/10 hover:text-white">
                <X size={22} />
              </button>
            </div>
            <div className="-mr-1 overflow-y-auto pr-1">{children}</div>
            {footer && <div className="mt-4 flex flex-wrap justify-end gap-3 pb-1">{footer}</div>}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/** Dialog konfirmasi hapus. */
export function ConfirmDialog({
  open,
  title = "Yakin mau hapus?",
  message,
  confirmLabel = "Ya, hapus",
  loading,
  onConfirm,
  onClose,
}: {
  open: boolean;
  title?: string;
  message: ReactNode;
  confirmLabel?: string;
  loading?: boolean;
  onConfirm: () => void;
  onClose: () => void;
}) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title}
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            Batal
          </Button>
          <Button variant="red" loading={loading} onClick={onConfirm}>
            {confirmLabel}
          </Button>
        </>
      }
    >
      <p className="text-mute">{message}</p>
    </Modal>
  );
}
