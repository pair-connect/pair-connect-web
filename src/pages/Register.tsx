import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useMousePosition } from "@/hooks/useMousePosition";
import { useAuth } from "@/contexts/AuthContext";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import Loader from "@/components/shared/Loader";
import { RegisterData } from "@/types";

const RegisterPage = () => {
  const { elementRef } = useMousePosition();
  const { register } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<RegisterData>({
    name: '',
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) newErrors.name = 'El nombre es requerido';
    if (!formData.username.trim()) newErrors.username = 'El nombre de usuario es requerido';
    if (!formData.email.trim()) newErrors.email = 'El email es requerido';
    if (!formData.password) newErrors.password = 'La contraseña es requerida';
    if (formData.password.length < 6) newErrors.password = 'La contraseña debe tener al menos 6 caracteres';
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Las contraseñas no coinciden';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      await register(formData);
      // El AuthContext maneja la redirección y el ProfileSetupModal
    } catch (error: unknown) {
      console.error("Error registering user", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <Loader />;
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)] px-4 my-12 md:my-16">
      <h1
        className="mb-8 md:mb-12 font-poppins font-bold text-5xl md:text-6xl leading-tight text-transparent bg-clip-text gradient-text"
      >
        Registro
      </h1>
      <div className="w-full max-w-6xl">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-start">
          {/* Left Column - Text Content for SEO */}
          <div className="order-1 lg:order-1">
            <div className="space-y-6">
              <h2 className="text-3xl font-bold text-light mb-4">
                Únete a Pair Connect
              </h2>
              <p className="text-[#939cab] text-lg leading-relaxed">
                Crea tu cuenta y comienza a conectar con otros desarrolladores/as. 
                Encuentra compañeros/as de programación que compartan tus intereses y nivel de experiencia.
              </p>
              <div className="space-y-4 mt-6">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-cyan/20 flex items-center justify-center shrink-0 mt-1">
                    <svg className="w-4 h-4 text-cyan" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <p className="text-[#939cab]">
                    Conecta con desarrolladores/as de todo el mundo
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-cyan/20 flex items-center justify-center shrink-0 mt-1">
                    <svg className="w-4 h-4 text-cyan" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <p className="text-[#939cab]">
                    Colabora en proyectos reales y crece profesionalmente
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-cyan/20 flex items-center justify-center shrink-0 mt-1">
                    <svg className="w-4 h-4 text-cyan" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <p className="text-[#939cab]">
                    Aprende programación en pareja o en grupo y mejora tus habilidades
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Form */}
          <div className="order-2 lg:order-2">
            <div
              className="border border-[#515d53] rounded-lg mouse-border-effect"
              ref={elementRef}
            >
              <div className="p-6 sm:p-8 card-with-light-effect">
                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-4">
            {/* Two columns on desktop, single column on mobile */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Nombre"
                  label="Nombre"
                  error={errors.name}
                  required
                  autoComplete="name"
                  className="bg-dark-bg border-[#515d53] text-light"
                />
              </div>

              <div>
                <Input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  placeholder="Nombre de usuario"
                  label="Nombre de usuario"
                  error={errors.username}
                  required
                  autoComplete="username"
                  className="bg-dark-bg border-[#515d53] text-light"
                />
              </div>
            </div>

            {/* Email full width */}
            <div>
              <Input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="cuenta@ejemplo.com"
                label="Correo electrónico"
                error={errors.email}
                required
                autoComplete="email"
                className="bg-dark-bg border-[#515d53] text-light"
              />
            </div>

            {/* Passwords in two columns on desktop */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Tu contraseña"
                  label="Contraseña"
                  error={errors.password}
                  required
                  autoComplete="new-password"
                  className="bg-dark-bg border-[#515d53] text-light"
                />
              </div>

              <div>
                <Input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Confirma tu contraseña"
                  label="Confirmar contraseña"
                  error={errors.confirmPassword}
                  required
                  autoComplete="new-password"
                  className="bg-dark-bg border-[#515d53] text-light"
                />
              </div>
            </div>

            <Button
              type="submit"
              variant="primary"
              className="w-full mt-6"
              disabled={loading}
            >
              {loading ? 'Enviando...' : 'Crear cuenta'}
            </Button>

            <p className="text-center text-sm text-light mt-6">
              ¿Ya te has registrado?{' '}
              <button
                type="button"
                onClick={() => navigate('/login')}
                className="text-[#ff5da2] hover:text-[#ff7ab5] font-bold transition-colors"
              >
                Inicia sesión
              </button>
            </p>
          </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
