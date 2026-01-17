import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { HeroButton } from "@/components/ui/HeroButton";
import arrowGradient from "@/assets/images/icons/arrow-gradient.svg";
import "@/styles/shooting-stars.css";

export const HeroSection = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const handleScrollToSessions = () => {
    const sessionsSection = document.querySelector("section:nth-of-type(2)");
    sessionsSection?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section className="hero-section relative min-h-[70vh] flex flex-col items-center justify-center px-4 py-16 md:py-24 overflow-hidden">
      {/* Shooting Stars */}
      <div className="shooting-star-cyan"></div>
      <div className="shooting-star-pink"></div>
      <div className="shooting-star-cyan"></div>
      <div className="shooting-star-pink"></div>
      <div className="shooting-star-cyan"></div>
      <div className="shooting-star-pink"></div>
      <div className="shooting-star-cyan"></div>
      <div className="shooting-star-pink"></div>
      <div className="shooting-star-cyan"></div>
      <div className="shooting-star-pink"></div>

      <div className="text-center max-w-4xl mx-auto relative z-10 mt-20 md:mt-24 lg:mt-28">
        {/* Main Title with Gradient */}
        <h1 className="mb-4 font-poppins font-bold text-6xl md:text-7xl lg:text-9xl leading-[120%] gradient-text">
          Pair Connect
        </h1>

        {/* Subtitle */}
        <p className="mb-16 text-xl md:text-2xl lg:text-3xl text-[var(--color-light)]">
          Conecta, programa y crece en equipo
        </p>

        {/* CTA Button */}
        <div className="flex flex-col items-center">
          {!isAuthenticated ? (
            <>
              <HeroButton
                text="Regístrate aquí"
                onClick={() => navigate("/register")}
              />

              <p className="mt-8 text-xs md:text-sm lg:text-sm text-[var(--color-light)]">
                Echa un vistazo a las próximas sesiones
              </p>
            </>
          ) : (
            <p className="text-xs md:text-sm lg:text-sm text-[var(--color-light)]">
              Explora las próximas sesiones
            </p>
          )}
        </div>

        {/* Down Arrow with Gradient */}
        <div className="mt-10">
          <img
            src={arrowGradient}
            alt="Down Arrow"
            className="w-10 h-10 md:w-12 lg:w-14 mx-auto cursor-pointer slow-bounce"
            onClick={handleScrollToSessions}
          />
        </div>
      </div>
    </section>
  );
};
