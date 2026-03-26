'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useTransactionStore } from '@/stores';
import { motion } from 'framer-motion';

const CATEGORY_INFO: Record<string, { label: string; icon: string }> = {
  food: { label: 'Makanan', icon: 'restaurant' },
  transport: { label: 'Transportasi', icon: 'directions_car' },
  shopping: { label: 'Belanja', icon: 'shopping_bag' },
  entertainment: { label: 'Hiburan', icon: 'sports_esports' },
  education: { label: 'Pendidikan', icon: 'school' },
  health: { label: 'Kesehatan', icon: 'medical_services' },
  utilities: { label: 'Utilitas', icon: 'bolt' },
  salary: { label: 'Gaji', icon: 'payments' },
  gift: { label: 'Hadiah', icon: 'redeem' },
  other: { label: 'Lainnya', icon: 'inventory_2' },
};

export default function TransactionDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  
  const { transactions, deleteTransaction } = useTransactionStore();
  const [mounted, setMounted] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  
  const transaction = transactions.find(t => t.id === id);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return <div className="min-h-screen bg-bg-light" />;
  
  if (!transaction) {
    return (
      <div className="min-h-screen bg-bg-light flex flex-col items-center justify-center p-6">
        <span className="material-symbols-outlined text-6xl text-gray-300 mb-4">search_off</span>
        <h2 className="text-xl font-bold text-gray-800 text-center">Transaksi tidak ditemukan</h2>
        <p className="text-sm text-gray-500 text-center mt-2 mb-6">Mungkin sudah dihapus atau ada kesalahan link.</p>
        <button 
          onClick={() => router.push('/transactions')}
          className="cursor-pointer px-6 py-3 bg-primary text-white font-bold rounded-xl"
        >
          Kembali ke Riwayat
        </button>
      </div>
    );
  }

  const categoryInfo = CATEGORY_INFO[transaction.category] || CATEGORY_INFO['other'];
  const isExpense = transaction.type === 'expense';
  
  const formatCurrency = (value: number) => new Intl.NumberFormat('id-ID').format(value);
  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('id-ID', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  const handleDelete = () => {
    deleteTransaction(transaction.id);
    router.push('/transactions');
  };

  return (
    <div className="min-h-screen bg-bg-light font-display relative overflow-hidden flex flex-col">
      {/* Background Elements */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className={`absolute top-0 w-full h-[400px] bg-gradient-to-b ${isExpense ? 'from-red-50/80' : 'from-green-50/80'} to-transparent transition-colors duration-500`}></div>
      </div>

      {/* Desktop Container Wrapper */}
      <div className="flex flex-col md:max-w-5xl md:mx-auto md:px-6 relative z-10 w-full flex-1">
        {/* Header */}
        <header className="px-6 pt-12 pb-6 relative z-10 flex items-center justify-between">
        <button 
          onClick={() => router.back()}
          className="cursor-pointer w-10 h-10 glass-card rounded-xl flex items-center justify-center text-gray-600 hover:scale-105 transition-transform"
        >
          <span className="material-symbols-outlined">arrow_back</span>
        </button>
        <span className="font-bold text-gray-900 text-lg">Detail Transaksi</span>
        <div className="w-10"></div> {/* Spacer */}
      </header>

      <main className="flex-1 px-6 pb-32 relative z-10 max-w-lg mx-auto w-full">
        {/* Main Card */}
        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="glass-card rounded-[32px] p-8 flex flex-col items-center shadow-soft text-center mb-6"
        >
          <div className={`w-20 h-20 rounded-full flex items-center justify-center mb-4 ${isExpense ? 'bg-red-100 text-danger' : 'bg-green-100 text-success'}`}>
            <span className="material-symbols-outlined text-[40px]">{categoryInfo.icon}</span>
          </div>
          <span className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-2">{categoryInfo.label}</span>
          <h2 className={`text-4xl font-black ${isExpense ? 'text-gray-900' : 'text-success'} mb-1`}>
            {isExpense ? '-' : '+'}Rp {formatCurrency(transaction.amount)}
          </h2>
          <span className="text-xs font-bold text-gray-400 bg-gray-100 px-3 py-1 rounded-full mt-2">
            {formatDate(transaction.date)}
          </span>
        </motion.div>

        {/* Details List */}
        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="glass-card rounded-2xl p-6 shadow-sm flex flex-col gap-5"
        >
          <div className="flex flex-col gap-1">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Tipe Transaksi</span>
            <span className="text-sm font-bold text-gray-800">{isExpense ? 'Pengeluaran' : 'Pemasukan'}</span>
          </div>
          
          <div className="h-px bg-gray-100 w-full"></div>
          
          <div className="flex flex-col gap-1">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Catatan</span>
            <span className="text-sm font-bold text-gray-800">{transaction.note || '-'}</span>
          </div>
        </motion.div>

        {/* Actions */}
        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-2 gap-4 mt-8"
        >
          <button 
            onClick={() => router.push(`/transactions/${transaction.id}/edit`)}
            className="cursor-pointer flex items-center justify-center gap-2 py-4 rounded-xl glass-card font-bold text-primary border-2 border-primary/20 hover:bg-primary/5 transition-colors"
          >
            <span className="material-symbols-outlined text-[20px]">edit</span>
            Edit
          </button>
          <button 
            onClick={() => setShowDeleteModal(true)}
            className="cursor-pointer flex items-center justify-center gap-2 py-4 rounded-xl glass-card font-bold text-danger border-2 border-danger/20 hover:bg-danger/5 transition-colors"
          >
            <span className="material-symbols-outlined text-[20px]">delete</span>
            Hapus
          </button>
        </motion.div>
      </main>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="glass-card rounded-super p-6 w-full max-w-sm shadow-glow"
          >
            <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="material-symbols-outlined text-danger text-3xl">warning</span>
            </div>
            <h3 className="text-lg font-bold text-gray-900 text-center mb-2">Hapus Transaksi?</h3>
            <p className="text-sm text-gray-500 text-center mb-6">Tindakan ini tidak dapat dibatalkan lho.</p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="cursor-pointer flex-1 py-3 rounded-xl font-bold bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
              >
                Batal
              </button>
              <button
                onClick={handleDelete}
                className="cursor-pointer flex-1 py-3 rounded-xl font-bold bg-danger text-white hover:scale-105 transition-transform"
              >
                Hapus
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
