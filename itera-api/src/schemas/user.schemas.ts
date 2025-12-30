import { z } from 'zod';

// Update user profile schema
export const updateUserSchema = z.object({
  name: z.string().min(1, 'Name cannot be empty').optional(),
  avatar_url: z.string().url('Invalid avatar URL').nullable().optional(),
  timezone: z.string().optional(),
});

// Update user settings schema
export const updateUserSettingsSchema = z.object({
  // Notification settings
  notifications_enabled: z.boolean().optional(),
  morning_reminder_time: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9](:[0-5][0-9])?$/, 'Invalid time format (use HH:MM or HH:MM:SS)').optional(),
  evening_reminder_time: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9](:[0-5][0-9])?$/, 'Invalid time format (use HH:MM or HH:MM:SS)').optional(),

  // Auto-save setting
  auto_save_enabled: z.boolean().optional(),

  // Points configuration (admin/advanced users only - validate carefully)
  streak_save_cost: z.number().int().min(1, 'Streak save cost must be at least 1').max(100, 'Streak save cost too high').optional(),
  points_per_ideal: z.number().int().min(1, 'Points per ideal must be at least 1').max(10, 'Points per ideal too high').optional(),
  points_per_period: z.number().int().min(1, 'Points per period must be at least 1').max(20, 'Points per period too high').optional(),
});

// Combined update schema (allows updating both profile and settings)
export const updateUserFullSchema = updateUserSchema.merge(updateUserSettingsSchema);

// Export types
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
export type UpdateUserSettingsInput = z.infer<typeof updateUserSettingsSchema>;
export type UpdateUserFullInput = z.infer<typeof updateUserFullSchema>;
