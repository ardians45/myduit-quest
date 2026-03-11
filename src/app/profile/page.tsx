'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { BottomNav } from '@/components/layout/BottomNav';
import { useBudgetStore, useTransactionStore, useGameStore, useProStore } from '@/stores';
import { SyncStatus } from '@/components/ui/SyncStatus';
import { deleteAllCloudData } from '@/lib/sync';
import { ProBadge } from '@/components/ui/ProBadge';
import { UpgradeModal } from '@/components/ui/UpgradeModal';

const AVATAR_OPTIONS = [
  '/avatar.png',
  'https://api.dicebear.com/7.x/adventurer/svg?seed=Felix&backgroundColor=c0aede',
  'https://api.dicebear.com/7.x/adventurer/svg?seed=Aneka&backgroundColor=b6e3f4',
  'https://api.dicebear.com/7.x/adventurer/svg?seed=Mimi&backgroundColor=ffdfbf',
  'https://api.dicebear.com/7.x/bottts/svg?seed=Robo&backgroundColor=d1d4f9',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Leo&backgroundColor=c0aede',
];

export default function ProfilePage() {
  const router = useRouter();
  const { monthlyBudget, setMonthlyBudget } = useBudgetStore();
  const { transactions } = useTransactionStore();
  const { xp, level, streak, achievements, getLevelName, getLevelProgress, username, avatar, updateProfile } = useGameStore();
  const { isPro } = useProStore();
  
  const [showBudgetModal, setShowBudgetModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [showEditProfileModal, setShowEditProfileModal] = useState(false);
  
  const [newBudget, setNewBudget] = useState(monthlyBudget.toString());
  const [newUsername, setNewUsername] = useState(username || 'Komandan');
  const [newAvatar, setNewAvatar] = useState(avatar || '/avatar.png');
  const [notifications, setNotifications] = useState(true);
  const [mounted, setMounted] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);
  
  const levelProgress = getLevelProgress();

  const formatCurrency = (value: number) => 
    new Intl.NumberFormat('id-ID').format(value);

  const handleSaveBudget = () => {
    const budget = Number(newBudget.replace(/\D/g, ''));
    if (budget >= 100000) {
      setMonthlyBudget(budget);
      setShowBudgetModal(false);
    }
  };

  const handleSaveProfile = () => {
    if (newUsername.trim().length > 0) {
      updateProfile(newUsername.trim(), newAvatar);
      setShowEditProfileModal(false);
    }
  };

  const handleDeleteAllData = async () => {
    setIsDeleting(true);
    try {
      // Delete cloud data first (if user is logged in)
      await deleteAllCloudData();
    } catch (e) {
      console.error('Failed to wipe cloud data', e);
    }
    
    // Clear local storage and redirect
    localStorage.clear();
    window.location.href = '/onboarding';
  };

  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleExport = (format: 'json' | 'csv') => {
    let content: string;
    let filename: string;
    let mimeType: string;
    
    if (format === 'json') {
      // Export full state from localStorage for backup
      const backupData = {
        game: localStorage.getItem('myduit-quest-game'),
        transactions: localStorage.getItem('myduit-quest-transactions'),
        budget: localStorage.getItem('myduit-quest-budget'),
        exportedAt: new Date().toISOString(),
      };
      
      content = JSON.stringify(backupData, null, 2);
      filename = `myduit-quest-backup-${new Date().toISOString().split('T')[0]}.json`;
      mimeType = 'application/json';
    } else {
      // Export just transactions for CSV
      const headers = ['Tanggal', 'Tipe', 'Jumlah', 'Kategori', 'Catatan'];
      const rows = transactions.map(t => [
        t.date,
        t.type === 'expense' ? 'Pengeluaran' : 'Pemasukan',
        t.amount,
        t.category,
        t.note || '',
      ]);
      content = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
      filename = `myduit-quest-transactions-${new Date().toISOString().split('T')[0]}.csv`;
      mimeType = 'text/csv';
    }
    
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const result = e.target?.result as string;
        const backupData = JSON.parse(result);
        
        // Basic validation checking if it's our backup structure
        if (backupData.game !== undefined && backupData.transactions !== undefined) {
          if (backupData.game) localStorage.setItem('myduit-quest-game', backupData.game);
          if (backupData.transactions) localStorage.setItem('myduit-quest-transactions', backupData.transactions);
          if (backupData.budget) localStorage.setItem('myduit-quest-budget', backupData.budget);
          
          alert('Data berhasil dipulihkan! Halaman akan dimuat ulang.');
          location.reload();
        } else {
          alert('Format file backup tidak valid.');
        }
      } catch (error) {
        alert('Gagal membaca file backup.');
        console.error('Import error:', error);
      }
    };
    reader.readAsText(file);
    
    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  if (!mounted) {
    return (
      <div className="min-h-screen bg-bg-light font-display pb-32 relative overflow-hidden flex items-center justify-center">
        <div className="animate-pulse flex flex-col items-center">
          <div className="w-16 h-16 rounded-full bg-gray-200 mb-4"></div>
          <div className="h-4 w-32 bg-gray-200 rounded mb-2"></div>
        </div>
        <BottomNav />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg-light font-display pb-32 relative overflow-hidden">
      
      {/* Background Elements */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 w-full h-[400px] bg-gradient-to-b from-primary/10 to-transparent"></div>
        <div className="absolute top-[-100px] right-[-100px] w-[300px] h-[300px] bg-primary/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-[100px] left-[-50px] w-[200px] h-[200px] bg-blue-300/20 rounded-full blur-3xl"></div>
      </div>

      {/* Desktop Container Wrapper */}
      <div className="flex flex-col md:max-w-5xl md:mx-auto md:px-6 relative z-10 w-full">

      {/* Header */}
      <header className="relative z-10 px-6 pt-12 pb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Profil Komandan</h1>
          <p className="text-gray-500 text-sm">Kelola akun & data</p>
        </div>
        <button 
          onClick={() => {
            setNewUsername(username || 'Komandan');
            setNewAvatar(avatar || '/avatar.png');
            setShowEditProfileModal(true);
          }}
          className="w-10 h-10 glass-card rounded-xl flex items-center justify-center text-primary shadow-soft hover:bg-primary/10 transition-colors"
        >
          <span className="material-symbols-outlined">edit</span>
        </button>
      </header>

      <main className="px-6 relative z-10 flex flex-col gap-6">
        
        {/* Profile Card */}
        <div className="glass-card rounded-[32px] p-6 relative overflow-hidden shadow-soft">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-primary/10 to-transparent rounded-bl-[100px]"></div>
          
          <div className="flex items-center gap-4 relative z-10">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary to-purple-600 p-1 shadow-glow relative">
              <div className="w-full h-full bg-white rounded-full flex items-center justify-center overflow-hidden">
                <img src={avatar || "/avatar.png"} alt="Profile Avatar" className="w-full h-full object-cover" />
              </div>
              <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-gold rounded-full border-2 border-white flex items-center justify-center shadow-sm">
                <span className="text-xs font-bold text-white mb-0.5">{level}</span>
              </div>
            </div>
            
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-gray-900 truncate max-w-[140px]">{username || 'Komandan'}</h2>
                {isPro && <ProBadge size="sm" />}
              </div>
              <div className="flex items-center gap-1.5 mb-2">
                <div className="bg-primary/5 inline-block px-2 py-0.5 rounded-lg border border-primary/10">
                  <p className="text-xs font-bold text-primary">{getLevelName()}</p>
                </div>
                {!isPro && (
                  <div className="bg-gray-100 inline-block px-2 py-0.5 rounded-lg">
                    <p className="text-[9px] font-bold text-gray-400 uppercase">Free</p>
                  </div>
                )}
              </div>
              
              {/* XP Bar */}
              <div className="relative h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                <div 
                  className="absolute top-0 left-0 h-full bg-gradient-to-r from-primary to-purple-400"
                  style={{ width: `${levelProgress.percentage}%` }}
                ></div>
              </div>
              <div className="flex justify-between mt-1">
                <span className="text-[10px] text-gray-400 font-bold">{xp} XP</span>
                <span className="text-[10px] text-gray-400 font-bold">Next: {levelProgress.max}</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3 mt-6 pt-6 border-t border-gray-100">
            <div className="flex flex-col items-center justify-center glass-card rounded-2xl py-3 px-1 shadow-sm hover:shadow-md transition-shadow">
              <span className="material-symbols-outlined text-[22px] text-emerald-400 mb-1.5 drop-shadow-sm">receipt_long</span>
              <span className="block text-2xl font-black text-gray-800 leading-none">{transactions.length}</span>
              <span className="text-[9px] text-gray-400 font-bold uppercase tracking-widest mt-2">TRANSAKSI</span>
            </div>
            <div className="flex flex-col items-center justify-center glass-card rounded-2xl py-3 px-1 shadow-sm hover:shadow-md transition-shadow">
              <span className="material-symbols-outlined text-[22px] text-orange-400 mb-1.5 drop-shadow-sm">local_fire_department</span>
              <span className="block text-2xl font-black text-gray-800 leading-none">{streak}</span>
              <span className="text-[9px] text-gray-400 font-bold uppercase tracking-widest mt-2">STREAK</span>
            </div>
            <div className="flex flex-col items-center justify-center glass-card rounded-2xl py-3 px-1 shadow-sm hover:shadow-md transition-shadow">
              <span className="material-symbols-outlined text-[22px] text-purple-500 mb-1.5 drop-shadow-sm">emoji_events</span>
              <span className="block text-2xl font-black text-gray-800 leading-none">{achievements.length}</span>
              <span className="text-[9px] text-gray-400 font-bold uppercase tracking-widest mt-2">MEDALI</span>
            </div>
          </div>
        </div>

        {/* Pro Plan Banner */}
        {!isPro && (
          <button 
            onClick={() => setShowUpgradeModal(true)}
            className="relative overflow-hidden rounded-[24px] p-5 text-left group active:scale-[0.98] transition-transform"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-amber-400 via-yellow-500 to-orange-500" />
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMjAiIGN5PSIyMCIgcj0iMSIgZmlsbD0id2hpdGUiIGZpbGwtb3BhY2l0eT0iMC4xIi8+PC9zdmc+')] opacity-30" />
            <div className="relative z-10 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                  <span className="material-symbols-outlined text-white text-2xl">workspace_premium</span>
                </div>
                <div>
                  <p className="font-black text-white text-sm">Upgrade ke Pro</p>
                  <p className="text-white/80 text-xs">Unlock semua fitur • Rp 19.000</p>
                </div>
              </div>
              <span className="material-symbols-outlined text-white/80 group-hover:translate-x-1 transition-transform">arrow_forward</span>
            </div>
          </button>
        )}

        {/* Pro Status Card (if Pro) */}
        {isPro && (
          <div className="glass-card rounded-[24px] p-4 border border-amber-200/50 bg-gradient-to-r from-amber-50/80 to-orange-50/80">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-yellow-500 flex items-center justify-center">
                <span className="material-symbols-outlined text-white text-xl">workspace_premium</span>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <p className="font-bold text-gray-800 text-sm">MyDuit Quest Pro</p>
                  <ProBadge size="sm" />
                </div>
                <p className="text-xs text-gray-400">Semua fitur premium aktif</p>
              </div>
            </div>
          </div>
        )}

        {/* Settings Menu */}
        <div className="flex flex-col gap-4">
          
          <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider pl-2">Pengaturan Umum</h3>
          
          <button 
            onClick={() => setShowBudgetModal(true)}
            className="glass-card p-4 rounded-2xl flex items-center justify-between group active:scale-[0.98] transition-transform"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-orange-50 text-orange-500 flex items-center justify-center">
                <span className="material-symbols-outlined">account_balance_wallet</span>
              </div>
              <div className="text-left">
                <p className="font-bold text-gray-800 text-sm">Atur Anggaran</p>
                <p className="text-xs text-gray-400">Rp {formatCurrency(monthlyBudget)}</p>
              </div>
            </div>
            <span className="material-symbols-outlined text-gray-300 group-hover:text-primary transition-colors">chevron_right</span>
          </button>

          <div className="glass-card rounded-2xl overflow-hidden divide-y divide-gray-50">
            <div className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-500 flex items-center justify-center">
                  <span className="material-symbols-outlined">notifications</span>
                </div>
                <div className="text-left">
                  <p className="font-bold text-gray-800 text-sm">Notifikasi Harian</p>
                  <p className="text-xs text-gray-400">Pengingat catat transaksi</p>
                </div>
              </div>
              <button 
                onClick={() => setNotifications(!notifications)}
                className={`w-12 h-6 rounded-full relative transition-colors ${notifications ? 'bg-success' : 'bg-gray-200'}`}
              >
                <div className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow-sm transition-all ${notifications ? 'left-7' : 'left-1'}`}></div>
              </button>
            </div>
          </div>

          <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider pl-2 mt-2">Data & Keamanan</h3>
          
          <SyncStatus />
          
          <div className="glass-card rounded-2xl overflow-hidden divide-y divide-gray-50 mt-4">
            <button 
              onClick={() => handleExport('json')}
              className="w-full p-4 flex items-center justify-between hover:bg-gray-50/50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-green-50 text-green-500 flex items-center justify-center">
                  <span className="material-symbols-outlined">description</span>
                </div>
                <div className="text-left">
                  <p className="font-bold text-gray-800 text-sm">Backup Data (JSON)</p>
                </div>
              </div>
              <span className="material-symbols-outlined text-gray-300">download</span>
            </button>
            <button 
              onClick={() => fileInputRef.current?.click()}
              className="w-full p-4 flex items-center justify-between hover:bg-gray-50/50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-500 flex items-center justify-center">
                  <span className="material-symbols-outlined">upload_file</span>
                </div>
                <div className="text-left">
                  <p className="font-bold text-gray-800 text-sm">Import Data (JSON)</p>
                </div>
              </div>
              <span className="material-symbols-outlined text-gray-300">upload</span>
            </button>
            <input 
              type="file" 
              accept=".json" 
              className="hidden" 
              ref={fileInputRef} 
              onChange={handleImport} 
            />
            <button 
              onClick={() => handleExport('csv')}
              className="w-full p-4 flex items-center justify-between hover:bg-gray-50/50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-500 flex items-center justify-center">
                  <span className="material-symbols-outlined">table_view</span>
                </div>
                <div className="text-left">
                  <p className="font-bold text-gray-800 text-sm">Export Excel (CSV)</p>
                </div>
              </div>
              <span className="material-symbols-outlined text-gray-300">download</span>
            </button>
          </div>

          <button 
            onClick={() => setShowDeleteModal(true)}
            className="glass-card p-4 rounded-2xl flex items-center gap-3 group active:scale-[0.98] transition-transform border border-danger/10 text-danger hover:bg-danger/5"
          >
            <div className="w-10 h-10 rounded-xl bg-danger/10 flex items-center justify-center">
              <span className="material-symbols-outlined">delete_forever</span>
            </div>
            <div className="text-left">
              <p className="font-bold text-sm">Hapus Semua Data</p>
              <p className="text-xs opacity-70">Aksi ini tidak dapat dibatalkan</p>
            </div>
          </button>
          
          <div className="text-center py-6 text-gray-400">
            <p className="text-[10px] font-bold tracking-widest uppercase">MyDuit Quest v1.0</p>
          </div>

        </div>
      </main>
      </div>

      {/* Budget Modal */}
      <AnimatePresence>
        {showBudgetModal && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-[32px] p-6 w-full max-w-xs shadow-2xl"
            >
              <h3 className="text-lg font-bold text-gray-900 mb-4 text-center">Atur Anggaran Bulanan</h3>
              
              <div className="bg-gray-50 rounded-2xl p-4 mb-6 border border-gray-100">
                <span className="text-xs text-gray-400 font-bold uppercase mb-1 block">Target Baru</span>
                <div className="flex items-center">
                  <span className="text-gray-400 font-bold mr-2">Rp</span>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={formatCurrency(Number(newBudget.replace(/\D/g, '')))}
                    onChange={(e) => setNewBudget(e.target.value)}
                    className="bg-transparent text-xl font-black text-gray-900 w-full focus:outline-none"
                    autoFocus
                  />
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowBudgetModal(false)}
                  className="flex-1 py-3 rounded-xl font-bold text-gray-500 hover:bg-gray-100 transition-colors"
                >
                  Batal
                </button>
                <button
                  onClick={handleSaveBudget}
                  className="flex-1 py-3 rounded-xl bg-primary text-white font-bold shadow-glow hover:scale-[1.02] transition-transform"
                >
                  Simpan
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete Modal */}
      <AnimatePresence>
        {showDeleteModal && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-[32px] p-6 w-full max-w-xs shadow-2xl text-center"
            >
              <div className="w-16 h-16 bg-danger/10 text-danger rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="material-symbols-outlined text-3xl">warning</span>
              </div>
              
              <h3 className="text-lg font-bold text-gray-900 mb-2">Hapus Semua Data?</h3>
              <p className="text-sm text-gray-500 mb-6 leading-relaxed">
                Semua progres level, transaksi, dan medali akan hilang permanen. Kamu yakin?
              </p>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  disabled={isDeleting}
                  className="flex-1 py-3 rounded-xl font-bold text-gray-500 hover:bg-gray-100 transition-colors disabled:opacity-50"
                >
                  Batal
                </button>
                <button
                  onClick={handleDeleteAllData}
                  disabled={isDeleting}
                  className="flex-1 py-3 rounded-xl bg-danger text-white font-bold shadow-lg hover:scale-[1.02] transition-transform disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isDeleting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Menghapus...</span>
                    </>
                  ) : (
                    <span>Ya, Hapus</span>
                  )}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Edit Profile Modal */}
      <AnimatePresence>
        {showEditProfileModal && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-[32px] p-6 w-full max-w-sm shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
            >
              <h3 className="text-lg font-bold text-gray-900 mb-4 text-center">Edit Profil</h3>
              
              <div className="overflow-y-auto no-scrollbar pb-2">
                {/* Avatar Selection */}
                <div className="mb-6">
                  <span className="text-xs text-gray-400 font-bold uppercase mb-3 block">Pilih Avatar</span>
                  <div className="grid grid-cols-3 gap-3">
                    {AVATAR_OPTIONS.map((opt, idx) => (
                      <button 
                        key={idx}
                        onClick={() => setNewAvatar(opt)}
                        className={`aspect-square rounded-2xl border-2 overflow-hidden transition-all ${
                          newAvatar === opt ? 'border-primary shadow-glow scale-105' : 'border-gray-100 opacity-60 hover:opacity-100 hover:scale-105'
                        }`}
                      >
                        <img src={opt} alt={`Avatar ${idx}`} className="w-full h-full object-cover bg-gray-50" />
                      </button>
                    ))}
                  </div>
                </div>

                {/* Name Input */}
                <div className="bg-gray-50 rounded-2xl p-4 mb-2 border border-gray-100">
                  <span className="text-xs text-gray-400 font-bold uppercase mb-1 block">Nama Komandan</span>
                  <input
                    type="text"
                    value={newUsername}
                    onChange={(e) => setNewUsername(e.target.value)}
                    maxLength={15}
                    className="bg-transparent text-lg font-bold text-gray-900 w-full focus:outline-none"
                    placeholder="Masukkan nama..."
                  />
                  <div className="text-right mt-1">
                    <span className="text-[10px] text-gray-400">{newUsername.length}/15</span>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 mt-4 pt-4 border-t border-gray-100">
                <button
                  onClick={() => setShowEditProfileModal(false)}
                  className="flex-1 py-3 rounded-xl font-bold text-gray-500 hover:bg-gray-100 transition-colors"
                >
                  Batal
                </button>
                <button
                  onClick={handleSaveProfile}
                  disabled={newUsername.trim().length === 0}
                  className="flex-1 py-3 rounded-xl bg-primary text-white font-bold shadow-glow hover:scale-[1.02] transition-transform disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Simpan
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Upgrade Modal */}
      <UpgradeModal 
        isOpen={showUpgradeModal} 
        onClose={() => setShowUpgradeModal(false)} 
      />

      {/* Floating FAB - Adjusted for Desktop */}
      <div className="fixed bottom-[70px] left-0 w-full flex justify-center pointer-events-none z-40 md:bottom-10 md:left-auto md:right-10 md:w-auto md:justify-end">
        <button 
          onClick={() => router.push('/add')}
          className="pointer-events-auto w-16 h-16 bg-gradient-to-br from-primary to-primary-dark text-white rounded-full shadow-glow flex items-center justify-center transition-transform hover:scale-110 active:scale-95 group focus:outline-none focus:ring-4 focus:ring-primary/30 border-4 border-white/30 backdrop-blur-sm"
        >
          <span className="material-symbols-outlined text-[32px] group-hover:rotate-90 transition-transform duration-300 drop-shadow-md">add</span>
        </button>
      </div>

      <BottomNav />
    </div>
  );
}
