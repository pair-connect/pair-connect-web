import React, { useState } from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/contexts/AuthContext';
import { Stack, Level } from '@/types';
import { availableLanguages } from '@/data/mockData';
import logoSvg from '@/assets/images/logos/logo.svg';

interface ProfileSetupModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ProfileSetupModal: React.FC<ProfileSetupModalProps> = ({ isOpen, onClose }) => {
  const { updateProfile } = useAuth();
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>([]);
  const [stack, setStack] = useState<Stack>('Frontend');
  const [level, setLevel] = useState<Level>('Junior');
  const [isLoading, setIsLoading] = useState(false);

  const toggleLanguage = (lang: string) => {
    setSelectedLanguages(prev => 
      prev.includes(lang) 
        ? prev.filter(l => l !== lang)
        : [...prev, lang]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await updateProfile({
        languages: selectedLanguages,
        stack: stack,
        level: level
      });
      onClose();
    } catch (err) {
      console.error('Error updating profile:', err);
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
      <div className="relative w-full max-w-lg bg-[#111518] rounded-lg border border-[#515d53] shadow-xl">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-[#b3b3b3] hover:text-white transition-colors z-10"
          aria-label="Cerrar modal"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="p-8">
          {/* Logo and Title */}
          <div className="flex items-center justify-center gap-3 mb-4">
            <img 
              src={logoSvg} 
              alt="Pair Connect Logo" 
              className="w-11 h-11 object-contain"
            />
            <h2 className="text-3xl font-bold gradient-text">
              Pair Connect
            </h2>
          </div>

          <h3 className="text-xl font-bold text-center text-light mb-2">
            ¡Un último paso para empezar a conectar!
          </h3>
          
          <p className="text-center text-light mb-6 leading-relaxed">
            Completa tu perfil con tu lenguaje de programación o framework favorito y tu stack.
            ¡Así podremos ofrecerte mejores conexiones!
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Languages Section */}
            <div>
              <label className="block text-base font-bold text-light mb-3">
                Lenguajes y Frameworks
              </label>
              <div className="relative">
                <select
                  multiple
                  value={selectedLanguages}
                  onChange={(e) => {
                    const selected = Array.from(e.target.selectedOptions, option => option.value);
                    setSelectedLanguages(selected);
                  }}
                  className="w-full px-4 py-3 bg-dark-bg border border-cyan rounded-lg text-light focus:outline-none focus:ring-2 focus:ring-cyan min-h-[44px]"
                  style={{
                    appearance: 'none',
                    backgroundImage: 'none'
                  }}
                >
                  {availableLanguages.slice(0, 10).map(lang => (
                    <option key={lang} value={lang} className="py-2">
                      {lang}
                    </option>
                  ))}
                </select>
                <div className="text-sm text-[#939cab] mt-2">
                  {selectedLanguages.length > 0 
                    ? `Seleccionados: ${selectedLanguages.join(', ')}`
                    : 'Mantén Ctrl/Cmd y haz clic para seleccionar múltiples'}
                </div>
              </div>
            </div>

            {/* Stack Section */}
            <div>
              <label className="block text-base font-bold text-light mb-3">
                Stack
              </label>
              <select
                value={stack}
                onChange={(e) => setStack(e.target.value as Stack)}
                className="w-full px-4 py-3 bg-dark-bg border border-[#515d53] rounded-lg text-[#939cab] focus:outline-none focus:ring-2 focus:ring-cyan focus:border-cyan"
              >
                <option value="Frontend">Frontend</option>
                <option value="Backend">Backend</option>
                <option value="Fullstack">Frontend, Backend o ambos</option>
              </select>
            </div>

            {/* Level Section */}
            <div>
              <label className="block text-base font-bold text-light mb-3">
                Nivel
              </label>
              <div className="grid grid-cols-3 gap-3">
                {(['Junior', 'Mid', 'Senior'] as Level[]).map(lvl => (
                  <button
                    key={lvl}
                    type="button"
                    onClick={() => setLevel(lvl)}
                    className={`p-3 rounded-lg font-bold transition-all ${
                      level === lvl
                        ? 'bg-cyan text-dark-bg'
                        : 'bg-dark-bg text-light border border-[#515d53] hover:border-cyan'
                    }`}
                  >
                    {lvl}
                  </button>
                ))}
              </div>
            </div>

            <Button
              type="submit"
              disabled={isLoading || selectedLanguages.length === 0}
              className="w-full bg-magenta hover:bg-magenta-light text-dark-bg font-bold"
            >
              {isLoading ? 'Guardando...' : 'Continuar'}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};