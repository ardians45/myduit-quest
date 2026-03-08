<div align="center">
  <img src="https://raw.githubusercontent.com/framer/motion/main/public/framer-motion.png" alt="MyDuit Quest Banner" width="100%" style="max-height: 200px; object-fit: cover; border-radius: 12px;" />
  <br/>
  
  <h1>🦊 MyDuit Quest 🏰</h1>
  <p><b>Ubah kebiasaan mencatat keuanganmu menjadi petualangan RPG yang seru!</b></p>

  <p>
    <a href="#about">Tentang</a> •
    <a href="#fitur-utama">Fitur</a> •
    <a href="#tech-stack">Teknologi</a> •
    <a href="#alur-dan-mekanik-game">Mekanik</a> •
    <a href="#getting-started">Mulai</a>
  </p>

  <p>
    <img src="https://img.shields.io/badge/Next.js-16.1.6-black?style=for-the-badge&logo=next.js" alt="Next.js" />
    <img src="https://img.shields.io/badge/React-19.2.3-blue?style=for-the-badge&logo=react" alt="React" />
    <img src="https://img.shields.io/badge/Tailwind_CSS-v4-38B2AC?style=for-the-badge&logo=tailwind-css" alt="Tailwind CSS" />
    <img src="https://img.shields.io/badge/Zustand-State_Management-yellow?style=for-the-badge" alt="Zustand" />
    <img src="https://img.shields.io/badge/Framer_Motion-Animation-FF0055?style=for-the-badge&logo=framer" alt="Framer Motion" />
  </p>
</div>

---

## 📖 About
**MyDuit Quest** adalah aplikasi pencatatan keuangan pribadi dengan pendekatan gamifikasi (Gamified Personal Finance Tracker). Berbeda dengan aplikasi keuangan konvensional yang kaku dan membosankan, MyDuit Quest mengajak pengguna untuk merawat sebuah "Benteng Pertahanan" virtual.

Semakin sering pengguna mencatat transaksi dan menjaga pengeluaran (*budget*), benteng mereka akan semakin kuat, XP bertambah, dan level meningkat! Tapi awas, pengeluaran yang tidak terkontrol akan mengurangi *Health Points* (HP) bentengmu!

## ✨ Fitur Utama
- 💰 **Manajemen Keuangan Pintar**: Catat *Income* (pemasukan) & *Expense* (pengeluaran) dengan mudah dan cepat.
- 🛡️ **Sistem Benteng (Health Points)**: Budget bulananmu adalah HP benteng. Setiap pengeluaran akan mengurangi HP. Jaga agar benteng tidak kritis!
- 📈 **Leveling & XP Engine**: Dapatkan XP (Experience Points) untuk setiap transaksi yang tercatat. Kumpulkan XP dan naikkan levelmu dari pemula menjadi master!
- 🔥 **Streak Harian**: Bangun kebiasaan disiplin dengan sistem streak. Catat keuangan tiap hari dan pertahankan api semangatmu!
- 🎖️ **Sistem Pencapaian (Achievements)**: Dapatkan *badge* eksklusif dengan menyelesaikan misi finansial seperti "Mulai Petualangan", "Budget Master", hingga "Saver Pro".
- 🎨 **Kustomisasi Dekorasi**: Buka berbagai dekorasi eksklusif (bendera, taman, obor) saat kamu mencapai level tertentu, dan hias bentengmu sesuka hati.

## 🛠️ Tech Stack
Proyek ini dibangun dengan teknologi modern untuk memastikan performa yang cepat, interaksi yang mulus, dan pengelolaan status yang handal:

| Teknologi | Deskripsi |
| --- | --- |
| **Next.js (App Router)** | Framework React utama untuk rendering dan routing halaman. |
| **React 19** | Library UI utama dengan dukungan fitur terbaru. |
| **TypeScript** | Memastikan *type safety* di seluruh proyek untuk mencegah bug. |
| **Tailwind CSS v4** | *Utility-first CSS framework* untuk styling komponen secara efisien. |
| **Zustand (Persist)** | Manajemen *state global* yang sangat ringan. Digunakan untuk menyimpan data transaksi, game progress, dan budget secara persisten di Local Storage. |
| **Framer Motion** | Digunakan untuk memberikan animasi mulus dan interaktif pada komponen UI & transisi halaman. |
| **Heroicons & Material Symbols** | *Icon library* untuk melengkapi kebutuhan visualisasi aplikasi. |

## 🎮 Alur dan Mekanik Game

1. **Onboarding**: Pengguna menetapkan Avatar dan *Monthly Budget* (Anggaran Bulanan). Budget ini menjadi batas maksimal pengeluaran (Max HP).
2. **Dashboard**: Menampilkan visual 3D/2D dari Benteng yang menyesuaikan secara otomatis dengan status HP dan Level.
   - 🟢 **Aman (>70% HP)**: Pengeluaran terjaga.
   - 🟠 **Waspada (<70% HP)**: Harus mulai berhemat.
   - 🔴 **Kritis (<40% HP)**: Zona bahaya, batas budget segera tercapai.
3. **Pencatatan Transaksi**:
   - Jika mencatat **Income**, saldo total bertambah.
   - Jika mencatat **Expense**, saldo total dan sisa budget/HP berkurang.
   - Menambahkan catatan apapun akan memberikan **XP** instan (+10 XP) dan menambah/menjaga **Streak**.
4. **Level Up & Reward**: Setelah XP memenuhi target (*nextLevelXP*), pemain naik level. Ini membuka opsi **Dekorasi** baru di menu Battle/Gudang.

## 🚀 Getting Started

Ikuti langkah-langkah di bawah ini untuk menjalankan aplikasi secara lokal di komputermu.

### Prasyarat
- Node.js (versi 18.x ke atas direkomendasikan)
- npm, pnpm, atau yarn

### Instalasi & Menjalankan Development Server

1. **Clone repository ini**
   ```bash
   git clone https://github.com/ardians45/myduit-quest.git
   cd myduit-quest
   ```

2. **Install dependensi**
   ```bash
   npm install
   # atau
   yarn install
   # atau
   pnpm install
   ```

3. **Jalankan Development Server**
   ```bash
   npm run dev
   # atau
   yarn dev
   # atau
   pnpm dev
   ```

4. **Buka di Browser**  
   Buka `http://localhost:3000` di broswermu untuk melihat versi lokal yang sudah berjalan.

## 📁 Struktur Direktori Utama

```
myduit-quest/
├── src/
│   ├── app/                # Next.js App Router (Halaman & Routing)
│   │   ├── dashboard/      # Menu Utama (Benteng, Stats, Tips)
│   │   ├── battle/         # Menu Achievements & Dekorasi
│   │   ├── add/            # Form Tambah Transaksi
│   │   └── ...
│   ├── components/         # Reusable Components (Layout, Visuals, UI)
│   │   ├── layout/         # BottomBar, Header, dsb
│   │   ├── visuals/        # Komponen Visual seperti "Fortress3D"
│   │   └── ...
│   └── stores/             # Zustand State Management
│       ├── budgetStore.ts      # Budget & HP state
│       ├── transactionStore.ts # Manajemen riwayat Transaksi
│       └── gameStore.ts        # Level, XP, Decorations, Achievements logic
├── package.json            # Daftar dependensi
└── tailwind.config.ts      # (Atau langsung postcss config di Tailwind v4)
```

## 🤝 Kontribusi (Contributing)
Kontribusi sangat terbuka! Jika kamu memiliki ide fitur (seperti Boss Fight untuk tagihan bulanan, atau Item Shop), silakan buat *Pull Request* atau sampaikan di *Issues*. 

1. **Fork** repository ini
2. Buat branch fitur baru (`git checkout -b feature/FiturBaruAmazing`)
3. Commit perubahanmu (`git commit -m 'Menambahkan Fitur Baru Amazing'`)
4. Push ke branch (`git push origin feature/FiturBaruAmazing`)
5. Buka **Pull Request**

---
<div align="center">
  Dibuat dengan ❤️ untuk mengubah cara kita melihat keuangan pribadi. <br/>
  <b>Time to Level Up Your Finance!</b>
</div>
