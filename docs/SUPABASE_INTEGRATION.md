# 🚀 Pair Connect - Integración con Supabase

## ✅ Estado de la Integración

**Pair Connect** ahora está completamente integrado con **Supabase** para autenticación real y base de datos persistente.

---

## 📦 ¿Qué está implementado?

### 🔐 Autenticación
- ✅ **Sign up** con email/password (Supabase Auth)
- ✅ **Login** con credenciales
- ✅ **Logout** con limpieza de sesión
- ✅ **Persistencia de sesión** con localStorage y verificación de token
- ✅ **Confirmación automática de email** (para desarrollo, sin servidor SMTP)

### 👥 Gestión de Usuarios
- ✅ **Crear perfil** completo (stack, nivel, lenguajes, contactos)
- ✅ **Actualizar perfil** de usuario autenticado
- ✅ **Obtener usuario por ID**
- ✅ **Buscar usuarios** con filtros (nombre, stack, nivel)

### 📦 Proyectos
- ✅ **CRUD completo** (Create, Read, Update, Delete)
- ✅ **Filtros** por owner, stack, nivel
- ✅ **Verificación de ownership** para update/delete

### 📅 Sesiones
- ✅ **CRUD completo** con verificación de permisos
- ✅ **Unirse/salir de sesiones** (join/leave)
- ✅ **Marcar interés** (interested)
- ✅ **Control de participantes** (maxParticipants)
- ✅ **Filtros** por proyecto y owner

### ❤️ Bookmarks
- ✅ **Toggle bookmark** (añadir/quitar favoritos)
- ✅ **Obtener todas las sesiones bookmarked**

---

## 🗄️ Arquitectura de Base de Datos

### KV Store Structure

Los datos se almacenan en el **KV Store** (tabla key-value) de Supabase con la siguiente estructura:

```typescript
// USERS
user:{userId} → User object
user_projects:{userId} → string[] (array de project IDs)

// PROJECTS
project:{projectId} → Project object
project_sessions:{projectId} → string[] (array de session IDs)

// SESSIONS
session:{sessionId} → Session object
```

### Ventajas del KV Store:
- ✅ **Sin migraciones** - No necesitas crear schemas SQL
- ✅ **Flexible** - Perfecto para prototipos y MVP
- ✅ **Schema-less** - Cambia la estructura sin ALTER TABLE
- ✅ **Rápido** - Get/Set operations optimizadas

---

## 🛠️ Cómo usar

### 1️⃣ **La app ya está conectada**

Supabase se conectó automáticamente y los archivos están listos:

```typescript
// ✅ Cliente configurado
/src/utils/supabase/client.tsx

// ✅ Server backend completo
/src/supabase/functions/server/index.tsx

// ✅ API helpers
/src/utils/api.ts

// ✅ AuthContext actualizado
/src/contexts/AuthContext.tsx
```

### 2️⃣ **Poblar la base de datos (SEED)**

Como la base de datos está vacía, necesitas crear datos iniciales. Hay dos opciones:

#### **Opción A: Registro manual (Recomendado para empezar)**

1. Ve a la app
2. Haz clic en "Regístrate aquí"
3. Completa el formulario
4. Configura tu perfil
5. ¡Listo! Ya puedes crear proyectos y sesiones

#### **Opción B: Script de seed automático**

Ejecuta el script de seed para poblar con datos de prueba:

```javascript
// 1. Abre la consola del navegador en tu app
// 2. Actualiza estas variables en /src/data/seedDatabase.ts:
const API_BASE_URL = 'https://crfrnnvmhrmhuqcbvpoh.supabase.co/functions/v1/make-server-39ee6a8c';
const ANON_KEY = 'tu_anon_key';

// 3. Ejecuta:
import { seedDatabase } from './data/seedDatabase';
await seedDatabase();
```

Esto creará:
- 👥 Varios usuarios de prueba
- 📦 Proyectos de ejemplo
- 📅 Sesiones programadas

**Contraseña por defecto:** `password123`

---

## 🧪 Testing

### Probar Autenticación:

```javascript
// Login
const response = await fetch('https://crfrnnvmhrmhuqcbvpoh.supabase.co/functions/v1/make-server-39ee6a8c/auth/login', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer YOUR_ANON_KEY'
  },
  body: JSON.stringify({
    email: 'user@example.com',
    password: 'password123'
  })
});
```

### Probar API con el cliente:

```typescript
import { api } from '@/utils/api';

// Obtener todas las sesiones
const sessions = await api.sessions.getSessions();

// Crear proyecto (requiere autenticación)
const project = await api.projects.createProject({
  title: 'Mi Proyecto',
  description: 'Descripción',
  stack: 'Fullstack',
  level: 'Mid',
  languages: ['JavaScript', 'TypeScript']
});

// Toggle bookmark
await api.bookmarks.toggleBookmark('session_id');
```

---

## 🔑 Variables de Entorno

Las variables ya están configuradas automáticamente:

```typescript
// /src/utils/supabase/info.tsx
export const projectId = "crfrnnvmhrmhuqcbvpoh"
export const publicAnonKey = "eyJhbGci..."
```

**⚠️ IMPORTANTE:**
- `publicAnonKey` es **segura** para el frontend (solo permisos de lectura)
- `SUPABASE_SERVICE_ROLE_KEY` está **solo en el servidor** (nunca la expongas al frontend)

---

## 📊 Endpoints Disponibles

### Auth
- `POST /auth/signup` - Crear usuario
- `POST /auth/login` - Iniciar sesión
- `GET /auth/session` - Verificar sesión

### Users
- `GET /users/:id` - Obtener usuario
- `PUT /users/:id` - Actualizar usuario (requiere auth)
- `GET /users?q=&stack=&level=` - Buscar usuarios

### Projects
- `POST /projects` - Crear proyecto (requiere auth)
- `GET /projects?ownerId=&stack=&level=` - Listar proyectos
- `GET /projects/:id` - Obtener proyecto
- `PUT /projects/:id` - Actualizar proyecto (requiere auth + ownership)
- `DELETE /projects/:id` - Eliminar proyecto (requiere auth + ownership)

### Sessions
- `POST /sessions` - Crear sesión (requiere auth + project ownership)
- `GET /sessions?projectId=&ownerId=` - Listar sesiones
- `GET /sessions/:id` - Obtener sesión
- `PUT /sessions/:id` - Actualizar sesión (requiere auth + ownership)
- `DELETE /sessions/:id` - Eliminar sesión (requiere auth + ownership)
- `POST /sessions/:id/join` - Unirse a sesión (requiere auth)
- `POST /sessions/:id/leave` - Salir de sesión (requiere auth)
- `POST /sessions/:id/interested` - Toggle interés (requiere auth)

### Bookmarks
- `POST /bookmarks/toggle` - Toggle bookmark (requiere auth)
- `GET /bookmarks` - Obtener bookmarks del usuario (requiere auth)

---

## 🚨 Troubleshooting

### Error: "Unauthorized"
- Verifica que estés enviando el `Authorization` header correcto
- Comprueba que el token no haya expirado
- Intenta hacer logout y login de nuevo

### Error: "Session not found"
- El usuario no tiene sesión activa
- Haz login nuevamente

### Error: "Forbidden"
- Estás intentando modificar recursos que no te pertenecen
- Solo puedes editar/eliminar tus propios proyectos y sesiones

### Base de datos vacía
- La base de datos está vacía inicialmente
- Ejecuta el script de seed o registra usuarios manualmente

---

## 🎯 Próximos Pasos

### Para crear contenido de prueba:

1. **Registra un usuario**
   ```
   Email: dev@pairconnect.com
   Password: password123
   ```

2. **Crea un proyecto**
   - Título: "E-commerce con React"
   - Stack: Fullstack
   - Nivel: Mid

3. **Crea una sesión**
   - Vinculada al proyecto
   - Fecha: Mañana a las 18:00
   - Max participantes: 4

4. **Prueba funcionalidades:**
   - ❤️ Bookmark la sesión
   - 👥 Únete a la sesión
   - 🔍 Busca otras sesiones
   - 📅 Filtra por calendario

---

## 💡 Consejos

- **Plan Gratuito de Supabase:**
  - 500 MB de base de datos ✅
  - 50,000 usuarios/mes ✅
  - Perfecto para desarrollo ✅

- **Performance:**
  - Las queries al KV Store son muy rápidas
  - Usa los filtros de API para optimizar

- **Seguridad:**
  - Todos los endpoints sensibles requieren autenticación
  - Los tokens se validan en cada request
  - Las ownership checks previenen accesos no autorizados

---

## 📝 Notas Importantes

1. **Email Confirmación:**
   - Los usuarios se crean con `email_confirm: true`
   - No necesitas servidor SMTP para desarrollo
   - En producción, configura un provider de email

2. **Passwords:**
   - Hasheadas automáticamente por Supabase Auth
   - No se almacenan en texto plano
   - Políticas de seguridad aplicadas

3. **KV Store vs SQL:**
   - Usamos KV Store para simplicidad
   - Si necesitas queries complejas, migra a tablas SQL
   - Consulta la documentación de Supabase para migraciones

---

¡Todo está listo para empezar a programar en pair! 🎉

**Documentación completa de Supabase:**
https://supabase.com/docs
