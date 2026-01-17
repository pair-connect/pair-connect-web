import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Edit2, Trash2, Calendar } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { useAuth } from "@/contexts/AuthContext";
import { api } from "@/utils/api";
import { Project } from "@/types";
import { SectionWrapper } from "@/components/layout/SectionWrapper";

export const MyProjects: React.FC = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthenticated || !user) {
      navigate("/?register=true");
      return;
    }

    const fetchProjects = async () => {
      try {
        setLoading(true);
        const userProjects = await api.projects.getProjects({
          ownerId: user.id,
        });
        setProjects(userProjects);
      } catch (error) {
        console.error("Error fetching projects:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, [isAuthenticated, user, navigate]);

  const handleDelete = async () => {
    if (!projectToDelete) return;

    try {
      await api.projects.deleteProject(projectToDelete);
      setProjects(projects.filter((p) => p.id !== projectToDelete));
      setShowDeleteModal(false);
      setProjectToDelete(null);
    } catch (error) {
      console.error("Error deleting project:", error);
    }
  };

  const formatDate = (date: Date | string) => {
    const d = typeof date === "string" ? new Date(date) : date;
    return new Intl.DateTimeFormat("es-ES", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    }).format(d);
  };

  if (!isAuthenticated || !user) {
    return null;
  }

  return (
    <div className="min-h-screen relative">
      <SectionWrapper className="relative z-10">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl md:text-5xl font-bold">
            <span className="text-[var(--color-light)]">Mis </span>
            <span className="gradient-text">Proyectos</span>
          </h1>
          <Button
            variant="primary"
            onClick={() => navigate("/proyectos/nuevo")}
          >
            <Plus className="w-5 h-5 mr-2" />
            Nuevo Proyecto
          </Button>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <p className="text-[var(--color-light)]/60">Cargando proyectos...</p>
          </div>
        ) : projects.length === 0 ? (
          <Card>
            <div className="text-center py-12">
              <p className="text-[var(--color-light)]/60 mb-4">No tienes proyectos aún.</p>
              <Button
                variant="primary"
                onClick={() => navigate("/proyectos/nuevo")}
              >
                <Plus className="w-5 h-5 mr-2" />
                Crear mi primer proyecto
              </Button>
            </div>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project) => (
              <Card
                key={project.id}
                className="relative group"
              >
                {project.image && (
                  <img
                    src={project.image}
                    alt={project.title}
                    className="w-full h-48 object-cover rounded mb-4 border border-[#4ad3e5]"
                  />
                )}
                <div className="flex items-start justify-between mb-2">
                  <h3 className="text-xl font-bold text-[var(--color-light)] flex-1">
                    {project.title}
                  </h3>
                  <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() =>
                        navigate(`/proyectos/${project.id}/editar`)
                      }
                      className="cursor-pointer p-2 text-[var(--color-light)]/60 hover:text-[#4ad3e5] transition-colors"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => {
                        setProjectToDelete(project.id);
                        setShowDeleteModal(true);
                      }}
                      className="cursor-pointer p-2 text-[var(--color-light)]/60 hover:text-[#ff5da2] transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <p className="text-[var(--color-light)]/80 text-sm mb-4 line-clamp-2">
                  {project.description}
                </p>

                <div className="flex flex-wrap gap-2 mb-4">
                  {project.languages.slice(0, 3).map((lang, index) => (
                    <Badge
                      key={index}
                      variant="gradient"
                    >
                      {lang}
                    </Badge>
                  ))}
                  {project.languages.length > 3 && (
                    <Badge
                      variant="solid"
                      className="bg-[var(--color-dark-card)] text-[var(--color-light)] border-[#4ad3e5]"
                    >
                      +{project.languages.length - 3}
                    </Badge>
                  )}
                </div>

                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2 text-[var(--color-light)]/60">
                    <Calendar className="w-4 h-4" />
                    <span>{formatDate(project.createdAt)}</span>
                  </div>
                  <div className="flex gap-2">
                    <Badge
                      variant="solid"
                      className="bg-transparent text-[var(--color-light)] border border-[#4ad3e5]"
                    >
                      {project.stack}
                    </Badge>
                    <Badge
                      variant="solid"
                      className="bg-transparent text-[var(--color-light)] border border-[#4ad3e5]"
                    >
                      {project.level}
                    </Badge>
                  </div>
                </div>

                <Button
                  variant="outline"
                  className="w-full mt-4"
                  onClick={() => navigate(`/proyectos/${project.id}`)}
                >
                  Ver detalles
                </Button>
              </Card>
            ))}
          </div>
        )}
      </SectionWrapper>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setProjectToDelete(null);
        }}
        title="Confirmar eliminación"
      >
        <div className="space-y-4">
          <p className="text-[var(--color-light)]/80">
            ¿Estás seguro de que quieres eliminar este proyecto? Esta acción no
            se puede deshacer.
          </p>
          <div className="flex gap-3">
            <Button
              variant="ghost"
              onClick={() => {
                setShowDeleteModal(false);
                setProjectToDelete(null);
              }}
              className="flex-1"
            >
              Cancelar
            </Button>
            <Button
              variant="primary"
              onClick={handleDelete}
              className="flex-1 bg-[#ff5da2] hover:bg-[#ff5da2]/80"
            >
              Eliminar
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
