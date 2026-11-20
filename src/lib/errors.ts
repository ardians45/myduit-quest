/** Terjemahkan error Supabase/Postgres menjadi pesan Indonesia yang ramah. */
export function friendlyError(error: { message?: string; code?: string } | null | undefined): string {
  if (!error) return "Terjadi kesalahan.";
  const msg = error.message ?? "";
  if (error.code === "42501" || /row-level security|permission denied/i.test(msg)) {
    return "Kamu tidak punya izin untuk aksi ini.";
  }
  if (error.code === "23505") return "Data yang sama sudah ada.";
  if (error.code === "23503") return "Data ini masih dipakai oleh data lain, jadi belum bisa dihapus.";
  if (error.code === "23514") return "Isian belum valid. Periksa lagi angka dan tanggalnya.";
  if (/Failed to fetch|NetworkError/i.test(msg)) return "Tidak bisa terhubung ke server. Cek koneksimu.";
  return msg || "Terjadi kesalahan.";
}
