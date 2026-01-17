import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  ArrowLeft,
  Edit2,
  Plus,
  Calendar,
  Clock,
  Users,
  Trash2,
  Heart,
  Bell,
} from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { useAuth } from "@/contexts/AuthContext";
import { api } from "@/utils/api";
import { Project, Session } from "@/types";
import { SectionWrapper } from "@/components/layout/SectionWrapper";

export const ProjectDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();

  const [project, setProject] = useState<Project | null>(null);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isInterested, setIsInterested] = useState(false);

  // Require authentication to view project details
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/?login=true&redirect=/proyectos/' + id);
      return;
    }
  }, [isAuthenticated, navigate, id]);

  useEffect(() => {
    if (!isAuthenticated || !id) return;

    const fetchData = async () => {
      try {
        setLoading(true);
        const [projectData, sessionsData] = await Promise.all([
          api.projects.getProject(id),
          api.sessions.getSessions({ projectId: id }),
        ]);
        setProject(projectData);
        setSessions(sessionsData);
      } catch (error) {
        console.error("Error fetching project:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, user, isAuthenticated]);

  const handleDelete = async () => {
    if (!project) return;

    try {
      await api.projects.deleteProject(project.id);
      navigate("/mis-proyectos");
    } catch (error) {
      console.error("Error deleting project:", error);
    }
  };

  const handleToggleInterest = async () => {
    if (!project || !user) {
      // Could show auth modal here
      return;
    }

    try {
      const updatedProject = await api.projects.toggleInterest(project.id);
      setProject({
        ...project,
        interested: updatedProject.interested || [],
      });
      setIsInterested(updatedProject.interested?.includes(user.id) || false);
    } catch (error) {
      console.error("Error toggling interest:", error);
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

  const formatTime = (date: Date | string) => {
    const d = typeof date === "string" ? new Date(date) : date;
    return new Intl.DateTimeFormat("es-ES", {
      hour: "2-digit",
      minute: "2-digit",
    }).format(d);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-[var(--color-light)]/60">Cargando proyecto...</p>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card>
          <p className="text-[var(--color-light)]/60 mb-4">Proyecto no encontrado</p>
          <Button onClick={() => navigate("/mis-proyectos")}>
            Volver a mis proyectos
          </Button>
        </Card>
      </div>
    );
  }

  const isOwner = user?.id === project.ownerId;

  return (
    <div
      className="min-h-screen relative"
      style={{ color: "#ffffff" }}
    >

      <SectionWrapper className="relative z-10" style={{ color: "#ffffff" }}>
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate(-1)}
              className="cursor-pointer p-2 text-[var(--color-light)]/60 hover:text-[#4ad3e5] transition-colors"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>
            <h1 className="text-3xl md:text-5xl font-bold">
              <span className="gradient-text">{project.title}</span>
            </h1>
          </div>

          {isOwner && (
            <div className="flex gap-2">
              <Button
                variant="primary"
                onClick={() => navigate(`/proyectos/${project.id}/solicitudes`)}
                className="flex items-center gap-2"
              >
                <Bell className="w-4 h-4" />
                Solicitudes
              </Button>
              <Button
                variant="outline"
                onClick={() => navigate(`/proyectos/${project.id}/editar`)}
              >
                <Edit2 className="w-4 h-4 mr-2" />
                Editar
              </Button>
              <Button
                variant="ghost"
                onClick={() => setShowDeleteModal(true)}
                className="text-[#ff5da2] hover:bg-[#ff5da2]/20"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Project Info */}
            <Card>
              <h2 className="text-xl font-bold text-[#4ad3e5] mb-4">
                Sobre el proyecto:
              </h2>
              <div className="flex gap-6">
                {project.image && (
                  <img
                    src={project.image}
                    alt={project.title}
                    className="w-32 h-32 object-cover rounded-lg border border-[#4ad3e5]"
                  />
                )}
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-[var(--color-light)] mb-2">
                    {project.title}
                  </h3>
                  <p className="text-[var(--color-light)]/70">
                    {project.description || "Sin descripción"}
                  </p>
                </div>
              </div>
            </Card>

            {/* Languages */}
            <Card>
              <h2 className="text-xl font-bold text-[#4ad3e5] mb-4">
                Lenguajes
              </h2>
              <div className="flex flex-wrap gap-2">
                {project.languages.length > 0 ? (
                  project.languages.map((lang, index) => (
                    <Badge
                      key={index}
                      variant="gradient"
                    >
                      {lang}
                    </Badge>
                  ))
                ) : (
                  <p className="text-[var(--color-light)]/60">No hay lenguajes definidos</p>
                )}
              </div>
            </Card>

            {/* Sessions List */}
            <Card>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-[#4ad3e5]">
                  Sesiones del proyecto
                </h2>
                {isOwner && (
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() =>
                      navigate(`/proyectos/${project.id}/nueva-sesion`)
                    }
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Nueva sesión
                  </Button>
                )}
              </div>

              {sessions.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-[var(--color-light)]/60 mb-4">
                    No hay sesiones programadas
                  </p>
                  {isOwner && (
                    <Button
                      variant="outline"
                      onClick={() =>
                        navigate(`/proyectos/${project.id}/nueva-sesion`)
                      }
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Crear primera sesión
                    </Button>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  {sessions.map((session) => (
                    <div
                      key={session.id}
                      className="p-4 bg-[var(--color-dark-card)] border border-[#4ad3e5]/30 rounded-lg hover:border-[#4ad3e5] transition-colors cursor-pointer"
                      onClick={() => navigate(`/sesion/${session.id}`)}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-bold text-[var(--color-light)]">
                          {session.title}
                        </h3>
                        <Badge
                          variant="solid"
                          className="bg-[#4ad3e5]/20 text-[#4ad3e5]"
                        >
                          {session.participants?.length || 0}/
                          {session.maxParticipants} participantes
                        </Badge>
                      </div>
                      <p className="text-[var(--color-light)]/60 text-sm mb-3 line-clamp-2">
                        {session.description}
                      </p>
                      <div className="flex items-center gap-4 text-sm text-[var(--color-light)]/60">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4 text-[#4ad3e5]" />
                          <span>{formatDate(session.date)}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4 text-[#4ad3e5]" />
                          <span>{formatTime(session.date)}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Users className="w-4 h-4 text-[#4ad3e5]" />
                          <span>{session.duration} min</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Stack & Level */}
            <Card>
              <div className="space-y-4">
                <div>
                  <h3 className="text-[#4ad3e5] font-bold mb-2">Nivel:</h3>
                  <Badge
                    variant="solid"
                    className="bg-transparent text-[var(--color-light)] border border-[#4ad3e5]"
                  >
                    {project.level}
                  </Badge>
                </div>
                <div>
                  <h3 className="text-[#4ad3e5] font-bold mb-2">Stack:</h3>
                  <Badge
                    variant="solid"
                    className="bg-transparent text-[var(--color-light)] border border-[#4ad3e5]"
                  >
                    {project.stack}
                  </Badge>
                </div>
              </div>
            </Card>

            {/* Created Date */}
            <Card>
                  <h3 className="text-[#4ad3e5] font-bold mb-2">Creado el:</h3>
              <p className="text-[var(--color-light)]/70">{formatDate(project.createdAt)}</p>
            </Card>

            {/* Interest Indicator for Owner */}
            {isOwner && project.interested && project.interested.length > 0 && (
              <Card className="border-2 border-[#ff5da2]">
                <div className="flex items-center gap-3 mb-2">
                  <Heart className="w-5 h-5 text-[#ff5da2] fill-[#ff5da2]" />
                  <h3 className="text-[#ff5da2] font-bold">
                    {project.interested.length} {project.interested.length === 1 ? 'persona interesada' : 'personas interesadas'}
                  </h3>
                </div>
                <p className="text-white/70 text-sm mb-3">
                  Hay desarrolladores/as interesados/as en tu proyecto. ¡Crea una sesión para activarlo!
                </p>
                <Button
                  variant="primary"
                  className="w-full"
                  onClick={() =>
                    navigate(`/proyectos/${project.id}/nueva-sesion`)
                  }
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Crear sesión
                </Button>
              </Card>
            )}

            {/* Quick Actions */}
            {isOwner && (
              <Card>
                <h3 className="text-[#4ad3e5] font-bold mb-4">
                  Acciones rápidas
                </h3>
                <div className="space-y-2">
                  <Button
                    variant="primary"
                    className="w-full"
                    onClick={() =>
                      navigate(`/proyectos/${project.id}/nueva-sesion`)
                    }
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Nueva sesión
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => navigate(`/proyectos/${project.id}/editar`)}
                  >
                    <Edit2 className="w-4 h-4 mr-2" />
                    Editar proyecto
                  </Button>
                </div>
              </Card>
            )}

            {/* Interest Button for Non-Owners */}
            {!isOwner && isAuthenticated && (
              <Card>
                <h3 className="text-[#4ad3e5] font-bold mb-4">
                  ¿Te interesa este proyecto?
                </h3>
                <p className="text-[var(--color-light)]/70 text-sm mb-4">
                  Muestra tu interés y el owner podrá crear una sesión para activarlo.
                </p>
                <Button
                  variant={isInterested ? "outline" : "primary"}
                  className="w-full"
                  onClick={handleToggleInterest}
                >
                  <Heart className={`w-4 h-4 mr-2 ${isInterested ? 'fill-[#ff5da2] text-[#ff5da2]' : ''}`} />
                  {isInterested ? 'Ya no me interesa' : 'Me interesa este proyecto'}
                </Button>
                {project.interested && project.interested.length > 0 && (
                  <p className="text-[var(--color-light)]/60 text-xs mt-3 text-center">
                    {project.interested.length} {project.interested.length === 1 ? 'persona interesada' : 'personas interesadas'}
                  </p>
                )}
              </Card>
            )}
          </div>
        </div>
      </SectionWrapper>

      {/* Delete Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Eliminar proyecto"
      >
        <div className="space-y-4">
          <p className="text-[var(--color-light)]/80">
            ¿Estás seguro de que quieres eliminar este proyecto? Se eliminarán
            también todas las sesiones asociadas.
          </p>
          <div className="flex gap-3">
            <Button
              variant="ghost"
              onClick={() => setShowDeleteModal(false)}
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
