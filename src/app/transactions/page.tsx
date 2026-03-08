'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { BottomNav } from '@/components/layout/BottomNav';
import { useTransactionStore } from '@/stores';

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

type FilterType = 'all' | 'expense' | 'income';

export default function TransactionsPage() {
  const router = useRouter();
  const { transactions, deleteTransaction } = useTransactionStore();
  const [filter, setFilter] = useState<FilterType>('all');
  const [search, setSearch] = useState('');
  const [deleteId, setDeleteId] = useState<string | null>(null);
  
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('id-ID').format(value);
  };
  
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);
    
    if (dateStr === today.toISOString().split('T')[0]) return 'Hari Ini';
    if (dateStr === yesterday.toISOString().split('T')[0]) return 'Kemarin';
    
    return date.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };
  
  // Filter and search transactions
  const filteredTransactions = useMemo(() => {
    return transactions.filter(t => {
      const matchesFilter = filter === 'all' || t.type === filter;
      const matchesSearch = search === '' || 
        t.note?.toLowerCase().includes(search.toLowerCase()) ||
        CATEGORY_INFO[t.category]?.label.toLowerCase().includes(search.toLowerCase());
      return matchesFilter && matchesSearch;
    });
  }, [transactions, filter, search]);
  
  // Group by date
  const groupedTransactions = useMemo(() => {
    const groups: Record<string, typeof transactions> = {};
    filteredTransactions.forEach(t => {
      if (!groups[t.date]) {
        groups[t.date] = [];
      }
      groups[t.date].push(t);
    });
    return Object.entries(groups).sort(([a], [b]) => b.localeCompare(a));
  }, [filteredTransactions]);
  
  const handleDelete = (id: string) => {
    deleteTransaction(id);
    setDeleteId(null);
  };
  
  return (
    <div className="min-h-screen bg-bg-light font-display pb-32 relative overflow-hidden">
      
      {/* Background Elements */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 w-full h-[500px] bg-gradient-to-b from-purple-50/80 to-transparent"></div>
        <div className="absolute top-[-100px] right-[-100px] w-[300px] h-[300px] bg-indigo-300/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-[200px] left-[-50px] w-[200px] h-[200px] bg-pink-300/20 rounded-full blur-3xl"></div>
      </div>

      {/* Header */}
      <header className="relative z-10 px-6 pt-12 pb-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => router.back()}
              className="w-10 h-10 glass-card rounded-xl flex items-center justify-center text-gray-600 hover:scale-105 transition-transform"
            >
              <span className="material-symbols-outlined">arrow_back</span>
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Riwayat Transaksi</h1>
              <p className="text-gray-500 text-sm">Catat setiap langkahmu</p>
            </div>
          </div>
        </div>
        
        {/* Search */}
        <div className="relative mb-4">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">search</span>
          <input
            type="text"
            placeholder="Cari transaksi..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-3 glass-card rounded-2xl text-gray-900 placeholder:text-gray-400 outline-none focus:ring-2 focus:ring-primary/20 transition-all"
          />
        </div>
        
        {/* Filter Tabs */}
        <div className="grid grid-cols-3 gap-2 p-1 glass-card rounded-2xl">
          {[
            { id: 'all', label: 'Semua', icon: 'list' },
            { id: 'expense', label: 'Keluar', icon: 'trending_down' },
            { id: 'income', label: 'Masuk', icon: 'trending_up' },
          ].map((f) => (
            <button
              key={f.id}
              onClick={() => setFilter(f.id as FilterType)}
              className={`py-2.5 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-1.5 ${
                filter === f.id
                  ? 'bg-primary text-white shadow-lg'
                  : 'text-gray-600 hover:bg-white/60'
              }`}
            >
              <span className="material-symbols-outlined text-[18px]">{f.icon}</span>
              {f.label}
            </button>
          ))}
        </div>
      </header>
      
      <main className="px-6 relative z-10">
        {groupedTransactions.length === 0 ? (
          <div className="glass-card rounded-super p-12 text-center shadow-soft">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="material-symbols-outlined text-gray-400 text-3xl">receipt_long</span>
            </div>
            <p className="text-gray-800 font-bold mb-1">
              {search ? 'Tidak ada hasil pencarian.' : 'Belum ada riwayat transaksi.'}
            </p>
            <p className="text-gray-500 text-sm mb-4">
              Mulai catat pengeluaran atau pemasukanmu
            </p>
            <button 
              onClick={() => router.push('/add')}
              className="px-6 py-2.5 bg-primary text-white rounded-xl font-bold hover:scale-105 transition-transform"
            >
              Tambah Transaksi
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {groupedTransactions.map(([date, items]) => (
              <div key={date}>
                <div className="flex items-center gap-2 mb-2 px-1">
                  <span className="material-symbols-outlined text-gray-400 text-[18px]">event</span>
                  <h3 className="text-sm font-bold text-gray-600 uppercase tracking-wide">
                    {formatDate(date)}
                  </h3>
                </div>
                <div className="glass-card rounded-2xl p-2 shadow-sm space-y-1">
                  {items.map((transaction) => (
                    <motion.div
                      key={transaction.id}
                      layout
                      className="flex flex-row items-center justify-between p-3 hover:bg-white/60 rounded-xl transition-colors group gap-2"
                    >
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${
                          transaction.type === 'expense' 
                            ? 'bg-red-50 text-danger' 
                            : 'bg-green-50 text-success'
                        }`}>
                          <span className="material-symbols-outlined text-[20px]">
                            {CATEGORY_INFO[transaction.category]?.icon || 'inventory_2'}
                          </span>
                        </div>
                        <div className="min-w-0 pr-2 flex-1">
                          <p className="font-bold text-gray-800 text-sm truncate">
                            {CATEGORY_INFO[transaction.category]?.label || 'Lainnya'}
                          </p>
                          {transaction.note && (
                            <p className="text-xs text-gray-500 truncate">
                              {transaction.note}
                            </p>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex flex-col sm:flex-row items-end sm:items-center gap-2 flex-shrink-0">
                        <span className={`font-bold text-sm whitespace-nowrap ${
                          transaction.type === 'expense' ? 'text-danger' : 'text-success'
                        }`}>
                          {transaction.type === 'expense' ? '-' : '+'}Rp {formatCurrency(transaction.amount)}
                        </span>
                        
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setDeleteId(transaction.id);
                          }}
                          className="w-8 h-8 rounded-lg flex items-center justify-center bg-red-50 text-danger sm:bg-transparent sm:text-gray-400 sm:hover:bg-red-50 sm:hover:text-danger transition-all opacity-100 sm:opacity-0 sm:group-hover:opacity-100"
                        >
                          <span className="material-symbols-outlined text-[18px]">delete</span>
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
      
      {/* Delete Confirmation Modal */}
      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="glass-card rounded-super p-6 w-full max-w-sm shadow-glow"
          >
            <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="material-symbols-outlined text-danger text-3xl">warning</span>
            </div>
            <h3 className="text-lg font-bold text-gray-900 text-center mb-2">
              Hapus Transaksi?
            </h3>
            <p className="text-sm text-gray-500 text-center mb-6">
              Tindakan ini tidak dapat dibatalkan
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteId(null)}
                className="flex-1 py-3 rounded-xl font-bold bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
              >
                Batal
              </button>
              <button
                onClick={() => handleDelete(deleteId)}
                className="flex-1 py-3 rounded-xl font-bold bg-danger text-white hover:scale-105 transition-transform"
              >
                Hapus
              </button>
            </div>
          </motion.div>
        </div>
      )}
      
      <BottomNav />
    </div>
  );
}
