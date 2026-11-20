# Myduit Gweh

Sistem Informasi Keuangan Pribadi bergaya game. Mencatat keuangan terasa seperti main game: setiap catatan memberi XP, setiap anggaran yang terjaga membuka achievement.

Project UAS: *Rancangan Aplikasi Sistem Informasi Keuangan Pribadi* (Ardian Setiawan, 231011402665, 07TPLK005).

- **URL hosting:** `https://GANTI-DENGAN-URL-VERCEL.vercel.app` (isi setelah deploy)
- **Akun demo:** lihat tabel di bawah

## Fitur

| Fitur (nama game) | Tabel | CRUD |
|---|---|---|
| Dompet (Inventory) | `wallets` | tambah, lihat, ubah, hapus. Saldo dihitung di view `wallet_balances` |
| Transaksi (Loot & Damage) | `transactions` | CRUD + filter tanggal/jenis/kategori/dompet + pencarian |
| Anggaran (Perisai HP) | `budgets` | CRUD per kategori per bulan, bar HP turun sesuai pengeluaran |
| Quest Tabungan (Boss) | `savings_goals`, `goal_deposits` | CRUD + setor dana, boss kalah = quest selesai |
| Kategori | `categories` | pribadi (pemain) dan global (admin) |
| Tantangan Harian | `challenges`, `challenge_claims` | mentor CRUD, pemain klaim XP |
| Pengguna | `profiles` | admin ubah role dan aktif/nonaktif |
| Role & Akses | `roles`, `permissions`, `role_permissions` | CRUD role + matriks checkbox permission |
| Achievement | `achievements`, `user_achievements` | admin CRUD |
| Log Aktivitas | `activity_logs` | admin dan mentor (hanya baca) |
| Laporan | view `monthly_cashflow`, `category_spending` | grafik recharts |

Gamifikasi dikerjakan di database (trigger dan RPC) supaya konsisten:

- Catat transaksi +10 XP, buat anggaran +20, setor ke quest +15, quest selesai +100, klaim tantangan = XP tantangan.
- Level = `floor(sqrt(xp / 50)) + 1`. Gelar: Rookie, Saver, Treasurer, Wealth Knight, Legend.
- Streak harian (zona waktu WIB): lanjut +1 bila kemarin juga mencatat, terlewat kembali ke 1.
- Achievement dicek RPC `check_achievements()` setelah aksi penting; yang baru terbuka memunculkan popup dan konfeti.
- Semua mutasi tercatat di `activity_logs` lewat trigger.

## Role dan RBAC

| Kode | Nama di UI | Fungsi |
|---|---|---|
| `admin` | Game Master | Kelola pengguna, role, permission, kategori global, achievement, lihat log |
| `mentor` | Mentor Keuangan | Lihat laporan semua pemain (read-only), lihat log, kelola Tantangan Harian |
| `pemain` | Hero / Pemain | Kelola keuangan sendiri |

Pendaftaran baru otomatis menjadi `pemain` (trigger `on_auth_user_created`).

RBAC memakai tabel `roles`, `permissions` (kode `modul.aksi`), `role_permissions`, dan `profiles.role_id`. Fungsi SQL `has_permission(kode)` dipakai di **semua** policy RLS, ditambah syarat kepemilikan (`user_id = auth.uid()`) untuk data pribadi. Di sisi app: `getSessionProfile()`, `requirePermission()` (server), komponen `<Can perm="...">` (klien), dan menu navigasi difilter per permission. Akses tanpa izin menampilkan halaman 403 "Area Terkunci". Role dan matriks permission bisa diubah admin di halaman **Role & Akses**; role `admin` tidak bisa kehilangan `rbac.manage`.

## Stack

Next.js 16 (App Router) + TypeScript + Tailwind v4, Supabase (Auth + Postgres + RLS) via `@supabase/ssr`, framer-motion, recharts, canvas-confetti, lucide-react. Efek 3D memakai CSS 3D transform (tanpa three.js). Bisa dipasang sebagai PWA.

## Cara menjalankan

### 1. Siapkan Supabase

1. Buat project di [supabase.com](https://supabase.com) (Postgres 15+).
2. Buka **SQL Editor**, tempel seluruh isi `database/myduit_gweh.sql`, lalu **Run** (sekali jalan). File ini gabungan `supabase/migrations/0001_schema.sql` (tabel, view, fungsi, trigger, RLS) dan `supabase/seed.sql` (role, permission, matriks, kategori global, achievement, tantangan, 3 akun demo + data contoh pemain 2 bulan terakhir). Aman dijalankan ulang.
3. Opsional untuk demo: di **Authentication > Providers > Email** matikan "Confirm email" supaya pendaftaran baru langsung bisa masuk.
4. Ambil **Project URL** dan **anon public key** di **Project Settings > API**.

### 2. Jalankan aplikasi

```bash
npm install
cp .env.example .env.local   # lalu isi nilainya
npm run dev                  # http://localhost:3000
```

Variabel lingkungan (`.env.example`):

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
```

File `.env*` tidak di-commit (kecuali `.env.example`).

### 3. Deploy (Vercel)

Import repo ke Vercel, isi dua variabel lingkungan di atas, deploy. Tidak ada service role key yang dipakai di aplikasi.

### Perintah lain

```bash
npm run build        # build produksi
npx tsc --noEmit     # cek tipe
npm run lint
```

## Akun demo

| Role | Email | Password |
|---|---|---|
| Admin (Game Master) | admin@myduitgweh.app | Demo12345! |
| Mentor Keuangan | mentor@myduitgweh.app | Demo12345! |
| Pemain | pemain@myduitgweh.app | Demo12345! |

Pemain demo berisi 3 dompet, sekitar 40 transaksi, 6 anggaran (4 bulan ini), 3 quest (1 selesai), beberapa tantangan terklaim, dan beberapa achievement.

## Ringkasan RLS

RLS aktif di semua tabel `public`. Pola umum: baca/tulis data pribadi hanya oleh pemilik yang punya permission `modul.aksi`; `reports.view_all` (mentor/admin) memberi akses **baca saja** ke data semua pemain; role, permission, dan achievement boleh dibaca user login tapi hanya ditulis pemegang `rbac.manage` / `achievements.manage`; `activity_logs` hanya dibaca pemegang `logs.view`. XP, level, dan streak tidak bisa diubah klien (dijaga trigger); klaim tantangan, cek achievement, dan pemberian XP berjalan lewat fungsi `security definer`.

## Struktur

```
database/myduit_gweh.sql        schema + seed (untuk SQL Editor / diunggah ke dosen)
supabase/migrations/0001_schema.sql
supabase/seed.sql
src/app/(auth)                  /login, /register
src/app/(app)                   halaman utama + admin (dilindungi sesi dan permission)
src/lib/supabase                client browser, server, dan proxy (refresh sesi)
src/proxy.ts                    refresh sesi + redirect ke /login
src/components                  UI 3D, umpan balik game, shell navigasi
```
