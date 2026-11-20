export type Kind = "income" | "expense";

export interface Profile {
  id: string;
  email: string | null;
  display_name: string;
  avatar: string;
  role_id: string | null;
  is_active: boolean;
  xp: number;
  level: number;
  streak: number;
  longest_streak: number;
  last_activity_date: string | null;
  created_at: string;
}

export interface Role {
  id: string;
  code: string;
  name: string;
  description: string | null;
  is_system: boolean;
}

export interface Permission {
  id: string;
  code: string;
  module: string;
  description: string | null;
}

export interface Category {
  id: string;
  user_id: string | null;
  name: string;
  icon: string;
  color: string;
  kind: Kind;
}

export interface WalletBalance {
  id: string;
  user_id: string;
  name: string;
  type: "cash" | "bank" | "ewallet" | "other";
  icon: string;
  color: string;
  initial_balance: number;
  balance: number;
  total_income: number;
  total_expense: number;
}

export interface Transaction {
  id: string;
  user_id: string;
  wallet_id: string;
  category_id: string | null;
  kind: Kind;
  amount: number;
  note: string | null;
  occurred_on: string;
  categories?: { name: string; icon: string; color: string } | null;
  wallets?: { name: string; icon: string } | null;
}

export interface BudgetStatus {
  id: string;
  user_id: string;
  category_id: string;
  month: string;
  limit_amount: number;
  spent: number;
}

export interface GoalProgress {
  id: string;
  user_id: string;
  name: string;
  icon: string;
  target_amount: number;
  deadline: string | null;
  status: "active" | "completed";
  completed_at: string | null;
  saved: number;
}

export interface GoalDeposit {
  id: string;
  goal_id: string;
  amount: number;
  note: string | null;
  deposited_on: string;
}

export interface Challenge {
  id: string;
  created_by: string | null;
  title: string;
  description: string | null;
  icon: string;
  xp_reward: number;
  is_active: boolean;
}

export interface Achievement {
  id: string;
  code: string;
  name: string;
  description: string | null;
  icon: string;
  condition_type: string;
  threshold: number;
  xp_reward: number;
  is_active: boolean;
}

export interface ActivityLog {
  id: number;
  user_id: string | null;
  actor_name: string | null;
  action: string;
  entity: string;
  entity_id: string | null;
  detail: Record<string, unknown> | null;
  created_at: string;
}
