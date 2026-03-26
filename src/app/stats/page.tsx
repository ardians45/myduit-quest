'use client';

import { useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useTransactionStore, useBudgetStore, useProStore } from '@/stores';
import { BottomNav } from '@/components/layout/BottomNav';
import { motion } from 'framer-motion';

export default function StatsPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [isCustomizing, setIsCustomizing] = useState(false);
  const [showUpgradePrompt, setShowUpgradePrompt] = useState(false);
  const [customPercents, setCustomPercents] = useState({ needs: 50, wants: 30, savings: 20 });
  const { transactions } = useTransactionStore();
  const { monthlyBudget, allocations, setAllocations } = useBudgetStore();
  const { isPro } = useProStore();
  
  // Month selection state
  const [selectedMonthOffset, setSelectedMonthOffset] = useState(0); // 0 = current, -1 = last month, 1 = next month

  const targetDate = useMemo(() => {
    const d = new Date();
    d.setMonth(d.getMonth() + selectedMonthOffset);
    return d;
  }, [selectedMonthOffset]);

  const currentMonth = targetDate.toISOString().slice(0, 7); // YYYY-MM
  const lastMonth = useMemo(() => {
    const d = new Date(targetDate);
    d.setMonth(d.getMonth() - 1);
    return d.toISOString().slice(0, 7);
  }, [targetDate]);

  const totalExpense = useMemo(() => {
    return transactions.filter(t => t.type === 'expense' && t.date.startsWith(currentMonth)).reduce((sum, t) => sum + t.amount, 0);
  }, [transactions, currentMonth]);

  const totalIncome = useMemo(() => {
    return transactions.filter(t => t.type === 'income' && t.date.startsWith(currentMonth)).reduce((sum, t) => sum + t.amount, 0);
  }, [transactions, currentMonth]);

  const netBalance = totalIncome - totalExpense;

  const handlePrevMonth = () => {
    if (selectedMonthOffset > -12) setSelectedMonthOffset(prev => prev - 1);
  };
  const handleNextMonth = () => {
    if (selectedMonthOffset < 12) setSelectedMonthOffset(prev => prev + 1);
  };

  const monthLabel = targetDate.toLocaleDateString('id-ID', { month: 'short', year: 'numeric' });

  useEffect(() => {
    setMounted(true);
  }, []);

  // 1. Daily Spending Pattern
  const dailyPattern = useMemo(() => {
    const dailyExpenses: Record<string, number> = {};
    transactions
      .filter(t => t.type === 'expense' && t.date.startsWith(currentMonth))
      .forEach(t => {
        const day = new Date(t.date).getDate();
        dailyExpenses[day] = (dailyExpenses[day] || 0) + t.amount;
      });
    
    const maxExpense = Math.max(...Object.values(dailyExpenses), 1);
    const busiestDay = Object.entries(dailyExpenses).sort(([,a], [,b]) => b - a)[0];
    
    return { dailyExpenses, maxExpense, busiestDay };
  }, [transactions, currentMonth]);

  // 2. Transaction Frequency
  const frequency = useMemo(() => {
    const thisMonthTransactions = transactions.filter(t => t.date.startsWith(currentMonth));
    const lastMonthTransactions = transactions.filter(t => t.date.startsWith(lastMonth));
    
    return {
      thisMonth: thisMonthTransactions.length,
      lastMonth: lastMonthTransactions.length,
      expenseCount: thisMonthTransactions.filter(t => t.type === 'expense').length,
      incomeCount: thisMonthTransactions.filter(t => t.type === 'income').length,
    };
  }, [transactions, currentMonth, lastMonth]);

  // 3. Month-over-Month Comparison
  const momComparison = useMemo(() => {
    const lastMonthExpense = transactions
      .filter(t => t.type === 'expense' && t.date.startsWith(lastMonth))
      .reduce((sum, t) => sum + t.amount, 0);
    
    if (lastMonthExpense === 0) return { change: 0, isIncrease: false, insight: "Data bulan lalu belum ada" };
    
    const change = ((totalExpense - lastMonthExpense) / lastMonthExpense) * 100;
    const isIncrease = change > 0;
    
    let insight = "";
    if (Math.abs(change) < 5) {
      insight = "Pengeluaran stabil seperti bulan lalu";
    } else if (isIncrease) {
      insight = `Pengeluaran naik ${Math.abs(change).toFixed(0)}% dari bulan lalu ⚠️`;
    } else {
      insight = `Kamu hemat ${Math.abs(change).toFixed(0)}% dibanding bulan lalu! 🎉`;
    }
    
    return { change, isIncrease, insight };
  }, [transactions, totalExpense, lastMonth]);

  // Category Breakdown
  const categoryBreakdown = useMemo(() => {
    const breakdown: Record<string, number> = {};
    transactions.forEach((t) => {
      if (t.type === 'expense' && t.date.startsWith(currentMonth)) {
        breakdown[t.category] = (breakdown[t.category] || 0) + t.amount;
      }
    });
    return Object.entries(breakdown)
      .sort(([, a], [, b]) => b - a)
      .map(([category, amount]) => ({
        category,
        amount,
        percentage: totalExpense > 0 ? (amount / totalExpense) * 100 : 0,
      }));
  }, [transactions, totalExpense, currentMonth]);

  const getCategoryIcon = (category: string) => {
    const map: Record<string, string> = {
      food: 'restaurant',
      transport: 'directions_car',
      shopping: 'shopping_bag',
      entertainment: 'sports_esports',
      education: 'school',
      health: 'medical_services',
      utilities: 'bolt',
      salary: 'payments',
      gift: 'redeem',
      other: 'inventory_2',
    };
    return map[category] || 'category';
  };

  const getCategoryColor = (index: number) => {
    const colors = ['bg-pink-500', 'bg-blue-500', 'bg-orange-500', 'bg-green-500', 'bg-purple-500'];
    return colors[index % colors.length];
  };

  const formatCurrency = (value: number) => 
    new Intl.NumberFormat('id-ID').format(value);

  // === SUB-BUDGET (ALLOCATIONS) LOGIC ===
  const ALLOCATION_TEMPLATES = [
    {
      id: 'classic',
      title: 'Strategi Pemula (50/30/20)',
      description: 'Metode klasik yang seimbang.',
      allocations: [
        { id: 'needs', name: 'Logistik (Kebutuhan)', percentage: 50, icon: 'home', categories: ['food', 'utilities', 'health', 'education'] },
        { id: 'wants', name: 'Tavern (Hiburan)', percentage: 30, icon: 'sports_esports', categories: ['shopping', 'entertainment', 'other'] },
        { id: 'savings', name: 'Peti Emas (Tabungan)', percentage: 20, icon: 'savings', categories: [] }
      ]
    },
    {
      id: 'student',
      title: 'Strategi Mahasiswa',
      description: 'Fokus bertahan hidup & berhemat.',
      allocations: [
        { id: 'needs', name: 'Ransum Makanan', percentage: 40, icon: 'restaurant', categories: ['food'] },
        { id: 'transport', name: 'Kuda / Transport', percentage: 20, icon: 'directions_car', categories: ['transport'] },
        { id: 'wants', name: 'Lainnya', percentage: 20, icon: 'extension', categories: ['shopping', 'entertainment', 'other', 'health', 'education'] },
        { id: 'savings', name: 'Tabungan', percentage: 20, icon: 'account_balance', categories: [] }
      ]
    }
  ];

  const handleCustomPercentsChange = (key: 'needs' | 'wants' | 'savings', value: number) => {
    setCustomPercents(prev => ({ ...prev, [key]: value }));
  };

  const customTotal = customPercents.needs + customPercents.wants + customPercents.savings;

  const handleSaveCustom = () => {
    if (customTotal !== 100) return;
    
    setAllocations([
      { id: 'needs', name: 'Logistik (Kebutuhan)', percentage: customPercents.needs, icon: 'home', categories: ['food', 'utilities', 'health', 'education'] },
      { id: 'wants', name: 'Tavern (Hiburan)', percentage: customPercents.wants, icon: 'sports_esports', categories: ['shopping', 'entertainment', 'other'] },
      { id: 'savings', name: 'Peti Emas (Tabungan)', percentage: customPercents.savings, icon: 'savings', categories: [] }
    ]);
    setIsCustomizing(false);
  };

  const allocationUsage = useMemo(() => {
    return allocations.map(alloc => {
      const budgetAmount = (alloc.percentage / 100) * monthlyBudget;
      const spentAmount = transactions
        .filter(t => t.type === 'expense' && t.date.startsWith(currentMonth))
        .filter(t => alloc.categories.includes(t.category))
        .reduce((sum, t) => sum + t.amount, 0);
      
      const percentageUsed = budgetAmount > 0 ? (spentAmount / budgetAmount) * 100 : 0;
      return { ...alloc, budgetAmount, spentAmount, percentageUsed };
    });
  }, [allocations, transactions, currentMonth, monthlyBudget]);

  // Hydration check - prevent SSR/CSR mismatch
  if (!mounted) {
    return (
      <div className="min-h-screen bg-bg-light flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="animate-spin w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full"></div>
          <span className="text-sm text-gray-500">Memuat statistik...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg-light font-display pb-32 relative overflow-hidden">
      
      {/* Background Elements */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 w-full h-[500px] bg-gradient-to-b from-indigo-50/80 to-transparent"></div>
        <div className="absolute top-[-100px] left-[-100px] w-[300px] h-[300px] bg-purple-300/20 rounded-full blur-3xl"></div>
        <div className="absolute top-[50px] right-[-50px] w-[200px] h-[200px] bg-blue-300/20 rounded-full blur-3xl"></div>
      </div>
      {/* Desktop Container Wrapper */}
      <div className="flex flex-col md:max-w-5xl md:mx-auto md:px-6 relative z-10 w-full">
        {/* Header */}
      <header className="relative z-10 px-6 pt-12 pb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Statistik</h1>
          <p className="text-gray-500 text-sm">Analisis pengeluaranmu</p>
        </div>
        <button 
          onClick={() => router.push('/transactions')}
          className="w-10 h-10 glass-card rounded-xl flex items-center justify-center text-primary shadow-soft hover:bg-white hover:scale-105 transition-all active:scale-95"
        >
          <span className="material-symbols-outlined">receipt_long</span>
        </button>
      </header>

      <main className="px-6 relative z-10 flex flex-col gap-6">
        
        {/* Summary Card - Financial Overview with Pie Chart */}
        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="glass-card p-6 rounded-super shadow-soft relative overflow-hidden"
        >
          <div className="absolute right-0 top-0 w-32 h-32 bg-gradient-to-bl from-primary/10 to-transparent rounded-bl-full pointer-events-none"></div>
          
          <div className="flex flex-col gap-5 relative z-10">
            <div className="flex items-center justify-between">
              <span className="text-gray-500 text-xs sm:text-sm font-bold uppercase tracking-wider">Ringkasan</span>
              <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1 z-20">
                <button onClick={handlePrevMonth} disabled={selectedMonthOffset <= -12} className="w-7 h-7 flex items-center justify-center rounded hover:bg-white disabled:opacity-30 transition-colors shadow-sm"><span className="material-symbols-outlined text-[18px]">chevron_left</span></button>
                <span className="text-xs font-bold w-20 text-center text-gray-700">{selectedMonthOffset === 0 ? 'Bulan Ini' : monthLabel}</span>
                <button onClick={handleNextMonth} disabled={selectedMonthOffset >= 12} className="w-7 h-7 flex items-center justify-center rounded hover:bg-white disabled:opacity-30 transition-colors shadow-sm"><span className="material-symbols-outlined text-[18px]">chevron_right</span></button>
              </div>
            </div>
            
            {/* Pie Chart + Stats Row */}
            <div className="flex items-center gap-5">
              
              {/* Animated SVG Donut Chart */}
              <div className="relative w-[130px] h-[130px] flex-shrink-0">
                <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90 drop-shadow-sm">
                  {categoryBreakdown.length > 0 ? (
                    (() => {
                      const PIE_COLORS = ['#ec4899', '#3b82f6', '#f97316', '#22c55e', '#a855f7', '#eab308', '#06b6d4', '#ef4444'];
                      let cumulative = 0;
                      const r = 35;
                      const circumference = 2 * Math.PI * r;
                      return categoryBreakdown.map((item, index) => {
                        const dashLength = (item.percentage / 100) * circumference;
                        const dashOffset = -(cumulative / 100) * circumference;
                        cumulative += item.percentage;
                        
                        return (
                          <motion.circle
                            key={item.category}
                            cx="50"
                            cy="50"
                            r={r}
                            fill="transparent"
                            stroke={PIE_COLORS[index % PIE_COLORS.length]}
                            strokeWidth="18"
                            strokeDasharray={`${dashLength} ${circumference}`}
                            strokeDashoffset={dashOffset}
                            initial={{ strokeDasharray: `0 ${circumference}` }}
                            animate={{ strokeDasharray: `${dashLength} ${circumference}` }}
                            transition={{ duration: 1, delay: index * 0.1, ease: "easeOut" }}
                            className="cursor-pointer hover:opacity-80 transition-opacity"
                          />
                        );
                      });
                    })()
                  ) : (
                    // Empty State Check
                    <motion.circle
                      cx="50" cy="50" r="35"
                      fill="transparent" stroke="#e2e8f0" strokeWidth="18"
                      strokeDasharray={`${2 * Math.PI * 35} ${2 * Math.PI * 35}`}
                      initial={{ strokeDasharray: `0 ${2 * Math.PI * 35}` }}
                      animate={{ strokeDasharray: `${2 * Math.PI * 35} ${2 * Math.PI * 35}` }}
                      transition={{ duration: 1 }}
                    />
                  )}
                </svg>

                {/* Center Label inside Donut */}
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Total</span>
                  <span className="text-sm font-black text-gray-800 shrink-to-fit">
                    {totalExpense > 0 ? `${(totalExpense / 1000).toFixed(0)}K` : '0'}
                  </span>
                </div>
              </div>

              {/* Legend + Quick Stats Right Side */}
              <div className="flex-1 flex flex-col gap-2 min-w-0">
                {categoryBreakdown.length > 0 ? (
                  categoryBreakdown.slice(0, 4).map((item, index) => {
                    const PIE_COLORS_HEX = ['#ec4899', '#3b82f6', '#f97316', '#22c55e', '#a855f7'];
                    return (
                      <div key={item.category} className="flex flex-row items-center justify-between mb-1">
                        <div className="flex flex-row items-center gap-2 flex-1 min-w-0 pr-2">
                          <div 
                            className="w-2 h-2 rounded-full flex-shrink-0" 
                            style={{ backgroundColor: PIE_COLORS_HEX[index % PIE_COLORS_HEX.length] }}
                          ></div>
                          <span className="text-[11px] font-bold text-gray-700 capitalize truncate leading-none">{item.category}</span>
                        </div>
                        <span className="text-[10px] font-bold text-gray-400 leading-none">{Math.round(item.percentage)}%</span>
                      </div>
                    );
                  })
                ) : (
                  <p className="text-xs text-gray-400">Belum ada data</p>
                )}
                {categoryBreakdown.length > 4 && (
                  <span className="text-[10px] text-gray-400 pl-4 mt-1">+{categoryBreakdown.length - 4} lainnya</span>
                )}
              </div>
            </div>
            
            {/* Income, Expense, Net Balance Bottom Slice */}
            <div className="grid grid-cols-3 gap-3 pt-4 mt-1 border-t border-gray-100">
              {/* Income */}
              <div className="flex flex-col">
                <span className="text-[9px] font-bold text-gray-400 uppercase">Pemasukan</span>
                <span className="text-xs font-bold text-success mt-1 truncate">+Rp {formatCurrency(totalIncome)}</span>
              </div>
              
              {/* Expense */}
              <div className="flex flex-col text-center border-x border-gray-100 px-2">
                <span className="text-[9px] font-bold text-gray-400 uppercase">Pengeluaran</span>
                <span className="text-xs font-bold text-danger mt-1 truncate">-Rp {formatCurrency(totalExpense)}</span>
              </div>
              
              {/* Net Balance */}
              <div className="flex flex-col text-right">
                <span className="text-[9px] font-bold text-gray-400 uppercase">Sisa</span>
                <span className={`text-xs font-bold mt-1 truncate ${netBalance >= 0 ? 'text-gray-800' : 'text-danger'}`}>
                  {netBalance >= 0 ? '' : '-'}Rp {formatCurrency(Math.abs(netBalance))}
                </span>
              </div>
            </div>

            {/* Budget Progress Bar */}
            <div className="flex flex-col gap-2 pt-3 border-t border-gray-100">
              <div className="flex justify-between items-end">
                <span className="text-[10px] font-bold text-gray-500">Total Penggunaan HP Benteng</span>
                <span className="text-xs font-bold text-gray-800">{monthlyBudget > 0 ? Math.round((totalExpense / monthlyBudget) * 100) : 0}%</span>
              </div>
              <div className="h-2.5 w-full bg-gray-100 rounded-full overflow-hidden shadow-inner flex border border-gray-200/50">
                <div 
                  className={`h-full transition-all duration-1000 ${
                    monthlyBudget > 0 && (totalExpense / monthlyBudget) > 0.9 ? 'bg-red-500' : 
                    monthlyBudget > 0 && (totalExpense / monthlyBudget) > 0.7 ? 'bg-amber-400' : 'bg-gradient-to-r from-indigo-500 to-purple-500'
                  }`}
                  style={{ width: `${monthlyBudget > 0 ? Math.min((totalExpense / monthlyBudget) * 100, 100) : 0}%` }}
                ></div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* NEW: SUB-BUDGET ALLOCATIONS */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-gray-800">Distribusi Ransum (Sub-Budget)</h2>
            {allocations.length > 0 && (
               <button onClick={() => setAllocations([])} className="text-[10px] font-bold text-gray-400 hover:text-danger">
                 Reset Strategi
               </button>
            )}
          </div>

          {allocations.length === 0 ? (
            <div className="glass-card p-5 rounded-2xl border-2 border-dashed border-primary/30 flex flex-col gap-4">
              <div className="text-center">
                <div className="w-12 h-12 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto mb-2">
                  <span className="material-symbols-outlined text-2xl">account_tree</span>
                </div>
                <h3 className="text-sm font-bold text-gray-900 mb-1">Pilih Strategi Bertahan</h3>
                <p className="text-[10px] sm:text-xs text-gray-500 px-4">Bagi HP Bentengmu ke beberapa pos untuk melacak pengeluaran lebih detail.</p>
              </div>
              <div className="flex flex-col gap-3">
                {ALLOCATION_TEMPLATES.map((tmpl) => (
                  <button 
                    key={tmpl.id}
                    onClick={() => setAllocations(tmpl.allocations)}
                    className="flex flex-col text-left p-4 rounded-xl border border-gray-100 bg-white shadow-sm hover:border-primary/50 hover:shadow-md transition-all group"
                  >
                    <div className="flex justify-between items-center mb-1">
                       <span className="text-sm font-bold text-gray-800 group-hover:text-primary transition-colors">{tmpl.title}</span>
                       <span className="material-symbols-outlined text-gray-300 group-hover:text-primary">arrow_forward_ios</span>
                    </div>
                    <span className="text-xs text-gray-500 mb-3">{tmpl.description}</span>
                    <div className="flex items-center gap-1">
                      {tmpl.allocations.map(a => (
                        <div key={a.id} className="h-2 rounded-full bg-primary/40" style={{ width: `${a.percentage}%` }} title={`${a.percentage}%`}></div>
                      ))}
                    </div>
                  </button>
                ))}

                {/* Custom Strategy Option */}
                {!isCustomizing ? (
                  <button 
                    onClick={() => setIsCustomizing(true)}
                    className="flex flex-col items-center justify-center p-4 rounded-xl border-2 border-dashed border-gray-200 text-gray-500 hover:border-primary hover:text-primary transition-all group"
                  >
                    <span className="material-symbols-outlined mb-1 group-hover:scale-110 transition-transform">tune</span>
                    <span className="text-xs font-bold">Kustom Strategi Sendiri</span>
                  </button>
                ) : (
                  <div className="p-4 rounded-xl border border-primary/20 bg-primary/5 flex flex-col gap-4">
                    <div className="flex justify-between items-center mb-2">
                       <span className="text-sm font-bold text-gray-800">Atur Ransum</span>
                       <span className={`text-xs font-bold ${customTotal === 100 ? 'text-success' : 'text-danger'}`}>
                         Total: {customTotal}%
                       </span>
                    </div>

                    {/* Sliders */}
                    {[
                      { key: 'needs', label: 'Logistik (Kebutuhan)', icon: 'home', color: 'bg-blue-500' },
                      { key: 'wants', label: 'Tavern (Hiburan)', icon: 'sports_esports', color: 'bg-orange-500' },
                      { key: 'savings', label: 'Peti Emas (Tabungan)', icon: 'savings', color: 'bg-green-500' },
                    ].map(st => (
                      <div key={st.key} className="flex flex-col gap-1">
                        <div className="flex justify-between items-center text-[10px] font-bold text-gray-600">
                          <div className="flex items-center gap-1">
                            <span className="material-symbols-outlined text-[14px]">{st.icon}</span>
                            <span>{st.label}</span>
                          </div>
                          <span>{customPercents[st.key as keyof typeof customPercents]}%</span>
                        </div>
                        <input 
                          type="range" min="0" max="100" step="5"
                          value={customPercents[st.key as keyof typeof customPercents]}
                          onChange={(e) => handleCustomPercentsChange(st.key as keyof typeof customPercents, parseInt(e.target.value))}
                          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary"
                        />
                      </div>
                    ))}

                    <div className="flex gap-2 mt-2">
                      <button 
                         onClick={() => setIsCustomizing(false)}
                         className="flex-1 py-2 rounded-lg bg-white border border-gray-200 text-gray-600 font-bold text-xs"
                      >
                         Batal
                      </button>
                      <button 
                         onClick={handleSaveCustom}
                         disabled={customTotal !== 100}
                         className="flex-1 py-2 rounded-lg bg-primary text-white font-bold text-xs disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                         Simpan
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {allocationUsage.map((alloc, idx) => (
                <div key={alloc.id} className="glass-card p-4 rounded-2xl flex flex-col gap-3">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                       <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-white shrink-0 shadow-sm ${getCategoryColor(idx)}`}>
                         <span className="material-symbols-outlined text-[16px]">{alloc.icon}</span>
                       </div>
                       <div>
                         <span className="text-sm font-bold text-gray-800 block leading-tight">{alloc.name}</span>
                         <span className="text-[10px] font-bold text-gray-500 block leading-tight">{alloc.percentage}% Anggaran</span>
                       </div>
                    </div>
                    <div className="text-right">
                       <span className="text-xs font-black text-gray-900 block leading-tight">Rp {formatCurrency(alloc.budgetAmount - alloc.spentAmount)}</span>
                       <span className="text-[9px] font-bold text-gray-400 block leading-tight">Sisa Target</span>
                    </div>
                  </div>
                  
                  {/* Progress Bar for the Allocation */}
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-2.5 bg-gray-100 rounded-full overflow-hidden shadow-inner flex border border-gray-200/50">
                      <div 
                        className={`h-full transition-all duration-700 ${
                          alloc.percentageUsed > 100 ? 'bg-danger' : 
                          alloc.percentageUsed > 80 ? 'bg-amber-500' : 'bg-success'
                        }`}
                        style={{ width: `${Math.min(alloc.percentageUsed, 100)}%` }}
                      ></div>
                    </div>
                    <span className="text-[10px] font-bold w-9 text-right text-gray-600">{Math.round(alloc.percentageUsed)}%</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* NEW: Insights Grid (Frequency + MoM) */}
        <div className="grid grid-cols-2 gap-3">
          {/* Transaction Frequency */}
          <motion.div
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="glass-card rounded-2xl p-4 shadow-sm"
          >
            <div className="flex items-center gap-2 mb-2">
              <span className="material-symbols-outlined text-indigo-500 text-[20px]">receipt</span>
              <span className="text-[10px] font-bold text-gray-400 uppercase">Frekuensi</span>
            </div>
            <div className="flex items-baseline gap-1 mb-1">
              <span className="text-2xl font-black text-gray-800">{frequency.thisMonth}</span>
              <span className="text-xs font-bold text-gray-400">transaksi</span>
            </div>
            <div className="text-[10px] text-gray-500">
              {frequency.thisMonth - frequency.lastMonth >= 0 ? '+' : ''}{frequency.thisMonth - frequency.lastMonth} dari bulan lalu
            </div>
          </motion.div>

          {/* Month-over-Month */}
          <motion.div
            initial={{ x: 20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className={`glass-card rounded-2xl p-4 shadow-sm border ${
              momComparison.isIncrease ? 'border-red-200 bg-red-50/30' : 'border-green-200 bg-green-50/30'
            }`}
          >
            <div className="flex items-center gap-2 mb-2">
              <span className={`material-symbols-outlined text-[20px] ${
                momComparison.isIncrease ? 'text-danger' : 'text-success'
              }`}>
                {momComparison.isIncrease ? 'trending_up' : 'trending_down'}
              </span>
              <span className="text-[10px] font-bold text-gray-400 uppercase">vs Bulan Lalu</span>
            </div>
            <div className="flex items-baseline gap-1 mb-1">
              <span className={`text-2xl font-black ${
                momComparison.isIncrease ? 'text-danger' : 'text-success'
              }`}>
                {momComparison.isIncrease ? '+' : ''}{Math.abs(momComparison.change).toFixed(0)}%
              </span>
            </div>
            <div className="text-[10px] text-gray-600 font-medium">
              {momComparison.insight}
            </div>
          </motion.div>
        </div>

        {/* NEW: Daily Spending Pattern */}
        {Object.keys(dailyPattern.dailyExpenses).length > 0 && (
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="glass-card rounded-2xl p-5 shadow-sm"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-purple-500 text-[20px]">show_chart</span>
                <h2 className="text-sm font-bold text-gray-800">Pola Harian</h2>
              </div>
              {dailyPattern.busiestDay && (
                <span className="text-[10px] font-bold text-gray-500 bg-gray-100 px-2 py-1 rounded-lg">
                  Puncak: Tanggal {dailyPattern.busiestDay[0]}
                </span>
              )}
            </div>

            {/* Mini Bar Chart */}
            <div className="flex items-end justify-between gap-1 h-24">
              {Array.from({ length: 7 }, (_, i) => {
                const today = new Date();
                const targetDate = new Date(today.setDate(today.getDate() - (6 - i)));
                const day = targetDate.getDate();
                const expense = dailyPattern.dailyExpenses[day] || 0;
                const height = dailyPattern.maxExpense > 0 ? (expense / dailyPattern.maxExpense) * 100 : 0;
                
                return (
                  <div key={i} className="flex-1 flex flex-col items-center gap-1">
                    <div className="w-full bg-gray-100 rounded-t-lg relative overflow-hidden" style={{ height: '80px' }}>
                      <div 
                        className="absolute bottom-0 w-full bg-gradient-to-t from-indigo-500 to-purple-400 rounded-t-lg transition-all duration-500"
                        style={{ height: `${height}%` }}
                      ></div>
                    </div>
                    <span className="text-[8px] font-bold text-gray-400">{day}</span>
                  </div>
                );
              })}
            </div>
            
            <p className="text-[10px] text-gray-500 text-center mt-3">
              7 hari terakhir
            </p>
          </motion.div>
        )}

        {/* Categories Chart */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-gray-800">Kategori</h2>
            <button className="text-primary text-xs font-bold bg-primary/5 px-2 py-1 rounded-lg">
              {selectedMonthOffset === 0 ? 'Bulan Ini' : monthLabel}
            </button>
          </div>

          <div className="flex flex-col gap-4">
            {categoryBreakdown.length > 0 ? (
              categoryBreakdown.map((item, index) => (
                <motion.div
                  key={item.category}
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.4 + index * 0.1 }}
                  className="glass-card p-4 rounded-2xl flex items-center gap-4 active:scale-[0.99] transition-transform"
                >
                  {/* Icon Box */}
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-white shadow-md ${getCategoryColor(index)}`}>
                    <span className="material-symbols-outlined">{getCategoryIcon(item.category)}</span>
                  </div>

                  {/* Details */}
                  <div className="flex-1">
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-bold text-gray-800 capitalize">{item.category}</span>
                      <span className="font-bold text-gray-900">Rp {formatCurrency(item.amount)}</span>
                    </div>
                    
                    {/* Bar */}
                    <div className="flex items-center gap-3">
                      <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div 
                          className={`h-full rounded-full ${getCategoryColor(index).replace('bg-', 'bg-')}`}
                          style={{ width: `${item.percentage}%`, opacity: 0.7 }}
                        ></div>
                      </div>
                      <span className="text-xs font-bold text-gray-400 w-8 text-right">
                        {Math.round(item.percentage)}%
                      </span>
                    </div>
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="text-center py-10 text-gray-400 glass-card rounded-2xl border-dashed">
                <span className="material-symbols-outlined text-4xl mb-2 block opacity-50">data_loss_prevention</span>
                <p>Belum ada data pengeluaran.</p>
              </div>
            )}
          </div>
        </section>

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
