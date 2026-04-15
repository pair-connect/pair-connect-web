import { useState } from 'react';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { AUTH_ENABLED } from '@/data/constants';

interface LoginFormProps {
  handleSubmit: (data: { email: string; password: string }) => Promise<void>;
}

const LoginForm = ({ handleSubmit }: LoginFormProps) => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const disabled = !AUTH_ENABLED;

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.email.trim()) {
      newErrors.email = 'El correo electrónico es obligatorio';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'El correo electrónico no es válido';
    }

    if (!formData.password) {
      newErrors.password = 'La contraseña es obligatoria';
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

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (disabled) return;
    if (!validate()) return;

    setIsLoading(true);
    try {
      await handleSubmit(formData);
    } catch (error: unknown) {
      console.error('Error en login:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={onSubmit} role="form" className="flex flex-col gap-5">
      <div>
        <Input
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          placeholder={disabled ? 'Próximamente' : 'cuenta@ejemplo.com'}
          label="Correo electrónico"
          error={errors.email}
          required={!disabled}
          autoComplete="email"
          disabled={disabled}
          className="bg-dark-bg border-[#515d53] text-light"
        />
      </div>

      <div>
        <Input
          type="password"
          name="password"
          value={formData.password}
          onChange={handleChange}
          placeholder={disabled ? 'Próximamente' : 'Tu contraseña'}
          label="Contraseña"
          error={errors.password}
          required={!disabled}
          autoComplete="current-password"
          disabled={disabled}
          className="bg-dark-bg border-[#515d53] text-light"
        />
      </div>

      <Button 
        type="submit" 
        className="w-[50%] self-center py-2.5" 
        disabled={isLoading || disabled}
        variant="primary"
        size="md"
      >
        {disabled ? 'Próximamente' : isLoading ? 'Iniciando sesión...' : 'Iniciar sesión'}
      </Button>
    </form>
  );
};

export default LoginForm;
