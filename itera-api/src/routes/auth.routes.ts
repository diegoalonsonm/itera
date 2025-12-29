import { Router, type Request, type Response, type NextFunction } from 'express';
import { supabaseAuth, supabase } from '../config/supabase.js';
import { validate, authenticate } from '../middleware/index.js';
import {
  signupSchema,
  signinSchema,
  refreshTokenSchema,
} from '../schemas/auth.schemas.js';
import type { ApiResponse, AuthTokens } from '../types/index.js';
import { AppError } from '../types/index.js';

const router = Router();

// Sign up
router.post(
  '/signup',
  validate(signupSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { email, password, name } = req.body;

      // Sign up with Supabase Auth
      const { data: authData, error: authError } = await supabaseAuth.auth.signUp({
        email,
        password,
        options: {
          data: {
            name: name || null,
          },
        },
      });

      if (authError) {
        // Provide more helpful error messages
        if (authError.message.includes('invalid') || authError.message.includes('Invalid')) {
          throw AppError.badRequest(
            'Unable to create account. Please check your Supabase email confirmation settings.',
            { originalError: authError.message }
          );
        }
        if (authError.message.includes('already registered')) {
          throw AppError.conflict('Email already in use');
        }
        throw AppError.badRequest(authError.message);
      }

      if (!authData.user || !authData.session) {
        throw AppError.internal('Failed to create user account');
      }

      // Note: User record in public.users is automatically created by database trigger
      // See docs/trigger-create-user.sql

      const response: ApiResponse<{
        user: typeof authData.user;
        tokens: AuthTokens;
      }> = {
        success: true,
        data: {
          user: authData.user,
          tokens: {
            accessToken: authData.session.access_token,
            refreshToken: authData.session.refresh_token,
          },
        },
      };

      res.status(201).json(response);
    } catch (error) {
      next(error);
    }
  }
);

// Sign in
router.post(
  '/signin',
  validate(signinSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { email, password } = req.body;

      // Sign in with Supabase Auth
      const { data, error } = await supabaseAuth.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        throw AppError.unauthorized('Invalid email or password');
      }

      if (!data.user || !data.session) {
        throw AppError.unauthorized('Invalid email or password');
      }

      const response: ApiResponse<{
        user: typeof data.user;
        tokens: AuthTokens;
      }> = {
        success: true,
        data: {
          user: data.user,
          tokens: {
            accessToken: data.session.access_token,
            refreshToken: data.session.refresh_token,
          },
        },
      };

      res.json(response);
    } catch (error) {
      next(error);
    }
  }
);

// Sign out
router.post(
  '/signout',
  authenticate,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Get token from header
      const token = req.headers.authorization?.substring(7);

      if (token) {
        // Sign out from Supabase (invalidates the token)
        await supabase.auth.admin.signOut(token);
      }

      const response: ApiResponse = {
        success: true,
        data: {
          message: 'Signed out successfully',
        },
      };

      res.json(response);
    } catch (error) {
      next(error);
    }
  }
);

// Refresh token
router.post(
  '/refresh',
  validate(refreshTokenSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { refreshToken } = req.body;

      // Refresh the session
      const { data, error } = await supabaseAuth.auth.refreshSession({
        refresh_token: refreshToken,
      });

      if (error || !data.session) {
        throw AppError.unauthorized('Invalid or expired refresh token');
      }

      const response: ApiResponse<{ tokens: AuthTokens }> = {
        success: true,
        data: {
          tokens: {
            accessToken: data.session.access_token,
            refreshToken: data.session.refresh_token,
          },
        },
      };

      res.json(response);
    } catch (error) {
      next(error);
    }
  }
);

// Get current user (useful for verifying token)
router.get(
  '/me',
  authenticate,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Get full user data from database
      const { data: user, error } = await supabase
        .from('users')
        .select('*')
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

export default router;
