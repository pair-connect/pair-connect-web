import React, { useState } from 'react';
import { X } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onShowProfileSetup: () => void;
  defaultTab?: 'login' | 'register';
}

export const AuthModal: React.FC<AuthModalProps> = ({ 
  isOpen, 
  onClose, 
  onShowProfileSetup,
  defaultTab = 'login'
}) => {
  const { login } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Login state
  const [loginData, setLoginData] = useState({
    email: '',
    password: ''
  });

  const handleLoginChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setLoginData(prev => ({ ...prev, [name]: value }));
    setError('');
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await login(loginData.email, loginData.password);
      onClose();
      setLoginData({ email: '', password: '' });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al iniciar sesión';
      if (errorMessage.includes('Invalid login credentials') || errorMessage.includes('Invalid credentials')) {
        setError('Credenciales inválidas. Verifica tu email y contraseña, o regístrate si no tienes cuenta.');
      } else {
        setError(errorMessage);
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
    >
      <div className="relative w-full max-w-lg bg-[var(--color-dark-card)] rounded-lg border border-[var(--color-dark-border)] hover:border-[#4ad3e5] transition-colors duration-300 shadow-xl">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-[var(--color-gray-blue)] hover:text-[var(--color-light)] transition-colors z-10"
          aria-label="Cerrar modal"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="p-8">
          {/* Title */}
          <h2 className="text-2xl font-bold text-center text-[var(--color-light)] mb-2">
            Iniciar sesión
          </h2>
          
          <p className="text-center text-[var(--color-gray-blue)] mb-6">
            Ingresa tus credenciales para continuar.
          </p>

          {/* Login Form */}
          <form onSubmit={handleLoginSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-[var(--color-light)] mb-2">
                Correo electrónico
              </label>
              <Input
                type="email"
                name="email"
                value={loginData.email}
                onChange={handleLoginChange}
                placeholder="cuenta@ejemplo.com"
                required
                autoComplete="email"
                className="bg-[var(--color-dark-bg)] border-[var(--color-dark-border)]"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-[var(--color-light)] mb-2">
                Contraseña
              </label>
              <Input
                type="password"
                name="password"
                value={loginData.password}
                onChange={handleLoginChange}
                placeholder="Tu contraseña"
                required
                autoComplete="current-password"
                className="bg-[var(--color-dark-bg)] border-[var(--color-dark-border)]"
              />
            </div>

            {error && (
              <p className="text-sm text-red-500" role="alert">
                {error}
              </p>
            )}

            <button
              type="button"
              className="text-sm text-cyan hover:text-cyan-light transition-colors"
              onClick={() => alert('Funcionalidad de recuperación de contraseña próximamente')}
            >
              Recupera contraseña
            </button>

            <Button
              type="submit"
              variant="primary"
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? 'Iniciando sesión...' : 'Iniciar sesión'}
            </Button>

            <p className="text-center text-sm text-[var(--color-light)] mt-4">
              ¿No tienes cuenta?{' '}
              <button
                type="button"
                onClick={() => {
                  onClose();
                  window.location.href = '/register';
                }}
                className="text-[#ff5da2] hover:text-[#ff7ab5] font-bold transition-colors"
              >
                Regístrate
              </button>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};
