import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { syncBudgetToCloud } from '@/lib/sync';

interface BudgetState {
  monthlyBudget: number;
  isOnboarded: boolean;
  _hasHydrated: boolean;
  setMonthlyBudget: (budget: number) => void;
  completeOnboarding: () => void;
  getHP: (totalExpense: number) => number;
  getHPStatus: (hp: number) => 'safe' | 'warning' | 'danger';
  getRemainingBudget: (totalExpense: number) => number;
  setHasHydrated: (state: boolean) => void;
}

export const useBudgetStore = create<BudgetState>()(
  persist(
    (set, get) => ({
      monthlyBudget: 2000000,
      isOnboarded: false,
      _hasHydrated: false,
      
      setMonthlyBudget: (budget) => {
        set({ monthlyBudget: budget });
        syncBudgetToCloud();
      },
      
      completeOnboarding: () => {
        set({ isOnboarded: true });
        syncBudgetToCloud();
      },
      
      setHasHydrated: (state) => set({ _hasHydrated: state }),
      
      getHP: (totalExpense) => {
        const budget = get().monthlyBudget;
        if (budget === 0) return 100;
        const remaining = budget - totalExpense;
        const hp = Math.max(0, Math.min(100, (remaining / budget) * 100));
        return Math.round(hp);
      },
      
      getHPStatus: (hp) => {
        if (hp > 50) return 'safe';
        if (hp > 25) return 'warning';
        return 'danger';
      },
      
      getRemainingBudget: (totalExpense) => {
        return Math.max(0, get().monthlyBudget - totalExpense);
      },
    }),
    {
      name: 'myduit-quest-budget',
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    }
  )
);
