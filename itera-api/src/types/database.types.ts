// Database enums
export type HabitCategory = 'obligatorio' | 'ideal';
export type FrequencyType = 'daily' | 'weekly' | 'custom';
export type DayStatus = 'pending' | 'complete' | 'saved' | 'failed';
export type PointTransactionType =
  | 'ideal_completed'
  | 'period_bonus'
  | 'streak_milestone'
  | 'streak_save'
  | 'manual_adjustment';
export type SubscriptionTier = 'free' | 'premium';
export type EntityStatus = 'activo' | 'inactivo';

// User table
export interface User {
  id: string;
  email: string;
  name: string | null;
  avatar_url: string | null;
  timezone: string;
  subscription_tier: SubscriptionTier;

  // Stats (denormalized)
  current_streak: number;
  best_streak: number;
  total_points: number;
  lifetime_points: number;
  saves_used: number;

  // Points configuration
  streak_save_cost: number;
  points_per_ideal: number;
  points_per_period: number;
  auto_save_enabled: boolean;

  // Notifications
  notifications_enabled: boolean;
  morning_reminder_time: string; // TIME format
  evening_reminder_time: string; // TIME format

  created_at: string;
  updated_at: string;
}

// Habit table
export interface Habit {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  category: HabitCategory;

  // Frequency
  frequency_type: FrequencyType;
  frequency_target: number;
  frequency_days: string[] | null;

  // UI
  icon: string;
  color: string;
  display_order: number;

  // Stats
  current_habit_streak: number;
  best_habit_streak: number;
  total_completions: number;

  status: EntityStatus;
  created_at: string;
  updated_at: string;
}

// Habit log table
export interface HabitLog {
  id: string;
  habit_id: string;
  user_id: string;
  log_date: string; // DATE format
  completed: boolean;
  skipped: boolean;
  notes: string | null;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
}

// Daily summary table
export interface DailySummary {
  id: string;
  user_id: string;
  summary_date: string; // DATE format
  obligatorios_completed: number;
  obligatorios_total: number;
  ideales_completed: number;
  ideales_total: number;
  day_status: DayStatus;
  streak_saved: boolean;
  points_earned: number;
  points_spent: number;
  streak_at_end: number;
  created_at: string;
  updated_at: string;
}

// Period completion table
export interface PeriodCompletion {
  id: string;
  habit_id: string;
  user_id: string;
  period_start: string; // DATE format
  period_end: string; // DATE format
  target: number;
  achieved: number;
  completed: boolean;
  bonus_points_awarded: number;
  created_at: string;
  updated_at: string;
}

// Point transaction table
export interface PointTransaction {
  id: string;
  user_id: string;
  transaction_date: string;
  amount: number; // Can be positive or negative
  transaction_type: PointTransactionType;
  description: string;
  habit_id: string | null;
  period_completion_id: string | null;
  balance_after: number;
  created_at: string;
}

// Streak milestone table
export interface StreakMilestone {
  id: string;
  user_id: string;
  milestone_days: number;
  bonus_points: number;
  achieved_at: string;
  created_at: string;
}

// User settings table
export interface UserSettings {
  id: string;
  user_id: string;
  theme: string;
  accent_color: string;
  streak_milestones: Record<string, any>; // JSONB
  onboarding_completed: boolean;
  created_at: string;
  updated_at: string;
}
