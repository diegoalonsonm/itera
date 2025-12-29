import { z } from 'zod';

// Sign up schema
export const signupSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .max(18, 'Password must not exceed 18 characters'),
  name: z.string().min(1, 'Name is required'),
});

// Sign in schema
export const signinSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

// Refresh token schema
export const refreshTokenSchema = z.object({
  refreshToken: z.string().min(1, 'Refresh token is required'),
});

// Export types
export type SignupInput = z.infer<typeof signupSchema>;
export type SigninInput = z.infer<typeof signinSchema>;
export type RefreshTokenInput = z.infer<typeof refreshTokenSchema>;
