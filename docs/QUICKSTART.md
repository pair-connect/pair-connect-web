# 🚀 Quick Start - Pair Connect con Supabase

## ⚡ Inicio Rápido (3 pasos)

### 1️⃣ **Poblar la Base de Datos**

Ve a la página de administración:

```
/admin/seed
```

Haz clic en **"🚀 Iniciar Seed"** y espera a que termine (~30 segundos).

✅ Esto creará:
- 4 usuarios de prueba
- 8 proyectos
- 12 sesiones

### 2️⃣ **Iniciar Sesión**

Usa cualquiera de estas credenciales:

```
📧 Email: ana.dev@example.com
🔑 Password: password123

📧 Email: carlos.dev@example.com
🔑 Password: password123

📧 Email: maria.dev@example.com
🔑 Password: password123

📧 Email: juan.dev@example.com
🔑 Password: password123
```

### 3️⃣ **Explorar la App**

- ✅ Ve la lista de sesiones en la home
- ✅ Filtra por fecha, stack, nivel
- ✅ Haz clic en una sesión para ver detalles
- ✅ Únete a sesiones
- ✅ Marca favoritos (❤️)

---

## 🎯 ¿Qué puedes hacer?

### Como Usuario Autenticado:

#### 📅 Sesiones
- Ver todas las sesiones
- Unirse a sesiones
- Marcar interés
- Salir de sesiones
- Bookmark sesiones favoritas

#### 📦 Proyectos
- Crear proyectos nuevos
- Editar tus proyectos
- Eliminar tus proyectos
- Ver proyectos de otros

#### 👤 Perfil
- Actualizar stack (Frontend/Backend/Fullstack)
- Cambiar nivel (Junior/Mid/Senior)
- Añadir lenguajes de programación
- Actualizar contactos (GitHub, LinkedIn, Discord)

---

## 🧪 Testing Rápido

### Test 1: Crear Proyecto

1. Login con `ana.dev@example.com`
2. Ve a "Mis Proyectos"
3. Click "Nuevo Proyecto"
4. Completa el formulario
5. ✅ Proyecto creado!

### Test 2: Crear Sesión

1. Abre tu proyecto
2. Click "Nueva Sesión"
3. Completa fecha/hora/participantes
4. ✅ Sesión creada!

### Test 3: Unirse a Sesión

1. Ve a Home
2. Busca una sesión
3. Click en la sesión
4. Click "Unirme"
5. ✅ Ya estás participando!

### Test 4: Bookmarks

1. En cualquier sesión, click el ❤️
2. Ve a "Mis Favoritos"
3. ✅ Ves tu sesión guardada!

---

## 📱 Rutas Disponibles

```
/                    → Home (lista de sesiones)
/sesion/:id          → Detalle de sesión
/sobre-el-equipo     → Página del equipo
/admin/seed          → Panel de seed (admin)
```

---

## 🔥 Funcionalidades Implementadas

### ✅ Autenticación
- [x] Sign up con email/password
- [x] Login persistente
- [x] Logout
- [x] Sesión guardada en localStorage

### ✅ Usuarios
- [x] Perfil completo (stack, nivel, lenguajes)
- [x] Contactos (GitHub, LinkedIn, Discord)
- [x] Avatar
- [x] Bio

### ✅ Proyectos
- [x] CRUD completo
- [x] Imágenes
- [x] Stack y nivel
- [x] Lenguajes de programación

### ✅ Sesiones
- [x] CRUD completo
- [x] Fecha y hora
- [x] Duración
- [x] Max participantes
- [x] Link de meeting
- [x] Unirse/Salir
- [x] Marcar interés

### ✅ Bookmarks
- [x] Añadir/quitar favoritos
- [x] Lista de favoritos

### ✅ UI/UX
- [x] Hero section con shooting stars
- [x] Calendario interactivo
- [x] Filtros avanzados
- [x] Search bar
- [x] Cards con bordes de color por stack
- [x] Indicadores de estado (participando/interesado)
- [x] Tema dark (light en progreso)

---

## 🐛 Troubleshooting

### "No se encontraron sesiones"
→ Ejecuta el seed en `/admin/seed`

### "Unauthorized"
→ Haz logout y login de nuevo

### "Session not found"
→ El token expiró, haz login nuevamente

### Base de datos vacía
→ Ve a `/admin/seed` y ejecuta el seed

---

## 💡 Tips

### Para Desarrollo:
- Usa `ana.dev@example.com` como usuario principal
- Crea 2-3 proyectos por usuario
- Programa sesiones para diferentes fechas
- Prueba unirte con diferentes usuarios

### Para Testing:
- Abre la app en 2 ventanas con diferentes usuarios
- Prueba límites de participantes
- Verifica que solo owners pueden editar

---

## 📊 Datos de Seed

El seed crea:

### Usuarios (4):
1. **Ana Dev** - Fullstack Senior
2. **Carlos Dev** - Backend Mid
3. **María Dev** - Frontend Junior
4. **Juan Dev** - Fullstack Mid

### Proyectos (8):
- E-commerce Platform
- Task Management App
- Weather Dashboard
- Social Network
- Blog CMS
- Chat Application
- Portfolio Generator
- Recipe Finder

### Sesiones (12):
- Distribuidas en los próximos 30 días
- Diferentes horarios
- Variedad de stacks y niveles

---

## 🎉 ¡Listo!

Ahora tienes **Pair Connect** funcionando con:
- ✅ Autenticación real
- ✅ Base de datos persistente
- ✅ Datos de prueba
- ✅ Todas las funcionalidades

**¡A programar en pair!** 👨‍💻👩‍💻

---

Para más detalles técnicos, consulta:
- [`SUPABASE_INTEGRATION.md`](./SUPABASE_INTEGRATION.md) - Documentación completa
- [`AUTHENTICATION.md`](./AUTHENTICATION.md) - Sistema de autenticación
