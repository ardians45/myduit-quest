<div align="center">
  <!-- BANNER -->
  <img src="https://raw.githubusercontent.com/ardians45/myduit-quest/main/public/banner.png" alt="MyDuit Quest Banner" width="100%" style="border-radius: 12px;" onerror="this.src='https://raw.githubusercontent.com/framer/motion/main/public/framer-motion.png'" />
  <br/>
  
  <h1>🛡️ MyDuit Quest ⚔️</h1>
  <p><b>Aplikasi Pencatat Keuangan Gamifikasi Paling Mutakhir dengan Kecerdasan Buatan (AI)</b></p>
  <p><i>Ubah kebiasaan finansialmu dari membosankan menjadi petualangan RPG yang epik!</i></p>
  
  <p>
    <b>🔥 Coba Web-nya Sekarang:</b><br/>
    <a href="https://myduit-quest.vercel.app/" target="_blank">👉 <b>https://myduit-quest.vercel.app/</b> 👈</a>
  </p>

  <p>
    <a href="#-kenapa-myduit-quest">Kenapa MyDuit Quest?</a> •
    <a href="#-kompetitor-vs-myduit-quest">Vs Kompetitor</a> •
    <a href="#-fitur-utama">Fitur</a> •
    <a href="#-teknologi">Teknologi</a> •
    <a href="#-mulai-petualangan">Mulai</a>
  </p>

  <p>
    <img src="https://img.shields.io/badge/Next.js-16.1.6-black?style=for-the-badge&logo=next.js" alt="Next.js" />
    <img src="https://img.shields.io/badge/React-19.2.3-blue?style=for-the-badge&logo=react" alt="React" />
    <img src="https://img.shields.io/badge/Tailwind_CSS-v4-38B2AC?style=for-the-badge&logo=tailwind-css" alt="Tailwind CSS" />
    <img src="https://img.shields.io/badge/Supabase-Auth_%26_DB-3ECF8E?style=for-the-badge&logo=supabase" alt="Supabase" />
    <img src="https://img.shields.io/badge/Google_Gemini-AI_Scanner-8E75B2?style=for-the-badge&logo=google" alt="Google Gemini" />
  </p>
</div>

---

## 🌟 Kenapa MyDuit Quest?

Mencatat pengeluaran setiap hari itu membosankan. Kebanyakan orang gagal memantau uang mereka karena aplikasinya kaku, terasa seperti tabel akuntansi, dan tidak memberikan *reward* atas kedisiplinan mereka. 

**MyDuit Quest** mendobrak batasan tersebut! Kami menggabungkan **manajemen keuangan, elemen RPG (Role-Playing Game), dan AI (Artificial Intelligence)**. Anggaran bulananmu adalah *Health Points* (HP) sebuah Benteng. Catat transaksi, lindungi bentengmu dari serangan "pengeluaran", kumpulkan *Experience* (XP), naik level, dan pamerkan pencapaianmu!

---

## 🥊 Kompetitor vs MyDuit Quest

Apa yang membuat kami jauh lebih unggul dibandingkan aplikasi *tracker* keuangan tradisional di App Store atau Play Store?

| Fitur | Aplikasi Tradisional | 🛡️ MyDuit Quest |
| :--- | :--- | :--- |
| **Input Data** | Mengetik manual satu per satu, rawan salah ketik. | **✨ AI Receipt Scanner (Gemini):** Tinggal foto struk, AI kami akan otomatis mendeteksi total harga, nama barang, dan merekomendasikan kategori! |
| **Sistem Login** | Harus hapal *password*, rawan diretas. | **🔒 Passwordless Magic Link & Google:** Login super aman dalam 1 detik tanpa perlu repot mengetik kata sandi. Didukung infrastruktur Supabase. |
| **Motivasi** | Hanya melihat grafik garis dan sisa saldo. | **🏰 Visualisasi Benteng 3D & Leveling:** Sisa uangmu diubah menjadi visual Benteng 3D. Kamu bisa naik level, membuka kunci dekorasi (bendera, pancuran air, dll), dan koleksi *Achievement/Badge*. |
| **Penyimpanan** | Seringkali hanya lokal, hilang jika HP rusak. | **☁️ Cloud Sync Super Aman:** Datamu dicadangkan ke ekosistem Supabase secara otomatis dan *real-time* antar semua perangkatmu. |
| **UI/UX** | Kaku, putih-abu-abu, terasa seperti Excel. | **🎨 Premium Glassmorphism & Animasi:** Desain *dark mode* modern dengan *micro-interactions* tingkat dewa via Framer Motion. |

---

## ✨ Fitur Utama

- 📸 **Scan Struk AI (Gemini 2.5 Flash)**: Menggunakan kecerdasan buatan Google secara visual. Deteksi pengeluaran langsung dari foto struk minimarket, restoran, tanpa perlu mengetik manual. Menghemat waktumu hingga 90%!
- 🔮 **Supabase Magic Auth**: Sistem login tanpa sandi, cepat, dan sangat terlindungi.
- 🏰 **Sistem HP Benteng**: Lihat langsung kondisi finansialmu. Apabila pengeluaran terlalu besar, benteng akan kritis dan hancur di layar Misi.
- 🚀 **RPG Leveling & Streak Engine**: Setiap transaksi memberikanmu +10 XP. Pertahankan *Streak* harian layaknya Duolingo untuk disiplin keuangan tingkat dewa.
- 🏆 **Achievement Unlocks**: Hadiahkan dirimu lencana digital berdasarkan kebiasaan keuangan yang baik. Buka kustomisasi dekorasi benteng saat mencapai level tertentu.
- 📱 **Mobile First & PWA Ready**: Dirancang khusus agar terlihat spektakuler dan mulus di layar sentuh HP dan desktop. Tampilan satu layar utuh tanpa perlu *scroll* melelahkan.

---

## 🛠️ Teknologi

Proyek ini menggunakan *stack* mutakhir yang sangat modern dan skalabel:

- **Frontend:** Next.js 16 (App Router), React 19, TypeScript
- **Styling & Animasi:** Tailwind CSS v4, Framer Motion
- **State Management:** Zustand (Persist)
- **Backend & Auth:** Supabase (PostgreSQL)
- **AI Engine:** Google Gemini SDK (`@google/genai`) untuk *Computer Vision* (Receipt Analyzing)

---

## 🚀 Mulai Petualangan

Siap melindungi finansialmu?

### Prasyarat
- Node.js 18.x+, npm/yarn/pnpm
- Akun [Supabase](https://supabase.com) (Untuk Database & Auth)
- API Key [Google AI Studio (Gemini)](https://aistudio.google.com/app/apikey)

### Instalasi Cepat

1. **Clone repository ini**
   ```bash
   git clone https://github.com/ardians45/myduit-quest.git
   cd myduit-quest
   ```

2. **Install Dependensi**
   ```bash
   npm install
   ```

3. **Konfigurasi Environment (.env.local)**
   Buat file `.env.local` di root proyek dan isi kredensial berikut:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   GEMINI_API_KEY=your_gemini_api_key
   ```

4. **Jalankan Quest!**
   ```bash
   npm run dev
   ```
   **Buka `http://localhost:3000` dan mulailah membangun bentengmu! 🏰**

---

<div align="center">
  Dibuat dengan ❤️, ☕, dan ✨ AI untuk mengubah cara dunia menabung.<br/>
  <b>Time to Level Up Your Finance!</b>
</div>
