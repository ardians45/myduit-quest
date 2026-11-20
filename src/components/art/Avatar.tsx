import { useId, type ReactNode } from "react";

export const AVATAR_KEYS = ["knight", "mage", "ranger", "rogue", "owl", "dragon", "robot", "fox"] as const;
export type AvatarKey = (typeof AVATAR_KEYS)[number];

export const AVATAR_LABELS: Record<AvatarKey, string> = {
  knight: "Ksatria",
  mage: "Penyihir",
  ranger: "Pemanah",
  rogue: "Bayangan",
  owl: "Hantu Bijak",
  dragon: "Naga",
  robot: "Robot",
  fox: "Rubah",
};

export function isAvatarKey(v: unknown): v is AvatarKey {
  return typeof v === "string" && (AVATAR_KEYS as readonly string[]).includes(v);
}

/** Warna latar tiap avatar (dua stop gradien). */
const BG: Record<AvatarKey, [string, string]> = {
  knight: ["#4F46E5", "#1E1B5E"],
  mage: ["#7C3AED", "#2B1170"],
  ranger: ["#059669", "#064E3B"],
  rogue: ["#475569", "#0F172A"],
  owl: ["#B45309", "#451A03"],
  dragon: ["#0E7490", "#164E63"],
  robot: ["#0891B2", "#1E1B4B"],
  fox: ["#EA580C", "#7C2D12"],
};

const SKIN = "#F6CFAE";
const DARK = "#0B1022";

function Shapes({ k, id }: { k: AvatarKey; id: string }): ReactNode {
  switch (k) {
    case "knight":
      return (
        <>
          <defs>
            <linearGradient id={`${id}-m`} x1="0" y1="0" x2="1" y2="1">
              <stop stopColor="#F1F4FC" />
              <stop offset="1" stopColor="#8E98B8" />
            </linearGradient>
          </defs>
          <path d="M8 64 C8 52 20 48 32 48 C44 48 56 52 56 64 Z" fill="#8E98B8" />
          <polygon points="29,14 35,14 47,3 31,4" fill="#FB7185" />
          <path d="M17 44 V28 C17 19 23 13 32 13 C41 13 47 19 47 28 V44 C47 49 40 53 32 53 C24 53 17 49 17 44 Z" fill={`url(#${id}-m)`} />
          <rect x="20" y="28" width="24" height="7" rx="3.5" fill={DARK} />
          <rect x="23" y="30" width="18" height="1.6" rx="0.8" fill="#22D3EE" />
          <path d="M32 13 V28" stroke="#6B7394" strokeWidth="1.5" />
          <path d="M26 40 H38 M27 45 H37" stroke="#6B7394" strokeWidth="1.5" strokeLinecap="round" />
        </>
      );
    case "mage":
      return (
        <>
          <path d="M8 64 C8 52 20 48 32 48 C44 48 56 52 56 64 Z" fill="#5B3FD0" />
          <circle cx="32" cy="42" r="11" fill={SKIN} />
          <path d="M21 44 Q32 66 43 44 Q32 52 21 44 Z" fill="#F4F6FF" />
          <circle cx="27.5" cy="40" r="1.6" fill={DARK} />
          <circle cx="36.5" cy="40" r="1.6" fill={DARK} />
          <ellipse cx="32" cy="32" rx="21" ry="5" fill="#6D4BD8" />
          <path d="M32 3 L46 32 H18 Z" fill="#8B5CF6" />
          <path d="M32 3 L39 18 L25 18 Z" fill="#fff" fillOpacity="0.14" />
          <rect x="18" y="27" width="28" height="4" fill="#F5B83D" />
          <circle cx="32" cy="16" r="2.4" fill="#FFE08A" />
        </>
      );
    case "ranger":
      return (
        <>
          <path d="M8 64 C8 52 20 48 32 48 C44 48 56 52 56 64 Z" fill="#065F46" />
          <path d="M13 52 C13 24 21 11 32 11 C43 11 51 24 51 52 Z" fill="#10B981" />
          <ellipse cx="32" cy="37" rx="11" ry="13" fill={SKIN} />
          <path d="M14 40 C18 30 24 24 32 24 C40 24 46 30 50 40 C46 34 40 31 32 31 C24 31 18 34 14 40 Z" fill="#047857" />
          <circle cx="27.5" cy="38" r="1.6" fill={DARK} />
          <circle cx="36.5" cy="38" r="1.6" fill={DARK} />
          <path d="M28 44 Q32 47 36 44" stroke="#B5694B" strokeWidth="1.6" fill="none" strokeLinecap="round" />
          <path d="M45 10 C50 6 55 8 57 12 C52 12 49 14 45 18 Z" fill="#F5B83D" />
          <path d="M20 52 H44 L40 58 H24 Z" fill="#34D399" />
        </>
      );
    case "rogue":
      return (
        <>
          <path d="M8 64 C8 52 20 48 32 48 C44 48 56 52 56 64 Z" fill="#1F2937" />
          <path d="M44 50 L58 60 L50 62 Z" fill="#FB7185" />
          <path d="M14 46 C12 26 20 10 32 8 C44 10 52 26 50 46 C46 52 18 52 14 46 Z" fill="#273148" />
          <path d="M18 34 H46 V43 C46 47 40 50 32 50 C24 50 18 47 18 43 Z" fill="#111827" />
          <path d="M20 36 H44 V40 H20 Z" fill={SKIN} />
          <ellipse cx="26.5" cy="38" rx="3.2" ry="1.7" fill="#22D3EE" />
          <ellipse cx="37.5" cy="38" rx="3.2" ry="1.7" fill="#22D3EE" />
          <path d="M32 8 L35 18 H29 Z" fill="#3B4660" />
        </>
      );
    case "owl":
      return (
        <>
          <path d="M8 64 C8 52 18 48 32 48 C46 48 56 52 56 64 Z" fill="#92400E" />
          <path d="M20 54 L32 64 L44 54" fill="none" stroke="#F5B83D" strokeWidth="2.5" strokeLinejoin="round" />
          <polygon points="14,22 20,8 28,17" fill="#B45309" />
          <polygon points="50,22 44,8 36,17" fill="#B45309" />
          <ellipse cx="32" cy="34" rx="20" ry="19" fill="#D97706" />
          <path d="M20 44 Q32 58 44 44 Q32 50 20 44 Z" fill="#FDE68A" />
          <circle cx="24" cy="32" r="9" fill="#FFF7E0" />
          <circle cx="40" cy="32" r="9" fill="#FFF7E0" />
          <circle cx="24.5" cy="32.5" r="4.6" fill="#6D4BD8" />
          <circle cx="39.5" cy="32.5" r="4.6" fill="#6D4BD8" />
          <circle cx="24.5" cy="32.5" r="2" fill={DARK} />
          <circle cx="39.5" cy="32.5" r="2" fill={DARK} />
          <circle cx="26" cy="30.5" r="1.1" fill="#fff" />
          <circle cx="41" cy="30.5" r="1.1" fill="#fff" />
          <polygon points="32,36 28,42 36,42" fill="#F5B83D" />
        </>
      );
    case "dragon":
      return (
        <>
          <path d="M8 64 C8 54 20 50 32 50 C44 50 56 54 56 64 Z" fill="#047857" />
          <polygon points="18,24 12,6 27,17" fill="#F5B83D" />
          <polygon points="46,24 52,6 37,17" fill="#F5B83D" />
          <path d="M16 32 C16 20 23 15 32 15 C41 15 48 20 48 32 V42 C48 51 41 56 32 56 C23 56 16 51 16 42 Z" fill="#10B981" />
          <path d="M22 40 H42 V46 C42 51 38 54 32 54 C26 54 22 51 22 46 Z" fill="#6EE7B7" />
          <circle cx="28" cy="46" r="1.4" fill="#065F46" />
          <circle cx="36" cy="46" r="1.4" fill="#065F46" />
          <path d="M20 30 L28 33 L21 35 Z" fill="#FFE08A" />
          <path d="M44 30 L36 33 L43 35 Z" fill="#FFE08A" />
          <rect x="21" y="30.8" width="1.6" height="3" fill={DARK} />
          <rect x="41.4" y="30.8" width="1.6" height="3" fill={DARK} />
          <polygon points="29,15 32,8 35,15" fill="#34D399" />
        </>
      );
    case "robot":
      return (
        <>
          <rect x="10" y="50" width="44" height="14" rx="6" fill="#4F46E5" />
          <rect x="29" y="5" width="6" height="12" rx="2" fill="#94A3B8" />
          <circle cx="32" cy="6" r="4" fill="#22D3EE" />
          <rect x="12" y="16" width="40" height="34" rx="10" fill="#CBD5E1" />
          <rect x="7" y="27" width="6" height="12" rx="3" fill="#8B5CF6" />
          <rect x="51" y="27" width="6" height="12" rx="3" fill="#8B5CF6" />
          <rect x="17" y="22" width="30" height="17" rx="6" fill={DARK} />
          <rect x="22" y="27" width="7" height="7" rx="3.5" fill="#22D3EE" />
          <rect x="35" y="27" width="7" height="7" rx="3.5" fill="#22D3EE" />
          <path d="M23 44 H41" stroke="#64748B" strokeWidth="2" strokeLinecap="round" strokeDasharray="3 3" />
        </>
      );
    case "fox":
      return (
        <>
          <path d="M8 64 C8 54 20 50 32 50 C44 50 56 54 56 64 Z" fill="#9A3412" />
          <path d="M8 12 L25 24 H39 L56 12 L54 40 C50 54 41 58 32 58 C23 58 14 54 10 40 Z" fill="#F97316" />
          <path d="M13 16 L23 24 L14 30 Z" fill="#7C2D12" />
          <path d="M51 16 L41 24 L50 30 Z" fill="#7C2D12" />
          <path d="M12 40 C16 36 24 40 32 50 C40 40 48 36 52 40 C48 54 41 58 32 58 C23 58 16 54 12 40 Z" fill="#FFF3E6" />
          <circle cx="24" cy="35" r="2" fill={DARK} />
          <circle cx="40" cy="35" r="2" fill={DARK} />
          <path d="M28 48 H36 L32 53 Z" fill={DARK} />
        </>
      );
  }
}

/** Avatar karakter geometris. Kunci tak dikenal (mis. nilai lama) jatuh ke `knight`. */
export function Avatar({
  name,
  size = 48,
  rounded = "xl",
  ring,
  className = "",
}: {
  name: string | null | undefined;
  size?: number;
  rounded?: "xl" | "full";
  ring?: boolean;
  className?: string;
}) {
  const id = useId();
  const k: AvatarKey = isAvatarKey(name) ? name : "knight";
  const [a, b] = BG[k];
  const r = rounded === "full" ? 32 : 16;
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      className={`shrink-0 ${className}`}
      style={ring ? { filter: "drop-shadow(0 0 6px rgba(139,92,246,0.55))" } : undefined}
      role="img"
      aria-label={`Avatar ${AVATAR_LABELS[k]}`}
    >
      <defs>
        <linearGradient id={`${id}-bg`} x1="0" y1="0" x2="1" y2="1">
          <stop stopColor={a} />
          <stop offset="1" stopColor={b} />
        </linearGradient>
        <clipPath id={`${id}-clip`}>
          <rect width="64" height="64" rx={r} />
        </clipPath>
      </defs>
      <g clipPath={`url(#${id}-clip)`}>
        <rect width="64" height="64" fill={`url(#${id}-bg)`} />
        <circle cx="50" cy="12" r="20" fill="#fff" fillOpacity="0.08" />
        <Shapes k={k} id={id} />
      </g>
      <rect x="0.75" y="0.75" width="62.5" height="62.5" rx={r - 0.75} fill="none" stroke="#fff" strokeOpacity={ring ? 0.5 : 0.18} strokeWidth="1.5" />
    </svg>
  );
}
