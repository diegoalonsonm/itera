import { z } from 'zod';

// Query params for daily summaries
export const getDailySummariesQuerySchema = z.object({
  start_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format (use YYYY-MM-DD)').optional(),
  end_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format (use YYYY-MM-DD)').optional(),
  limit: z.string().transform(Number).pipe(z.number().int().min(1).max(365)).optional(),
});

// Query params for point transactions
export const getPointTransactionsQuerySchema = z.object({
  transaction_type: z.enum([
    'ideal_completed',
    'period_bonus',
    'streak_milestone',
    'streak_save',
    'manual_adjustment'
  ]).optional(),
  start_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format (use YYYY-MM-DD)').optional(),
  end_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format (use YYYY-MM-DD)').optional(),
  limit: z.string().transform(Number).pipe(z.number().int().min(1).max(100)).optional(),
});

// Query params for habit stats
export const getHabitStatsQuerySchema = z.object({
  habit_id: z.string().uuid('Invalid habit ID').optional(),
  days: z.string().transform(Number).pipe(z.number().int().min(1).max(365)).optional(),
});

// Export types
export type GetDailySummariesQuery = z.infer<typeof getDailySummariesQuerySchema>;
export type GetPointTransactionsQuery = z.infer<typeof getPointTransactionsQuerySchema>;
export type GetHabitStatsQuery = z.infer<typeof getHabitStatsQuerySchema>;
