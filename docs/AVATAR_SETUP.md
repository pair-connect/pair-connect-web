# 📸 Configuración de Avatares

Esta guía explica cómo configurar el sistema de avatares para usuarios en Pair Connect.

## 🎯 Opciones de Avatares

### 1. Avatares Generados (Para usuarios existentes)

Para usuarios que ya existen en la base de datos, puedes usar el script SQL que genera avatares automáticamente basados en el nombre del usuario.

**Ejecutar en Supabase SQL Editor:**

```sql
-- Ver el script completo en: scripts/update-user-avatars.sql
```

Este script usa **UI Avatars** (https://ui-avatars.com/) para generar avatares con las iniciales del nombre del usuario.

### 2. Subida de Imágenes (Para nuevos avatares)

Los usuarios pueden subir sus propias imágenes desde su ordenador. Las imágenes se almacenan en **Supabase Storage**.

## ⚙️ Configuración de Supabase Storage

### Paso 1: Crear el Bucket

1. Ve a tu proyecto en Supabase Dashboard
2. Navega a **Storage** en el menú lateral
3. Haz clic en **"New bucket"**
4. Configura el bucket:
   - **Name**: `avatars`
   - **Public bucket**: ✅ **Sí** (para que las imágenes sean accesibles públicamente)
   - **File size limit**: 5 MB (o el tamaño que prefieras)
   - **Allowed MIME types**: `image/jpeg, image/jpg, image/png, image/webp, image/gif`

### Paso 2: Configurar Políticas RLS (Row Level Security)

1. Ve a **Storage** → **Policies** → Selecciona el bucket `avatars`
2. Crea las siguientes políticas:

#### Política 1: Lectura pública
```sql
-- Permitir lectura pública de avatares
CREATE POLICY "Avatares son públicos"
ON storage.objects FOR SELECT
USING (bucket_id = 'avatars');
```

#### Política 2: Usuarios pueden subir su propio avatar
```sql
-- Permitir que usuarios suban su propio avatar
CREATE POLICY "Usuarios pueden subir su avatar"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'avatars' AND
  auth.uid()::text = (storage.foldername(name))[1]
);
```

#### Política 3: Usuarios pueden actualizar su propio avatar
```sql
-- Permitir que usuarios actualicen su propio avatar
CREATE POLICY "Usuarios pueden actualizar su avatar"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'avatars' AND
  auth.uid()::text = (storage.foldername(name))[1]
);
```

#### Política 4: Usuarios pueden eliminar su propio avatar
```sql
-- Permitir que usuarios eliminen su propio avatar
CREATE POLICY "Usuarios pueden eliminar su avatar"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'avatars' AND
  auth.uid()::text = (storage.foldername(name))[1]
);
```

**Nota:** El endpoint de la Edge Function maneja la subida usando el `service_role`, por lo que estas políticas son principalmente para seguridad adicional.

### Paso 3: Verificar la Configuración

1. El bucket `avatars` debe estar visible en Storage
2. Las políticas deben estar activas
3. El bucket debe ser público

## 📝 Uso

### Para Usuarios Existentes

Ejecuta el script SQL `scripts/update-user-avatars.sql` en Supabase SQL Editor para asignar avatares generados automáticamente a todos los usuarios que no tienen avatar.

### Para Nuevos Avatares

1. El usuario va a su perfil
2. Hace clic en "Editar perfil"
3. Hace clic en el ícono de subida (📤) sobre el avatar
4. Selecciona una imagen desde su ordenador
5. La imagen se sube automáticamente y se actualiza el perfil

## 🔧 Especificaciones Técnicas

- **Formatos soportados**: JPEG, JPG, PNG, WebP, GIF
- **Tamaño máximo**: 5 MB (configurable)
- **Ubicación en Storage**: `avatars/{userId}/{timestamp}.{ext}`
- **URL pública**: Se genera automáticamente y se guarda en la base de datos

## 🐛 Solución de Problemas

### Error: "Bucket not found"
- Verifica que el bucket `avatars` existe en Supabase Storage
- Verifica que el nombre del bucket es exactamente `avatars` (sin mayúsculas)

### Error: "Permission denied"
- Verifica que las políticas RLS están configuradas correctamente
- Verifica que el bucket es público si quieres acceso público a las imágenes

### Error: "File too large"
- Verifica el límite de tamaño del bucket (debe ser al menos 5 MB)
- El usuario debe subir una imagen más pequeña

### Las imágenes no se muestran
- Verifica que el bucket es público
- Verifica que la URL generada es correcta
- Revisa la consola del navegador para errores de CORS

## 📚 Recursos

- [Supabase Storage Documentation](https://supabase.com/docs/guides/storage)
- [UI Avatars API](https://ui-avatars.com/)
- [DiceBear Avatars](https://www.dicebear.com/) (alternativa para avatares generados)
