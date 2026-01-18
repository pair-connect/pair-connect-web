# 🚀 Pair Connect

**Plataforma web de pair programming** donde desarrolladores pueden crear perfiles, hacer match con otros desarrolladores y trabajar juntos en proyectos colaborativos en tiempo real.

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)
![React](https://img.shields.io/badge/react-18.3-61dafb.svg)
![TypeScript](https://img.shields.io/badge/typescript-5.6-3178c6.svg)
![Supabase](https://img.shields.io/badge/supabase-ready-3ecf8e.svg)

---

## 📋 Tabla de Contenidos

- [Características](#-características)
- [Tecnologías](#-tecnologías)
- [Requisitos Previos](#-requisitos-previos)
- [Instalación](#-instalación)
- [Configuración](#-configuración)
- [Uso](#-uso)
- [Estructura del Proyecto](#-estructura-del-proyecto)
- [API Backend](#-api-backend)
- [Arquitectura](#-arquitectura)
- [Scripts Disponibles](#-scripts-disponibles)
- [Deployment](#-deployment)
- [Documentación](#-documentación)
- [Contribuir](#-contribuir)
- [Licencia](#-licencia)

---

## ✨ Características

### 🔐 **Autenticación Completa**

- Sistema de registro y login con Supabase Auth
- Manejo seguro de sesiones con tokens JWT
- Protección de rutas privadas
- Persistencia de sesión en localStorage

### 👤 **Gestión de Perfiles**

- Perfiles personalizados de desarrollador
- Stack tecnológico (Frontend, Backend, Fullstack)
- Niveles de experiencia (Junior, Mid, Senior)
- Lenguajes de programación
- Información de contacto

### 📁 **Gestión de Proyectos**

- Crear y administrar proyectos
- Descripción, stack y nivel requerido
- Asociar múltiples sesiones por proyecto
- Filtrado por tecnología y experiencia

### 🎯 **Sistema de Sesiones**

- Crear sesiones de pair programming
- Fecha, hora y duración configurables
- Límite de participantes
- Unirse/salir de sesiones
- Mostrar interés en sesiones
- Sistema de bookmarks/favoritos

### 🔍 **Búsqueda y Filtrado**

- Buscar desarrolladores por nombre/username
- Filtrar proyectos por stack y nivel
- Filtrar sesiones por tecnología
- Búsqueda en tiempo real

### 🎨 **Diseño Moderno**

- Tema neon futurista con colores cyan y magenta
- Efectos glow y gradientes
- Responsive mobile-first
- Soporte para modo dark/light
- Animaciones suaves
- Accesibilidad (ARIA labels, keyboard navigation)



## 🛠️ Tecnologías

### **Frontend**

- **[React 18.3](https://react.dev/)** - Librería UI
- **[TypeScript 5.6](https://www.typescriptlang.org/)** - Type safety
- **[Vite](https://vitejs.dev/)** - Build tool & dev server
- **[React Router DOM](https://reactrouter.com/)** - Routing
- **[Tailwind CSS v4](https://tailwindcss.com/)** - Styling
- **[Lucide React](https://lucide.dev/)** - Iconos

### **Backend & Database**

- **[Supabase](https://supabase.com/)** - Backend as a Service
  - Authentication (JWT)
  - PostgreSQL Database
  - Edge Functions (Deno)
  - Storage (para futuros archivos)
- **[Hono](https://hono.dev/)** - Web framework para Edge Functions
- **Deno Runtime** - JavaScript/TypeScript runtime

### **Arquitectura**

- **Three-tier architecture**: Frontend → Server → Database
- **RESTful API** con Hono
- **Key-Value Store** usando tabla PostgreSQL
- **JWT Authentication** con Supabase Auth

---

## 📦 Requisitos Previos

Antes de comenzar, asegúrate de tener instalado:

- **Node.js** >= 18.0.0
- **npm** >= 9.0.0 o **yarn** >= 1.22.0
- **Git** (para clonar el repositorio)
- Cuenta en **[Supabase](https://supabase.com/)** (opcional para desarrollo local)

---

## 🚀 Instalación

### 1. **Clonar el repositorio**

```bash
git clone https://github.com/tu-usuario/pair-connect.git
cd pair-connect
```

### 2. **Instalar dependencias**

```bash
npm install
```

### 3. **Configurar variables de entorno**

Crea un archivo `.env.local` en la raíz del proyecto:

```env
# Supabase Configuration
VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
VITE_SUPABASE_ANON_KEY=tu-anon-key-aqui
```

> **Nota**: Las credenciales actuales están en `/src/utils/supabase/info.tsx` pero se recomienda usar variables de entorno en producción.

### 4. **Ejecutar en desarrollo**

```bash
npm run dev
```

La aplicación estará disponible en `http://localhost:3000`

---

## ⚙️ Configuración

### **Supabase Setup**

El proyecto ya está configurado con una instancia de Supabase en la región `us-east-1` (Virginia).

#### **Si quieres usar tu propia instancia de Supabase:**

1. **Crear proyecto en Supabase**

   - Ve a [supabase.com](https://supabase.com/)
   - Crea un nuevo proyecto
   - Copia la URL y las API keys

2. **Configurar Edge Function**
   - El servidor backend está en `/src/supabase/functions/server/index.tsx`
   - Deploy usando Supabase CLI:

```bash
# Instalar Supabase CLI
npm install -g supabase

# Login
supabase login

# Link proyecto
supabase link --project-ref tu-project-ref

# Deploy función
supabase functions deploy server
```

3. **Configurar secretos en Supabase**

```bash
supabase secrets set SUPABASE_URL=https://tu-proyecto.supabase.co
supabase secrets set SUPABASE_ANON_KEY=tu-anon-key
supabase secrets set SUPABASE_SERVICE_ROLE_KEY=tu-service-role-key
```

4. **Actualizar frontend**
   - Modifica `/src/utils/supabase/info.tsx` con tus credenciales
   - O usa variables de entorno `.env.local`

---

## 🎯 Uso

### **Registro de Usuario**

1. Navega a la página principal
2. Click en "Regístrate aquí"
3. Completa el formulario con:
   - Nombre completo
   - Nombre de usuario
   - Email
   - Contraseña
4. Click en "Registrarse"

### **Login**

1. Navega a la página principal
2. Click en "Login" en el navbar
3. Ingresa email y contraseña
4. Click en "Iniciar Sesión"

### **Crear Proyecto**

1. Una vez logueado, navega a `/mis-proyectos`
2. Click en "Crear Proyecto"
3. Completa:
   - Nombre del proyecto
   - Descripción
   - Stack tecnológico
   - Nivel requerido
4. Click en "Crear Proyecto"

### **Crear Sesión**

1. Desde la página de un proyecto, click en "Nueva Sesión"
2. Configura:
   - Fecha y hora
   - Duración
   - Número máximo de participantes
   - Notas adicionales
3. Click en "Crear Sesión"

### **Unirse a Sesión**

1. Busca sesiones en la página principal
2. Click en "Ver Detalles" en una sesión
3. Click en "Unirse" si hay espacio disponible


---

## 📂 Estructura del Proyecto

```
pair-connect/
├── docs/                      # Documentación técnica
│   ├── AUTHENTICATION.md      # Sistema de autenticación
│   ├── QUICKSTART.md          # Guía rápida de inicio
│   ├── SUPABASE_INTEGRATION.md # Integración con Supabase
│   └── ATTRIBUTIONS.md        # Atribuciones y licencias
├── public/                    # Archivos estáticos
├── src/                       # Código fuente
│   ├── assets/                # Imágenes y recursos
│   ├── components/            # Componentes React reutilizables
│   │   ├── auth/              # Componentes de autenticación
│   │   ├── calendar/          # Componentes de calendario
│   │   ├── figma/             # Componentes de Figma Make
│   │   ├── landing/           # Componentes de landing
│   │   ├── layout/            # Componentes de layout
│   │   ├── sessions/          # Componentes de sesiones
│   │   └── ui/                # Componentes UI base (shadcn/ui)
│   ├── contexts/              # React Context
│   │   ├── AuthContext.tsx
│   │   └── ThemeContext.tsx
│   ├── data/                  # Datos mock y seed
│   │   ├── mockData.ts
│   │   └── seedDatabase.ts
│   ├── hooks/                 # Custom hooks
│   │   └── useTheme.ts
│   ├── imports/               # Componentes generados de Figma
│   ├── pages/                 # Páginas/vistas principales
│   │   ├── Home.tsx
│   │   ├── SessionDetail.tsx
│   │   ├── Team.tsx
│   │   ├── AdminSeed.tsx
│   │   ├── QuickStart.tsx
│   │   └── Diagnostics.tsx
│   ├── styles/                # Estilos globales
│   │   ├── globals.css
│   │   └── shooting-stars.css
│   ├── supabase/              # Backend Edge Functions
│   │   └── functions/
│   │       └── server/
│   │           ├── index.tsx  # Servidor principal Hono
│   │           └── kv_store.tsx
│   ├── types/                 # TypeScript types
│   │   └── index.ts
│   ├── utils/                 # Utilidades
│   │   ├── api.ts
│   │   └── supabase/
│   │       ├── client.tsx
│   │       └── info.tsx
│   ├── App.tsx                 # Componente principal con rutas
│   ├── main.tsx                # Entry point de React
│   └── index.css               # Estilos base
├── .env.local                 # Variables de entorno (crear)
├── index.html                 # HTML principal
├── package.json               # Dependencias y scripts
├── tsconfig.json              # Configuración TypeScript
├── tsconfig.node.json          # Config TypeScript para Node
├── vite.config.ts              # Configuración Vite
└── README.md                  # Este archivo
```

---

## 🔌 API Backend

El backend está implementado con **Supabase Edge Functions** usando **Hono**.

### **Base URL**

```
https://crfrnnvmhrmhuqcbvpoh.supabase.co/functions/v1/make-server-39ee6a8c
```

### **Endpoints Principales**

#### **Autenticación**

| Método | Endpoint        | Descripción             | Auth |
| ------ | --------------- | ----------------------- | ---- |
| POST   | `/auth/signup`  | Crear nuevo usuario     | No   |
| POST   | `/auth/login`   | Iniciar sesión          | No   |
| GET    | `/auth/session` | Verificar sesión actual | Sí   |

#### **Usuarios**

| Método | Endpoint     | Descripción              | Auth |
| ------ | ------------ | ------------------------ | ---- |
| GET    | `/users`     | Buscar usuarios          | No   |
| GET    | `/users/:id` | Obtener usuario por ID   | No   |
| PUT    | `/users/:id` | Actualizar perfil propio | Sí   |

#### **Proyectos**

| Método | Endpoint        | Descripción                | Auth |
| ------ | --------------- | -------------------------- | ---- |
| GET    | `/projects`     | Listar proyectos           | No   |
| GET    | `/projects/:id` | Obtener proyecto           | No   |
| POST   | `/projects`     | Crear proyecto             | Sí   |
| PUT    | `/projects/:id` | Actualizar proyecto propio | Sí   |
| DELETE | `/projects/:id` | Eliminar proyecto propio   | Sí   |

#### **Sesiones**

| Método | Endpoint                   | Descripción              | Auth |
| ------ | -------------------------- | ------------------------ | ---- |
| GET    | `/sessions`                | Listar sesiones          | No   |
| GET    | `/sessions/:id`            | Obtener sesión           | No   |
| POST   | `/sessions`                | Crear sesión             | Sí   |
| PUT    | `/sessions/:id`            | Actualizar sesión propia | Sí   |
| DELETE | `/sessions/:id`            | Eliminar sesión propia   | Sí   |
| POST   | `/sessions/:id/join`       | Unirse a sesión          | Sí   |
| POST   | `/sessions/:id/leave`      | Salir de sesión          | Sí   |
| POST   | `/sessions/:id/interested` | Mostrar interés          | Sí   |

#### **Bookmarks**

| Método | Endpoint            | Descripción       | Auth |
| ------ | ------------------- | ----------------- | ---- |
| GET    | `/bookmarks`        | Obtener bookmarks | Sí   |
| POST   | `/bookmarks/toggle` | Toggle bookmark   | Sí   |

### **Autenticación de Requests**

Para endpoints protegidos, incluye el token JWT en el header:

```javascript
Authorization: Bearer <access_token>
```

### **Ejemplo de Request**

```javascript
const response = await fetch(`${API_BASE_URL}/projects`, {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    Authorization: `Bearer ${accessToken}`,
  },
  body: JSON.stringify({
    name: "Mi Proyecto",
    description: "Descripción del proyecto",
    stack: "Fullstack",
    level: "Mid",
  }),
});
```

---

## 🏗️ Arquitectura

### **Three-Tier Architecture**

```
┌─────────────────────────────────────────────────┐
│                   FRONTEND                      │
│  React + TypeScript + Tailwind + Vite         │
│  - AuthContext (manejo de estado)              │
│  - React Router (navegación)                   │
│  - Supabase Client (auth frontend)             │
└─────────────────┬───────────────────────────────┘
                  │ REST API (fetch)
                  │ Authorization: Bearer <token>
┌─────────────────▼───────────────────────────────┐
│                   SERVER                        │
│  Supabase Edge Function (Deno + Hono)         │
│  - Autenticación JWT                            │
│  - Validación de permisos                      │
│  - Lógica de negocio                           │
│  - CORS configurado                            │
└─────────────────┬───────────────────────────────┘
                  │ KV Store API
                  │ Supabase Admin Client
┌─────────────────▼───────────────────────────────┐
│                  DATABASE                       │
│  PostgreSQL (Supabase)                         │
│  - Tabla: kv_store_39ee6a8c                   │
│    - key: string (primary)                     │
│    - value: jsonb                              │
│  - Supabase Auth (usuarios)                    │
└─────────────────────────────────────────────────┘
```

### **Flujo de Autenticación**

```
1. Usuario → Submit form (email, password)
2. Frontend → supabase.auth.signInWithPassword()
3. Supabase Auth → Valida credenciales → Retorna JWT
4. Frontend → Fetch /users/:id con JWT
5. Backend → Verifica JWT con supabase.auth.getUser()
6. Backend → Obtiene perfil de KV store
7. Backend → Retorna perfil
8. Frontend → Guarda user + token en AuthContext + localStorage
```

### **Data Models**

#### **User**

```typescript
{
  id: string;              // UUID de Supabase Auth
  username: string;        // Único
  name: string;
  email: string;           // Único
  stack: 'Frontend' | 'Backend' | 'Fullstack';
  level: 'Junior' | 'Mid' | 'Senior';
  languages: string[];
  contacts: {
    email: string;
    github?: string;
    linkedin?: string;
  };
  bookmarks: string[];     // IDs de sesiones
  createdAt: string;       // ISO 8601
}
```

#### **Project**

```typescript
{
  id: string; // proj_timestamp_random
  ownerId: string; // User ID
  name: string;
  description: string;
  stack: string;
  level: string;
  createdAt: string;
}
```

#### **Session**

```typescript
{
  id: string;              // sess_timestamp_random
  projectId: string;
  ownerId: string;
  date: string;            // ISO 8601
  duration: number;        // Minutos
  maxParticipants: number;
  participants: string[];  // User IDs
  interested: string[];    // User IDs
  notes?: string;
  createdAt: string;
}
```

---

## 📜 Scripts Disponibles

```bash
# Desarrollo
npm run dev              # Inicia servidor de desarrollo en localhost:3000

# Build
npm run build            # Compila para producción en /dist

# Preview
npm run preview          # Preview del build de producción

# Type Check
npx tsc --noEmit        # Verifica tipos TypeScript
```

---

## 🚀 Deployment

### **Frontend (Vercel/Netlify)**

#### **Vercel**

```bash
# Instalar Vercel CLI
npm install -g vercel

# Deploy
vercel

# Configurar variables de entorno en Vercel Dashboard:
# - VITE_SUPABASE_URL
# - VITE_SUPABASE_ANON_KEY
```

#### **Netlify**

```bash
# Build command
npm run build

# Publish directory
dist

# Variables de entorno en Netlify Dashboard:
# - VITE_SUPABASE_URL
# - VITE_SUPABASE_ANON_KEY
```

### **Backend (Supabase Edge Functions)**

El backend ya está desplegado en Supabase. Para actualizar:

```bash
supabase functions deploy server
```

---

## 📚 Documentación

Documentación técnica adicional disponible en la carpeta [`docs/`](./docs/):

- **[AUTHENTICATION.md](./docs/AUTHENTICATION.md)** - Sistema de autenticación detallado
- **[QUICKSTART.md](./docs/QUICKSTART.md)** - Guía rápida de inicio
- **[SUPABASE_INTEGRATION.md](./docs/SUPABASE_INTEGRATION.md)** - Integración con Supabase
- **[ATTRIBUTIONS.md](./docs/ATTRIBUTIONS.md)** - Atribuciones y licencias

---

## 🎨 Personalización

### **Colores del Tema**

Edita `/src/styles/globals.css` para cambiar los colores:

```css
:root {
  --color-cyan: #4ad3e5;
  --color-magenta: #ff5da2;
  --color-dark-bg: #0b0c10;
  --color-dark-card: #14181a;
  --color-dark-border: #29303d;
}
```

### **Configuración de Tailwind**

Los tokens CSS están en `/src/styles/globals.css`. Tailwind v4 no requiere `tailwind.config.js`.

---


### **Guías de Estilo**

- **React**: Componentes funcionales con hooks
- **TypeScript**: Tipos explícitos, evitar `any`
- **CSS**: Usar Tailwind classes, evitar estilos inline
- **Commits**: Conventional Commits (feat, fix, docs, style, refactor, test, chore)

### **Principios de Código**

- **DRY** (Don't Repeat Yourself)
- **SOLID** (Single Responsibility, Open/Closed, etc.)
- **KISS** (Keep It Simple, Stupid)
- **Accesibilidad** (ARIA labels, semantic HTML, keyboard nav)

---


### **CORS Error**

**Solución**: El servidor ya tiene CORS habilitado para todos los orígenes. Si persiste:

1. Verifica la URL del servidor en `/src/utils/supabase/info.tsx`
2. Asegúrate de que la Edge Function esté desplegada

### **Build Error**

**Solución**:

```bash
# Limpia caché y reinstala
rm -rf node_modules package-lock.json
npm install
npm run build
```

---

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver archivo `LICENSE` para más detalles.

---

## 👨‍💻 Autor

Creado con ❤️ para la comunidad de desarrolladores

---


## 📞 Contacto

Para preguntas, sugerencias o reportar bugs, abre un **[Issue](https://github.com/tu-usuario/pair-connect/issues)** en GitHub.

---

## 🔮 Roadmap

### **v1.1** (Próximamente)

- [ ] Chat en tiempo real entre participantes
- [ ] Videollamada integrada
- [ ] Sistema de calificaciones y reviews
- [ ] Social login (Google, GitHub)
- [ ] Sistema de mensajería privada
- [ ] Dashboard con estadísticas
- [ ] Internacionalización (i18n)

---

**¡Happy Coding! 🚀✨**
