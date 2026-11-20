/** Koin CSS 3D yang berputar pelan (tanpa three.js). */
export function Coin3D({ size = 56, label = "G" }: { size?: number; label?: string }) {
  return (
    <div className="stage3d" aria-hidden style={{ width: size, height: size }}>
      <div className="coin" style={{ ["--s" as string]: `${size}px` }}>
        {[-2, -1, 0, 1, 2].map((n) => (
          <i key={n} style={{ ["--n" as string]: n }} />
        ))}
        <b className="front">{label}</b>
        <b className="back">{label}</b>
      </div>
    </div>
  );
}

/** Peti/kubus CSS 3D berputar, isi emoji di tiap sisi. */
export function Cube3D({ size = 56, emoji = "🎁" }: { size?: number; emoji?: string }) {
  return (
    <div className="stage3d" aria-hidden style={{ width: size, height: size }}>
      <div className="cube" style={{ ["--s" as string]: `${size}px` }}>
        {["f1", "f2", "f3", "f4", "f5", "f6"].map((f) => (
          <span key={f} className={f}>
            {emoji}
          </span>
        ))}
      </div>
    </div>
  );
}
