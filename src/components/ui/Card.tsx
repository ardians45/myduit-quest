import type { CSSProperties, ReactNode } from "react";

/**
 * Kartu glass halus. `hero` = border gradien tipis untuk kartu utama.
 * Prop `gold` dan `tilt` dipertahankan untuk kompatibilitas (gold = hero, tilt diabaikan).
 */
export function Card({
  children,
  className = "",
  hero,
  gold,
  lift,
  style,
}: {
  children: ReactNode;
  className?: string;
  hero?: boolean;
  gold?: boolean;
  tilt?: boolean;
  lift?: boolean;
  style?: CSSProperties;
}) {
  return (
    <div style={style} className={`card ${hero || gold ? "card-hero" : ""} ${lift ? "card-lift" : ""} ${className}`}>
      {children}
    </div>
  );
}
