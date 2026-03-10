'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useBudgetStore, useTransactionStore, useGameStore } from '@/stores';
import { BottomNav } from '@/components/layout/BottomNav';
import { Fortress3D } from '@/components/visuals/Fortress3D';

const GEN_Z_TIPS = [
  "💡 Info ngab: Kopi susu tiap hari itu silent killer buat dompet lu.",
  "💡 Self-reward boleh, tapi inget besok masih butuh makan.",
  "💡 Paylater itu jebakan batman, mending nabung pelan-pelan.",
  "💡 Promo gratis ongkir jangan dibikin alasan buat boros, kocak.",
  "💡 'Uang bisa dicari', bener sih, tapi nyarinya pusing headshot.",
  "💡 Kurang-kurangin checkout oren tengah malem, rawan khilaf.",
  "💡 Tips: Leveling up benteng bikin lu makin pro ngatur duit.",
  "💡 Gaya elit, ekonomi sulit. Mending nabung buat masa depan, chill.",
  "💡 Ingat kata pepatah: Sedikit-dikit fyp, lama-lama jadi bukit duit.",
  "💡 Catet pengeluaran emang ribet, tapi lebih ribet kalo tanggal tua nangis di pojokan."
];

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

export default function DashboardPage() {
  const router = useRouter();
  const { isOnboarded, monthlyBudget, getHP, getHPStatus, getRemainingBudget, _hasHydrated } = useBudgetStore();
  const { transactions, getTransactionsByDate } = useTransactionStore();
  const { streak, level, xp, getLevelName, activeDecorations, avatar } = useGameStore();
  
  const nextLevelXp = level * 100;
  
  // Mounted state to avoid hydration mismatch
  const [mounted, setMounted] = useState(false);
  const [currentTipIndex, setCurrentTipIndex] = useState(() => Math.floor(Math.random() * GEN_Z_TIPS.length));
  
  useEffect(() => {
    setMounted(true);
    
    // Tips rotator
    const interval = setInterval(() => {
      setCurrentTipIndex((prev) => {
        let next;
        do { next = Math.floor(Math.random() * GEN_Z_TIPS.length); } while (next === prev && GEN_Z_TIPS.length > 1);
        return next;
      });
    }, 15000); // Rotates every 15 seconds
    
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    // Only redirect AFTER hydration is complete
    if (_hasHydrated && !isOnboarded) {
      router.replace('/onboarding');
    }
  }, [_hasHydrated, isOnboarded, router]);

  // --- DATA CALCULATION FOR CARDS ---
  
  // 1. Global Stats
  const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM
  const totalExpenseThisMonth = transactions
    .filter(t => t.type === 'expense' && t.date.startsWith(currentMonth))
    .reduce((sum, t) => sum + t.amount, 0);

  const hp = getHP(totalExpenseThisMonth);
  const remaining = getRemainingBudget(totalExpenseThisMonth);
  const xpPercentage = Math.min((xp / nextLevelXp) * 100, 100);

  // 2. Battle Today Data
  const today = new Date().toISOString().split('T')[0];
  const todayTransactions = transactions.filter(t => t.date === today);
  const todayExpense = todayTransactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);
  const todayXP = todayTransactions.length * 10; // Estimation: 10 XP per transaction

  // 3. Spending Trend Data
  const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
  const yesterdayTransactions = transactions.filter(t => t.date === yesterday);
  const yesterdayExpense = yesterdayTransactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  let trendText = "Mulai petualangan finansialmu hari ini!";
  let trendIcon = "trending_flat";
  let trendColor = "text-gray-500";

  if (todayExpense > 0 && yesterdayExpense > 0) {
    const diff = todayExpense - yesterdayExpense;
    const percent = Math.round((Math.abs(diff) / yesterdayExpense) * 100);
    
    if (diff > 0) {
      trendText = `Pengeluaran naik ${percent}% dari kemarin`;
      trendIcon = "trending_up";
      trendColor = "text-danger";
    } else {
      trendText = `Lebih hemat ${percent}% dari kemarin`;
      trendIcon = "trending_down";
      trendColor = "text-success";
    }
  } else if (todayExpense > 0 && yesterdayExpense === 0) {
      trendText = "Hari ini kamu mulai mengeluarkan harta.";
      trendIcon = "trending_up";
      trendColor = "text-warning";
  }

  // 4. Next Action Logic
  let actionMessage = "Pertahanan stabil, lanjutkan!";
  let actionColor = "bg-emerald-50 text-emerald-700 border-emerald-200";
  let actionIcon = "check_circle";

  if (hp < 40) {
    actionMessage = "Zona merah! Hindari pengeluaran besar";
    actionColor = "bg-red-50 text-red-700 border-red-200";
    actionIcon = "warning";
  } else if (hp < 70) {
    actionMessage = "Kurangi jajan hari ini ⚠️";
    actionColor = "bg-amber-50 text-amber-700 border-amber-200";
    actionIcon = "priority_high";
  }

  
  const formatIDR = (value: number) => 
    new Intl.NumberFormat('id-ID').format(value);

  // Wait for both mount and hydration before rendering
  if (!mounted || !_hasHydrated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg-light">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-500 text-sm">Loading...</p>
        </div>
      </div>
    );
  }
  
  if (!isOnboarded) return null;

  return (
    <>
      {/* Background Elements */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 w-full h-full bg-gradient-to-b from-purple-50/50 to-blue-50/30"></div>
        <div className="absolute top-[20%] left-[-20%] w-[140%] h-[40%] bg-purple-200/20 rounded-[100%] blur-3xl transform -rotate-12"></div>
        <div className="absolute top-[30%] right-[-10%] w-[80%] h-[50%] bg-indigo-200/20 rounded-[100%] blur-3xl"></div>
        
        {/* Floating Coins Animation */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-[15%] left-[10%] text-gold animate-float opacity-60">
            <span className="material-symbols-outlined text-xl animate-coin-spin">monetization_on</span>
          </div>
          <div className="absolute top-[25%] right-[15%] text-gold animate-float-delayed opacity-50">
            <span className="material-symbols-outlined text-lg animate-coin-spin">monetization_on</span>
          </div>
          <div className="absolute bottom-[40%] left-[20%] text-gold animate-float opacity-40">
            <span className="material-symbols-outlined text-sm animate-coin-spin">monetization_on</span>
          </div>
        </div>
      </div>

      <div className="min-h-screen flex flex-col md:max-w-5xl md:mx-auto md:px-6">
        {/* Header */}
        <header className="relative z-20 px-6 pt-12 pb-2 flex items-center justify-between w-full backdrop-blur-[2px] md:pt-8 md:pb-6">
          <div className="flex flex-col gap-1 flex-1">
            <div className="flex items-center gap-2">
              <div className="bg-primary text-white text-[10px] font-bold px-2 py-0.5 rounded-md shadow-lg border border-white/20">
                LVL {level}
              </div>
              <span className="text-xs font-bold uppercase tracking-wider text-gray-600">
                {getLevelName()}
              </span>
            </div>
            <div className="flex items-center gap-3 w-full max-w-[200px]">
              <div className="flex-1 h-3 bg-white/60 rounded-full overflow-hidden border border-white/40 shadow-inner">
                <div 
                  className="h-full bg-gradient-to-r from-primary to-purple-400 relative overflow-hidden transition-all duration-1000"
                  style={{ width: `${xpPercentage}%` }}
                >
                  <div className="absolute inset-0 bg-white/20 w-full h-full animate-[pulse_2s_ease-in-out_infinite]"></div>
                </div>
              </div>
              <span className="text-[10px] font-bold text-primary whitespace-nowrap drop-shadow-sm">
                {xp} XP
              </span>
            </div>
          </div>
          <button className="flex items-center gap-2 px-3 py-1.5 glass-card hover:bg-white rounded-full transition-all active:scale-95 shadow-sm group">
            <span className="material-symbols-outlined text-[18px] text-gray-600 group-hover:rotate-180 transition-transform duration-500">sync</span>
          </button>
        </header>

        {/* Main Content Grid */}
        <main className="flex-1 relative z-10 pb-32 no-scrollbar w-full flex flex-col md:grid md:grid-cols-12 md:gap-8 md:items-start">
          
          {/* LEFT COLUMN: Fortress Visual */}
          <section className="relative w-full flex flex-col items-center pt-4 px-4 pb-2 md:col-span-7 md:h-full md:justify-center">
            
            {/* Top Right Floating Card */}
            <div className="absolute top-0 right-4 z-30 flex flex-col items-end md:right-10 md:top-10">
              <div className="animate-float-delayed relative">
                <div className="glass-card text-gray-800 text-[10px] font-bold py-1.5 px-3 rounded-xl rounded-br-none shadow-lg mb-1 mr-8 whitespace-nowrap animate-bounce">
                  Pertahanan stabil!
                </div>
                <div 
                  className="w-14 h-14 rounded-xl border-2 border-white shadow-xl overflow-hidden bg-purple-50 relative group cursor-pointer transform rotate-3 hover:rotate-0 transition-all"
                  onClick={() => router.push('/profile')}
                >
                  <img src={avatar || "/avatar.png"} alt="Profile" className="w-full h-full object-cover" />
                </div>
              </div>
            </div>

            {/* Fortress Visual */}
            <div className="relative w-full aspect-square max-w-[320px] mx-auto md:max-w-full md:aspect-[4/5] flex items-center justify-center -mt-4 md:mt-0">
               <Fortress3D hp={hp} level={level} activeDecorations={activeDecorations} className="transform scale-110 md:scale-125 transition-transform duration-700" />
            </div>

            {/* Floating Action Buttons Overlay (Keep existing) */}
            <div className="absolute inset-0 pointer-events-none">
               {/* Left Floating Goal Button */}
               <div className="absolute top-[20%] left-[15%] z-10 animate-float-delayed pointer-events-auto">
                 <button 
                   onClick={() => router.push('/add?type=income')}
                   className="w-12 h-12 glass-card rounded-2xl flex items-center justify-center hover:border-primary hover:text-primary transition-colors group relative"
                 >
                   <span className="material-symbols-outlined text-gray-400 group-hover:text-primary">add</span>
                   <span className="absolute -bottom-4 bg-gray-800 text-white text-[8px] px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                     Income
                   </span>
                 </button>
               </div>
 
               {/* Right Floating Savings Icon */}
               <div className="absolute top-[20%] right-[15%] z-10 animate-float pointer-events-auto">
                 <div className="w-12 h-14 bg-blue-500 rounded-lg shadow-[0_8px_0_#1e3a8a] border-2 border-blue-400 flex items-center justify-center relative">
                   <span className="material-symbols-outlined text-white text-lg">savings</span>
                   <div className="absolute -top-2 -right-2 bg-yellow-400 text-yellow-900 text-[8px] font-bold px-1 rounded-full border border-white shadow-sm">
                     Lvl {level}
                   </div>
                 </div>
               </div>
 
               {/* Bottom Left Lock Icon / Decoration Link */}
               <div className="absolute bottom-[25%] left-[15%] z-20 pointer-events-auto">
                 <button 
                   onClick={() => router.push('/battle?tab=dekorasi')}
                   className="w-12 h-12 glass-card rounded-2xl flex items-center justify-center hover:border-primary hover:text-primary transition-colors group relative"
                 >
                   <span className={`material-symbols-outlined transition-colors ${level >= 2 ? 'text-primary' : 'text-gray-400 group-hover:text-primary'}`}>
                     {level >= 2 ? 'palette' : 'lock'}
                   </span>
                   {level < 2 ? (
                     <span className="absolute -bottom-4 bg-gray-800 text-white text-[8px] px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                       Buka di Lv 2
                     </span>
                   ) : (
                     <span className="absolute -bottom-4 bg-gray-800 text-white text-[8px] px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                       Dekorasi
                     </span>
                   )}
                 </button>
               </div>
            </div>

          </section>

          {/* RIGHT COLUMN: 4-Card Dashboard Layout */}
          <section className="flex flex-col gap-3 px-6 md:col-span-5 md:px-0 md:pt-10">
            
            {/* 1. 🛡️ FORTRESS STATUS CARD (HERO) */}
            <div className="w-full glass-card rounded-super p-5 shadow-soft relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-3">
                 <div className={`text-[10px] font-bold px-2 py-1 rounded-lg border ${
                   hp > 70 ? 'bg-green-100 text-green-700 border-green-200' :
                   hp > 40 ? 'bg-amber-100 text-amber-700 border-amber-200' :
                   'bg-red-100 text-red-700 border-red-200 animate-pulse'
                 }`}>
                   {hp > 70 ? 'AMAN' : hp > 40 ? 'WASPADA' : 'KRITIS'}
                 </div>
              </div>
              
              <div className="flex flex-col gap-3 relative z-10">
                <div>
                   <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Integritas Benteng</span>
                   <div className="flex items-end gap-2 mt-1">
                     <span className={`text-4xl font-black ${hp > 50 ? 'text-gray-800' : 'text-red-600'}`}>
                        {hp.toFixed(0)}%
                     </span>
                     <span className="text-sm font-bold text-gray-400 mb-1.5">/ 100%</span>
                   </div>
                </div>

                {/* HP Bar */}
                <div className="h-4 bg-gray-100/80 rounded-full p-1 shadow-inner relative overflow-hidden w-full">
                  <div 
                    className={`h-full rounded-full shadow-lg relative overflow-hidden transition-all duration-1000 ${
                       hp > 70 ? 'bg-gradient-to-r from-emerald-400 to-green-500' :
                       hp > 40 ? 'bg-gradient-to-r from-amber-400 to-orange-500' :
                       'bg-gradient-to-r from-red-500 to-rose-600'
                    }`}
                    style={{ width: `${hp}%` }}
                  >
                    <div className="absolute inset-0 bg-white/30 w-full h-full animate-[shimmer_2s_infinite]"></div>
                  </div>
                </div>

                <div className="flex justify-between items-center text-xs pt-1 border-t border-gray-100">
                  <span className="text-gray-500">Sisa Budget</span>
                  <span className="font-bold text-gray-800">Rp {formatIDR(remaining).replace('Rp', '')}</span>
                </div>
                
                {/* Total Saldo */}
                <div className="flex justify-between items-center text-xs pt-2">
                  <span className="text-gray-400 text-[10px] uppercase tracking-wide">Total Saldo</span>
                  <span className="font-bold text-gray-600">Rp {formatIDR(
                    transactions.reduce((sum, t) => sum + (t.type === 'income' ? t.amount : -t.amount), 0)
                  ).replace('Rp', '')}</span>
                </div>
              </div>
            </div>

            {/* 2. ⚔️ BATTLE TODAY CARD */}
            <div className="w-full glass-card rounded-2xl p-4 shadow-sm flex items-center justify-between group hover:bg-white/60 transition-colors cursor-pointer" onClick={() => router.push('/transactions')}>
               <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center">
                    <span className="material-symbols-outlined">swords</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] font-bold text-gray-400 uppercase">Pertarungan Hari Ini</span>
                    <span className="text-xs font-bold text-gray-700">
                       {todayTransactions.length > 0 ? `Bertarung ${todayTransactions.length} kali` : "Belum ada aktivitas"} ⚔️
                    </span>
                  </div>
               </div>
               <div className="text-right">
                  <span className="block text-[10px] font-bold text-success">+{todayXP} XP</span>
                  <span className="text-xs font-bold text-danger">-Rp {formatIDR(todayExpense).replace('Rp', '')}</span>
               </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
               {/* 3. 📊 SPENDING TREND CARD */}
               <div className="glass-card rounded-2xl p-4 shadow-sm flex flex-col justify-between min-h-[100px] hover:bg-white/60 transition-colors relative overflow-hidden">
                  <span className="text-[10px] font-bold text-gray-400 uppercase">Trend</span>
                  
                  <div className="flex flex-col gap-1 mt-2 relative z-10">
                     <span className={`material-symbols-outlined text-2xl ${trendColor}`}>{trendIcon}</span>
                     <p className={`text-[10px] font-bold leading-tight ${trendColor}`}>
                       {trendText}
                     </p>
                  </div>
                  
                  {/* Decor Background */}
                  <div className={`absolute -right-2 -bottom-2 w-12 h-12 rounded-full opacity-10 blur-xl ${
                    trendIcon === 'trending_up' ? 'bg-red-500' : 'bg-green-500'
                  }`}></div>
               </div>

               {/* 4. 🎯 NEXT ACTION CARD */}
               <div className={`glass-card rounded-2xl p-4 shadow-sm flex flex-col justify-between min-h-[100px] border relative overflow-hidden ${actionColor}`}>
                  <span className="text-[10px] font-bold opacity-70 uppercase">Saran Strategis</span>
                  
                  <div className="flex flex-col gap-1 mt-2">
                     <div className="flex items-center gap-1">
                        <span className="material-symbols-outlined text-lg">{actionIcon}</span>
                     </div>
                     <p className="text-[10px] font-bold leading-tight">
                       "{actionMessage}"
                     </p>
                  </div>
               </div>
            </div>

            {/* 5. 📜 RECENT TRANSACTIONS */}
            <div className="w-full mt-2">
              <div className="flex items-center justify-between mb-3 px-1">
                <h3 className="text-sm font-bold text-gray-800">Transaksi Terakhir</h3>
                <button onClick={() => router.push('/transactions')} className="text-[10px] font-bold text-primary hover:underline">Lihat Semua</button>
              </div>
              
              {transactions.length > 0 ? (
                <div className="flex flex-col gap-2">
                  {transactions.slice(0, 3).map(tx => (
                    <div 
                      key={tx.id} 
                      onClick={() => router.push(`/transactions/${tx.id}`)}
                      className="glass-card rounded-2xl p-3 flex items-center justify-between hover:bg-white/60 transition-colors cursor-pointer"
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                            tx.type === 'expense' ? 'bg-red-50 text-danger' : 'bg-green-50 text-success'
                          }`}>
                          <span className="material-symbols-outlined text-[18px]">
                            {CATEGORY_INFO[tx.category]?.icon || 'inventory_2'}
                          </span>
                        </div>
                        <div className="flex flex-col">
                          <span className="text-sm font-bold text-gray-800">{CATEGORY_INFO[tx.category]?.label || 'Lainnya'}</span>
                          <span className="text-[10px] text-gray-500 truncate max-w-[120px]">{tx.note || (tx.type === 'expense' ? 'Pengeluaran' : 'Pemasukan')}</span>
                        </div>
                      </div>
                      <div className="flex flex-col items-end">
                        <span className={`text-sm font-bold ${tx.type === 'expense' ? 'text-danger' : 'text-success'}`}>
                          {tx.type === 'expense' ? '-' : '+'}Rp {formatIDR(tx.amount)}
                        </span>
                        <span className="text-[10px] text-gray-400">
                          {new Date(tx.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="glass-card rounded-2xl p-4 text-center">
                  <span className="text-xs text-gray-500">Belum ada transaksi</span>
                </div>
              )}
            </div>

            {/* Premium Tips Ticker */}
            <div className="w-full mt-1 mb-4 group cursor-pointer" onClick={() => setCurrentTipIndex((prev) => { let next; do { next = Math.floor(Math.random() * GEN_Z_TIPS.length); } while (next === prev && GEN_Z_TIPS.length > 1); return next; })} title="Klik untuk ganti tips">
               <div className="relative glass-card rounded-2xl p-4 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white/60 hover:border-primary/30 transition-all overflow-hidden bg-gradient-to-r from-white/80 to-indigo-50/50 backdrop-blur-xl">
                 
                 {/* Decorative background blur */}
                 <div className="absolute -left-4 -top-4 w-16 h-16 bg-blue-400/10 rounded-full blur-xl pointer-events-none"></div>
                 <div className="absolute -right-4 -bottom-4 w-16 h-16 bg-purple-400/10 rounded-full blur-xl pointer-events-none"></div>
                 
                 <div className="flex items-center gap-3 relative z-10">
                   <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/30 flex-shrink-0 animate-pulse-slow">
                     <span className="material-symbols-outlined text-white text-[16px]">tips_and_updates</span>
                   </div>
                   
                   <div className="flex-1 w-full overflow-hidden">
                     <span className="text-[9px] font-black uppercase tracking-widest text-indigo-400 block mb-0.5">Petuah Harian</span>
                     <div className="w-full relative h-[20px] overflow-hidden flex items-center">
                       <AnimatePresence>
                         <motion.div 
                           key={currentTipIndex}
                           initial={{ x: 400 }}
                           animate={{ x: -800 }}
                           transition={{ duration: 15, ease: "linear" }}
                           className="text-xs sm:text-sm font-semibold text-gray-700 whitespace-nowrap absolute"
                         >
                           {GEN_Z_TIPS[currentTipIndex].replace('💡', '').trim()}
                         </motion.div>
                       </AnimatePresence>
                     </div>
                   </div>
                   
                   <div className="opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                     <span className="material-symbols-outlined text-gray-400 text-[18px]">keyboard_double_arrow_right</span>
                   </div>
                 </div>
                 
                 {/* Progress Indicator */}
                 <div className="absolute bottom-0 left-0 w-full h-[2px] bg-gray-100/50">
                    <motion.div 
                      key={`progress-${currentTipIndex}`}
                      initial={{ width: "0%" }}
                      animate={{ width: "100%" }}
                      transition={{ duration: 15, ease: "linear" }}
                      className="h-full bg-gradient-to-r from-indigo-400 to-purple-500 rounded-r-full"
                    />
                 </div>
               </div>
            </div>

          </section>

        </main>
      </div>

      {/* Floating FAB - Adjusted for Desktop */}
      <div className="fixed bottom-[70px] left-0 w-full flex justify-center pointer-events-none z-40 md:bottom-10 md:left-auto md:right-10 md:w-auto md:justify-end">
        <button 
          onClick={() => router.push('/add')}
          className="pointer-events-auto w-16 h-16 bg-gradient-to-br from-primary to-primary-dark text-white rounded-full shadow-glow flex items-center justify-center transition-transform hover:scale-110 active:scale-95 group focus:outline-none focus:ring-4 focus:ring-primary/30 border-4 border-white/30 backdrop-blur-sm"
        >
          <span className="material-symbols-outlined text-[32px] group-hover:rotate-90 transition-transform duration-300 drop-shadow-md">add</span>
        </button>
      </div>


      {/* Custom Bottom Navigation */}
      <BottomNav />
    </>
  );
}
