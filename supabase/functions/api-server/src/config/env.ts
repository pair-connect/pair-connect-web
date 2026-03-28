export const env = {
  supabaseUrl: Deno.env.get('SUPABASE_URL') || '',
  supabaseServiceKey: Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '',
  supabaseAnonKey: Deno.env.get('SUPABASE_ANON_KEY') || '',
};
