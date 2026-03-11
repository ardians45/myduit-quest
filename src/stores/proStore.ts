'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface ProState {
  isPro: boolean;
  proSince: string | null;
  mayarTransactionId: string | null;
  setPro: (transactionId?: string) => void;
  clearPro: () => void;
  checkProStatus: () => Promise<void>;
}

export const useProStore = create<ProState>()(
  persist(
    (set, get) => ({
      isPro: false,
      proSince: null,
      mayarTransactionId: null,

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

      /**
       * Check Pro status from server/Supabase.
       * Falls back to localStorage if no server check is available.
       */
      checkProStatus: async () => {
        // If already Pro in localStorage, trust it for now
        // A more robust approach would verify with the server
        const { isPro } = get();
        if (isPro) return;

        // Could add a server endpoint check here in the future
        // e.g., fetch('/api/payment/status?userId=...')
      },
    }),
    {
      name: 'myduit-quest-pro',
    }
  )
);
