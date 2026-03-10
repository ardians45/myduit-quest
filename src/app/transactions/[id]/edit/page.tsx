'use client';

import { Suspense, useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useTransactionStore } from '@/stores';

const EXPENSE_CATEGORIES = [
  { id: 'food', label: 'Makanan', icon: 'restaurant' },
  { id: 'transport', label: 'Transport', icon: 'directions_car' },
  { id: 'shopping', label: 'Belanja', icon: 'shopping_bag' },
  { id: 'entertainment', label: 'Hiburan', icon: 'sports_esports' },
  { id: 'education', label: 'Pendidikan', icon: 'school' },
  { id: 'health', label: 'Kesehatan', icon: 'medical_services' },
  { id: 'utilities', label: 'Utilitas', icon: 'bolt' },
  { id: 'other', label: 'Lainnya', icon: 'inventory_2' },
];

const INCOME_CATEGORIES = [
  { id: 'salary', label: 'Gaji', icon: 'payments' },
  { id: 'gift', label: 'Hadiah', icon: 'redeem' },
  { id: 'other', label: 'Lainnya', icon: 'paid' },
];

function EditTransactionContent() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  
  const { transactions, editTransaction } = useTransactionStore();
  const [mounted, setMounted] = useState(false);
  const transaction = transactions.find(t => t.id === id);

  const [type, setType] = useState<'expense' | 'income'>('expense');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('food');
  const [note, setNote] = useState('');
  const [date, setDate] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  
  useEffect(() => {
    setMounted(true);
    if (transaction) {
      setType(transaction.type);
      setAmount(transaction.amount.toString());
      setCategory(transaction.category);
      setNote(transaction.note || '');
      setDate(transaction.date);
    }
  }, [transaction]);

  const categories = type === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;
  
  useEffect(() => {
    if (mounted && transaction && transaction.type !== type) {
       setCategory(type === 'income' ? 'salary' : 'food');
    }
  }, [type, mounted, transaction]);
  
  const formatCurrency = (value: string) => {
    const num = value.replace(/\D/g, '');
    return new Intl.NumberFormat('id-ID').format(Number(num));
  };
  
  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\D/g, '');
    setAmount(val);
  };
  
  const handleSubmit = () => {
    if (!amount || Number(amount) === 0 || !transaction) return;
    
    editTransaction(transaction.id, { 
      type, 
      amount: Number(amount), 
      category, 
      note, 
      date 
    });
    
    setIsSuccess(true);
    setTimeout(() => router.back(), 800);
  };

  if (!mounted) return <div className="min-h-screen bg-bg-light" />;

  if (!transaction) {
     return (
       <div className="min-h-screen bg-bg-light flex flex-col items-center justify-center p-6">
         <h2 className="text-xl font-bold text-gray-800 mb-4">Transaksi tidak ditemukan</h2>
         <button onClick={() => router.push('/transactions')} className="px-6 py-3 bg-primary text-white rounded-xl">Kembali</button>
       </div>
     );
  }
  
  return (
    <div className="min-h-screen bg-bg-light font-display relative overflow-hidden flex flex-col">
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 w-full h-[500px] bg-gradient-to-b from-purple-50/80 to-transparent"></div>
        <div className="absolute top-[-100px] right-[-100px] w-[300px] h-[300px] bg-indigo-300/20 rounded-full blur-3xl"></div>
      </div>

      {/* Desktop Container Wrapper */}
      <div className="flex flex-col md:max-w-5xl md:mx-auto md:px-6 relative z-10 w-full flex-1">
      <AnimatePresence>
        {isSuccess && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-white/60 backdrop-blur-md"
          >
            <motion.div 
              initial={{ scale: 0.5, y: 50, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              transition={{ type: "spring", stiffness: 400, damping: 20 }}
              className="glass-card p-8 rounded-[32px] flex flex-col items-center shadow-xl border-2 border-primary/20"
            >
              <div className="w-20 h-20 bg-gradient-to-br from-primary to-primary-dark rounded-full flex items-center justify-center mb-4 shadow-glow text-white">
                <span className="material-symbols-outlined text-4xl">edit</span>
              </div>
              <h2 className="text-2xl font-black text-gray-900 mb-1">Berhasil Diperbarui!</h2>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <header className="px-6 pt-8 pb-4 relative z-10 flex items-center justify-between">
        <button 
          onClick={() => router.back()}
          className="w-10 h-10 glass-card rounded-xl flex items-center justify-center text-gray-600 hover:scale-105 transition-transform"
        >
          <span className="material-symbols-outlined">arrow_back</span>
        </button>
        <span className="font-bold text-gray-900">Edit Transaksi</span>
        <div className="w-10"></div>
      </header>

      <main className="flex-1 px-6 pb-32 relative z-10 overflow-y-auto no-scrollbar max-w-lg mx-auto w-full">
        
        <div className="bg-gray-200/50 p-1 rounded-2xl flex relative mb-8">
           <motion.div
             layout
             className="absolute left-1 top-1 bottom-1 w-[calc(50%-4px)] bg-white rounded-xl shadow-sm"
             initial={false}
             animate={{ x: type === 'expense' ? 0 : '100%' }}
             transition={{ type: 'spring', stiffness: 300, damping: 30 }}
           />
           <button
             onClick={() => setType('expense')}
             className={`flex-1 py-3 text-sm font-bold text-center relative z-10 transition-colors ${type === 'expense' ? 'text-danger' : 'text-gray-500'}`}
           >
             Pengeluaran
           </button>
           <button
             onClick={() => setType('income')}
             className={`flex-1 py-3 text-sm font-bold text-center relative z-10 transition-colors ${type === 'income' ? 'text-success' : 'text-gray-500'}`}
           >
             Pemasukan
           </button>
        </div>

        <div className="mb-8 text-center relative">
          <span className="block text-xs font-bold text-gray-400 mb-2 uppercase tracking-wider">Jumlah</span>
          <div className="relative inline-block w-full">
            <span className="absolute left-8 top-1/2 -translate-y-1/2 text-2xl font-bold text-gray-400">Rp</span>
            <input
               type="text"
               inputMode="numeric"
               value={formatCurrency(amount)}
               onChange={handleAmountChange}
               className={`w-full bg-transparent text-center text-4xl font-black focus:outline-none placeholder-gray-300 ${type === 'expense' ? 'text-gray-900' : 'text-success'}`}
            />
          </div>
          <div className="h-1 w-32 bg-gray-200 rounded-full mx-auto mt-2"></div>
        </div>

        <div className="mb-8">
          <span className="block text-xs font-bold text-gray-400 mb-4 uppercase tracking-wider">Kategori</span>
          <div className="grid grid-cols-4 gap-3">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setCategory(cat.id)}
                className={`flex flex-col items-center gap-2 p-3 rounded-2xl transition-all ${
                  category === cat.id
                    ? 'bg-primary text-white shadow-lg scale-105'
                    : 'glass-card hover:bg-white/80 text-gray-500'
                }`}
              >
                <div className={`text-2xl flex items-center justify-center ${category === cat.id ? 'text-white' : 'text-primary'}`}>
                  <span className="material-symbols-outlined">{cat.icon}</span>
                </div>
                <span className="text-[10px] font-bold text-center leading-tight">{cat.label}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <div className="glass-card p-4 rounded-2xl flex items-center gap-3">
            <span className="material-symbols-outlined text-gray-400">calendar_today</span>
            <input
               type="date"
               value={date}
               onChange={(e) => setDate(e.target.value)}
               className="bg-transparent w-full text-sm font-bold text-gray-700 focus:outline-none"
            />
          </div>
          
          <div className="glass-card p-4 rounded-2xl flex items-center gap-3">
            <span className="material-symbols-outlined text-gray-400">edit</span>
            <input
               type="text"
               placeholder="Catatan tambahan..."
               value={note}
               onChange={(e) => setNote(e.target.value)}
               className="bg-transparent w-full text-sm font-bold text-gray-700 focus:outline-none placeholder-gray-400"
            />
          </div>
        </div>

      </main>

      <div className="fixed bottom-6 left-0 w-full px-6 z-30 flex justify-center pointer-events-none md:max-w-5xl md:mx-auto">
        <button
          onClick={handleSubmit}
          disabled={!amount || Number(amount) === 0}
          className="pointer-events-auto w-full max-w-lg py-4 rounded-xl bg-gradient-to-r from-primary to-primary-dark text-white font-bold text-lg shadow-glow hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          <span>Simpan Perubahan</span>
          <span className="material-symbols-outlined">save</span>
        </button>
      </div>
      </div>
    </div>
  );
}

export default function EditPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-bg-light" />}>
      <EditTransactionContent />
    </Suspense>
  );
}
