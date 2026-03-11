'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const FREE_FEATURES = [
  { icon: 'account_balance_wallet', text: '1 dompet saja', available: true },
  { icon: 'pie_chart', text: 'Maks 3 alokasi anggaran', available: true },
  { icon: 'lock', text: 'Dekorasi terkunci per level', available: true },
  { icon: 'document_scanner', text: 'Scan struk 30x/bulan', available: true },
  { icon: 'palette', text: 'Avatar standar', available: true },
];

const PRO_FEATURES = [
  { icon: 'account_balance_wallet', text: 'Dompet tak terbatas', available: true },
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
            className="bg-white rounded-t-[32px] sm:rounded-[32px] w-full max-w-md shadow-2xl max-h-[90vh] overflow-hidden flex flex-col"
          >
            {/* Header */}
            <div className="relative bg-gradient-to-br from-amber-400 via-yellow-500 to-orange-500 px-6 pt-8 pb-6 text-white">
              <button
                onClick={handleClose}
                className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-white hover:bg-white/30 transition-colors"
              >
                <span className="material-symbols-outlined text-lg">close</span>
              </button>

              <div className="flex items-center gap-3 mb-3">
                <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                  <span className="material-symbols-outlined text-3xl">workspace_premium</span>
                </div>
                <div>
                  <h2 className="text-xl font-black">MyDuit Quest</h2>
                  <div className="inline-block bg-white/25 px-2 py-0.5 rounded-md text-xs font-bold backdrop-blur-sm">
                    PRO
                  </div>
                </div>
              </div>
              <p className="text-white/90 text-sm">
                {step === 'info' ? 'Upgrade sekali, akses selamanya!' : 'Masukkan data untuk pembayaran'}
              </p>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto px-6 py-5">
              {step === 'info' ? (
                <>
                  {/* Price */}
                  <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-2xl p-4 mb-5 border border-amber-200/50 text-center">
                    <span className="text-xs text-amber-600 font-bold uppercase tracking-wider">Seumur Hidup</span>
                    <div className="flex items-baseline justify-center gap-1 mt-1">
                      <span className="text-sm text-gray-400">Rp</span>
                      <span className="text-3xl font-black text-gray-900">19.000</span>
                    </div>
                    <p className="text-[10px] text-gray-400 mt-1">Sekali bayar, akses lifetime ✨</p>
                  </div>

                  {/* Comparison */}
                  <div className="grid grid-cols-2 gap-3 mb-4">
                    {/* Free Column */}
                    <div>
                      <div className="text-center mb-3">
                        <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Free</span>
                      </div>
                      <div className="space-y-2">
                        {FREE_FEATURES.map((feature, idx) => (
                          <div key={idx} className="flex items-start gap-1.5">
                            <span className="material-symbols-outlined text-gray-300 text-sm mt-0.5">
                              {feature.icon}
                            </span>
                            <span className="text-[11px] text-gray-500 leading-tight">{feature.text}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Pro Column */}
                    <div>
                      <div className="text-center mb-3">
                        <div className="inline-flex items-center gap-1 text-xs font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-lg uppercase tracking-wider">
                          <span className="material-symbols-outlined text-xs">workspace_premium</span>
                          Pro
                        </div>
                      </div>
                      <div className="space-y-2">
                        {PRO_FEATURES.map((feature, idx) => (
                          <div key={idx} className="flex items-start gap-1.5">
                            <span className="material-symbols-outlined text-amber-500 text-sm mt-0.5">
                              {feature.icon}
                            </span>
                            <span className="text-[11px] text-gray-700 font-medium leading-tight">{feature.text}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  {/* Email & Phone Form */}
                  <div className="space-y-4">
                    <div>
                      <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5 block">Email</label>
                      <div className="bg-gray-50 rounded-xl p-3 border border-gray-100 flex items-center gap-2">
                        <span className="material-symbols-outlined text-gray-400 text-lg">mail</span>
                        <input
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="contoh@email.com"
                          className="bg-transparent text-sm font-medium text-gray-900 w-full focus:outline-none"
                          autoFocus
                        />
                      </div>
                    </div>
                    <div>
                      <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5 block">Nomor HP</label>
                      <div className="bg-gray-50 rounded-xl p-3 border border-gray-100 flex items-center gap-2">
                        <span className="material-symbols-outlined text-gray-400 text-lg">phone</span>
                        <input
                          type="tel"
                          value={mobile}
                          onChange={(e) => setMobile(e.target.value)}
                          placeholder="08123456789"
                          className="bg-transparent text-sm font-medium text-gray-900 w-full focus:outline-none"
                        />
                      </div>
                    </div>
                    <div className="bg-amber-50 rounded-xl p-3 border border-amber-100">
                      <p className="text-[11px] text-amber-700 leading-relaxed">
                        <span className="font-bold">🔒 Data aman.</span> Email dan HP digunakan sebagai bukti pembayaran oleh Mayar.
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
            <div className="px-6 pb-6 pt-2 border-t border-gray-100">
              {step === 'info' ? (
                <button
                  onClick={() => setStep('form')}
                  className="w-full py-4 rounded-2xl bg-gradient-to-r from-amber-400 to-orange-500 text-white font-bold text-base shadow-lg shadow-amber-200/50 hover:shadow-amber-300/60 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                >
                  <span className="material-symbols-outlined">rocket_launch</span>
                  <span>Upgrade Sekarang - Rp 19.000</span>
                </button>
              ) : (
                <div className="flex gap-3">
                  <button
                    onClick={() => { setStep('info'); setError(null); }}
                    className="flex-1 py-4 rounded-2xl font-bold text-gray-500 hover:bg-gray-100 transition-colors"
                  >
                    Kembali
                  </button>
                  <button
                    onClick={handleUpgrade}
                    disabled={isLoading}
                    className="flex-[2] py-4 rounded-2xl bg-gradient-to-r from-amber-400 to-orange-500 text-white font-bold shadow-lg shadow-amber-200/50 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {isLoading ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Memproses...</span>
                      </>
                    ) : (
                      <span>Bayar Rp 19.000</span>
                    )}
                  </button>
                </div>
              )}
              <p className="text-center text-[10px] text-gray-400 mt-3">
                Pembayaran diproses oleh Mayar. Mendukung QRIS, Transfer Bank, & E-Wallet.
              </p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
