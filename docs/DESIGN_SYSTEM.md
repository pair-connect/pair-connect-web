# 🎨 Sistema de Diseño - Estrategia y Organización

## 📋 Visión General

Este documento describe la estrategia profesional de organización de estilos para **Pair Connect**, siguiendo principios de sistemas de diseño modernos con enfoque en **Tailwind CSS como prioridad máxima**.

---

## 🎯 Principios Fundamentales

### 1. **Tailwind First**
- **Prioridad máxima**: Usar clases de Tailwind CSS siempre que sea posible
- **CSS personalizado**: Solo para efectos complejos que Tailwind no puede manejar
- **Justificación requerida**: Cualquier CSS personalizado debe tener una razón clara

### 2. **Tokenización**
- Todos los valores de diseño (colores, espaciado, tipografía) están tokenizados
- Los tokens están centralizados en `globals.css`
- Fácil mantenimiento y consistencia

### 3. **Modularidad**
- Estilos organizados por responsabilidad
- Archivos separados para efectos específicos (ej: `shooting-stars.css`)
- Fácil de encontrar y modificar

---

## 📁 Estructura de Archivos

```
src/
├── index.css                    # Punto de entrada principal
│   └── Importa Tailwind + globals.css
│
└── styles/
    ├── globals.css              # Sistema de diseño principal
    │   ├── Tokens de marca
    │   ├── Configuración Tailwind (@theme)
    │   ├── Estilos base
    │   └── Utilidades específicas
    │
    └── shooting-stars.css       # Efecto específico (separado)
```

---

## 🗂️ Organización de `globals.css`

### 1. **Imports** (Líneas 1-19)
- Fuentes de Google
- Dependencias externas

### 2. **Design Tokens** (Líneas 20-150)
- **Colores de marca**: Cyan, Magenta, Purple
- **Colores de superficie**: Dark theme
- **Colores semánticos**: Primary, Secondary, Destructive, etc.
- **Gradientes**: Definidos como variables CSS
- **Sombras**: Efectos de sombra personalizados
- **Tipografía**: Fuentes y pesos
- **Espaciado**: Radios y dimensiones

### 3. **Tailwind Theme Configuration** (Líneas 151-220)
- `@theme inline`: Expone tokens a Tailwind
- Permite usar tokens como clases: `bg-cyan`, `text-magenta`, etc.

### 4. **Base Styles** (Líneas 221-250)
- Reset y estilos base mínimos
- Configuración de `html`, `body`, `#root`

### 5. **Utility Classes** (Líneas 251-450)
- Solo clases que **NO** pueden hacerse con Tailwind
- Ejemplos:
  - `.gradient-text`: Efecto de texto con gradiente complejo
  - `.neon-border`: Borde neon con múltiples sombras
  - `.mouse-light-effect`: Efecto interactivo con mouse

### 6. **Animations** (Líneas 451-550)
- Keyframes reutilizables
- Clases de animación utilitarias

---

## 🎨 Tokens de Diseño

### Colores de Marca

```css
/* Primary - Cyan */
--color-cyan: #4ad3e5
--color-cyan-light: #65dde6
--color-cyan-dark: #069a9a

/* Secondary - Magenta */
--color-magenta: #ff5da2
--color-magenta-light: #ff7ab5
--color-magenta-dark: #862552

/* Accent - Purple */
--color-purple: #a855f7
--color-purple-alt: #a16ee4
```

### Uso en Tailwind

```tsx
// Usando tokens como clases Tailwind
<div className="bg-cyan text-magenta border-purple">
  Contenido
</div>

// O usando variables CSS directamente
<div style={{ backgroundColor: 'var(--color-cyan)' }}>
  Contenido
</div>
```

---

## 📝 Guía de Uso

### ✅ Hacer (Tailwind First)

```tsx
// ✅ Usar clases Tailwind
<div className="bg-dark-bg text-foreground p-4 rounded-lg">
  Contenido
</div>

// ✅ Usar tokens de Tailwind
<button className="bg-primary text-primary-foreground hover:bg-primary-hover">
  Botón
</button>

// ✅ Combinar utilidades Tailwind
<div className="flex items-center gap-4 p-6 bg-dark-card rounded-xl border border-dark-border">
  Contenido
</div>
```

### ❌ Evitar (CSS Personalizado Innecesario)

```tsx
// ❌ NO crear clases CSS para cosas que Tailwind puede hacer
// .custom-padding { padding: 1rem; } ❌
// Usar: className="p-4" ✅

// ❌ NO usar estilos inline para valores tokenizados
// style={{ color: '#4ad3e5' }} ❌
// Usar: className="text-cyan" ✅
```

### ✅ Aceptable (CSS Personalizado Justificado)

```tsx
// ✅ Efectos complejos que Tailwind no puede hacer
<div className="gradient-text">Texto con gradiente animado</div>
<div className="neon-border">Card con borde neon</div>
<div className="mouse-light-effect">Efecto interactivo</div>
```

---

## 🔄 Flujo de Trabajo

### Agregar un Nuevo Color

1. **Agregar token en `globals.css`**:
```css
:root {
  --color-nuevo: #hexcode;
}
```

2. **Exponer a Tailwind**:
```css
@theme inline {
  --color-nuevo: var(--color-nuevo);
}
```

3. **Usar en componentes**:
```tsx
<div className="bg-nuevo text-nuevo">Contenido</div>
```

### Agregar una Nueva Utilidad

1. **Evaluar si Tailwind puede hacerlo**
   - Si sí → Usar clases Tailwind
   - Si no → Continuar

2. **Agregar en `globals.css` bajo `@layer utilities`**:
```css
@layer utilities {
  .mi-utilidad {
    /* CSS específico */
  }
}
```

3. **Documentar por qué no se puede usar Tailwind**

---

## 🎯 Casos Especiales

### `shooting-stars.css`
- **Razón**: Efecto visual específico y complejo
- **Ubicación**: Separado en `styles/shooting-stars.css`
- **Uso**: Importado solo donde se necesita (ej: `Home.tsx`)
- **Justificación**: Animaciones complejas con múltiples elementos posicionados

### Clases de Gradiente
- **Razón**: Efectos de texto con gradiente animado complejo
- **Ubicación**: `globals.css` → `@layer utilities`
- **Uso**: `.gradient-text`, `.gradient-text-secondary`, etc.

### Efectos Neon
- **Razón**: Bordes con múltiples sombras y efectos de blur
- **Ubicación**: `globals.css` → `@layer utilities`
- **Uso**: `.neon-border`, `.neon-border-alt`

---

## 📊 Checklist de Revisión

Antes de agregar CSS personalizado, pregúntate:

- [ ] ¿Puede hacerse con Tailwind?
- [ ] ¿Es un efecto visual complejo justificado?
- [ ] ¿Está tokenizado si es un valor de diseño?
- [ ] ¿Está documentado por qué no se usa Tailwind?
- [ ] ¿Está en el lugar correcto (globals.css vs archivo específico)?

---

## 🚀 Mejores Prácticas

1. **Siempre usar tokens**: Nunca hardcodear valores de color/espaciado
2. **Tailwind primero**: Intentar Tailwind antes de CSS personalizado
3. **Documentar decisiones**: Comentar por qué se usa CSS personalizado
4. **Mantener limpio**: Eliminar CSS no utilizado regularmente
5. **Consistencia**: Usar los mismos tokens en todo el proyecto

---

## 📚 Referencias

- [Tailwind CSS v4 Documentation](https://tailwindcss.com/docs)
- [Design Tokens](https://www.designtokens.org/)
- [CSS Layers](https://developer.mozilla.org/en-US/docs/Web/CSS/@layer)

---

## 🔧 Mantenimiento

### Revisión Mensual
- Verificar CSS no utilizado
- Consolidar estilos duplicados
- Actualizar tokens si cambia la marca
- Revisar si nuevos efectos pueden hacerse con Tailwind

### Actualización de Tokens
- Cambios de marca → Actualizar tokens en `globals.css`
- Los cambios se propagan automáticamente a todo el proyecto

---

**Última actualización**: 2024
**Mantenido por**: Equipo de desarrollo Pair Connect
