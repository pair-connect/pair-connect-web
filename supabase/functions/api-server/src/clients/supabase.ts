import { createClient } from "@supabase/supabase-js";
import { env } from "../config/env.ts";

export const supabaseAdmin = createClient(env.supabaseUrl, env.supabaseServiceKey);
export const supabase = createClient(env.supabaseUrl, env.supabaseAnonKey);
