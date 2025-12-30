import { Router, type Request, type Response, type NextFunction } from 'express';
import { supabase } from '../config/supabase.js';
import { validate, authenticate } from '../middleware/index.js';
import {
  createHabitSchema,
  updateHabitSchema,
  reorderHabitsSchema,
  getHabitsQuerySchema,
  habitIdParamSchema,
} from '../schemas/habit.schemas.js';
import type { ApiResponse } from '../types/index.js';
import { AppError } from '../types/index.js';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Get all habits for current user
router.get(
  '/',
  validate(getHabitsQuerySchema, 'query'),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { status, category } = req.query;

      // Build query
      let query = supabase
        .from('habits')
        .select('*')
        .eq('user_id', req.user!.id)
        .order('display_order', { ascending: true })
        .order('created_at', { ascending: true });

      // Apply filters
      if (status) {
        query = query.eq('status', status);
      } else {
        // Default to active habits only
        query = query.eq('status', 'activo');
      }

      if (category) {
        query = query.eq('category', category);
      }

      const { data: habits, error } = await query;

      if (error) {
        throw AppError.internal('Failed to fetch habits', error);
      }

      const response: ApiResponse = {
        success: true,
        data: {
          habits: habits || [],
          count: habits?.length || 0,
        },
      };

      res.json(response);
    } catch (error) {
      next(error);
    }
  }
);

// Get single habit by ID
router.get(
  '/:id',
  validate(habitIdParamSchema, 'params'),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;

      const { data: habit, error } = await supabase
        .from('habits')
        .select('*')
        .eq('id', id)
        .eq('user_id', req.user!.id)
        .single();

      if (error || !habit) {
        throw AppError.notFound('Habit');
      }

      const response: ApiResponse = {
        success: true,
        data: { habit },
      };

      res.json(response);
    } catch (error) {
      next(error);
    }
  }
);

// Create new habit
router.post(
  '/',
  validate(createHabitSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const habitData = req.body;

      // Get the current max display_order for this user
      const { data: maxOrderHabit } = await supabase
        .from('habits')
        .select('display_order')
        .eq('user_id', req.user!.id)
        .order('display_order', { ascending: false })
        .limit(1)
        .single();

      // Set display_order if not provided
      const display_order = habitData.display_order ?? (maxOrderHabit?.display_order ?? -1) + 1;

      // Create habit
      const { data: habit, error } = await supabase
        .from('habits')
        .insert({
          ...habitData,
          user_id: req.user!.id,
          display_order,
        })
        .select()
        .single();

      if (error) {
        throw AppError.internal('Failed to create habit', error);
      }

      const response: ApiResponse = {
        success: true,
        data: { habit },
      };

      res.status(201).json(response);
    } catch (error) {
      next(error);
    }
  }
);

// Update habit
router.patch(
  '/:id',
  validate(habitIdParamSchema, 'params'),
  validate(updateHabitSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const updates = req.body;

      // Verify habit belongs to user
      const { data: existingHabit, error: fetchError } = await supabase
        .from('habits')
        .select('id')
        .eq('id', id)
        .eq('user_id', req.user!.id)
        .single();

      if (fetchError || !existingHabit) {
        throw AppError.notFound('Habit');
      }

      // Update habit
      const { data: habit, error } = await supabase
        .from('habits')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        throw AppError.internal('Failed to update habit', error);
      }

      const response: ApiResponse = {
        success: true,
        data: { habit },
      };

      res.json(response);
    } catch (error) {
      next(error);
    }
  }
);

// Deactivate habit (soft delete)
router.delete(
  '/:id',
  validate(habitIdParamSchema, 'params'),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;

      // Verify habit belongs to user
      const { data: existingHabit, error: fetchError } = await supabase
        .from('habits')
        .select('id, status')
        .eq('id', id)
        .eq('user_id', req.user!.id)
        .single();

      if (fetchError || !existingHabit) {
        throw AppError.notFound('Habit');
      }

      if (existingHabit.status === 'inactivo') {
        throw AppError.badRequest('Habit is already inactive');
      }

      // Deactivate habit
      const { data: habit, error } = await supabase
        .from('habits')
        .update({
          status: 'inactivo',
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        throw AppError.internal('Failed to deactivate habit', error);
      }

      const response: ApiResponse = {
        success: true,
        data: { habit },
      };

      res.json(response);
    } catch (error) {
      next(error);
    }
  }
);

// Reactivate habit
router.patch(
  '/:id/activate',
  validate(habitIdParamSchema, 'params'),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;

      // Verify habit belongs to user
      const { data: existingHabit, error: fetchError } = await supabase
        .from('habits')
        .select('id, status')
        .eq('id', id)
        .eq('user_id', req.user!.id)
        .single();

      if (fetchError || !existingHabit) {
        throw AppError.notFound('Habit');
      }

      if (existingHabit.status === 'activo') {
        throw AppError.badRequest('Habit is already active');
      }

      // Reactivate habit
      const { data: habit, error } = await supabase
        .from('habits')
        .update({
          status: 'activo',
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        throw AppError.internal('Failed to activate habit', error);
      }

      const response: ApiResponse = {
        success: true,
        data: { habit },
      };

      res.json(response);
    } catch (error) {
      next(error);
    }
  }
);

// Reorder habits
router.post(
  '/reorder',
  validate(reorderHabitsSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { habits } = req.body;

      // Verify all habits belong to user
      const habitIds = habits.map((h: any) => h.id);
      const { data: existingHabits, error: fetchError } = await supabase
        .from('habits')
        .select('id')
        .eq('user_id', req.user!.id)
        .in('id', habitIds);

      if (fetchError) {
        throw AppError.internal('Failed to verify habits', fetchError);
      }

      if (!existingHabits || existingHabits.length !== habitIds.length) {
        throw AppError.notFound('One or more habits not found');
      }

      // Update display_order for each habit
      const updatePromises = habits.map((habit: any) =>
        supabase
          .from('habits')
          .update({ display_order: habit.display_order })
          .eq('id', habit.id)
          .eq('user_id', req.user!.id)
      );

      await Promise.all(updatePromises);

      const response: ApiResponse = {
        success: true,
        data: {
          message: 'Habits reordered successfully',
          updated: habits.length,
        },
      };

      res.json(response);
    } catch (error) {
      next(error);
    }
  }
);

export default router;
