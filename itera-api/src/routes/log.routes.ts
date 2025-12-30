import { Router, type Request, type Response, type NextFunction } from 'express';
import { supabase } from '../config/supabase.js';
import { validate, authenticate } from '../middleware/index.js';
import {
  toggleHabitSchema,
  logHabitIdParamSchema,
} from '../schemas/log.schemas.js';
import type { ApiResponse } from '../types/index.js';
import { AppError } from '../types/index.js';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Get today's habits with completion status
router.get(
  '/today',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD

      // Get all active habits for user
      const { data: habits, error: habitsError } = await supabase
        .from('habits')
        .select('*')
        .eq('user_id', req.user!.id)
        .eq('status', 'activo')
        .order('display_order', { ascending: true });

      if (habitsError) {
        throw AppError.internal('Failed to fetch habits', habitsError);
      }

      // Get today's logs for all habits
      const { data: logs, error: logsError } = await supabase
        .from('habit_logs')
        .select('*')
        .eq('user_id', req.user!.id)
        .eq('log_date', today);

      if (logsError) {
        throw AppError.internal('Failed to fetch logs', logsError);
      }

      // Create a map of habit_id -> log
      const logsMap = new Map(logs?.map(log => [log.habit_id, log]) || []);

      // Combine habits with their completion status
      const habitsWithStatus = habits?.map(habit => ({
        ...habit,
        completed_today: logsMap.get(habit.id)?.completed || false,
        log_id: logsMap.get(habit.id)?.id || null,
        notes: logsMap.get(habit.id)?.notes || null,
        completed_at: logsMap.get(habit.id)?.completed_at || null,
      })) || [];

      const response: ApiResponse = {
        success: true,
        data: {
          date: today,
          habits: habitsWithStatus,
          summary: {
            total_habits: habitsWithStatus.length,
            completed: habitsWithStatus.filter(h => h.completed_today).length,
            obligatorios_total: habitsWithStatus.filter(h => h.category === 'obligatorio').length,
            obligatorios_completed: habitsWithStatus.filter(h => h.category === 'obligatorio' && h.completed_today).length,
            ideales_total: habitsWithStatus.filter(h => h.category === 'ideal').length,
            ideales_completed: habitsWithStatus.filter(h => h.category === 'ideal' && h.completed_today).length,
          },
        },
      };

      res.json(response);
    } catch (error) {
      next(error);
    }
  }
);

// Toggle habit completion for today
router.post(
  '/:habitId/toggle',
  validate(logHabitIdParamSchema, 'params'),
  validate(toggleHabitSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { habitId } = req.params;
      const { completed, notes } = req.body;
      const today = new Date().toISOString().split('T')[0];
      const now = new Date().toISOString();

      // Verify habit exists and belongs to user
      const { data: habit, error: habitError } = await supabase
        .from('habits')
        .select('*')
        .eq('id', habitId)
        .eq('user_id', req.user!.id)
        .single();

      if (habitError || !habit) {
        throw AppError.notFound('Habit');
      }

      if (habit.status !== 'activo') {
        throw AppError.badRequest('Cannot log inactive habit');
      }

      // Check if log already exists for today
      const { data: existingLog, error: fetchLogError } = await supabase
        .from('habit_logs')
        .select('*')
        .eq('habit_id', habitId)
        .eq('log_date', today)
        .maybeSingle();

      if (fetchLogError) {
        throw AppError.internal('Failed to fetch log', fetchLogError);
      }

      let log;
      let pointsEarned = 0;
      const wasCompleted = existingLog?.completed || false;

      if (existingLog) {
        // Update existing log
        const { data: updatedLog, error: updateError } = await supabase
          .from('habit_logs')
          .update({
            completed,
            notes: notes || existingLog.notes,
            completed_at: completed ? now : null,
            updated_at: now,
          })
          .eq('id', existingLog.id)
          .select()
          .single();

        if (updateError) {
          throw AppError.internal('Failed to update log', updateError);
        }

        log = updatedLog;
      } else {
        // Create new log
        const { data: newLog, error: createError } = await supabase
          .from('habit_logs')
          .insert({
            habit_id: habitId,
            user_id: req.user!.id,
            log_date: today,
            completed,
            notes,
            completed_at: completed ? now : null,
          })
          .select()
          .single();

        if (createError) {
          throw AppError.internal('Failed to create log', createError);
        }

        log = newLog;
      }

      // If completing an "ideal" habit (and wasn't completed before), award points
      if (completed && !wasCompleted && habit.category === 'ideal') {
        // Get user settings for points_per_ideal
        const { data: user } = await supabase
          .from('users')
          .select('points_per_ideal, total_points, lifetime_points')
          .eq('id', req.user!.id)
          .single();

        if (user) {
          pointsEarned = user.points_per_ideal;
          const newTotalPoints = user.total_points + pointsEarned;
          const newLifetimePoints = user.lifetime_points + pointsEarned;

          // Create point transaction
          await supabase.from('point_transactions').insert({
            user_id: req.user!.id,
            transaction_date: now,
            amount: pointsEarned,
            transaction_type: 'ideal_completed',
            description: `Completed ideal habit: ${habit.name}`,
            habit_id: habitId,
            balance_after: newTotalPoints,
          });

          // Update user points
          await supabase
            .from('users')
            .update({
              total_points: newTotalPoints,
              lifetime_points: newLifetimePoints,
              updated_at: now,
            })
            .eq('id', req.user!.id);
        }
      }

      // If un-completing an ideal habit (removing points)
      if (!completed && wasCompleted && habit.category === 'ideal') {
        const { data: user } = await supabase
          .from('users')
          .select('points_per_ideal, total_points, lifetime_points')
          .eq('id', req.user!.id)
          .single();

        if (user) {
          const pointsToRemove = user.points_per_ideal;
          const newTotalPoints = Math.max(0, user.total_points - pointsToRemove);

          // Create negative point transaction
          await supabase.from('point_transactions').insert({
            user_id: req.user!.id,
            transaction_date: now,
            amount: -pointsToRemove,
            transaction_type: 'manual_adjustment',
            description: `Uncompleted ideal habit: ${habit.name}`,
            habit_id: habitId,
            balance_after: newTotalPoints,
          });

          // Update user points
          await supabase
            .from('users')
            .update({
              total_points: newTotalPoints,
              updated_at: now,
            })
            .eq('id', req.user!.id);

          pointsEarned = -pointsToRemove;
        }
      }

      // Update habit total_completions if completing
      if (completed && !wasCompleted) {
        await supabase
          .from('habits')
          .update({
            total_completions: habit.total_completions + 1,
            updated_at: now,
          })
          .eq('id', habitId);
      } else if (!completed && wasCompleted) {
        await supabase
          .from('habits')
          .update({
            total_completions: Math.max(0, habit.total_completions - 1),
            updated_at: now,
          })
          .eq('id', habitId);
      }

      // Update daily summary (simplified - create or update)
      await updateDailySummary(req.user!.id, today);

      const response: ApiResponse = {
        success: true,
        data: {
          log,
          habit: {
            id: habit.id,
            name: habit.name,
            category: habit.category,
          },
          points_earned: pointsEarned,
          completed_today: completed,
        },
      };

      res.json(response);
    } catch (error) {
      next(error);
    }
  }
);

// Helper function to update daily summary
async function updateDailySummary(userId: string, date: string) {
  try {
    // Get all logs for the day
    const { data: logs } = await supabase
      .from('habit_logs')
      .select('habit_id, completed')
      .eq('user_id', userId)
      .eq('log_date', date);

    // Get all active habits
    const { data: habits } = await supabase
      .from('habits')
      .select('id, category')
      .eq('user_id', userId)
      .eq('status', 'activo');

    if (!habits || !logs) return;

    const logsMap = new Map(logs.map(l => [l.habit_id, l.completed]));

    const obligatoriosTotal = habits.filter(h => h.category === 'obligatorio').length;
    const obligatoriosCompleted = habits
      .filter(h => h.category === 'obligatorio')
      .filter(h => logsMap.get(h.id) === true).length;

    const idealesTotal = habits.filter(h => h.category === 'ideal').length;
    const idealesCompleted = habits
      .filter(h => h.category === 'ideal')
      .filter(h => logsMap.get(h.id) === true).length;

    const dayStatus = obligatoriosCompleted === obligatoriosTotal ? 'complete' : 'pending';

    // Check if summary exists
    const { data: existingSummary } = await supabase
      .from('daily_summaries')
      .select('id')
      .eq('user_id', userId)
      .eq('summary_date', date)
      .maybeSingle();

    if (existingSummary) {
      // Update existing summary
      await supabase
        .from('daily_summaries')
        .update({
          obligatorios_completed: obligatoriosCompleted,
          obligatorios_total: obligatoriosTotal,
          ideales_completed: idealesCompleted,
          ideales_total: idealesTotal,
          day_status: dayStatus,
          updated_at: new Date().toISOString(),
        })
        .eq('id', existingSummary.id);
    } else {
      // Create new summary
      await supabase.from('daily_summaries').insert({
        user_id: userId,
        summary_date: date,
        obligatorios_completed: obligatoriosCompleted,
        obligatorios_total: obligatoriosTotal,
        ideales_completed: idealesCompleted,
        ideales_total: idealesTotal,
        day_status: dayStatus,
        streak_saved: false,
        points_earned: 0,
        points_spent: 0,
        streak_at_end: 0,
      });
    }
  } catch (error) {
    console.error('Failed to update daily summary:', error);
  }
}

export default router;
