import React from "react";

interface HeroButtonProps {
  text: string;
  onClick: () => void;
}

export const HeroButton: React.FC<HeroButtonProps> = ({ text, onClick }) => {
  return (
    <div
      className="relative w-48 h-12 transition-transform duration-700 rounded-lg md:w-56 md:h-14 lg:w-64 lg:h-16 hover:scale-110 cursor-pointer"
      style={{
        background: "linear-gradient(135deg, #ff5da2 0%, #4ad3e5 100%)",
        padding: "3px",
        display: "block",
      }}
    >
      <button
        type="button"
        onClick={onClick}
        aria-label="hero-gradient-register-button"
        className="cursor-pointer w-full h-full px-4 py-2 text-xs md:px-6 md:py-3 md:text-sm lg:px-8 lg:py-4 lg:text-base bg-[var(--color-dark-bg)] text-[var(--color-light)] hover:opacity-95 font-bold whitespace-nowrap transition-all duration-200"
        style={{
          borderRadius: "calc(0.5rem - 3px)",
          display: "block",
          border: "none",
          outline: "none",
        }}
        title="Sí, sí, aquí! Tendrás acceso a conectar con la comunidad de devs."
      >
        {text}
      </button>
    </div>
  );
};
