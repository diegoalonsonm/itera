import { z } from 'zod';

// Create habit schema
export const createHabitSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name too long'),
  description: z.string().max(500, 'Description too long').optional(),
  category: z.enum(['obligatorio', 'ideal'], {
    errorMap: () => ({ message: 'Category must be "obligatorio" or "ideal"' }),
  }),
  frequency_type: z.enum(['daily', 'weekly', 'custom'], {
    errorMap: () => ({ message: 'Frequency type must be "daily", "weekly", or "custom"' }),
  }).default('daily'),
  frequency_target: z.number().int().min(1).max(7).optional(),
  frequency_days: z.array(z.enum(['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'])).optional(),
  icon: z.string().max(50).default('check'),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Invalid color format (use #RRGGBB)').default('#10b981'),
  display_order: z.number().int().min(0).optional(),
}).refine((data) => {
  // If frequency_type is weekly, frequency_target is required
  if (data.frequency_type === 'weekly' && !data.frequency_target) {
    return false;
  }
  // If frequency_type is custom, frequency_days is required
  if (data.frequency_type === 'custom' && (!data.frequency_days || data.frequency_days.length === 0)) {
    return false;
  }
  return true;
}, {
  message: 'Weekly habits require frequency_target, custom habits require frequency_days',
});

// Update habit schema (all fields optional except those being updated)
export const updateHabitSchema = z.object({
  name: z.string().min(1, 'Name cannot be empty').max(100, 'Name too long').optional(),
  description: z.string().max(500, 'Description too long').nullable().optional(),
  category: z.enum(['obligatorio', 'ideal']).optional(),
  frequency_type: z.enum(['daily', 'weekly', 'custom']).optional(),
  frequency_target: z.number().int().min(1).max(7).nullable().optional(),
  frequency_days: z.array(z.enum(['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'])).nullable().optional(),
  icon: z.string().max(50).optional(),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Invalid color format (use #RRGGBB)').optional(),
  display_order: z.number().int().min(0).optional(),
  status: z.enum(['activo', 'inactivo']).optional(),
});

// Reorder habits schema
export const reorderHabitsSchema = z.object({
  habits: z.array(
    z.object({
      id: z.string().uuid('Invalid habit ID'),
      display_order: z.number().int().min(0),
    })
  ).min(1, 'At least one habit is required'),
});

// Query params schema for listing habits
export const getHabitsQuerySchema = z.object({
  status: z.enum(['activo', 'inactivo']).optional(),
  category: z.enum(['obligatorio', 'ideal']).optional(),
});

// Param schema for habit ID
export const habitIdParamSchema = z.object({
  id: z.string().uuid('Invalid habit ID'),
});

// Export types
export type CreateHabitInput = z.infer<typeof createHabitSchema>;
export type UpdateHabitInput = z.infer<typeof updateHabitSchema>;
export type ReorderHabitsInput = z.infer<typeof reorderHabitsSchema>;
export type GetHabitsQuery = z.infer<typeof getHabitsQuerySchema>;
export type HabitIdParam = z.infer<typeof habitIdParamSchema>;
