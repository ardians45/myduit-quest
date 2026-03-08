'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { syncGameToCloud } from '@/lib/sync';

// ===== DECORATION CATALOG =====
export interface DecorationItem {
  id: string;
  name: string;
  icon: string;
  description: string;
  requiredLevel: number;
  type: 'flag' | 'torch' | 'banner' | 'garden' | 'fountain';
}

export const DECORATION_CATALOG: DecorationItem[] = [
  { id: 'red_flag', name: 'Bendera Merah', icon: 'flag', description: 'Bendera klasik berwarna merah berkibar di bentengmu', requiredLevel: 2, type: 'flag' },
  { id: 'blue_flag', name: 'Bendera Biru', icon: 'flag', description: 'Bendera biru kerajaan yang megah', requiredLevel: 3, type: 'flag' },
  { id: 'gold_flag', name: 'Bendera Emas', icon: 'flag', description: 'Bendera emas langka untuk pejuang sejati', requiredLevel: 5, type: 'flag' },
  { id: 'wall_torch', name: 'Obor Dinding', icon: 'local_fire_department', description: 'Obor api yang menerangi dinding benteng', requiredLevel: 3, type: 'torch' },
  { id: 'blue_torch', name: 'Obor Biru', icon: 'local_fire_department', description: 'Obor api mistis berwarna biru', requiredLevel: 5, type: 'torch' },
  { id: 'royal_banner', name: 'Panji Kerajaan', icon: 'bookmark', description: 'Panji besar bertuliskan lambang kerajaan', requiredLevel: 4, type: 'banner' },
  { id: 'garden', name: 'Taman Mini', icon: 'park', description: 'Taman hijau kecil di sekitar benteng', requiredLevel: 6, type: 'garden' },
  { id: 'fountain', name: 'Air Mancur', icon: 'water_drop', description: 'Air mancur mewah di depan benteng', requiredLevel: 7, type: 'fountain' },
];

// ===== GAME STATE =====
interface GameState {
  xp: number;
  level: number;
  streak: number;
  lastTransactionDate: string | null;
  achievements: string[];
  activeDecorations: string[];
  username: string;
  avatar: string;
  addXP: (amount: number) => void;
  updateStreak: () => void;
  unlockAchievement: (achievement: string) => void;
  toggleDecoration: (decorationId: string) => void;
  isDecorationUnlocked: (decorationId: string) => boolean;
  updateProfile: (username: string, avatar: string) => void;
  getLevelProgress: () => { current: number; max: number; percentage: number };
  getLevelName: () => string;
}

const XP_PER_LEVEL = 100;

const LEVEL_NAMES: Record<number, string> = {
  1: 'Pemula Keuangan',
  2: 'Penjaga Hemat',
  3: 'Satria Tabungan',
  4: 'Ksatria Benteng',
  5: 'Benteng Pejuang',
  6: 'Ahli Finansial',
  7: 'Master Budget',
  8: 'Raja Hemat',
  9: 'Legenda Keuangan',
  10: 'Dewa Finansial',
};

export const useGameStore = create<GameState>()(
  persist(
    (set, get) => ({
      xp: 0,
      level: 1,
      streak: 0,
      lastTransactionDate: null,
      achievements: [],
      activeDecorations: [],
      username: 'Komandan',
      avatar: '/avatar.png',
      
      updateProfile: (username, avatar) => {
        set({ username, avatar });
        syncGameToCloud();
      },

      addXP: (amount) => {
        set((state) => {
          const newXP = state.xp + amount;
          const newLevel = Math.floor(newXP / XP_PER_LEVEL) + 1;
          const result = {
            xp: newXP,
            level: newLevel,
          };
          // Schedule sync after state update
          setTimeout(() => syncGameToCloud(), 0);
          return result;
        });
      },
      
      updateStreak: () => {
        const today = new Date().toISOString().split('T')[0];
        const lastDate = get().lastTransactionDate;
        
        let shouldSync = false;

        if (!lastDate) {
          set({ streak: 1, lastTransactionDate: today });
          shouldSync = true;
        } else {
          const yesterday = new Date();
          yesterday.setDate(yesterday.getDate() - 1);
          const yesterdayStr = yesterday.toISOString().split('T')[0];
          
          if (lastDate === today) {
            return;
          } else if (lastDate === yesterdayStr) {
            set((state) => ({
              streak: state.streak + 1,
              lastTransactionDate: today,
            }));
            shouldSync = true;
          } else {
            set({ streak: 1, lastTransactionDate: today });
            shouldSync = true;
          }
        }
        
        if (shouldSync) {
          syncGameToCloud();
        }
      },
      
      unlockAchievement: (achievement) => {
        let changed = false;
        set((state) => {
          if (state.achievements.includes(achievement)) return state;
          changed = true;
          return { achievements: [...state.achievements, achievement] };
        });
        if (changed) syncGameToCloud();
      },
      
      toggleDecoration: (decorationId) => {
        const { level, activeDecorations } = get();
        const item = DECORATION_CATALOG.find(d => d.id === decorationId);
        if (!item || level < item.requiredLevel) return; // Can't toggle if locked
        
        if (activeDecorations.includes(decorationId)) {
          // Remove
          set({ activeDecorations: activeDecorations.filter(id => id !== decorationId) });
        } else {
          // Add
          set({ activeDecorations: [...activeDecorations, decorationId] });
        }
        syncGameToCloud();
      },
      
      isDecorationUnlocked: (decorationId) => {
        const { level } = get();
        const item = DECORATION_CATALOG.find(d => d.id === decorationId);
        return item ? level >= item.requiredLevel : false;
      },
      
      getLevelProgress: () => {
        const { xp, level } = get();
        const currentLevelXP = (level - 1) * XP_PER_LEVEL;
        const nextLevelXP = level * XP_PER_LEVEL;
        const progress = xp - currentLevelXP;
        const needed = nextLevelXP - currentLevelXP;
        return {
          current: progress,
          max: needed,
          percentage: Math.round((progress / needed) * 100),
        };
      },
      
      getLevelName: () => {
        const level = get().level;
        return LEVEL_NAMES[Math.min(level, 10)] || LEVEL_NAMES[10];
      },
    }),
    {
      name: 'myduit-quest-game',
    }
  )
);
