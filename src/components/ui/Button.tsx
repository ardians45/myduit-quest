"use client";

import Link from "next/link";
import type { ButtonHTMLAttributes, ReactNode, MouseEvent } from "react";

type Variant = "gold" | "green" | "red" | "blue" | "ghost";

const VARIANT: Record<Variant, string> = {
  gold: "",
  green: "btn-green",
  red: "btn-red",
  blue: "btn-blue",
  ghost: "btn-ghost",
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

/** Tombol 3D: border bawah tebal, kilau atas, turun saat ditekan, getar di HP. */
export function Button({ variant = "gold", small, loading, className = "", onClick, disabled, children, ...rest }: ButtonProps) {
  return (
    <button
      {...rest}
      disabled={disabled || loading}
      onClick={(e: MouseEvent<HTMLButtonElement>) => {
        buzz();
        onClick?.(e);
      }}
      className={`btn3d ${VARIANT[variant]} ${small ? "btn-sm" : ""} ${className}`}
    >
      {loading ? <span className="animate-pulse">Tunggu...</span> : children}
    </button>
  );
}

export function LinkButton({
  href,
  variant = "gold",
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
    <Link href={href} onClick={buzz} className={`btn3d ${VARIANT[variant]} ${small ? "btn-sm" : ""} ${className}`}>
      {children}
    </Link>
  );
}
