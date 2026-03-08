import { supabase } from './supabase';
import { useGameStore } from '@/stores/gameStore';
import { useBudgetStore } from '@/stores/budgetStore';
import { useTransactionStore } from '@/stores/transactionStore';

// === SYNC TO CLOUD ===
export const syncGameToCloud = async () => {
  if (typeof window === 'undefined') return;
  const { data: session } = await supabase.auth.getSession();
  if (!session.session?.user) return;
  
  const { xp, level, streak, achievements, activeDecorations, username, avatar } = useGameStore.getState();
  
  await supabase.from('game_state').upsert({
    user_id: session.session.user.id,
    xp,
    level,
    streak,
    achievements,
    active_decorations: activeDecorations,
    username,
    avatar,
    last_synced_at: new Date().toISOString()
  }, { onConflict: 'user_id' });
};

export const syncBudgetToCloud = async () => {
  if (typeof window === 'undefined') return;
  const { data: session } = await supabase.auth.getSession();
  if (!session.session?.user) return;

  const { monthlyBudget } = useBudgetStore.getState();

  await supabase.from('budgets').upsert({
    user_id: session.session.user.id,
    monthly_budget: monthlyBudget,
    last_synced_at: new Date().toISOString()
  }, { onConflict: 'user_id' });
};

// Sync individual transaction (insert or update)
export const syncTransactionToCloud = async (transaction: any) => {
  if (typeof window === 'undefined') return;
  const { data: session } = await supabase.auth.getSession();
  if (!session.session?.user) return;

  await supabase.from('transactions').upsert({
    user_id: session.session.user.id,
    local_id: transaction.id,
    type: transaction.type,
    amount: transaction.amount,
    category: transaction.category,
    note: transaction.note,
    date: transaction.date,
  }, { onConflict: 'user_id, local_id' });
};

export const syncDeleteTransactionToCloud = async (localId: string) => {
  if (typeof window === 'undefined') return;
  const { data: session } = await supabase.auth.getSession();
  if (!session.session?.user) return;

  await supabase.from('transactions')
    .delete()
    .eq('user_id', session.session.user.id)
    .eq('local_id', localId);
};

// === SYNC FROM CLOUD (PULL) ===
export const pullDataFromCloud = async () => {
  const { data: session } = await supabase.auth.getSession();
  if (!session.session?.user) return false;

  try {
    const userId = session.session.user.id;

    // Pull Game State
    const { data: gameState } = await supabase.from('game_state').select('*').eq('user_id', userId).single();
    if (gameState) {
      useGameStore.setState({
        xp: gameState.xp,
        level: gameState.level,
        streak: gameState.streak,
        achievements: gameState.achievements || [],
        activeDecorations: gameState.active_decorations || [],
        username: gameState.username || 'Komandan',
        avatar: gameState.avatar || '/avatar.png',
      });
    }

    // Pull Budget
    const { data: budgetData } = await supabase.from('budgets').select('*').eq('user_id', userId).single();
    if (budgetData) {
      useBudgetStore.setState({ monthlyBudget: budgetData.monthly_budget });
    }

    // Pull Transactions
    const { data: txData } = await supabase.from('transactions').select('*').eq('user_id', userId);
    if (txData && txData.length > 0) {
      const formattedTx = txData.map(t => ({
        id: t.local_id,
        type: t.type,
        amount: t.amount,
        category: t.category,
        note: t.note,
        date: t.date,
        createdAt: new Date(t.created_at).getTime()
      }));
      
      // Sort to match local behavior (newest first)
      formattedTx.sort((a, b) => b.createdAt - a.createdAt);
      
      useTransactionStore.setState({ transactions: formattedTx });
    }
    
    return true;
  } catch (error) {
    console.error('Error pulling data from cloud:', error);
    return false;
  }
};
