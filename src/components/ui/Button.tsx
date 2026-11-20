"use client";

import Link from "next/link";
import { Loader2 } from "lucide-react";
import type { ButtonHTMLAttributes, ReactNode, MouseEvent } from "react";

/** Nama lama (gold/green/red/blue) tetap diterima agar kode halaman tidak perlu berubah. */
type Variant = "primary" | "secondary" | "ghost" | "danger" | "success" | "gold" | "green" | "red" | "blue";

const VARIANT: Record<Variant, string> = {
  primary: "",
  gold: "",
  blue: "",
  success: "btn-success",
  green: "btn-success",
  danger: "btn-danger",
  red: "btn-danger",
  secondary: "btn-secondary",
  ghost: "btn-secondary",
};

function buzz() {
  try {
    navigator.vibrate?.(10);
  } catch {
    /* perangkat tidak mendukung getar */
  }
}

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  small?: boolean;
  loading?: boolean;
}

/** Tombol: primer bergradien violet, tekan = turun 1px + mengecil sedikit. */
export function Button({ variant = "primary", small, loading, className = "", onClick, disabled, children, ...rest }: ButtonProps) {
  return (
    <button
      {...rest}
      disabled={disabled || loading}
      onClick={(e: MouseEvent<HTMLButtonElement>) => {
        buzz();
        onClick?.(e);
      }}
      className={`btn ${VARIANT[variant]} ${small ? "btn-sm" : ""} ${className}`}
    >
      {loading ? (
        <>
          <Loader2 size={16} className="animate-spin" /> Tunggu...
        </>
      ) : (
        children
      )}
    </button>
  );
}

/** Tombol ikon persegi (aksi kecil di baris/list). */
export function IconButton({
  label,
  children,
  className = "",
  ...rest
}: ButtonHTMLAttributes<HTMLButtonElement> & { label: string; children: ReactNode }) {
  return (
    <button {...rest} aria-label={label} title={label} className={`btn btn-ghost btn-icon ${className}`}>
      {children}
    </button>
  );
}

export function LinkButton({
  href,
  variant = "primary",
  small,
  className = "",
  children,
}: {
  href: string;
  variant?: Variant;
  small?: boolean;
  className?: string;
  children: ReactNode;
}) {
  return (
    <Link href={href} onClick={buzz} className={`btn ${VARIANT[variant]} ${small ? "btn-sm" : ""} ${className}`}>
      {children}
    </Link>
  );
}
