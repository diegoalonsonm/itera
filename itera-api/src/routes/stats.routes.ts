import { Router, type Request, type Response, type NextFunction } from 'express';
import { supabase } from '../config/supabase.js';
import { validate, authenticate } from '../middleware/index.js';
import {
  getDailySummariesQuerySchema,
  getPointTransactionsQuerySchema,
  getHabitStatsQuerySchema,
} from '../schemas/stats.schemas.js';
import type { ApiResponse } from '../types/index.js';
import { AppError } from '../types/index.js';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Get dashboard overview
router.get(
  '/dashboard',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Get user stats
      const { data: user, error: userError } = await supabase
        .from('users')
        .select('current_streak, best_streak, total_points, lifetime_points, saves_used')
        .eq('id', req.user!.id)
        .single();

      if (userError || !user) {
        throw AppError.notFound('User');
      }

      // Get today's summary
      const today = new Date().toISOString().split('T')[0];
      const { data: todaySummary } = await supabase
        .from('daily_summaries')
        .select('*')
        .eq('user_id', req.user!.id)
        .eq('summary_date', today)
        .maybeSingle();

      // Get active habits count
      const { count: activeHabitsCount } = await supabase
        .from('habits')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', req.user!.id)
        .eq('status', 'activo');

      // Get recent milestones
      const { data: recentMilestones } = await supabase
        .from('streak_milestones')
        .select('*')
        .eq('user_id', req.user!.id)
        .order('achieved_at', { ascending: false })
        .limit(3);

      // Get last 7 days summaries for trend
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      const { data: weekSummaries } = await supabase
        .from('daily_summaries')
        .select('summary_date, day_status, obligatorios_completed, obligatorios_total, ideales_completed, ideales_total')
        .eq('user_id', req.user!.id)
        .gte('summary_date', sevenDaysAgo.toISOString().split('T')[0])
        .order('summary_date', { ascending: false });

      const response: ApiResponse = {
        success: true,
        data: {
          user_stats: user,
          today: todaySummary || null,
          active_habits: activeHabitsCount || 0,
          recent_milestones: recentMilestones || [],
          week_summaries: weekSummaries || [],
        },
      };

      res.json(response);
    } catch (error) {
      next(error);
    }
  }
);

// Get daily summaries
router.get(
  '/summaries',
  validate(getDailySummariesQuerySchema, 'query'),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { start_date, end_date, limit } = req.query;

      let query = supabase
        .from('daily_summaries')
        .select('*')
        .eq('user_id', req.user!.id)
        .order('summary_date', { ascending: false });

      if (start_date) {
        query = query.gte('summary_date', start_date);
      }

      if (end_date) {
        query = query.lte('summary_date', end_date);
      }

      if (limit) {
        query = query.limit(Number(limit));
      } else {
        query = query.limit(30); // Default to last 30 days
      }

      const { data: summaries, error } = await query;

      if (error) {
        throw AppError.internal('Failed to fetch summaries', error);
      }

      const response: ApiResponse = {
        success: true,
        data: {
          summaries: summaries || [],
          count: summaries?.length || 0,
        },
      };

      res.json(response);
    } catch (error) {
      next(error);
    }
  }
);

// Get point transactions history
router.get(
  '/transactions',
  validate(getPointTransactionsQuerySchema, 'query'),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { transaction_type, start_date, end_date, limit } = req.query;

      let query = supabase
        .from('point_transactions')
        .select('*')
        .eq('user_id', req.user!.id)
        .order('transaction_date', { ascending: false });

      if (transaction_type) {
        query = query.eq('transaction_type', transaction_type);
      }

      if (start_date) {
        query = query.gte('transaction_date', start_date);
      }

      if (end_date) {
        query = query.lte('transaction_date', end_date);
      }

      if (limit) {
        query = query.limit(Number(limit));
      } else {
        query = query.limit(50); // Default to last 50 transactions
      }

      const { data: transactions, error } = await query;

      if (error) {
        throw AppError.internal('Failed to fetch transactions', error);
      }

      // Calculate summary stats
      const totalEarned = transactions?.reduce((sum, t) => sum + (t.amount > 0 ? t.amount : 0), 0) || 0;
      const totalSpent = transactions?.reduce((sum, t) => sum + (t.amount < 0 ? Math.abs(t.amount) : 0), 0) || 0;

      const response: ApiResponse = {
        success: true,
        data: {
          transactions: transactions || [],
          count: transactions?.length || 0,
          summary: {
            total_earned: totalEarned,
            total_spent: totalSpent,
            net: totalEarned - totalSpent,
          },
        },
      };

      res.json(response);
    } catch (error) {
      next(error);
    }
  }
);

// Get streak milestones
router.get(
  '/milestones',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { data: milestones, error } = await supabase
        .from('streak_milestones')
        .select('*')
        .eq('user_id', req.user!.id)
        .order('milestone_days', { ascending: false });

      if (error) {
        throw AppError.internal('Failed to fetch milestones', error);
      }

      const totalBonusPoints = milestones?.reduce((sum, m) => sum + m.bonus_points, 0) || 0;

      const response: ApiResponse = {
        success: true,
        data: {
          milestones: milestones || [],
          count: milestones?.length || 0,
          total_bonus_points: totalBonusPoints,
        },
      };

      res.json(response);
    } catch (error) {
      next(error);
    }
  }
);

// Get habit statistics
router.get(
  '/habits',
  validate(getHabitStatsQuerySchema, 'query'),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { habit_id, days } = req.query;
      const daysCount = days ? Number(days) : 30;

      // Calculate date range
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - daysCount);

      if (habit_id) {
        // Get stats for specific habit
        const { data: habit, error: habitError } = await supabase
          .from('habits')
          .select('*')
          .eq('id', habit_id)
          .eq('user_id', req.user!.id)
          .single();

        if (habitError || !habit) {
          throw AppError.notFound('Habit');
        }

        // Get logs for this habit in date range
        const { data: logs, error: logsError } = await supabase
          .from('habit_logs')
          .select('*')
          .eq('habit_id', habit_id)
          .gte('log_date', startDate.toISOString().split('T')[0])
          .lte('log_date', endDate.toISOString().split('T')[0])
          .order('log_date', { ascending: false });

        if (logsError) {
          throw AppError.internal('Failed to fetch logs', logsError);
        }

        const completedCount = logs?.filter(l => l.completed).length || 0;
        const completionRate = daysCount > 0 ? (completedCount / daysCount) * 100 : 0;

        const response: ApiResponse = {
          success: true,
          data: {
            habit,
            stats: {
              days_analyzed: daysCount,
              completed_count: completedCount,
              completion_rate: Math.round(completionRate * 100) / 100,
              current_streak: habit.current_habit_streak,
              best_streak: habit.best_habit_streak,
              total_completions: habit.total_completions,
            },
            logs: logs || [],
          },
        };

        res.json(response);
      } else {
        // Get stats for all active habits
        const { data: habits, error: habitsError } = await supabase
          .from('habits')
          .select('*')
          .eq('user_id', req.user!.id)
          .eq('status', 'activo');

        if (habitsError) {
          throw AppError.internal('Failed to fetch habits', habitsError);
        }

        // Get logs for all habits in date range
        const { data: allLogs, error: logsError } = await supabase
          .from('habit_logs')
          .select('habit_id, completed, log_date')
          .eq('user_id', req.user!.id)
          .gte('log_date', startDate.toISOString().split('T')[0])
          .lte('log_date', endDate.toISOString().split('T')[0]);

        if (logsError) {
          throw AppError.internal('Failed to fetch logs', logsError);
        }

        // Group logs by habit
        const logsByHabit = new Map<string, number>();
        allLogs?.forEach(log => {
          if (log.completed) {
            logsByHabit.set(log.habit_id, (logsByHabit.get(log.habit_id) || 0) + 1);
          }
        });

        const habitStats = habits?.map(habit => ({
          habit_id: habit.id,
          habit_name: habit.name,
          category: habit.category,
          completed_count: logsByHabit.get(habit.id) || 0,
          completion_rate: Math.round(((logsByHabit.get(habit.id) || 0) / daysCount) * 100 * 100) / 100,
          current_streak: habit.current_habit_streak,
          best_streak: habit.best_habit_streak,
          total_completions: habit.total_completions,
        })) || [];

        const response: ApiResponse = {
          success: true,
          data: {
            days_analyzed: daysCount,
            habits: habitStats,
            count: habitStats.length,
          },
        };

        res.json(response);
      }
    } catch (error) {
      next(error);
    }
  }
);

// Get insights (advanced analytics)
router.get(
  '/insights',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Get last 30 days of summaries
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const { data: summaries, error: summariesError } = await supabase
        .from('daily_summaries')
        .select('*')
        .eq('user_id', req.user!.id)
        .gte('summary_date', thirtyDaysAgo.toISOString().split('T')[0])
        .order('summary_date', { ascending: false });

      if (summariesError) {
        throw AppError.internal('Failed to fetch summaries', summariesError);
      }

      // Calculate insights
      const totalDays = summaries?.length || 0;
      const completeDays = summaries?.filter(s => s.day_status === 'complete').length || 0;
      const savedDays = summaries?.filter(s => s.day_status === 'saved').length || 0;
      const failedDays = summaries?.filter(s => s.day_status === 'failed').length || 0;

      const completionRate = totalDays > 0 ? (completeDays / totalDays) * 100 : 0;
      const saveRate = totalDays > 0 ? (savedDays / totalDays) * 100 : 0;

      // Calculate average completions
      const avgObligatorios = totalDays > 0
        ? summaries.reduce((sum, s) => sum + s.obligatorios_completed, 0) / totalDays
        : 0;
      const avgIdeales = totalDays > 0
        ? summaries.reduce((sum, s) => sum + s.ideales_completed, 0) / totalDays
        : 0;

      // Find best day of week
      const dayOfWeekCounts = new Map<string, { complete: number; total: number }>();
      summaries?.forEach(summary => {
        const date = new Date(summary.summary_date);
        const dayName = date.toLocaleDateString('en-US', { weekday: 'long' });
        const current = dayOfWeekCounts.get(dayName) || { complete: 0, total: 0 };
        current.total++;
        if (summary.day_status === 'complete') {
          current.complete++;
        }
        dayOfWeekCounts.set(dayName, current);
      });

      let bestDay = '';
      let bestDayRate = 0;
      dayOfWeekCounts.forEach((counts, day) => {
        const rate = counts.total > 0 ? (counts.complete / counts.total) * 100 : 0;
        if (rate > bestDayRate) {
          bestDayRate = rate;
          bestDay = day;
        }
      });

      const response: ApiResponse = {
        success: true,
        data: {
          period: {
            days: totalDays,
            start_date: summaries?.[summaries.length - 1]?.summary_date || null,
            end_date: summaries?.[0]?.summary_date || null,
          },
          completion: {
            complete_days: completeDays,
            saved_days: savedDays,
            failed_days: failedDays,
            completion_rate: Math.round(completionRate * 100) / 100,
            save_rate: Math.round(saveRate * 100) / 100,
          },
          averages: {
            obligatorios_per_day: Math.round(avgObligatorios * 100) / 100,
            ideales_per_day: Math.round(avgIdeales * 100) / 100,
          },
          patterns: {
            best_day_of_week: bestDay || 'Not enough data',
            best_day_rate: Math.round(bestDayRate * 100) / 100,
          },
        },
      };

      res.json(response);
    } catch (error) {
      next(error);
    }
  }
);

export default router;
