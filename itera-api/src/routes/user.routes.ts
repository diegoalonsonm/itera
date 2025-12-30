import { Router, type Request, type Response, type NextFunction } from 'express';
import { supabase } from '../config/supabase.js';
import { validate, authenticate } from '../middleware/index.js';
import { updateUserFullSchema } from '../schemas/user.schemas.js';
import type { ApiResponse } from '../types/index.js';
import { AppError } from '../types/index.js';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Get current user profile
router.get(
  '/me',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { data: user, error } = await supabase
        .from('users')
        .select('id, email, name, avatar_url, timezone, subscription_tier, current_streak, best_streak, total_points, lifetime_points, saves_used, streak_save_cost, points_per_ideal, points_per_period, auto_save_enabled, notifications_enabled, morning_reminder_time, evening_reminder_time, created_at, updated_at')
        .eq('id', req.user!.id)
        .single();

      if (error || !user) {
        throw AppError.notFound('User');
      }

      const response: ApiResponse = {
        success: true,
        data: { user },
      };

      res.json(response);
    } catch (error) {
      next(error);
    }
  }
);

// Update current user profile/settings
router.patch(
  '/me',
  validate(updateUserFullSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const updates = req.body;

      // Update the user
      const { data: user, error } = await supabase
        .from('users')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', req.user!.id)
        .select()
        .single();

      if (error) {
        throw AppError.internal('Failed to update user', error);
      }

      if (!user) {
        throw AppError.notFound('User');
      }

      const response: ApiResponse = {
        success: true,
        data: { user },
      };

      res.json(response);
    } catch (error) {
      next(error);
    }
  }
);

// Get user statistics summary
router.get(
  '/me/stats',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { data: user, error } = await supabase
        .from('users')
        .select('current_streak, best_streak, total_points, lifetime_points, saves_used')
        .eq('id', req.user!.id)
        .single();

      if (error || !user) {
        throw AppError.notFound('User');
      }

      const response: ApiResponse = {
        success: true,
        data: {
          stats: user,
        },
      };

      res.json(response);
    } catch (error) {
      next(error);
    }
  }
);

// Delete user account (soft delete - deactivate)
router.delete(
  '/me',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Note: This doesn't actually delete the user from auth.users
      // It just marks them as inactive in our system
      // For full deletion, you'd need to call Supabase Auth API

      // For now, we'll just return a message
      // In a real app, you might want to:
      // 1. Delete all user's habits, logs, etc.
      // 2. Call supabase.auth.admin.deleteUser(req.user!.id)
      // 3. Or mark the user as deleted/inactive

      const response: ApiResponse = {
        success: true,
        data: {
          message: 'Account deletion not yet implemented. Contact support.',
        },
      };

      res.json(response);
    } catch (error) {
      next(error);
    }
  }
);

export default router;
