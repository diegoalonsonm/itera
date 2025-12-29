import { createClient } from '@supabase/supabase-js';
import { config } from './environment.js';

// Create Supabase client with service role key for backend operations
export const supabase = createClient(
  config.supabase.url,
  config.supabase.serviceRoleKey,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);

// Create a client with anon key for auth operations
export const supabaseAuth = createClient(
  config.supabase.url,
  config.supabase.anonKey,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);
