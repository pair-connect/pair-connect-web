import React from 'react';

interface SectionWrapperProps {
  children: React.ReactNode;
  /**
   * Padding vertical (arriba y abajo)
   * @default 'py-8' (32px)
   */
  verticalPadding?: 'py-4' | 'py-6' | 'py-8' | 'py-12' | 'py-16' | 'none';
  /**
   * Padding horizontal (izquierda y derecha)
   * @default 'px-4' (16px)
   */
  horizontalPadding?: 'px-2' | 'px-4' | 'px-6' | 'px-8' | 'none';
  /**
   * Ancho máximo del contenedor
   * @default 'container' (max-width responsive de Tailwind)
   */
  maxWidth?: 'container' | 'max-w-4xl' | 'max-w-5xl' | 'max-w-6xl' | 'max-w-7xl' | 'max-w-full';
  /**
   * Clases adicionales
   */
  className?: string;
  /**
   * Si es true, aplica margin-bottom adicional
   */
  withBottomMargin?: boolean;
  /**
   * Estilos inline opcionales
   */
  style?: React.CSSProperties;
}

/**
 * ============================================
 * SECTION WRAPPER - Componente de Layout
 * ============================================
 * 
 * Componente reutilizable para estandarizar el espaciado
 * y márgenes de las secciones/páginas.
 * 
 * Uso:
 * ```tsx
 * <SectionWrapper>
 *   <h1>Título</h1>
 *   <p>Contenido...</p>
 * </SectionWrapper>
 * ```
 * 
 * Con opciones personalizadas:
 * ```tsx
 * <SectionWrapper 
 *   verticalPadding="py-12" 
 *   maxWidth="max-w-6xl"
 * >
 *   Contenido...
 * </SectionWrapper>
 * ```
 */
export const SectionWrapper: React.FC<SectionWrapperProps> = ({
  children,
  verticalPadding = 'py-8',
  horizontalPadding = 'px-4',
  maxWidth = 'container',
  className = '',
  withBottomMargin = false,
  style,
}) => {
  const paddingClasses = [
    verticalPadding !== 'none' ? verticalPadding : '',
    horizontalPadding !== 'none' ? horizontalPadding : '',
  ].filter(Boolean).join(' ');

  const marginClass = withBottomMargin ? 'mb-8' : '';

  return (
    <div 
      className={`${maxWidth} mx-auto ${paddingClasses} ${marginClass} ${className}`.trim()}
      style={style}
    >
      {children}
    </div>
  );
};
