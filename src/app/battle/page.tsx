'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import dynamic from 'next/dynamic';
import { BottomNav } from '@/components/layout/BottomNav';
import { useBudgetStore, useTransactionStore, useGameStore, useProStore } from '@/stores';
import { DECORATION_CATALOG } from '@/stores/gameStore';

const Fortress3D = dynamic(
  () => import('@/components/visuals/Fortress3D').then(mod => ({ default: mod.Fortress3D })),
  { ssr: false, loading: () => <div className="w-full aspect-square flex items-center justify-center"><div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" /></div> }
);

const ACHIEVEMENTS = [
  { id: 'first_setup', label: 'Mulai Petualangan', icon: 'flag', description: 'Selesaikan setup awal' },
  { id: 'first_transaction', label: 'Transaksi Pertama', icon: 'receipt_long', description: 'Catat transaksi pertamamu' },
  { id: 'streak_3', label: '3 Hari Berturut', icon: 'local_fire_department', description: 'Catat 3 hari berturut-turut' },
  { id: 'streak_7', label: 'Seminggu Penuh', icon: 'date_range', description: 'Catat 7 hari berturut-turut' },
  { id: 'budget_master', label: 'Budget Master', icon: 'account_balance_wallet', description: 'Selesaikan bulan tanpa over budget' },
  { id: 'saver_pro', label: 'Saver Pro', icon: 'savings', description: 'Hemat 30% dari budget' },
];

const TYPE_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  flag: { bg: 'bg-red-50', text: 'text-red-600', border: 'border-red-200' },
  torch: { bg: 'bg-orange-50', text: 'text-orange-600', border: 'border-orange-200' },
  banner: { bg: 'bg-purple-50', text: 'text-purple-600', border: 'border-purple-200' },
  garden: { bg: 'bg-green-50', text: 'text-green-600', border: 'border-green-200' },
  fountain: { bg: 'bg-blue-50', text: 'text-blue-600', border: 'border-blue-200' },
};

export default function BattlePage() {
  const router = useRouter();
  const { getHP } = useBudgetStore();
  const { getTotalExpenseThisMonth } = useTransactionStore();
  const { xp, level, streak, achievements, activeDecorations, toggleDecoration, isDecorationUnlocked, getLevelProgress, getLevelName } = useGameStore();
  const { isPro } = useProStore();
  const [activeTab, setActiveTab] = useState<'achievements' | 'decorations'>('achievements');
  const [shakeId, setShakeId] = useState<string | null>(null);
  
  const totalExpense = getTotalExpenseThisMonth();
  const hp = getHP(totalExpense);
  const levelProgress = getLevelProgress();
  
  return (
    <div className="min-h-screen bg-bg-light font-display pb-32 relative overflow-hidden">
      
      {/* Background Elements */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 w-full h-[500px] bg-gradient-to-b from-orange-50/80 to-transparent"></div>
        <div className="absolute top-[-100px] left-[-100px] w-[300px] h-[300px] bg-red-300/10 rounded-full blur-3xl"></div>
        <div className="absolute top-[50px] right-[-50px] w-[200px] h-[200px] bg-yellow-300/10 rounded-full blur-3xl"></div>
      </div>
      
      {/* Desktop Container Wrapper */}
      <div className="flex flex-col md:max-w-5xl md:mx-auto md:px-6 relative z-10 w-full">

      {/* Header */}
      <header className="relative z-10 px-6 pt-12 pb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Benteng</h1>
          <p className="text-gray-500 text-sm">Status pertahanan & misi</p>
        </div>
        <div className="w-10 h-10 glass-card rounded-xl flex items-center justify-center text-primary shadow-soft">
          <span className="material-symbols-outlined">fort</span>
        </div>
      </header>

      <main className="px-6 relative z-10 flex flex-col gap-6">
        
        {/* Fortress Hero Section */}
        <div className="glass-card rounded-[40px] p-6 relative overflow-hidden shadow-soft">
          <div className="absolute inset-0 bg-gradient-to-br from-orange-50/50 to-transparent pointer-events-none"></div>
          
          <div className="relative z-10 flex flex-col items-center">
            <Fortress3D hp={hp} level={level} activeDecorations={activeDecorations} className="transform scale-90 -my-4" />
            
            <div className="text-center mt-2 w-full">
              <div className="inline-flex items-center gap-2 bg-white/50 backdrop-blur-sm px-3 py-1 rounded-full border border-white/60 shadow-sm mb-2">
                <span className="text-xs font-bold text-primary uppercase tracking-wider">Lvl {level}</span>
                <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                <span className="text-xs font-bold text-gray-600">{getLevelName()}</span>
              </div>
              
              <div className="relative h-4 w-full bg-gray-100 rounded-full overflow-hidden shadow-inner mt-2">
                <div 
                  className="absolute top-0 left-0 h-full bg-gradient-to-r from-primary to-purple-400"
                  style={{ width: `${levelProgress.percentage}%` }}
                ></div>
                <div className="absolute inset-0 flex items-center justify-center text-[9px] font-bold text-white/90 drop-shadow-md">
                  {levelProgress.current} / {levelProgress.max} XP
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-3">
          <div className="glass-card p-3 rounded-2xl flex flex-col items-center justify-center gap-1 shadow-sm">
            <span className="material-symbols-outlined text-success text-2xl">favorite</span>
            <span className="text-lg font-black text-gray-800">{hp}%</span>
            <span className="text-[10px] text-gray-400 font-bold uppercase">Health</span>
          </div>
          <div className="glass-card p-3 rounded-2xl flex flex-col items-center justify-center gap-1 shadow-sm">
            <span className="material-symbols-outlined text-warning text-2xl">local_fire_department</span>
            <span className="text-lg font-black text-gray-800">{streak}</span>
            <span className="text-[10px] text-gray-400 font-bold uppercase">Streak</span>
          </div>
          <div className="glass-card p-3 rounded-2xl flex flex-col items-center justify-center gap-1 shadow-sm">
            <span className="material-symbols-outlined text-primary text-2xl">hotel_class</span>
            <span className="text-lg font-black text-gray-800">{xp}</span>
            <span className="text-[10px] text-gray-400 font-bold uppercase">Total XP</span>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex bg-gray-200/50 p-1 rounded-xl">
          <button
            onClick={() => setActiveTab('achievements')}
            className={`cursor-pointer flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
              activeTab === 'achievements' ? 'bg-white text-primary shadow-sm' : 'text-gray-500'
            }`}
          >
            Pencapaian
          </button>
          <button
            onClick={() => setActiveTab('decorations')}
            className={`cursor-pointer flex-1 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1 ${
              activeTab === 'decorations' ? 'bg-white text-primary shadow-sm' : 'text-gray-500'
            }`}
          >
            Dekorasi
            {activeDecorations.length > 0 && (
              <span className="bg-primary text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                {activeDecorations.length}
              </span>
            )}
          </button>
        </div>

        {/* Content List */}
        <div className="flex flex-col gap-3 min-h-[200px]">
          {activeTab === 'achievements' ? (
            ACHIEVEMENTS.map((achievement, index) => {
              const isUnlocked = achievements.includes(achievement.id);
              return (
                <motion.div
                  key={achievement.id}
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: index * 0.1 }}
                  className={`glass-card p-4 rounded-2xl flex items-center gap-4 ${
                    !isUnlocked ? 'opacity-60 grayscale' : 'border-l-4 border-l-primary'
                  }`}
                >
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                    isUnlocked ? 'bg-primary/10 text-primary' : 'bg-gray-100 text-gray-400'
                  }`}>
                    <span className="material-symbols-outlined text-xl">
                      {isUnlocked ? achievement.icon : 'lock'}
                    </span>
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-gray-800">{achievement.label}</h3>
                    <p className="text-xs text-gray-500">{achievement.description}</p>
                  </div>
                </motion.div>
              );
            })
          ) : (
            /* ===== DECORATION INVENTORY GRID ===== */
            <div className="flex flex-col gap-4">
              {/* Active count */}
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                  {activeDecorations.length} / {DECORATION_CATALOG.length} Aktif
                </span>
                <span className="text-[10px] text-gray-400">Tap untuk toggle</span>
              </div>

              {/* Decoration Grid */}
              <div className="grid grid-cols-2 gap-3">
                {DECORATION_CATALOG.map((item, index) => {
                  const unlocked = isDecorationUnlocked(item.id, isPro);
                  const isActive = activeDecorations.includes(item.id);
                  const typeColor = TYPE_COLORS[item.type] || TYPE_COLORS.flag;

                  return (
                    <motion.button
                      key={item.id}
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ 
                        y: 0, 
                        opacity: 1,
                        x: shakeId === item.id ? [-5, 5, -5, 5, 0] : 0
                      }}
                      transition={{ delay: shakeId === item.id ? 0 : index * 0.07, duration: shakeId === item.id ? 0.3 : 0.4 }}
                      onClick={() => {
                        if (unlocked) {
                          toggleDecoration(item.id, isPro);
                        } else {
                          setShakeId(item.id);
                          setTimeout(() => setShakeId(null), 400);
                        }
                      }}
                      className={`relative p-4 rounded-2xl flex flex-col items-center gap-2 text-center transition-all ${unlocked ? 'active:scale-95 cursor-pointer' : 'cursor-not-allowed'} ${
                        !unlocked
                          ? (shakeId === item.id ? 'bg-red-50 border-2 border-red-300 opacity-90' : 'glass-card opacity-50 grayscale')
                          : isActive
                            ? `${typeColor.bg} border-2 ${typeColor.border} shadow-md`
                            : 'glass-card hover:bg-white/80 border border-transparent hover:border-gray-200'
                      }`}
                    >
                      {/* Active indicator */}
                      {isActive && (
                        <div className="absolute top-2 right-2">
                          <span className={`material-symbols-outlined text-sm ${typeColor.text}`}>check_circle</span>
                        </div>
                      )}
                      
                      {/* Lock overlay */}
                      {!unlocked && (
                        <div className="absolute top-2 right-2 flex items-center gap-1 bg-gray-200/80 px-1.5 py-0.5 rounded-md">
                          <span className="material-symbols-outlined text-[10px] text-gray-500">lock</span>
                          <span className="text-[9px] font-bold text-gray-500">Lv.{item.requiredLevel}</span>
                        </div>
                      )}
                      {unlocked && isPro && level < item.requiredLevel && (
                        <div className="absolute top-2 right-2 flex items-center gap-1 bg-amber-100 px-1.5 py-0.5 rounded-md">
                          <span className="material-symbols-outlined text-[10px] text-amber-600">workspace_premium</span>
                          <span className="text-[9px] font-bold text-amber-600">PRO</span>
                        </div>
                      )}

                      {/* Icon */}
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                        !unlocked 
                          ? 'bg-gray-100 text-gray-400' 
                          : isActive 
                            ? `${typeColor.bg} ${typeColor.text}` 
                            : 'bg-gray-50 text-gray-500'
                      }`}>
                        <span className="material-symbols-outlined text-2xl">
                          {unlocked ? item.icon : 'lock'}
                        </span>
                      </div>

                      {/* Text */}
                      <div>
                        <h4 className={`text-xs font-bold ${unlocked ? 'text-gray-800' : 'text-gray-400'}`}>
                          {item.name}
                        </h4>
                        <p className="text-[10px] text-gray-400 leading-tight mt-0.5">
                          {unlocked ? item.description : `Buka di Level ${item.requiredLevel}`}
                        </p>
                      </div>

                      {/* Type badge */}
                      <span className={`text-[8px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                        unlocked ? `${typeColor.bg} ${typeColor.text}` : 'bg-gray-100 text-gray-400'
                      }`}>
                        {item.type}
                      </span>
                    </motion.button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

      </main>
      </div>

      {/* Floating FAB - Adjusted for Desktop */}
      <div className="fixed bottom-[55px] left-0 w-full flex justify-center pointer-events-none z-40 md:bottom-10 md:left-auto md:right-10 md:w-auto md:justify-end">
        <button 
          onClick={() => router.push('/add')}
          className="cursor-pointer pointer-events-auto w-[60px] h-[60px] bg-gradient-to-br from-primary to-primary-dark text-white rounded-full shadow-glow flex items-center justify-center transition-transform hover:scale-110 active:scale-95 group focus:outline-none focus:ring-4 focus:ring-primary/30 border-4 border-white/30 backdrop-blur-sm"
        >
          <span className="material-symbols-outlined text-[30px] group-hover:rotate-90 transition-transform duration-300 drop-shadow-md">add</span>
        </button>
      </div>

      <BottomNav />
    </div>
  );
}
