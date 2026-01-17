import React from "react";
import { ProjectCard } from "@/components/projects/ProjectCard";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/Carousel";
import { Project } from "@/types";
import { SectionWrapper } from "@/components/layout/SectionWrapper";

interface ProjectsListProps {
  projects: Project[];
  loading: boolean;
  isAuthenticated: boolean;
  onToggleInterest: (projectId: string) => void;
  onRequireAuth: () => void;
}

export const ProjectsList: React.FC<ProjectsListProps> = ({
  projects,
  loading,
  isAuthenticated,
  onToggleInterest,
  onRequireAuth,
}) => {
  return (
    <SectionWrapper verticalPadding={projects.length > 0 ? "py-12" : "py-12"}>
      <h2 className="text-2xl md:text-3xl font-bold text-[var(--color-light)] mb-2">
        Proyectos de la comunidad
      </h2>
      <p className="text-[#8fa6bc] text-sm mb-6 font-['Source_Code_Pro']">
        {isAuthenticated 
          ? "Explora proyectos creados por la comunidad y muestra interés para activarlos."
          : "Explora proyectos creados por la comunidad. Inicia sesión para ver detalles y participar en sesiones."}
      </p>
      {loading ? (
        <div className="text-center py-12">
          <p className="text-gray-400 text-lg">Cargando proyectos...</p>
        </div>
      ) : projects.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-400 text-lg">No se encontraron proyectos</p>
        </div>
      ) : (
        <div className="relative">
          {/* Mobile: Grid simple sin carousel */}
          <div className="block md:hidden">
            <div className="grid grid-cols-1 gap-4">
              {projects.map((project) => (
                <ProjectCard
                  key={project.id}
                  project={project}
                  onToggleInterest={onToggleInterest}
                  onRequireAuth={onRequireAuth}
                />
              ))}
            </div>
          </div>

          {/* Desktop: Carousel con flechas fuera del contenido */}
          <div className="hidden md:block relative">
            <Carousel
              opts={{
                align: "start",
                loop: false,
              }}
              className="w-full px-12"
            >
              <CarouselContent className="-ml-4">
                {projects.map((project) => (
                  <CarouselItem key={project.id} className="pl-4 basis-1/2 lg:basis-1/3">
                    <ProjectCard
                      project={project}
                      onToggleInterest={onToggleInterest}
                      onRequireAuth={onRequireAuth}
                    />
                  </CarouselItem>
                ))}
              </CarouselContent>
              {projects.length > 1 && (
                <>
                  <CarouselPrevious 
                    className="!-left-4 !bg-[var(--color-dark-card)]/95 backdrop-blur-sm !border-2 !border-[#4ad3e5] !text-[#4ad3e5] hover:!bg-[#4ad3e5] hover:!text-[var(--color-dark-card)] !w-12 !h-12 !rounded-lg !z-20"
                  />
                  <CarouselNext 
                    className="!-right-4 !bg-[var(--color-dark-card)]/95 backdrop-blur-sm !border-2 !border-[#4ad3e5] !text-[#4ad3e5] hover:!bg-[#4ad3e5] hover:!text-[var(--color-dark-card)] !w-12 !h-12 !rounded-lg !z-20"
                  />
                </>
              )}
            </Carousel>
          </div>
        </div>
      )}
    </SectionWrapper>
  );
};
