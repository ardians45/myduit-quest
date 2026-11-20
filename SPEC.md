# Myduit Gweh — Spesifikasi UAS

**Judul:** Rancangan Aplikasi Sistem Informasi Keuangan Pribadi
**Mahasiswa:** Ardian Setiawan · 231011402665 · 07TPLK005
**Visi:** Mencatat keuangan terasa seperti main game: setiap catatan memberi XP, setiap anggaran yang terjaga memberi achievement.

## Syarat dosen yang wajib terpenuhi
1. Aplikasi web, CRUD lengkap pada minimal 3 fitur (di sini ada 7).
2. Minimal 3 role.
3. RBAC yang bisa dikelola (role, permission, dan matriks role-permission bisa diubah admin dari UI).
4. Di-hosting (Vercel), punya akun demo, ada file SQL.

## Stack
Next.js (App Router, versi di package.json) + TypeScript + Tailwind v4 · Supabase (Auth email/password + Postgres + RLS) via `@supabase/ssr` · framer-motion · recharts · canvas-confetti · lucide-react. **Tanpa three.js**: efek 3D pakai CSS 3D transform agar ringan di HP. Mobile-first (lebar 360–430px), tetap rapi di desktop (sidebar). Bisa dipasang sebagai PWA (manifest + ikon).

## Role (3)
| Kode | Nama di UI | Fungsi |
|---|---|---|
| `admin` | Game Master | Kelola pengguna, role, permission, kategori global, master achievement, lihat log aktivitas |
| `mentor` | Mentor Keuangan | Melihat laporan dan ringkasan semua pemain (read-only), melihat log aktivitas, mengelola **Tantangan Harian** (CRUD) yang dikerjakan pemain |
| `pemain` | Hero / Pemain | Mengelola keuangannya sendiri: dompet, transaksi, anggaran, quest tabungan, kategori pribadi |

Pendaftaran baru otomatis mendapat role `pemain`.

## RBAC
- Tabel `roles`, `permissions` (kode `modul.aksi`, mis. `transactions.create`), `role_permissions`, dan `profiles.role_id`.
- Fungsi SQL `public.has_permission(p_code text) returns boolean` (security definer, stable) mengecek permission user yang sedang login. **Setiap policy RLS memakai fungsi ini**, ditambah syarat kepemilikan data (`user_id = auth.uid()`) untuk data pribadi.
- Di sisi app: `getSessionProfile()` mengembalikan profil + daftar kode permission. Komponen `<Can perm="...">`, helper `requirePermission()` di server component/action, dan menu navigasi difilter berdasarkan permission. Mengakses halaman tanpa izin → halaman 403 bertema game ("Area Terkunci").
- Halaman admin **Role & Akses**: CRUD role + matriks checkbox permission × role (perubahan langsung tersimpan). Role `admin` tidak boleh kehilangan `rbac.manage` (dijaga di SQL dan UI).
- Modul permission: `dashboard.view`, `wallets.*`, `transactions.*`, `budgets.*`, `goals.*`, `categories.*` (pribadi), `categories.manage_global`, `challenges.view`, `challenges.manage`, `reports.view_own`, `reports.view_all`, `users.manage`, `rbac.manage`, `achievements.manage`, `logs.view`. (`*` = view/create/update/delete)

## Fitur & CRUD
| Fitur (nama game) | Tabel | Siapa | CRUD |
|---|---|---|---|
| Dompet (Inventory) | `wallets` | pemain | C R U D |
| Transaksi (Loot & Damage) | `transactions` | pemain | C R U D + filter tanggal/jenis/kategori/dompet, pencarian |
| Anggaran (Perisai HP) | `budgets` | pemain | C R U D per kategori per bulan; bar HP turun sesuai pengeluaran |
| Quest Tabungan (Boss) | `savings_goals` + `goal_deposits` | pemain | C R U D, setor dana → HP boss berkurang, kalah = quest selesai |
| Kategori | `categories` | pemain (pribadi), admin (global) | C R U D |
| Tantangan Harian | `challenges` + `challenge_claims` | mentor kelola, pemain klaim | C R U D |
| Pengguna | `profiles` | admin | R U (ubah role, aktif/nonaktif), D (nonaktifkan) |
| Role & Permission | `roles`, `role_permissions` | admin | C R U D |
| Achievement | `achievements` | admin | C R U D |
| Log Aktivitas | `activity_logs` | admin, mentor | R |
| Laporan | view/RPC | pemain (milik sendiri), mentor/admin (semua) | R + grafik |

Saldo dompet = `initial_balance` + pemasukan − pengeluaran (dihitung di view `wallet_balances`, bukan disimpan).

## Gamifikasi (dikerjakan di DB lewat trigger/RPC agar konsisten)
- Mencatat transaksi +10 XP, membuat anggaran +20, setor ke quest +15, quest selesai +100, klaim tantangan = XP sesuai tantangan.
- Level = `floor(sqrt(xp / 50)) + 1`. Gelar per level: Rookie → Saver → Treasurer → Wealth Knight → Legend.
- Streak harian: kalau mencatat hari ini dan kemarin juga mencatat, streak +1; kalau terlewat, streak kembali ke 1.
- Achievement dicek oleh RPC `check_achievements()` setelah aksi penting, dan mengembalikan achievement yang baru terbuka agar UI bisa menampilkan popup + konfeti. Contoh: Langkah Pertama (transaksi pertama), Streak 7 Hari, Penjaga Anggaran, Pembunuh Boss (quest pertama selesai), Kolektor (3 dompet).
- Semua mutasi menulis `activity_logs` (via trigger).

## Arah visual — "dopamin tapi ringan"
Inspirasi diambil dari *genre* UI game mobile (tombol tebal yang "ditekan" seperti di game strategi kartu, warna cerah bergaris tepi tebal, sistem streak/XP ala aplikasi belajar). **Jangan meniru aset, logo, atau nama game tertentu.**
- Tema gelap "night arcade": latar biru-ungu tua bergradien + bintang/partikel CSS halus; aksen emas (koin), hijau zamrud (pemasukan), merah rubi (pengeluaran), biru elektrik (XP).
- Font judul tebal bulat (Google Font "Lilita One" atau "Baloo 2"), body "Nunito".
- **Tombol 3D**: border bawah tebal + `translateY` saat ditekan, kilau di bagian atas, dan getar `navigator.vibrate(10)` di HP.
- **Kartu 3D**: `perspective` + tilt ringan (hover di desktop, tanpa gyro), ikon koin/peti dari CSS 3D yang berputar pelan.
- Animasi umpan balik: angka XP melayang "+10 XP", level-up modal dengan konfeti, bar HP anggaran beranimasi, hitungan angka saldo bergulir.
- Hormati `prefers-reduced-motion`. Tanpa video atau gambar besar. Target Lighthouse mobile performance ≥ 85.
- Navigasi HP: bottom nav 5 tab (Markas, Loot, + besar di tengah, Quest, Profil); menu tambahan per role (admin/mentor) masuk ke tab Profil/"Guild Hall". Di desktop: sidebar.
- Semua teks UI dalam Bahasa Indonesia santai, format uang `Rp 1.250.000`.

## Akun demo (di-seed lewat SQL)
| Role | Email | Password |
|---|---|---|
| Admin | admin@myduitgweh.app | Demo12345! |
| Mentor | mentor@myduitgweh.app | Demo12345! |
| Pemain | pemain@myduitgweh.app | Demo12345! |
Pemain demo diberi data contoh 2 bulan terakhir (3 dompet, ±40 transaksi, 4 anggaran, 2 quest, beberapa achievement).

## File keluaran
- `supabase/migrations/0001_schema.sql` (tabel, view, fungsi, trigger, RLS)
- `supabase/seed.sql` (role, permission, matriks, kategori global, achievement, tantangan, akun demo + data contoh)
- `database/myduit_gweh.sql` = gabungan keduanya (untuk diunggah ke dosen)
- `.env.example`: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `README.md`: deskripsi, cara menjalankan, akun demo, URL hosting
- `docs/UAS_07TPLK005_231011402665_ARDIAN-SETIAWAN.docx` (dibuat terakhir, berisi screenshot)
