/**
 * Configuración de Supabase desde variables de entorno
 * Configura estas variables en tu archivo .env.local:
 * - VITE_SUPABASE_URL
 * - VITE_SUPABASE_ANON_KEY
 * - VITE_API_URL
 */

export const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "";
export const publicAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || "";
export const apiBaseUrl = import.meta.env.VITE_API_URL || "";

// Validación en desarrollo
if (import.meta.env.DEV) {
  const missing: string[] = [];
  if (!supabaseUrl) missing.push('VITE_SUPABASE_URL');
  if (!publicAnonKey) missing.push('VITE_SUPABASE_ANON_KEY');
  if (!apiBaseUrl) missing.push('VITE_API_URL');

  if (missing.length > 0) {
    console.error(
      "❌ Variables de entorno de Supabase no configuradas:\n" +
      missing.map(v => `  - ${v}`).join('\n') +
      "\n\nPor favor, configura estas variables en tu archivo .env.local"
    );
  } else {
    console.log('✅ Variables de entorno de Supabase configuradas correctamente');
    console.log('  - VITE_SUPABASE_URL:', supabaseUrl ? '✓' : '✗');
    console.log('  - VITE_SUPABASE_ANON_KEY:', publicAnonKey ? `✓ (${publicAnonKey.substring(0, 20)}...)` : '✗');
    console.log('  - VITE_API_URL:', apiBaseUrl ? `✓ (${apiBaseUrl})` : '✗');
  }
}