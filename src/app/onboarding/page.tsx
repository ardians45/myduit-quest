'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useBudgetStore, useGameStore, useTransactionStore } from '@/stores';
import { Fortress3D } from '@/components/visuals/Fortress3D';

const BUDGET_PRESETS = [
  { label: '1 Juta', value: 1000000 },
  { label: '2 Juta', value: 2000000 },
  { label: '3 Juta', value: 3000000 },
  { label: '5 Juta', value: 5000000 },
];

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [budget, setBudget] = useState(2000000);
  const [previewLevel, setPreviewLevel] = useState(1);
  const { setMonthlyBudget, completeOnboarding } = useBudgetStore();
  const { unlockAchievement } = useGameStore();
  const { addTransaction } = useTransactionStore();

  // Auto-level preview animation
  useEffect(() => {
    const interval = setInterval(() => {
      setPreviewLevel(prev => (prev >= 10 ? 1 : prev + 1));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const getPreviewDecorations = (level: number) => {
    const decos = [];
    if (level >= 2) decos.push('red_flag');
    if (level >= 3) decos.push('wall_torch');
    if (level >= 4) decos.push('royal_banner');
    if (level >= 5) decos.push('gold_flag');
    if (level >= 6) decos.push('garden');
    if (level >= 7) decos.push('fountain');
    return decos;
  };

  const handleBudgetChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '');
    setBudget(Number(value) || 0);
  };

  const handleComplete = () => {
    setMonthlyBudget(budget);
    completeOnboarding();
    unlockAchievement('first_setup');
    
    // Add initial balance as first income transaction
    addTransaction({
      amount: budget,
      category: 'salary',
      type: 'income',
      date: new Date().toISOString().split('T')[0],
      note: 'Saldo Awal (Anggaran)',
    });

    router.replace('/dashboard');
  };

  const formatCurrency = (value: number) => 
    new Intl.NumberFormat('id-ID').format(value);

  const variants = {
    enter: { x: 50, opacity: 0 },
    center: { x: 0, opacity: 1 },
    exit: { x: -50, opacity: 0 },
  };

  return (
    <div className="min-h-screen relative overflow-hidden flex flex-col md:flex-row p-6 bg-bg-light font-display text-gray-900 md:p-0">
      
      {/* Background Elements */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 w-full h-full bg-gradient-to-b from-purple-50/50 to-blue-50/30"></div>
        <div className="absolute top-[20%] left-[-20%] w-[140%] h-[40%] bg-purple-200/20 rounded-[100%] blur-3xl transform -rotate-12"></div>
        <div className="absolute top-[30%] right-[-10%] w-[80%] h-[50%] bg-indigo-200/20 rounded-[100%] blur-3xl"></div>
      </div>

      {/* Desktop Branding (Top Left) */}
      <div className="absolute top-8 left-8 z-30 hidden md:flex items-center gap-3">
        <div className="w-10 h-10 bg-gradient-to-br from-primary to-purple-600 rounded-xl flex items-center justify-center shadow-lg text-white">
          <span className="material-symbols-outlined">fort</span>
        </div>
        <div>
          <h1 className="text-lg font-bold text-gray-900 leading-none">MyDuit Quest</h1>
          <p className="text-xs text-gray-500 font-medium">Financial Fortress</p>
        </div>
      </div>

      {/* Left Col: Visual (Desktop) */}
      <div className="hidden md:flex md:w-1/2 lg:w-[55%] h-screen items-center justify-center relative z-10 bg-white/30 backdrop-blur-sm border-r border-white/50">
         <div className="relative w-full max-w-lg aspect-square flex items-center justify-center">
            <div className="transform scale-150 transition-transform duration-700 hover:scale-[1.6]">
              <Fortress3D level={previewLevel} activeDecorations={getPreviewDecorations(previewLevel)} />
            </div>
            
            {/* Floating Elements */}
            <motion.div 
              animate={{ y: [0, -20, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className="absolute top-[20%] left-[10%] bg-white/90 backdrop-blur-md p-4 rounded-2xl shadow-xl border border-white/50"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-100 text-green-600 rounded-full flex items-center justify-center">
                  <span className="material-symbols-outlined">savings</span>
                </div>
                <div>
                  <p className="text-xs text-gray-400 font-bold uppercase">Budget</p>
                  <p className="text-sm font-bold text-gray-800">Terkendali</p>
                </div>
              </div>
            </motion.div>

            <motion.div 
              animate={{ y: [0, 20, 0] }}
              transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
              className="absolute bottom-[25%] right-[10%] bg-white/90 backdrop-blur-md p-4 rounded-2xl shadow-xl border border-white/50"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center">
                  <span className="material-symbols-outlined">shield</span>
                </div>
                <div>
                  <p className="text-xs text-gray-400 font-bold uppercase">Pertahanan</p>
                  <p className="text-sm font-bold text-gray-800">Aman</p>
                </div>
              </div>
            </motion.div>
         </div>
      </div>

      {/* Right Col: Interaction */}
      <div className="w-full md:w-1/2 lg:w-[45%] min-h-[100dvh] md:min-h-screen flex flex-col items-center justify-center p-6 py-10 md:p-12 lg:p-20 relative z-20">
        <div className="w-full h-full max-w-md flex flex-col justify-center">
          <AnimatePresence mode="wait">
            
            {/* Step 1: Welcome */}
            {step === 1 && (
              <motion.div
                key="step1"
                variants={variants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.4 }}
                className="flex flex-col items-center md:items-start text-center md:text-left h-full justify-center"
              >
                {/* Mobile Visual */}
                <motion.div 
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="mb-8 md:hidden flex justify-center w-full relative"
                >
                  <div className="w-48 h-48 sm:w-56 sm:h-56 relative flex items-center justify-center mt-4 mb-4">
                    <Fortress3D level={previewLevel} activeDecorations={getPreviewDecorations(previewLevel)} className="w-full h-full transform scale-125" />
                    
                    {/* Floating Elements (Mobile Adapted) */}
                    <motion.div 
                      animate={{ y: [0, -5, 0] }}
                      transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                      className="absolute top-[-10%] left-[-15%] bg-white/95 backdrop-blur-md p-2 rounded-xl shadow-lg border border-white/50 z-20 flex items-center gap-2"
                    >
                      <div className="w-7 h-7 sm:w-8 sm:h-8 bg-green-100 text-green-600 rounded-full flex items-center justify-center shrink-0">
                        <span className="material-symbols-outlined text-sm">savings</span>
                      </div>
                      <div className="text-left hidden xs:block">
                        <p className="text-[9px] sm:text-[10px] text-gray-400 font-bold uppercase leading-none mb-0.5">Budget</p>
                        <p className="text-[10px] sm:text-xs font-bold text-gray-800 leading-none">Terkendali</p>
                      </div>
                    </motion.div>

                    <motion.div 
                      animate={{ y: [0, 5, 0] }}
                      transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                      className="absolute bottom-[-5%] right-[-15%] bg-white/95 backdrop-blur-md p-2 rounded-xl shadow-lg border border-white/50 z-20 flex items-center gap-2"
                    >
                      <div className="text-right hidden xs:block">
                        <p className="text-[9px] sm:text-[10px] text-gray-400 font-bold uppercase leading-none mb-0.5">Pertahanan</p>
                        <p className="text-[10px] sm:text-xs font-bold text-gray-800 leading-none">Aman</p>
                      </div>
                      <div className="w-7 h-7 sm:w-8 sm:h-8 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center shrink-0">
                        <span className="material-symbols-outlined text-sm">shield</span>
                      </div>
                    </motion.div>
                  </div>
                </motion.div>

                <div className="bg-primary/10 text-primary px-3 py-1.5 rounded-full text-[10px] md:text-sm font-bold mb-3 inline-flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
                  Misi 1: Setup Awal
                </div>

                <h1 className="text-3xl sm:text-4xl md:text-5xl font-black mb-3 text-gray-900 leading-[1.1]">
                  Siapkan <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-purple-600">Pertahanan</span> Finansialmu!
                </h1>
                <p className="text-gray-500 mb-8 leading-relaxed text-sm sm:text-base md:text-lg md:pr-10">
                  Bangun benteng yang kuat. Setiap pengeluaran adalah serangan, dan budget adalah HP-mu. Siap bertahan?
                </p>

                <div className="w-full mt-auto md:mt-0">
                  <button
                    onClick={() => setStep(2)}
                    className="w-full bg-gray-900 text-white font-bold text-base md:text-lg px-6 py-4 rounded-2xl md:rounded-2xl shadow-xl hover:scale-[1.02] hover:bg-gray-800 active:scale-[0.98] transition-all flex items-center justify-center gap-3 group"
                  >
                    <span>Mulai Misi</span>
                    <span className="material-symbols-outlined text-[20px] md:text-[24px] group-hover:translate-x-1 transition-transform">arrow_forward</span>
                  </button>
                </div>
              </motion.div>
            )}

            {/* Step 2: Set Budget */}
            {step === 2 && (
              <motion.div
                key="step2"
                variants={variants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.4 }}
                className="w-full flex flex-col h-full justify-center text-center md:text-left"
              >
                <div>
                  <div className="flex items-center justify-between md:justify-start gap-4 mb-4 md:mb-6">
                    <button 
                      onClick={() => setStep(1)}
                      className="w-10 h-10 md:w-12 md:h-12 rounded-full border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-colors"
                    >
                      <span className="material-symbols-outlined text-gray-600 text-[20px] md:text-[24px]">arrow_back</span>
                    </button>
                    <span className="text-xs md:text-sm font-bold text-gray-400">Langkah 2 dari 3</span>
                  </div>

                  <div className="mb-4">
                    <h2 className="text-2xl md:text-3xl font-black text-gray-900 mb-2 md:mb-3">Suplai Anggaran</h2>
                    <p className="text-gray-500 text-sm md:text-lg">
                      Tentukan batas pengeluaran bulananmu.
                    </p>
                  </div>
                  
                  {/* Mobile Visual inside Step 2 */}
                  <div className="md:hidden flex flex-col items-center justify-center w-full my-6 relative">
                    <div className="w-40 h-40 sm:w-48 sm:h-48 relative flex items-center justify-center">
                      <Fortress3D level={previewLevel} activeDecorations={getPreviewDecorations(previewLevel)} className="w-full h-full transform scale-110" />
                      
                      {/* Floating Elements (Mobile Adapted) */}
                      <motion.div 
                        animate={{ y: [0, -5, 0] }}
                        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                        className="absolute top-[-10%] left-[-15%] bg-white/95 backdrop-blur-md p-2 rounded-xl shadow-sm border border-white/50 z-20 flex items-center gap-2 pointer-events-none"
                      >
                        <div className="w-7 h-7 bg-green-100 text-green-600 rounded-full flex items-center justify-center shrink-0">
                          <span className="material-symbols-outlined text-sm">savings</span>
                        </div>
                      </motion.div>

                      <motion.div 
                        animate={{ y: [0, 5, 0] }}
                        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                        className="absolute bottom-[-5%] right-[-15%] bg-white/95 backdrop-blur-md p-2 rounded-xl shadow-sm border border-white/50 z-20 flex items-center gap-2 pointer-events-none"
                      >
                        <div className="w-7 h-7 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center shrink-0">
                          <span className="material-symbols-outlined text-sm">shield</span>
                        </div>
                      </motion.div>
                    </div>
                  </div>

                  <div className="py-2 md:py-6 relative z-30 mb-4">
                    <div className="relative w-full">
                      <span className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-lg md:text-2xl">Rp</span>
                      <input
                        type="text"
                        inputMode="numeric"
                        value={formatCurrency(budget)}
                        onChange={handleBudgetChange}
                        className="w-full bg-white border-2 border-gray-100 rounded-2xl py-4 md:py-5 pl-16 md:pl-20 pr-4 md:pr-6 text-2xl sm:text-3xl md:text-4xl font-black text-gray-900 focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all shadow-sm text-left"
                        placeholder="0"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 mb-8 md:mb-10 relative z-30">
                    {BUDGET_PRESETS.map((preset) => (
                      <button
                        key={preset.value}
                        onClick={() => setBudget(preset.value)}
                        className={`py-3 md:py-4 px-2 rounded-xl text-xs md:text-sm font-bold transition-all border-2 ${
                          budget === preset.value
                            ? 'bg-primary/5 text-primary border-primary shadow-sm'
                            : 'bg-white text-gray-500 border-gray-100 hover:bg-gray-50 hover:border-gray-200'
                        }`}
                      >
                        {preset.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="mt-auto w-full relative z-30">
                  <button
                    onClick={() => setStep(3)}
                    disabled={budget < 100000}
                    className="w-full bg-gray-900 text-white font-bold text-base md:text-lg px-6 py-4 rounded-2xl shadow-xl hover:scale-[1.02] hover:bg-gray-800 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
                  >
                    <span>Lanjut</span>
                    <span className="material-symbols-outlined text-[20px] md:text-[24px]">arrow_forward</span>
                  </button>
                </div>
              </motion.div>
            )}

            {/* Step 3: Confirm */}
            {step === 3 && (
              <motion.div
                key="step3"
                variants={variants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.4 }}
                className="w-full flex flex-col h-full justify-center text-center md:text-left"
              >
                {/* Mobile Visual inside Step 3 */}
                <div className="md:hidden flex flex-col items-center justify-center w-full mb-6 relative">
                  <div className="w-56 h-56 relative flex items-center justify-center">
                    <Fortress3D level={previewLevel} activeDecorations={getPreviewDecorations(previewLevel)} className="w-full h-full transform scale-125" />
                  </div>
                </div>

                <div className="mb-6">
                  <div className="w-16 h-16 bg-success/10 text-success rounded-3xl flex items-center justify-center mb-4 mx-auto md:mx-0">
                    <span className="material-symbols-outlined text-4xl text-success drop-shadow-sm">verified</span>
                  </div>
                  <h2 className="text-3xl font-black text-gray-900 mb-2">Benteng Siap!</h2>
                  <p className="text-gray-500 text-base leading-relaxed">
                    Pertahananmu sudah terpasang kokoh.
                  </p>
                </div>

                <div className="w-full bg-white p-5 md:p-6 rounded-3xl border border-gray-100 mb-8 shadow-sm">
                  <div className="flex justify-between items-center mb-4 border-b border-gray-100 pb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center">
                        <span className="material-symbols-outlined text-[18px]">shield</span>
                      </div>
                      <span className="text-gray-600 font-bold text-base">Integritas</span>
                    </div>
                    <span className="text-success font-black text-xl">Aman</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-green-50 text-green-600 flex items-center justify-center">
                        <span className="material-symbols-outlined text-[18px]">account_balance_wallet</span>
                      </div>
                      <span className="text-gray-600 font-bold text-base">Anggaran</span>
                    </div>
                    <span className="text-gray-900 font-black text-xl text-right">Rp {formatCurrency(budget)}</span>
                  </div>
                </div>

                <div className="flex flex-col gap-3 w-full mt-auto relative z-30">
                  <button
                    onClick={handleComplete}
                    className="w-full bg-primary text-white font-bold text-base md:text-lg px-6 py-4 rounded-2xl shadow-glow hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3 group"
                  >
                    <span>Masuk Arena</span>
                    <span className="material-symbols-outlined text-[20px] md:text-[24px] group-hover:translate-x-1 transition-transform">swords</span>
                  </button>
                  <button
                    onClick={() => setStep(2)}
                    className="w-full py-3 text-gray-400 font-bold text-sm hover:text-gray-600 transition-colors"
                  >
                    Kembali Ubah Anggaran
                  </button>
                </div>
              </motion.div>
            )}

          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
