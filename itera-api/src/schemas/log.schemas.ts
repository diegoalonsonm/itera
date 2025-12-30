import { z } from 'zod';

// Toggle habit completion schema
export const toggleHabitSchema = z.object({
  completed: z.boolean(),
  notes: z.string().max(500, 'Notes too long').optional(),
});

// Query params for getting logs
export const getLogsQuerySchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format (use YYYY-MM-DD)').optional(),
  habit_id: z.string().uuid('Invalid habit ID').optional(),
});

// Param schema for habit ID
export const logHabitIdParamSchema = z.object({
  habitId: z.string().uuid('Invalid habit ID'),
});

// Export types
export type ToggleHabitInput = z.infer<typeof toggleHabitSchema>;
export type GetLogsQuery = z.infer<typeof getLogsQuerySchema>;
export type LogHabitIdParam = z.infer<typeof logHabitIdParamSchema>;
