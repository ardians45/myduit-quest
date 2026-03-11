'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useProStore } from '@/stores/proStore';

export default function UpgradeSuccessPage() {
  const router = useRouter();
  const { setPro } = useProStore();
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    // Mark as Pro
    const pendingTxn = localStorage.getItem('myduit-quest-pending-txn');
    setPro(pendingTxn || undefined);
    localStorage.removeItem('myduit-quest-pending-txn');
  }, [setPro]);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          router.push('/profile');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [router]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 via-white to-orange-50 font-display flex items-center justify-center p-6">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', damping: 20, stiffness: 200 }}
        className="w-full max-w-sm text-center"
      >
        {/* Celebratory Icon */}
        <motion.div
          initial={{ rotate: -10, scale: 0 }}
          animate={{ rotate: 0, scale: 1 }}
          transition={{ delay: 0.2, type: 'spring', damping: 15 }}
          className="w-24 h-24 bg-gradient-to-br from-amber-400 to-yellow-500 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-amber-200/50"
        >
          <span className="material-symbols-outlined text-5xl text-white">workspace_premium</span>
        </motion.div>

        {/* Text */}
        <motion.h1
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-2xl font-black text-gray-900 mb-2"
        >
          Selamat, Komandan! 🎉
        </motion.h1>

        <motion.p
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-gray-500 mb-8 leading-relaxed"
        >
          Kamu sekarang pengguna <strong className="text-amber-600">MyDuit Quest Pro</strong>!
          Semua fitur premium sudah terbuka.
        </motion.p>

        {/* Features Unlocked */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="bg-white rounded-3xl p-5 shadow-soft mb-8 text-left"
        >
          <p className="text-xs font-bold text-amber-600 uppercase tracking-wider mb-3">Fitur yang terbuka:</p>
          <div className="space-y-2.5">
            {[
              { icon: 'castle', text: 'Semua dekorasi benteng' },
              { icon: 'document_scanner', text: 'Scan struk unlimited' },
              { icon: 'pie_chart', text: 'Alokasi anggaran tak terbatas' },
              { icon: 'palette', text: 'Avatar & tema premium' },
              { icon: 'workspace_premium', text: 'Badge Pro Komandan' },
            ].map((item, idx) => (
              <motion.div
                key={idx}
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.6 + idx * 0.1 }}
                className="flex items-center gap-3"
              >
                <div className="w-8 h-8 rounded-xl bg-amber-50 flex items-center justify-center">
                  <span className="material-symbols-outlined text-amber-500 text-lg">{item.icon}</span>
                </div>
                <span className="text-sm text-gray-700 font-medium">{item.text}</span>
                <span className="material-symbols-outlined text-emerald-400 text-lg ml-auto">check_circle</span>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Redirect */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
        >
          <button
            onClick={() => router.push('/profile')}
            className="w-full py-4 rounded-2xl bg-gradient-to-r from-amber-400 to-orange-500 text-white font-bold shadow-lg shadow-amber-200/50 hover:scale-[1.02] active:scale-[0.98] transition-all"
          >
            Lanjutkan ke Profil
          </button>
          <p className="text-xs text-gray-400 mt-3">
            Redirect otomatis dalam {countdown} detik...
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
}
