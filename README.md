# <img src="src/assets/images/logos/logo.svg" alt="Pair Connect Logo" width="24" height="24"/> Pair Connect

**Plataforma web de pair programming** donde desarrolladores/as pueden crear perfiles, hacer match con otros desarrolladores/as y trabajar juntos/as en proyectos colaborativos a través de sesiones programadas.

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![License](https://img.shields.io/badge/license-Proprietary-red.svg)
![React](https://img.shields.io/badge/react-18.3-61dafb.svg)
![TypeScript](https://img.shields.io/badge/typescript-5.6-3178c6.svg)
![Supabase](https://img.shields.io/badge/supabase-ready-3ecf8e.svg)

---

## 📋 Tabla de Contenidos

- [Características](#-características)
- [Tecnologías](#-tecnologías)
- [Requisitos Previos](#-requisitos-previos)
- [Instalación y Configuración](#-instalación-y-configuración)
- [Configuración](#-configuración)
- [Uso](#-uso)
- [Estructura del Proyecto](#-estructura-del-proyecto)
- [API Backend](#-api-backend)
- [Arquitectura](#-arquitectura)
- [Scripts Disponibles](#-scripts-disponibles)
- [Documentación](#-documentación)
- [Licencia](#-licencia)
- [Autoras](#-autoras)
- [Contacto](#-contacto)
- [Roadmap](#-roadmap)

---

## ✨ Características

### 🔐 **Autenticación Completa**

- Sistema de registro y login con Supabase Auth
- Manejo seguro de sesiones con tokens JWT
- Protección de rutas privadas
- Persistencia de sesión en localStorage

### 👤 **Gestión de Perfiles**

- Perfiles personalizados de desarrollador/a
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

- Crear sesiones de pair programming o group programming
- Fecha, hora y duración configurables
- Límite de participantes
- Unirse/salir de sesiones
- Mostrar interés en sesiones
- Sistema de bookmarks/favoritos

### 🔍 **Búsqueda y Filtrado**

- Buscar desarrolladores/as por nombre/username
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
- **Base de datos relacional** PostgreSQL con tablas normalizadas
- **JWT Authentication** con Supabase Auth

---

## 📦 Requisitos Previos

Antes de comenzar, asegúrate de tener instalado:

- **Node.js** >= 18.0.0
- **npm** >= 9.0.0 o **yarn** >= 1.22.0
- **Git** (para clonar el repositorio)

---

## 🚀 Instalación y Configuración

### **Requisitos del Sistema**

- Node.js >= 18.0.0
- npm >= 9.0.0
- Cuenta de Supabase configurada

### **Configuración del Entorno**

1. **Clonar el repositorio** (para desarrollo interno)

```bash
git clone https://github.com/tu-usuario/pair-connect-web.git
cd pair-connect-web
```

2. **Instalar dependencias**

```bash
npm install
```

### 3. **Configurar variables de entorno**

Copia el archivo `.env.example` a `.env.local` y completa con tus valores reales:

```bash
cp .env.example .env.local
```

Luego edita `.env.local` con tus credenciales de Supabase:

```env
# Supabase Configuration
VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
VITE_SUPABASE_ANON_KEY=tu-anon-key-aqui
# IMPORTANTE: Usa el SLUG real de tu función Edge (no el nombre)
# El slug lo encuentras en: Edge Functions > tu-funcion > Details > Slug
VITE_API_URL=https://tu-proyecto.supabase.co/functions/v1/tu-slug-real-aqui
```


### 4. **Ejecutar en desarrollo**

```bash
npm run dev
```

La aplicación estará disponible en `http://localhost:3000`

---

## ⚙️ Configuración

### **Supabase Setup**

El proyecto utiliza Supabase como backend. Configura tu propia instancia siguiendo las instrucciones de configuración.


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
├── docs/                  
├── public/                    # Archivos estáticos
├── src/                       # Código fuente
│   ├── assets/                # Imágenes y recursos
│   ├── components/
│   ├── contexts/              # React Context
│   │   ├── AuthContext.tsx
│   │   └── ThemeContext.tsx
│   ├── data/
│   ├── hooks/
│   ├── pages/                 # Páginas/vistas principales
│   ├── styles/                # Estilos globales
│   │   ├── globals.css
│   │   └── shooting-stars.css
│   ├── supabase/              # Backend Edge Functions
│   │   └── functions/
│   │       └── tu-funcion-edge/
│   │           └── index.ts   # Servidor principal Hono
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

La URL base de la API se configura mediante la variable de entorno `VITE_API_URL` en tu archivo `.env.local`:

```
https://tu-proyecto.supabase.co/functions/v1/tu-slug-real-aqui
```

**⚠️ IMPORTANTE:** Usa el **SLUG** real de tu función Edge, no el nombre. El slug lo encuentras en:
- Dashboard de Supabase → Edge Functions → tu-funcion → Details → Slug
- El slug puede ser diferente al nombre (ej: función se llama "api-server" pero el slug es "make-server-39ee6a8c")

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
                  │ PostgreSQL API
                  │ Supabase Admin Client
┌─────────────────▼───────────────────────────────┐
│                  DATABASE                       │
│  PostgreSQL (Supabase)                         │
│  - Tablas relacionales:                        │
│    • users (perfiles)                           │
│    • projects (proyectos)                       │
│    • sessions (sesiones)                        │
│    • session_participants (relaciones)         │
│    • user_bookmarks (favoritos)                │
│  - Row Level Security (RLS) habilitado          │
│  - Supabase Auth (autenticación)               │
└─────────────────────────────────────────────────┘
```

### **Flujo de Autenticación**

```
1. Usuario → Submit form (email, password)
2. Frontend → supabase.auth.signInWithPassword()
3. Supabase Auth → Valida credenciales → Retorna JWT
4. Frontend → Fetch /users/:id con JWT
5. Backend → Verifica JWT con supabase.auth.getUser()
6. Backend → Obtiene perfil de la base de datos
7. Backend → Retorna perfil
8. Frontend → Guarda user + token en AuthContext + localStorage
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

## 📚 Documentación

Documentación técnica adicional disponible en la carpeta [`docs/`](./docs/):

- **[AUTHENTICATION.md](./docs/AUTHENTICATION.md)** - Sistema de autenticación detallado
- **[QUICKSTART.md](./docs/QUICKSTART.md)** - Guía rápida de inicio
- **[SUPABASE_INTEGRATION.md](./docs/SUPABASE_INTEGRATION.md)** - Integración con Supabase
- **[ATTRIBUTIONS.md](./docs/ATTRIBUTIONS.md)** - Atribuciones y licencias

---

### **Buenas Prácticas Implementadas**

Este proyecto sigue las siguientes buenas prácticas de desarrollo:

- **React**: Componentes funcionales con hooks
- **TypeScript**: Tipos explícitos para mayor seguridad de tipos
- **CSS**: Uso de Tailwind classes, evitando estilos inline
- **Arquitectura**: Principios DRY, SOLID y KISS
- **Accesibilidad**: ARIA labels, HTML semántico, navegación por teclado

---

## 📄 Licencia

Este proyecto es propietario. Todos los derechos reservados. Ver archivo `LICENSE` para más detalles.

---

## 👩‍💻 Autoras

Creado con ❤️ por:

- **[Lynn](https://github.com/Dpoetess)** - Fullstack Developer
- **[Helena](https://github.com/helopgom)** - Fullstack Developer  
- **[Jess](https://github.com/jess-ar)** - Fullstack Developer

---

## 📞 Contacto

Para consultas sobre el producto o soporte técnico, escribe a **pairconnect@mail.com**

---

## 🔮 Roadmap

### **v1.1** (Próximamente)

- [ ] Chat en tiempo real entre participantes
- [ ] Sistema de calificaciones y reviews
- [ ] Social login (Google, GitHub)
- [ ] Sistema de mensajería privada
- [ ] Dashboard con estadísticas
- [ ] Internacionalización (i18n)

---

**¡Happy Coding! 🚀✨**
