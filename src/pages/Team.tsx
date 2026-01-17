import "@/styles/cosmic-background.css";
import CosmicBackground from "@/components/shared/CosmicBackground";
import TeamContent from "@/components/team/TeamContent";
import { Button } from "@/components/ui/Button";
import { useRef } from "react";
import { useNavigate } from "react-router-dom";
import TeamList from "@/components/team/TeamList";

export const Team = () => {
  const navigate = useNavigate();
  const registerButtonRef = useRef<HTMLButtonElement>(null);
  const teamSectionRef = useRef<HTMLDivElement>(null);

  const scrollToTeamSection = () => {
    if (teamSectionRef.current) {
      teamSectionRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <section className="relative min-h-screen" style={{ isolation: 'isolate', zIndex: 0 }}>
      <div className="relative z-0">
        <CosmicBackground />
        <TeamContent onClick={scrollToTeamSection} />

        <div className="flex flex-col items-center gap-5 mt-20 mb-10 text-center" style={{ zIndex: 0 }}>
          <div ref={teamSectionRef} style={{ zIndex: 0 }}>
            <TeamList />
          </div>
          <h3 className="mt-20 mb-2 text-xl font-bold text-[var(--color-light)]">
            ¡Únete a Pair Connect!
          </h3>
          <Button
            variant="doubleColorButton"
            onClick={() => navigate("/register")}
            size="lg"
            title="Regístrate y forma parte de nuestra comunidad"
            ref={registerButtonRef}
          >
            Regístrate
          </Button>
        </div>
      </div>
    </section>
  );
};
