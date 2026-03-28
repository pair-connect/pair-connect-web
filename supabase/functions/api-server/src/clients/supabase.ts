import { createClient } from "npm:@supabase/supabase-js@2";
import { env } from "../config/env.ts";

export const supabaseAdmin = createClient(env.supabaseUrl, env.supabaseServiceKey);
export const supabase = createClient(env.supabaseUrl, env.supabaseAnonKey);
