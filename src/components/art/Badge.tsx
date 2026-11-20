import { useId } from "react";
import { Lock } from "lucide-react";
import { AppIcon } from "@/lib/icons";

/** Medali heksagon achievement. `locked` = grayscale dengan gembok. */
export function AchievementBadge({
  icon,
  locked = false,
  size = 64,
  className = "",
}: {
  icon: string | null | undefined;
  locked?: boolean;
  size?: number;
  className?: string;
}) {
  const id = useId();
  return (
    <div className={`relative inline-grid shrink-0 place-items-center ${className}`} style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox="0 0 64 64" className="absolute inset-0" aria-hidden>
        <defs>
          <linearGradient id={`${id}-g`} x1="10" y1="4" x2="54" y2="62" gradientUnits="userSpaceOnUse">
            {locked ? (
              <>
                <stop stopColor="#4A5170" />
                <stop offset="1" stopColor="#2A3050" />
              </>
            ) : (
              <>
                <stop stopColor="#FFE9A6" />
                <stop offset="0.5" stopColor="#F5B83D" />
                <stop offset="1" stopColor="#B8730F" />
              </>
            )}
          </linearGradient>
        </defs>
        <polygon points="32,3 58,17.5 58,46.5 32,61 6,46.5 6,17.5" fill={`url(#${id}-g)`} />
        <polygon points="32,10 52,21 52,43 32,54 12,43 12,21" fill="#0B1022" fillOpacity={locked ? 0.75 : 0.6} stroke="#fff" strokeOpacity="0.2" />
        {!locked && <path d="M32 3 L58 17.5 L32 32 L6 17.5 Z" fill="#fff" fillOpacity="0.14" />}
      </svg>
      <AppIcon name={icon} size={Math.round(size * 0.42)} className={`relative ${locked ? "text-[#6B7394]" : "text-[#FFE08A]"}`} />
      {locked && (
        <span className="absolute -bottom-0.5 -right-0.5 grid h-5 w-5 place-items-center rounded-full border border-white/15 bg-[#161B30] text-[#8A93B2]">
          <Lock size={11} />
        </span>
      )}
    </div>
  );
}
