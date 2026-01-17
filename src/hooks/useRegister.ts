import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { RegisterData } from '@/types';

export const useRegister = () => {
  const { register } = useAuth();
  const [loading, setLoading] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const handleRegister = async (data: RegisterData) => {
    setLoading(true);
    try {
      await register(data);
      setShowSuccessModal(true);
    } catch (error) {
      console.error('Error en registro:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return {
    handleRegister,
    loading,
    showSuccessModal,
    setShowSuccessModal,
  };
};
