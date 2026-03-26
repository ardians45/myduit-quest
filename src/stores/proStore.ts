'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface ProState {
  isPro: boolean;
  proSince: string | null;
  mayarTransactionId: string | null;
  scanCount: number;
  scanResetMonth: string | null;
  setPro: (transactionId?: string) => void;
  clearPro: () => void;
  checkProStatus: () => Promise<void>;
  canScan: () => boolean;
  incrementScan: () => void;
  getScansRemaining: () => number;
}

const FREE_SCAN_LIMIT = 30;

export const useProStore = create<ProState>()(
  persist(
    (set, get) => ({
      isPro: false,
      proSince: null,
      mayarTransactionId: null,
      scanCount: 0,
      scanResetMonth: null,

      setPro: (transactionId?: string) => {
        set({
          isPro: true,
          proSince: new Date().toISOString(),
          mayarTransactionId: transactionId || null,
        });
      },

      clearPro: () => {
        set({
          isPro: false,
          proSince: null,
          mayarTransactionId: null,
        });
      },

      checkProStatus: async () => {
        const { isPro } = get();
        if (isPro) return;
      },

      canScan: () => {
        const { isPro, scanCount, scanResetMonth } = get();
        if (isPro) return true;

        // Reset counter each month
        const currentMonth = new Date().toISOString().slice(0, 7);
        if (scanResetMonth !== currentMonth) {
          set({ scanCount: 0, scanResetMonth: currentMonth });
          return true;
        }

        return scanCount < FREE_SCAN_LIMIT;
      },

      incrementScan: () => {
        const { isPro } = get();
        if (isPro) return; // Pro users don't need tracking

        const currentMonth = new Date().toISOString().slice(0, 7);
        const { scanResetMonth, scanCount } = get();

        if (scanResetMonth !== currentMonth) {
          set({ scanCount: 1, scanResetMonth: currentMonth });
        } else {
          set({ scanCount: scanCount + 1 });
        }
      },

      getScansRemaining: () => {
        const { isPro, scanCount, scanResetMonth } = get();
        if (isPro) return Infinity;

        const currentMonth = new Date().toISOString().slice(0, 7);
        if (scanResetMonth !== currentMonth) return FREE_SCAN_LIMIT;

        return Math.max(0, FREE_SCAN_LIMIT - scanCount);
      },
    }),
    {
      name: 'myduit-quest-pro',
    }
  )
);
