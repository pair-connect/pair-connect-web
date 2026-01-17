-- =============================================
-- PRIVACIDAD DE USUARIOS
-- =============================================
-- Agrega campos para controlar la privacidad del perfil
-- =============================================

-- Agregar campos de privacidad a la tabla users
ALTER TABLE users
ADD COLUMN IF NOT EXISTS profile_public BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS privacy_settings JSONB DEFAULT '{
  "showEmail": false,
  "showContacts": true,
  "showProjects": true,
  "showSessions": false,
  "showBio": true,
  "showLanguages": true,
  "showStack": true,
  "showLevel": true
}'::jsonb;

-- Comentarios para documentación
COMMENT ON COLUMN users.profile_public IS 'Si el perfil es público o privado. Si es privado, solo el usuario puede ver su perfil completo.';
COMMENT ON COLUMN users.privacy_settings IS 'Configuración granular de privacidad para cada campo del perfil.';

-- Índice para búsquedas rápidas de perfiles públicos
CREATE INDEX IF NOT EXISTS idx_users_profile_public ON users(profile_public) WHERE profile_public = true;
