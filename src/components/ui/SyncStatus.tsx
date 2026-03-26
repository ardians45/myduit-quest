'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { pullDataFromCloud, syncGameToCloud, syncBudgetToCloud } from '@/lib/sync';
import { useTransactionStore } from '@/stores/transactionStore';
import { syncTransactionToCloud } from '@/lib/sync';
import { motion, AnimatePresence } from 'framer-motion';

export function SyncStatus() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  
  // Magic Link State
  const [email, setEmail] = useState('');
  const [isSendingLink, setIsSendingLink] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  
  // Toast State
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  useEffect(() => {
    // Check active session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user || null);
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user || null);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const handleMagicLinkLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    
    setIsSendingLink(true);
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/profile`,
        },
      });
      
      if (error) throw error;
      setEmailSent(true);
    } catch (error: any) {
      console.error('Error sending magic link:', error);
      showToast(error.message || 'Gagal mengirim link login.', 'error');
    } finally {
      setIsSendingLink(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  const handleManualSync = async () => {
    setSyncing(true);
    try {
      const success = await pullDataFromCloud();
      if (success) {
        // Also push current local state just in case
        await syncGameToCloud();
        await syncBudgetToCloud();
        const txs = useTransactionStore.getState().transactions;
        for (const tx of txs) {
          await syncTransactionToCloud(tx);
        }
        showToast('Sinkronisasi berhasil! Data sudah terupdate.', 'success');
      } else {
        showToast('Gagal mengambil data dari cloud atau data kosong.', 'error');
      }
    } catch (error) {
      console.error(error);
      showToast('Terjadi kesalahan saat sinkronisasi.', 'error');
    } finally {
      setSyncing(false);
    }
  };

  if (loading) {
    return <div className="text-center py-4 text-gray-400 text-sm animate-pulse">Memuat status backup...</div>;
  }

  return (
    <>
      <div className="glass-card rounded-2xl overflow-hidden divide-y divide-gray-50 flex flex-col relative">
        {user ? (
          <>
            <div className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-success/10 text-success flex items-center justify-center">
                  <span className="material-symbols-outlined">cloud_done</span>
                </div>
                <div className="text-left">
                  <p className="font-bold text-gray-800 text-sm">Backup Aktif</p>
                  <p className="text-xs text-gray-400 truncate max-w-[150px]">{user.email}</p>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="text-xs font-bold text-danger bg-danger/10 px-3 py-1.5 rounded-lg hover:bg-danger/20 transition-colors"
              >
                Keluar
              </button>
            </div>
            <button
              onClick={handleManualSync}
              disabled={syncing}
              className="w-full p-4 flex items-center justify-between hover:bg-gray-50/50 transition-colors disabled:opacity-50"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-500 flex items-center justify-center">
                  <span className={`material-symbols-outlined ${syncing ? 'animate-spin' : ''}`}>sync</span>
                </div>
                <div className="text-left">
                  <p className="font-bold text-gray-800 text-sm">{syncing ? 'Menyinkronkan...' : 'Sinkronisasi Manual'}</p>
                  <p className="text-[10px] text-gray-400">Tarik data dari cloud</p>
                </div>
              </div>
            </button>
          </>
        ) : (
          <div className="p-4 flex flex-col gap-3">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                <span className="material-symbols-outlined">mail</span>
              </div>
              <div className="text-left">
                <p className="font-bold text-gray-800 text-sm">Login untuk Backup</p>
                <p className="text-[10px] text-gray-400">Gunakan Email (Tanpa Password)</p>
              </div>
            </div>
            
            {emailSent ? (
              <div className="bg-success/10 border border-success/20 p-3 rounded-xl text-center">
                <span className="material-symbols-outlined text-success mb-1">mark_email_read</span>
                <p className="text-xs font-bold text-success">Link login terkirim!</p>
                <p className="text-[10px] text-gray-500 mt-1">Cek inbox atau folder spam email Anda.</p>
                <button 
                  onClick={() => setEmailSent(false)} 
                  className="text-[10px] font-bold text-primary mt-2"
                >
                  Gunakan email lain
                </button>
              </div>
            ) : (
              <form onSubmit={handleMagicLinkLogin} className="flex flex-col gap-2">
                <input
                  type="email"
                  placeholder="Masukkan alamat email..."
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary transition-colors text-gray-800"
                />
                <button
                  type="submit"
                  disabled={isSendingLink || !email}
                  className="w-full py-3 rounded-xl bg-primary text-white font-bold text-sm shadow-glow hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isSendingLink ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Mengirim...</span>
                    </>
                  ) : (
                    <span>Kirim Link Login</span>
                  )}
                </button>
              </form>
            )}
          </div>
        )}
      </div>

      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 w-[90%] max-w-sm"
          >
            <div className={`p-4 rounded-2xl shadow-2xl flex items-center gap-3 backdrop-blur-md ${
              toast.type === 'success' ? 'bg-success/90 border border-success' : 'bg-danger/90 border border-danger'
            }`}>
              <span className="material-symbols-outlined text-white">
                {toast.type === 'success' ? 'check_circle' : 'error'}
              </span>
              <p className="text-sm font-bold text-white pr-4">
                {toast.message}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
