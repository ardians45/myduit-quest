'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const FREE_FEATURES = [
  { icon: 'pie_chart', text: 'Maks 3 alokasi anggaran', available: true },
  { icon: 'lock', text: 'Dekorasi terkunci per level', available: true },
  { icon: 'document_scanner', text: 'Scan struk 30x/bulan', available: true },
  { icon: 'palette', text: 'Avatar standar', available: true },
];

const PRO_FEATURES = [
  { icon: 'pie_chart', text: 'Alokasi anggaran unlimited', available: true },
  { icon: 'castle', text: 'Unlock semua dekorasi benteng', available: true },
  { icon: 'document_scanner', text: 'Scan struk unlimited (AI)', available: true },
  { icon: 'palette', text: 'Avatar & tema premium', available: true },
  { icon: 'workspace_premium', text: 'Badge "Pro Komandan"', available: true },
  { icon: 'download', text: 'Ekspor data lengkap', available: true },
];

export function UpgradeModal({ isOpen, onClose }: UpgradeModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [email, setEmail] = useState('');
  const [mobile, setMobile] = useState('');
  const [step, setStep] = useState<'info' | 'form'>('info');

  const handleUpgrade = async () => {
    // Validate
    if (!email || !email.includes('@')) {
      setError('Masukkan email yang valid');
      return;
    }
    if (!mobile || mobile.length < 10) {
      setError('Masukkan nomor HP minimal 10 digit');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Generate a unique user ID from localStorage or create one
      let userId = localStorage.getItem('myduit-quest-user-id');
      if (!userId) {
        userId = `user_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
        localStorage.setItem('myduit-quest-user-id', userId);
      }

      const response = await fetch('/api/payment/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, email, mobile }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Gagal membuat payment link');
      }

      if (data.paymentUrl) {
        // Save transaction ID for later verification
        localStorage.setItem('myduit-quest-pending-txn', data.transactionId);
        // Redirect to Mayar checkout page
        window.location.href = data.paymentUrl;
      } else {
        throw new Error('Payment URL tidak ditemukan');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Terjadi kesalahan');
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setStep('info');
    setError(null);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm"
          onClick={(e) => e.target === e.currentTarget && handleClose()}
        >
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="bg-white rounded-t-[32px] sm:rounded-[32px] w-full max-w-2xl shadow-2xl max-h-[90vh] overflow-hidden flex flex-col"
          >
            {/* Header */}
            <div className="relative bg-gradient-to-br from-amber-400 via-yellow-500 to-orange-500 px-6 sm:px-8 pt-8 pb-6 text-white shrink-0">
              <button
                onClick={handleClose}
                className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-white hover:bg-white/30 transition-colors"
              >
                <span className="material-symbols-outlined text-lg">close</span>
              </button>

              <div className="flex items-center gap-4 mb-4">
                <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm shadow-inner overflow-hidden relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-transparent opacity-50"></div>
                  <span className="material-symbols-outlined text-4xl relative z-10 drop-shadow-md">workspace_premium</span>
                </div>
                <div>
                  <h2 className="text-2xl sm:text-3xl font-black drop-shadow-sm tracking-tight">MyDuit Quest</h2>
                  <div className="inline-block bg-white text-orange-500 px-3 py-1 rounded-lg text-xs font-black shadow-sm mt-1 uppercase tracking-widest">
                    PRO LIFETIME
                  </div>
                </div>
              </div>
              <p className="text-white/95 text-sm sm:text-base font-medium">
                {step === 'info' ? 'Tingkatkan petualangan finansialmu, sekali bayar untuk selamanya!' : 'Masukkan data untuk memproses pembayaran aman'}
              </p>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto px-6 sm:px-8 py-6 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
              {step === 'info' ? (
                <>
                  {/* Price */}
                  <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-2xl sm:rounded-3xl p-5 mb-6 sm:mb-8 border border-amber-200/50 text-center relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-amber-400/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:bg-amber-400/20 transition-colors duration-500"></div>
                    <div className="absolute bottom-0 left-0 w-24 h-24 bg-orange-400/10 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2 group-hover:bg-orange-400/20 transition-colors duration-500"></div>
                    
                    <span className="relative z-10 inline-block px-3 py-1 bg-amber-100 text-amber-700 text-xs font-black rounded-full uppercase tracking-widest mb-2 border border-amber-200">Seumur Hidup</span>
                    <div className="flex items-baseline justify-center gap-1.5 mt-1 relative z-10">
                      <span className="text-lg text-amber-700/60 font-bold">Rp</span>
                      <span className="text-4xl sm:text-5xl font-black text-gray-900 tracking-tighter">19.000</span>
                    </div>
                    <p className="text-xs text-gray-500 mt-2 font-medium relative z-10">Sekali bayar, tidak ada biaya bulanan</p>
                  </div>

                  {/* Comparison */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 mb-2">
                    {/* Free Column */}
                    <div className="bg-gray-50 rounded-3xl p-5 border border-gray-100">
                      <div className="flex items-center justify-between mb-4 pb-4 border-b border-gray-200">
                        <span className="text-sm font-black text-gray-500 uppercase tracking-widest">Free Plan</span>
                        <span className="material-symbols-outlined text-gray-300">sentiment_neutral</span>
                      </div>
                      <div className="space-y-3">
                        {FREE_FEATURES.map((feature, idx) => (
                          <div key={idx} className="flex items-start gap-3">
                            <span className="material-symbols-outlined text-gray-400 text-base mt-0.5 shrink-0">
                              {feature.icon}
                            </span>
                            <span className="text-sm text-gray-500 leading-snug">{feature.text}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Pro Column */}
                    <div className="bg-gradient-to-br from-amber-50 to-orange-50/30 rounded-3xl p-5 border-2 border-amber-200 relative overflow-hidden">
                      <div className="absolute -right-6 -top-6 w-24 h-24 bg-amber-400/10 rounded-full blur-2xl"></div>
                      <div className="flex items-center justify-between mb-4 pb-4 border-b border-amber-200/50 relative z-10">
                        <div className="flex items-center gap-1.5">
                          <span className="text-sm font-black text-amber-600 uppercase tracking-widest">Pro Plan</span>
                          <span className="material-symbols-outlined text-amber-500 text-sm animate-pulse">stars</span>
                        </div>
                        <span className="material-symbols-outlined text-amber-500">sentiment_very_satisfied</span>
                      </div>
                      <div className="space-y-3 relative z-10">
                        {PRO_FEATURES.map((feature, idx) => (
                          <div key={idx} className="flex items-start gap-3 group">
                            <div className="w-6 h-6 rounded-full bg-white shadow-sm flex items-center justify-center shrink-0 border border-amber-100 group-hover:scale-110 group-hover:bg-amber-100 transition-all duration-300">
                              <span className="material-symbols-outlined text-amber-500 text-[14px]">
                                {feature.icon}
                              </span>
                            </div>
                            <span className="text-sm text-gray-800 font-medium leading-snug pt-0.5">{feature.text}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  {/* Email & Phone Form */}
                  <div className="space-y-5 max-w-md mx-auto pt-4 sm:pt-8 min-h-[300px]">
                    <div>
                      <label className="text-sm font-bold text-gray-700 mb-2 block">Alamat Email</label>
                      <div className="bg-white rounded-2xl p-4 border-2 border-gray-100 flex items-center gap-3 focus-within:border-amber-400 focus-within:ring-4 focus-within:ring-amber-400/10 transition-all shadow-sm">
                        <span className="material-symbols-outlined text-gray-400">mail</span>
                        <input
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="contoh@email.com"
                          className="bg-transparent text-base font-medium text-gray-900 w-full focus:outline-none placeholder:font-normal placeholder:text-gray-400"
                          autoFocus
                        />
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-bold text-gray-700 mb-2 block">Nomor HP / WhatsApp</label>
                      <div className="bg-white rounded-2xl p-4 border-2 border-gray-100 flex items-center gap-3 focus-within:border-amber-400 focus-within:ring-4 focus-within:ring-amber-400/10 transition-all shadow-sm">
                        <span className="material-symbols-outlined text-gray-400">call</span>
                        <input
                          type="tel"
                          value={mobile}
                          onChange={(e) => setMobile(e.target.value)}
                          placeholder="08123456789"
                          className="bg-transparent text-base font-medium text-gray-900 w-full focus:outline-none placeholder:font-normal placeholder:text-gray-400"
                        />
                      </div>
                    </div>
                    <div className="bg-amber-50 rounded-xl p-4 border border-amber-200 flex items-start gap-3 mt-6">
                      <span className="material-symbols-outlined text-amber-600 shrink-0 text-xl">shield_lock</span>
                      <p className="text-xs text-amber-800 leading-relaxed font-medium">
                        Data privasi Anda terjaga. Email dan nomor HP hanya digunakan untuk mengirimkan bukti pembayaran resmi oleh Mayar.
                      </p>
                    </div>
                  </div>
                </>
              )}

              {/* Error */}
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-3 mb-4 mt-4">
                  <p className="text-xs text-red-600">{error}</p>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="px-6 sm:px-8 pb-6 sm:pb-8 pt-4 sm:pt-6 border-t border-gray-100 bg-white">
              {step === 'info' ? (
                <button
                  onClick={() => setStep('form')}
                  className="w-full sm:w-2/3 mx-auto py-4 rounded-2xl bg-gradient-to-r from-amber-400 to-orange-500 text-white font-black text-lg shadow-xl shadow-amber-200/50 hover:shadow-amber-300/60 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 border border-white/20"
                >
                  <span className="material-symbols-outlined">rocket_launch</span>
                  <span>Upgrade Sekarang</span>
                </button>
              ) : (
                <div className="flex flex-col-reverse sm:flex-row gap-3 max-w-md mx-auto">
                  <button
                    onClick={() => { setStep('info'); setError(null); }}
                    className="w-full sm:w-1/3 py-4 rounded-2xl font-bold text-gray-500 bg-gray-50 border-2 border-transparent hover:border-gray-200 hover:bg-gray-100 transition-all"
                  >
                    Kembali
                  </button>
                  <button
                    onClick={handleUpgrade}
                    disabled={isLoading}
                    className="w-full sm:w-2/3 py-4 rounded-2xl bg-gradient-to-r from-amber-400 to-orange-500 text-white font-black text-lg shadow-xl shadow-amber-200/50 hover:scale-[1.02] hover:shadow-amber-300/60 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 border border-white/20"
                  >
                    {isLoading ? (
                      <>
                        <div className="w-5 h-5 border-3 border-white/30 border-t-white rounded-full animate-spin" />
                        <span>Memproses...</span>
                      </>
                    ) : (
                      <>
                        <span className="material-symbols-outlined">credit_card</span>
                        <span>Bayar Rp 19.000</span>
                      </>
                    )}
                  </button>
                </div>
              )}
              <div className="flex items-center justify-center gap-2 text-gray-400 mt-4">
                <span className="material-symbols-outlined text-sm">lock</span>
                <p className="text-center text-[10px] sm:text-xs">
                  Pembayaran aman terenkripsi oleh Mayar. Mendukung QRIS, e-Wallet, & Virtual Account.
                </p>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
