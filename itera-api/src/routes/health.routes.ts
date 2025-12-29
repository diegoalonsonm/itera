import { Router, type Request, type Response } from 'express';
import { supabase } from '../config/supabase.js';
import type { ApiResponse } from '../types/index.js';

const router = Router();

// Basic health check
router.get('/', (req: Request, res: Response) => {
  const response: ApiResponse = {
    success: true,
    data: {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    },
  };
  res.json(response);
});

// Database health check
router.get('/db', async (req: Request, res: Response) => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('count')
      .limit(1)
      .single();

    if (error) {
      const response: ApiResponse = {
        success: false,
        error: {
          code: 'DATABASE_ERROR',
          message: 'Database connection failed',
          details: error.message,
        },
      };
      res.status(503).json(response);
      return;
    }

    const response: ApiResponse = {
      success: true,
      data: {
        status: 'healthy',
        database: 'connected',
        timestamp: new Date().toISOString(),
      },
    };
    res.json(response);
  } catch (error) {
    const response: ApiResponse = {
      success: false,
      error: {
        code: 'DATABASE_ERROR',
        message: 'Database health check failed',
      },
    };
    res.status(503).json(response);
  }
});

export default router;