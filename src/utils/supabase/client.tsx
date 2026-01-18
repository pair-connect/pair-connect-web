import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { supabaseUrl, publicAnonKey } from '@/utils/supabase/info';

// Singleton Supabase client for frontend
let supabaseInstance: ReturnType<typeof createSupabaseClient> | null = null;

export const createClient = () => {
  if (!supabaseInstance) {
    if (!supabaseUrl || !publicAnonKey) {
      throw new Error('Missing Supabase configuration. Please check your .env.local file.');
    }
    supabaseInstance = createSupabaseClient(supabaseUrl, publicAnonKey);
  }
  return supabaseInstance;
};

export const supabase = createClient();
