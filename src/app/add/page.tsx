'use client';

import { Suspense, useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import imageCompression from 'browser-image-compression';
import { useTransactionStore, useGameStore } from '@/stores';

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

function AddTransactionContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { addTransaction, transactions } = useTransactionStore();
  const { addXP, updateStreak, unlockAchievement } = useGameStore();
  
  const initialType = (searchParams.get('type') as 'expense' | 'income') || 'expense';
  const [type, setType] = useState<'expense' | 'income'>(initialType);
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState(initialType === 'income' ? 'salary' : 'food');
  const [note, setNote] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [isSuccess, setIsSuccess] = useState(false);
  
  // Scanning State
  const [isScanning, setIsScanning] = useState(false);
  const [scanError, setScanError] = useState<string | null>(null);
  
  const categories = type === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;
  
  useEffect(() => {
    setCategory(type === 'income' ? 'salary' : 'food');
  }, [type]);
  
  const formatCurrency = (value: string) => {
    const num = value.replace(/\D/g, '');
    return new Intl.NumberFormat('id-ID').format(Number(num));
  };
  
  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\D/g, '');
    setAmount(val);
  };
  
  const handleSubmit = () => {
    if (!amount || Number(amount) === 0) return;
    
    addTransaction({ type, amount: Number(amount), category, note, date });
    addXP(10);
    updateStreak();
    
    if (transactions.length === 0) {
      unlockAchievement('first_transaction');
    }
    
    setIsSuccess(true);
    setTimeout(() => router.back(), 800); // Faster redirect
  };
  
  const handleScanReceipt = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsScanning(true);
    setScanError(null);

    try {
      // 1. Compress Image
      const options = {
        maxSizeMB: 0.8,
        maxWidthOrHeight: 1200,
        useWebWorker: true,
      };
      
      const compressedFile = await imageCompression(file, options);
      
      // 2. Convert to Base64
      const reader = new FileReader();
      reader.readAsDataURL(compressedFile);
      
      reader.onloadend = async () => {
        const base64data = reader.result;
        
        // 3. Send to API
        try {
          const res = await fetch('/api/scan', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ imageBase64: base64data }),
          });
          
          const data = await res.json();
          
          if (!res.ok) {
            throw new Error(data.error || 'Gagal memindai struk.');
          }
          
          // 4. Auto fill form
          setType('expense'); // Receipts are usually expenses
          
          if (data.totalAmount) {
            setAmount(data.totalAmount.toString());
          }
          
          if (data.category && EXPENSE_CATEGORIES.some(c => c.id === data.category)) {
             setCategory(data.category);
          } else {
             setCategory('shopping'); // Fallback category
          }
          
          if (data.shopName) {
            setNote(`Belanja di ${data.shopName}`);
          }
          
          if (data.date) {
            // Force it to today's date no matter what AI returns to prevent stats bugs
            setDate(new Date().toISOString().split('T')[0]);
          } else {
             setDate(new Date().toISOString().split('T')[0]);
          }
          
        } catch (apiError: any) {
           console.error('API Error:', apiError);
           setScanError(apiError.message || 'Terjadi kesalahan saat menghubungi agen AI.');
        } finally {
          setIsScanning(false);
        }
      };
      
      reader.onerror = () => {
         setScanError('Gagal membaca file gambar.');
         setIsScanning(false);
      };

    } catch (compressionError) {
      console.error('Compression Error:', compressionError);
      setScanError('Gagal mengompresi gambar.');
      setIsScanning(false);
    }
    
    // Reset file input so same file can be selected again if needed
    e.target.value = '';
  };
  
  return (
    <div className="min-h-screen bg-bg-light font-display relative overflow-hidden flex flex-col">
      
      {/* Background Elements */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 w-full h-[500px] bg-gradient-to-b from-purple-50/80 to-transparent"></div>
        <div className="absolute top-[-100px] right-[-100px] w-[300px] h-[300px] bg-indigo-300/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-[0px] left-[-50px] w-[200px] h-[200px] bg-pink-300/20 rounded-full blur-3xl"></div>
      </div>

      {/* Desktop Container Wrapper */}
      <div className="flex flex-col md:max-w-5xl md:mx-auto md:px-6 relative z-10 w-full flex-1 overflow-hidden">
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
              className="glass-card p-8 rounded-[32px] flex flex-col items-center shadow-xl border-2 border-success/20"
            >
              <div className="w-20 h-20 bg-gradient-to-br from-success to-emerald-600 rounded-full flex items-center justify-center mb-4 shadow-glow">
                <span className="material-symbols-outlined text-white text-4xl">done_all</span>
              </div>
              <h2 className="text-2xl font-black text-gray-900 mb-1">Berhasil!</h2>
              <p className="text-sm font-bold text-gray-500">+10 XP Bertambah</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <header className="px-6 pt-8 pb-4 relative z-10 flex items-center justify-between">
        <button 
          onClick={() => router.back()}
          className="w-10 h-10 glass-card rounded-xl flex items-center justify-center text-gray-600 hover:scale-105 transition-transform"
        >
          <span className="material-symbols-outlined">arrow_back</span>
        </button>
        <span className="font-bold text-gray-900">Tambah Transaksi</span>
        <div className="w-10 relative">
           <input 
             type="file" 
             accept="image/*" 
             // capture="environment" // Optional: open camera directly on mobile
             id="receipt-upload" 
             className="hidden" 
             onChange={handleScanReceipt}
           />
           <label 
             htmlFor="receipt-upload"
             className="w-10 h-10 glass-card rounded-xl flex items-center justify-center text-primary hover:text-white hover:bg-primary transition-colors hover:scale-105 shadow-sm cursor-pointer"
           >
             <span className="material-symbols-outlined text-lg">document_scanner</span>
           </label>
        </div>
      </header>

      <main className="flex-1 px-6 pb-32 relative z-10 overflow-y-auto no-scrollbar">
        
        {/* Type Toggle */}
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

        {/* Amount Input */}
        <div className="mb-8 text-center relative">
          <span className="block text-xs font-bold text-gray-400 mb-2 uppercase tracking-wider">Jumlah</span>
          <div className="relative inline-block w-full">
            <span className="absolute left-8 top-1/2 -translate-y-1/2 text-2xl font-bold text-gray-400">Rp</span>
            <input
              type="text"
              inputMode="numeric"
              placeholder="0"
              value={formatCurrency(amount)}
              onChange={handleAmountChange}
              className={`w-full bg-transparent text-center text-4xl font-black focus:outline-none placeholder-gray-300 ${type === 'expense' ? 'text-gray-900' : 'text-success'}`}
            />
          </div>
          <div className="h-1 w-32 bg-gray-200 rounded-full mx-auto mt-2"></div>
        </div>

        {/* Category Grid */}
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
                <span className="text-[10px] font-bold text-center leading-tight">
                  {cat.label}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Details Form */}
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

        {/* Scan Status Area */}
        <AnimatePresence>
          {isScanning && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mt-6 p-4 bg-primary/10 border border-primary/20 rounded-2xl flex items-center gap-3"
            >
               <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin"></div>
               <div className="flex flex-col">
                 <span className="text-xs font-bold text-primary">Agen AI sedang bekerja...</span>
                 <span className="text-[10px] text-gray-600">Menganalisis struk kamu. Mohon tunggu sebentar.</span>
               </div>
            </motion.div>
          )}

          {scanError && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mt-6 p-4 bg-red-50 border border-red-200 rounded-2xl flex items-center gap-3"
            >
               <span className="material-symbols-outlined text-red-500">error</span>
               <div className="flex flex-col">
                 <span className="text-xs font-bold text-red-700">Pemindaian Gagal</span>
                 <span className="text-[10px] text-red-600">{scanError}</span>
               </div>
            </motion.div>
          )}
        </AnimatePresence>

      </main>

      {/* Floating Submit Button */}
      <div className="fixed bottom-6 left-0 right-0 mx-auto w-full px-6 z-30 pointer-events-none md:max-w-5xl">
        <button
          onClick={handleSubmit}
          disabled={!amount || Number(amount) === 0}
          className="pointer-events-auto w-full py-4 rounded-xl flex items-center justify-center gap-2 bg-gradient-to-r from-primary to-primary-dark text-white font-bold text-lg shadow-glow hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <span>Simpan Transaksi</span>
          <span className="material-symbols-outlined">check</span>
        </button>
      </div>

      </div>
    </div>
  );
}

export default function AddPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-bg-light" />}>
      <AddTransactionContent />
    </Suspense>
  );
}
