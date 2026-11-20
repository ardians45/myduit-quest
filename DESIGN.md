# Myduit Gweh — Arah Desain v2 ("Modern Arcade")

Menggantikan bagian "Arah visual" di SPEC.md. Tujuannya: terasa seperti menu game modern yang premium (bersih, tajam, bercahaya halus), bukan kartun. Tetap ringan di HP.

## Aturan keras
1. **Nol emoji** di seluruh UI, kode, dan data. Semua ikon pakai `lucide-react` atau aset SVG buatan sendiri.
2. Data yang dulu menyimpan emoji (`categories.icon`, `wallets.icon`, `savings_goals.icon`, `challenges.icon`, `achievements.icon`, `profiles.avatar`) sekarang menyimpan **kunci ikon** (mis. `utensils`, `wallet`, `trophy`) atau **kunci avatar** (mis. `knight`). Satu registry (`src/lib/icons.ts`) memetakan kunci ke komponen lucide atau aset kustom. Kunci tidak dikenal → ikon fallback `circle-dot`.
3. Tanpa three.js, tanpa gambar raster besar. Semua aset berupa SVG inline atau komponen React.

## Fondasi visual
- **Warna (token CSS di :root):**
  - Latar `#070A14` dengan dua glow radial lembut (violet di kiri atas, cyan di kanan bawah).
  - Surface `rgba(255,255,255,0.04)` dengan border `rgba(255,255,255,0.08)`; surface-2 sedikit lebih terang.
  - Teks `#E8ECF8`, muted `#8A93B2`.
  - Aksen: violet `#8B5CF6` (utama/XP), cyan `#22D3EE` (info), gold `#F5B83D` (koin/level), emerald `#34D399` (pemasukan), rose `#FB7185` (pengeluaran/damage).
- **Tipografi** (next/font/google): display "Sora" (600–800) untuk judul dan angka besar; body "Plus Jakarta Sans". Angka uang pakai `font-variant-numeric: tabular-nums`. Hapus Lilita One / Nunito.
- **Bentuk:** radius 16–20px untuk kartu dan 12px untuk input. Kartu glass halus (backdrop-blur hanya di nav/sheet, bukan di setiap kartu, demi performa). Border gradien tipis 1px pada kartu "hero".
- **Ikon:** lucide stroke 2, ukuran 18–22. Ikon fitur diletakkan di "tile" 40px rounded-xl dengan gradien warna kategori pada opacity rendah, plus ikon berwarna penuh.
- **Tombol:** primer bergradien violet ke indigo, dengan inner highlight di atas dan shadow bawah tipis (efek 3D halus). Saat ditekan `translateY(1px)` + scale 0.98. Varian: secondary (surface), ghost, danger. Tidak ada border tebal kartun.
- **Gerak:** framer-motion, durasi 150–250ms, spring halus. Masuk halaman: fade+rise stagger kecil. Hormati `prefers-reduced-motion`.

## Aset SVG buatan sendiri (`src/components/art/`)
Semua berupa komponen React SVG, dengan gradien dan id unik (`useId`):
- `CoinMark`: koin emas bertepi, dengan "G" monogram, untuk logo/brand. Ganti Coin/Cube CSS lama.
- `LevelEmblem`: perisai/hex bertingkat dengan angka level di tengah; warna berubah per tier gelar (Rookie abu-perak, Saver hijau, Treasurer emas, Wealth Knight violet, Legend gradien pelangi halus).
- `StreakFlame`: api bergradien, untuk streak.
- `XpBar`: bar dengan segmen dan kilau bergerak.
- `HpShield`: perisai untuk anggaran (bar HP), berubah warna hijau → kuning → merah.
- `BossSigil`: ilustrasi "boss" abstrak geometris untuk quest tabungan (tidak meniru karakter mana pun), dengan HP ring melingkar.
- `Chest`: peti harta untuk dompet/total saldo.
- `Badge` achievement: medali hex dengan ikon lucide di tengah; versi terkunci grayscale.
- **Set avatar (8 avatar karakter abstrak geometris, berpalet sendiri):** `knight`, `mage`, `ranger`, `rogue`, `owl` (mentor), `dragon`, `robot`, `fox`. Profil bisa memilih avatar.
- **Ilustrasi empty state** (3): belum ada transaksi, belum ada quest, akses terkunci (403). Bentuk geometris sederhana.
- Ikon PWA dan favicon memakai `CoinMark`.

## Pola layout
- **HP:** top bar tipis berisi logo, chip streak, dan chip level (LevelEmblem mini). Bottom nav melayang (floating pill, blur) dengan 4 tab + tombol aksi tengah (lingkaran gradien, ikon `plus`). Tab aktif diberi indikator glow.
- **Desktop ≥1024px:** sidebar kiri 260px (logo, menu bergrup per role, kartu profil mini di bawah), konten max-width 1200px, grid 12 kolom.
- **Markas:** kartu hero (avatar + LevelEmblem + XpBar + streak), kartu saldo (Chest + angka besar beranimasi), statistik bulan ini (pemasukan/pengeluaran dengan sparkline kecil), quest aktif (BossSigil + ring), anggaran kritis (HpShield), tantangan hari ini, dan transaksi terbaru.
- **List:** baris rapi berisi tile ikon, judul, meta muted, dan nominal kanan berwarna. Aksi ubah/hapus lewat menu `more-horizontal` atau swipe-friendly button, bukan teks "Ubah/Hapus" besar.
- **Form:** bottom sheet di HP dan modal di desktop. Input dengan label kecil di atas, pilihan ikon lewat **icon picker grid** (dari registry), pilihan warna lewat swatch.
- **Grafik (recharts):** warna dari token, grid tipis, tooltip gelap kustom.
- **Admin matriks RBAC:** tabel sticky header dan kolom pertama, switch modern (bukan checkbox mentah), grup per modul dengan ikon modul.
- **Umpan balik game:** toast "+10 XP" (pill violet dengan ikon `sparkles`), modal level-up (LevelEmblem membesar + konfeti warna token), dan popup achievement (Badge berputar masuk).
