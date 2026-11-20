import { useId } from "react";

function Frame({ children, size, label }: { children: (id: string) => React.ReactNode; size: number; label: string }) {
  const id = useId();
  return (
    <svg width={size} height={(size * 3) / 4} viewBox="0 0 160 120" role="img" aria-label={label}>
      <defs>
        <radialGradient id={`${id}-halo`} cx="0.5" cy="0.5" r="0.5">
          <stop stopColor="#8B5CF6" stopOpacity="0.35" />
          <stop offset="1" stopColor="#8B5CF6" stopOpacity="0" />
        </radialGradient>
      </defs>
      <ellipse cx="80" cy="60" rx="70" ry="52" fill={`url(#${id}-halo)`} />
      {children(id)}
    </svg>
  );
}

/** Belum ada transaksi: gulungan buku kas dengan koin. */
export function EmptyTransactions({ size = 160 }: { size?: number }) {
  return (
    <Frame size={size} label="Belum ada transaksi">
      {(id) => (
        <>
          <defs>
            <linearGradient id={`${id}-p`} x1="0" y1="0" x2="1" y2="1">
              <stop stopColor="#2A3160" />
              <stop offset="1" stopColor="#161B3A" />
            </linearGradient>
            <linearGradient id={`${id}-c`} x1="0" y1="0" x2="1" y2="1">
              <stop stopColor="#FFE9A6" />
              <stop offset="1" stopColor="#D98F10" />
            </linearGradient>
          </defs>
          <rect x="42" y="18" width="76" height="86" rx="12" fill={`url(#${id}-p)`} stroke="#fff" strokeOpacity="0.16" />
          <rect x="54" y="34" width="34" height="5" rx="2.5" fill="#8B5CF6" />
          <rect x="54" y="48" width="52" height="4" rx="2" fill="#fff" fillOpacity="0.14" />
          <rect x="54" y="60" width="44" height="4" rx="2" fill="#fff" fillOpacity="0.14" />
          <rect x="54" y="72" width="50" height="4" rx="2" fill="#fff" fillOpacity="0.14" />
          <circle cx="112" cy="90" r="19" fill={`url(#${id}-c)`} stroke="#8A5206" strokeOpacity="0.4" strokeWidth="1.5" />
          <circle cx="112" cy="90" r="13.5" fill="none" stroke="#FFF3C4" strokeOpacity="0.7" strokeDasharray="1.5 3" />
          <path d="M116 85 A7 7 0 1 0 117.5 90 H111" fill="none" stroke="#7A4A06" strokeWidth="3.4" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M30 40 l3 7 l7 3 l-7 3 l-3 7 l-3 -7 l-7 -3 l7 -3 Z" fill="#22D3EE" fillOpacity="0.8" />
        </>
      )}
    </Frame>
  );
}

/** Belum ada quest: bendera di puncak segitiga. */
export function EmptyQuest({ size = 160 }: { size?: number }) {
  return (
    <Frame size={size} label="Belum ada quest">
      {(id) => (
        <>
          <defs>
            <linearGradient id={`${id}-m`} x1="0" y1="0" x2="0" y2="1">
              <stop stopColor="#4B3AA8" />
              <stop offset="1" stopColor="#1A1650" />
            </linearGradient>
            <linearGradient id={`${id}-f`} x1="0" y1="0" x2="1" y2="0">
              <stop stopColor="#FB7185" />
              <stop offset="1" stopColor="#E11D48" />
            </linearGradient>
          </defs>
          <polygon points="14,104 62,44 92,84 110,62 148,104" fill={`url(#${id}-m)`} stroke="#fff" strokeOpacity="0.14" strokeLinejoin="round" />
          <polygon points="62,44 75,60 62,58 52,60" fill="#fff" fillOpacity="0.16" />
          <line x1="62" y1="44" x2="62" y2="14" stroke="#E8ECF8" strokeWidth="3" strokeLinecap="round" />
          <polygon points="64,15 90,22 64,31" fill={`url(#${id}-f)`} />
          <circle cx="62" cy="13" r="3" fill="#F5B83D" />
          <circle cx="130" cy="30" r="2.5" fill="#22D3EE" fillOpacity="0.8" />
          <circle cx="26" cy="46" r="2" fill="#F5B83D" fillOpacity="0.8" />
        </>
      )}
    </Frame>
  );
}

/** Akses terkunci (403): perisai dengan gembok. */
export function EmptyLocked({ size = 160 }: { size?: number }) {
  return (
    <Frame size={size} label="Akses terkunci">
      {(id) => (
        <>
          <defs>
            <linearGradient id={`${id}-s`} x1="0" y1="0" x2="0" y2="1">
              <stop stopColor="#3B2F8F" />
              <stop offset="1" stopColor="#1A1450" />
            </linearGradient>
            <linearGradient id={`${id}-g`} x1="0" y1="0" x2="1" y2="1">
              <stop stopColor="#FFE9A6" />
              <stop offset="1" stopColor="#D98F10" />
            </linearGradient>
          </defs>
          <path d="M80 10 L120 24 V58 C120 82 102 100 80 110 C58 100 40 82 40 58 V24 Z" fill={`url(#${id}-s)`} stroke="#8B5CF6" strokeOpacity="0.7" strokeWidth="2" />
          <path d="M80 20 L112 31 V58 C112 76 98 91 80 100 Z" fill="#fff" fillOpacity="0.06" />
          <path d="M68 54 V46 C68 39 73 35 80 35 C87 35 92 39 92 46 V54" fill="none" stroke="#E8ECF8" strokeWidth="5" strokeLinecap="round" />
          <rect x="62" y="52" width="36" height="28" rx="7" fill={`url(#${id}-g)`} />
          <circle cx="80" cy="64" r="4" fill="#5B3A06" />
          <rect x="78.4" y="66" width="3.2" height="9" rx="1.6" fill="#5B3A06" />
          <circle cx="28" cy="34" r="2.5" fill="#FB7185" fillOpacity="0.8" />
          <circle cx="138" cy="84" r="2.5" fill="#22D3EE" fillOpacity="0.8" />
        </>
      )}
    </Frame>
  );
}
