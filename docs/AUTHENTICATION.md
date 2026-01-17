# Sistema de Autenticación - Pair Connect

## Descripción General

La aplicación Pair Connect utiliza un sistema de autenticación unificado que combina Login y Registro en una sola modal con tabs, siguiendo el diseño neon futurista de Figma.

## Componentes Principales

### 1. AuthModal (`/components/auth/AuthModal.tsx`)

Modal unificada que maneja tanto el registro como el inicio de sesión:

**Props:**
- `isOpen`: boolean - Controla la visibilidad de la modal
- `onClose`: () => void - Callback para cerrar la modal
- `onShowProfileSetup`: () => void - Callback para mostrar el modal de configuración de perfil
- `defaultTab`: 'login' | 'register' - Tab inicial a mostrar (default: 'register')

**Características:**
- Tabs para cambiar entre "Registro" e "Iniciar sesión"
- Validación de formularios en tiempo real
- Mensajes de error claros
- Diseño responsive
- Accesibilidad con ARIA labels y navegación por teclado

**Campos de Registro:**
- Nombre
- Nombre de usuario
- Correo electrónico
- Contraseña
- Confirmar contraseña

**Campos de Login:**
- Correo electrónico
- Contraseña

### 2. ProfileSetupModal (`/components/auth/ProfileSetupModal.tsx`)

Modal que aparece después del registro exitoso para completar el perfil:

**Props:**
- `isOpen`: boolean
- `onClose`: () => void

**Campos:**
- Lenguajes y Frameworks (selector múltiple)
- Stack (Frontend/Backend/Fullstack)
- Nivel (Junior/Mid/Senior)

**Características:**
- Logo de Pair Connect con gradiente
- Selector multi-opción para lenguajes
- Botones de radio estilizados para nivel
- Botón de "Continuar" con validación

## Flujo de Autenticación

### Flujo de Registro:

1. Usuario hace clic en "Comenzar ahora" o "Login" en Navbar
2. Se abre AuthModal con tab de "Registro" por defecto
3. Usuario completa el formulario de registro
4. Al enviar, se validan los campos:
   - Nombre no vacío
   - Username no vacío
   - Email válido
   - Contraseña mínimo 6 caracteres
   - Contraseñas coinciden
5. Si es válido, se crea el usuario y se cierra AuthModal
6. Se abre ProfileSetupModal automáticamente
7. Usuario completa lenguajes, stack y nivel
8. Al confirmar, se actualiza el perfil y se cierra la modal
9. Usuario es redirigido a la home autenticado

### Flujo de Login:

1. Usuario hace clic en "Iniciar sesión" en AuthModal o Navbar
2. Se abre AuthModal con tab de "Iniciar sesión"
3. Usuario ingresa email y contraseña
4. Al enviar, se validan las credenciales
5. Si son correctas, se autentica al usuario
6. Modal se cierra y usuario queda autenticado

### Usuarios de Demo:

Para testing, puedes usar:
- Email: `superman@email.com`
- Password: cualquier contraseña

## Integración en Páginas

### Home Page (`/pages/Home.tsx`)

```tsx
const [showAuthModal, setShowAuthModal] = useState(false);
const [authDefaultTab, setAuthDefaultTab] = useState<'login' | 'register'>('register');
const [showProfileSetup, setShowProfileSetup] = useState(false);

// Detectar parámetros de URL
useEffect(() => {
  const loginParam = searchParams.get('login');
  const registerParam = searchParams.get('register');
  
  if (loginParam === 'true') {
    setAuthDefaultTab('login');
    setShowAuthModal(true);
  } else if (registerParam === 'true') {
    setAuthDefaultTab('register');
    setShowAuthModal(true);
  }
}, [searchParams]);

// Modals
<AuthModal
  isOpen={showAuthModal}
  onClose={() => setShowAuthModal(false)}
  defaultTab={authDefaultTab}
  onShowProfileSetup={() => setShowProfileSetup(true)}
/>

<ProfileSetupModal
  isOpen={showProfileSetup}
  onClose={() => setShowProfileSetup(false)}
/>
```

### Navbar (`/components/layout/Navbar.tsx`)

```tsx
// Botón que redirige a home con parámetro
<Button 
  onClick={() => window.location.href = '/?register=true'} 
  variant="primary"
>
  Login
</Button>
```

### Session Detail (`/pages/SessionDetail.tsx`)

```tsx
const handleJoinSession = () => {
  if (!isAuthenticated) {
    navigate('/?register=true');  // Redirige a registro
    return;
  }
  setShowJoinModal(true);
};
```

## Contexto de Autenticación

### AuthContext (`/contexts/AuthContext.tsx`)

**Estado:**
- `user`: User | null - Usuario actual
- `isAuthenticated`: boolean - Estado de autenticación

**Métodos:**
- `login(email, password)`: Promise<void> - Inicia sesión
- `register(data)`: Promise<void> - Registra nuevo usuario
- `logout()`: void - Cierra sesión
- `updateProfile(data)`: Promise<void> - Actualiza perfil del usuario

**Persistencia:**
- Los datos del usuario se guardan en localStorage
- Al recargar la página, se restaura la sesión automáticamente

## Estilos y Diseño

### Colores:
- **Cyan**: #4ad3e5 - Botón principal, bordes activos
- **Magenta**: #ff5da2 - Enlaces de cambio de tab, botón continuar
- **Fondo modal**: #111518
- **Bordes**: #515d53
- **Texto placeholder**: #939cab
- **Fondo inputs**: #0b0c10 (dark-bg)

### Componentes de UI:
- Input con validación y mensajes de error
- Botones con variantes (primary, secondary, outline, ghost)
- Modal con backdrop semi-transparente
- Close button con ícono X

## Accesibilidad

- Todos los inputs tienen labels descriptivos
- Mensajes de error con role="alert"
- Navegación por teclado completa
- Escape cierra las modales
- Click fuera de la modal la cierra
- ARIA labels en botones de acción

## Mejoras Futuras

- [ ] Recuperación de contraseña funcional
- [ ] Verificación de email
- [ ] Login con OAuth (Google, GitHub)
- [ ] 2FA (Two-Factor Authentication)
- [ ] Recordar sesión (checkbox)
- [ ] Validación de email en tiempo real
- [ ] Indicador de fortaleza de contraseña
- [ ] Límite de intentos de login
