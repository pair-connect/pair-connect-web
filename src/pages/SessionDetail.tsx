import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  Calendar,
  Clock,
  Users,
  ArrowLeft,
  Link as LinkIcon,
  Edit2,
  Trash2,
} from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { useAuth } from "@/contexts/AuthContext";
import { api } from "@/utils/api";
import { Session, Project, User } from "@/types";
import { SectionWrapper } from "@/components/layout/SectionWrapper";

export const SessionDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();

  const [session, setSession] = useState<Session | null>(null);
  const [project, setProject] = useState<Project | null>(null);
  const [owner, setOwner] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [message, setMessage] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  // Require authentication to view session details
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/?login=true&redirect=/sesion/' + id);
      return;
    }
  }, [isAuthenticated, navigate, id]);

  useEffect(() => {
    if (!isAuthenticated || !id) return;
    const fetchData = async () => {
      if (!id) return;

      try {
        setLoading(true);
        const sessionData = await api.sessions.getSession(id);
        setSession(sessionData);

        const [projectData, ownerData] = await Promise.all([
          api.projects.getProject(sessionData.projectId),
          api.users.getUser(sessionData.ownerId),
        ]);

        setProject(projectData);
        setOwner(ownerData);
      } catch (error: unknown) {
        console.error("Error fetching session:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, isAuthenticated]);

  const formatDate = (date: Date | string) => {
    const d = typeof date === "string" ? new Date(date) : date;
    return new Intl.DateTimeFormat("es-ES", {
      weekday: "long",
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

  const formatDateShort = (date: Date | string) => {
    const d = typeof date === "string" ? new Date(date) : date;
    return new Intl.DateTimeFormat("es-ES", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }).format(d);
  };

  const handleJoinSession = async () => {
    if (!isAuthenticated) {
      navigate("/?register=true");
      return;
    }

    try {
      setActionLoading(true);
      await api.sessions.joinSession(id!);
      // Refresh session data
      const updatedSession = await api.sessions.getSession(id!);
      setSession(updatedSession);
      setShowJoinModal(false);
    } catch (error: unknown) {
      console.error("Error joining session:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Error al unirse a la sesión";
      alert(errorMessage);
    } finally {
      setActionLoading(false);
    }
  };

  const handleLeaveSession = async () => {
    try {
      setActionLoading(true);
      await api.sessions.leaveSession(id!);
      const updatedSession = await api.sessions.getSession(id!);
      setSession(updatedSession);
    } catch (error: unknown) {
      console.error("Error leaving session:", error);
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteSession = async () => {
    try {
      setActionLoading(true);
      await api.sessions.deleteSession(id!);
      navigate(`/proyectos/${project?.id}`);
    } catch (error: unknown) {
      console.error("Error deleting session:", error);
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-[var(--color-light)]/60">Cargando sesión...</p>
      </div>
    );
  }

  if (!session || !project) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card>
          <p className="text-[var(--color-light)]/60 mb-4">Sesión no encontrada</p>
          <Button onClick={() => navigate("/")}>Volver al inicio</Button>
        </Card>
      </div>
    );
  }

  const isOwner = user?.id === session.ownerId;
  const isParticipant = session.participants?.includes(user?.id || "");
  const isInterested = session.interested?.includes(user?.id || "");
  const isFull = (session.participants?.length || 0) >= session.maxParticipants;

  // Calculate end time
  const startTime = new Date(session.date);
  const endTime = new Date(startTime.getTime() + session.duration * 60000);

  return (
    <div className="min-h-screen relative">

      <SectionWrapper className="relative z-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate(-1)}
              className="cursor-pointer p-2 text-[var(--color-light)]/60 hover:text-[#4ad3e5] transition-colors"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>
            {isOwner && (
              <button
                onClick={() => navigate(`/sesion/${id}/editar`)}
                className="cursor-pointer p-2 text-[var(--color-light)]/60 hover:text-[#4ad3e5] transition-colors"
              >
                <Edit2 className="w-5 h-5" />
              </button>
            )}
          </div>

          {/* Date & Time Header */}
          <div className="text-white/60 font-mono">
            {formatDateShort(session.date)} {formatTime(session.date)} -{" "}
            {formatTime(endTime)} [{Math.floor(session.duration / 60)}h]
          </div>
        </div>

        <h1 className="text-3xl md:text-5xl font-bold mb-8">
          <span className="text-[var(--color-light)]">Detalles de la </span>
          <span className="gradient-text">sesión</span>
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column */}
          <div className="space-y-6">
            {/* Project Info */}
            <Card>
              <h2 className="text-xl font-bold text-[#4ad3e5] mb-4">
                Sobre el proyecto:
              </h2>
              <div className="flex gap-4">
                {project.image && (
                  <img
                    src={project.image}
                    alt={project.title}
                    className="w-24 h-24 object-cover rounded-lg border border-[#4ad3e5]"
                  />
                )}
                <div className="flex-1">
                  <h3 className="font-bold text-[var(--color-light)] mb-2">{project.title}</h3>
                  <p className="text-[var(--color-light)]/70 text-sm">
                    {project.description || "Sin descripción"}
                  </p>
                </div>
              </div>
            </Card>

            {/* Session Description */}
            <Card>
              <h2 className="text-xl font-bold text-[#4ad3e5] mb-4">
                Descripción de la sesión:
              </h2>
              <p className="text-[var(--color-light)]/80">
                {session.description || "Sin descripción"}
              </p>
            </Card>

            {/* Session Link - Only visible to owner or accepted participants */}
            {session.link ? (
              <Card>
                <h2 className="text-xl font-bold text-[#4ad3e5] mb-4">
                  Enlace sesión:
                </h2>
                <a
                  href={session.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-white/80 hover:text-[#4ad3e5] transition-colors flex items-center gap-2"
                >
                  <LinkIcon className="w-4 h-4" />
                  {session.link}
                </a>
              </Card>
            ) : !isOwner && !isParticipant && (
              <Card>
                <h2 className="text-xl font-bold text-[#4ad3e5] mb-4">
                  Enlace sesión:
                </h2>
                <p className="text-[var(--color-light)]/60 text-sm">
                  🔒 El enlace de la sesión es privado. Solo los/as participantes aceptados/as pueden verlo.
                  {!isAuthenticated && (
                    <span> <Link to="/?login=true" className="text-[#4ad3e5] hover:underline">Inicia sesión</Link> y muestra interés en el proyecto para solicitar acceso.</span>
                  )}
                  {isAuthenticated && !isParticipant && (
                    <span> Muestra interés en el proyecto para solicitar acceso a esta sesión.</span>
                  )}
                </p>
              </Card>
            )}

            {/* Other Details */}
            <Card>
              <h2 className="text-xl font-bold text-[#4ad3e5] mb-4">
                Otros detalles:
              </h2>
              <div className="space-y-2 text-white/80">
                <p>Límite de participantes/as: {session.maxParticipants}</p>
                <p>Sesión privada</p>
              </div>
            </Card>

            {/* Participants */}
            <Card>
              <h2 className="text-xl font-bold text-[#4ad3e5] mb-4">
                Participantes confirmados/as
              </h2>
              {session.participants && session.participants.length > 0 ? (
                <div className="flex -space-x-2">
                  {session.participants.map((participantId, i) => (
                    <div
                      key={participantId}
                      className="w-10 h-10 rounded-full bg-gradient-to-r from-[#4ad3e5] to-[#ff5da2] flex items-center justify-center text-[var(--color-light)] font-bold text-sm border-2 border-[var(--color-dark-card)]"
                    >
                      {i + 1}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-white/60 text-sm">
                  No hay participantes confirmados
                </p>
              )}
            </Card>

            {/* Interested */}
            <Card>
              <h2 className="text-xl font-bold text-[#4ad3e5] mb-4">
                Coders interesados
              </h2>
              {session.interested && session.interested.length > 0 ? (
                <div className="flex -space-x-2">
                  {session.interested.map((userId, i) => (
                    <div
                      key={userId}
                      className="w-10 h-10 rounded-full bg-gradient-to-r from-[#ff5da2] to-[#4ad3e5] flex items-center justify-center text-[var(--color-light)] font-bold text-sm border-2 border-[var(--color-dark-card)]"
                    >
                      {i + 1}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-[var(--color-light)]/60 text-sm">
                  Parece que no se ha apuntado nadie aún
                </p>
              )}
            </Card>

            {/* Recommended Coders */}
            <Card>
              <h2 className="text-xl font-bold text-[#4ad3e5] mb-4">
                Coders recomendados
              </h2>
              <p className="text-[var(--color-light)]/60 text-sm mb-4">
                  Te podría interesar estos/as otros/as coders para tu proyecto
              </p>
              <div className="flex -space-x-2">
                {["Superman", "Ironman", "Catwoman2", "Arya"].map((name) => (
                  <div
                    key={name}
                    className="w-10 h-10 rounded-full bg-gradient-to-r from-[#4ad3e5] to-[#ff5da2] flex items-center justify-center text-[var(--color-light)] font-bold text-sm border-2 border-[var(--color-dark-card)]"
                    title={name}
                  >
                    {name[0]}
                  </div>
                ))}
              </div>
            </Card>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Languages */}
            <Card>
              <h2 className="text-xl font-bold text-white mb-4">Lenguajes</h2>
              <div className="flex flex-wrap gap-2">
                {project.languages.length > 0 ? (
                  project.languages.map((lang, i) => (
                    <Badge
                      key={lang}
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

            {/* Level & Stack */}
            <Card>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="text-[#4ad3e5] font-bold mb-2">Nivel:</h3>
                  <p className="text-[var(--color-light)]">{project.level}</p>
                </div>
                <div>
                  <h3 className="text-[#4ad3e5] font-bold mb-2">Stack:</h3>
                  <p className="text-[var(--color-light)]">{project.stack}</p>
                </div>
              </div>
            </Card>

            {/* Action Buttons */}
            {!isOwner && isAuthenticated && (
              <Card>
                {isParticipant ? (
                  <div className="space-y-3">
                    <Badge
                      variant="gradient"
                      className="w-full justify-center py-2"
                    >
                      ✓ Estás apuntado
                    </Badge>
                    <Button
                      variant="ghost"
                      className="w-full text-[#ff5da2]"
                      onClick={handleLeaveSession}
                      disabled={actionLoading}
                    >
                      Salir de la sesión
                    </Button>
                  </div>
                ) : isFull ? (
                  <Button
                    variant="outline"
                    className="w-full"
                    disabled
                  >
                    Sesión completa
                  </Button>
                ) : (
                  <Button
                    variant="primary"
                    className="w-full"
                    onClick={() => setShowJoinModal(true)}
                    disabled={actionLoading}
                  >
                    Apuntarse a la sesión
                  </Button>
                )}
              </Card>
            )}

            {!isAuthenticated && (
              <Card>
                <Button
                  variant="primary"
                  className="w-full"
                  onClick={() => navigate("/?register=true")}
                >
                  Inicia sesión para apuntarte
                </Button>
              </Card>
            )}

            {isOwner && (
              <Card>
                <h3 className="text-[#4ad3e5] font-bold mb-4">
                  Acciones del/la organizador/a
                </h3>
                <div className="space-y-2">
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => navigate(`/sesion/${id}/editar`)}
                  >
                    <Edit2 className="w-4 h-4 mr-2" />
                    Editar sesión
                  </Button>
                  <Button
                    variant="ghost"
                    className="w-full text-[#ff5da2] hover:bg-[#ff5da2]/20"
                    onClick={() => setShowDeleteModal(true)}
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Eliminar sesión
                  </Button>
                </div>
              </Card>
            )}
          </div>
        </div>
      </SectionWrapper>

      {/* Join Modal */}
      <Modal
        isOpen={showJoinModal}
        onClose={() => setShowJoinModal(false)}
        title="Apuntarse a la sesión"
      >
        <div className="space-y-4">
          <p className="text-[var(--color-light)]/80">
            ¿Deseas apuntarte a esta sesión de pair programming o programación en grupo?
          </p>

          <div>
            <label className="block text-sm font-medium text-[var(--color-light)] mb-2">
              Mensaje opcional para el/la organizador/a
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Escribe tu mensaje si quieres"
              className="w-full px-4 py-3 bg-[var(--color-dark-card)] border border-[#4ad3e5]/30 rounded-lg text-[var(--color-light)] placeholder-[var(--color-gray-blue)] focus:outline-none focus:border-[#4ad3e5] resize-none"
              rows={4}
            />
          </div>

          <div className="flex gap-3">
            <Button
              variant="ghost"
              onClick={() => setShowJoinModal(false)}
              className="flex-1"
            >
              Cancelar
            </Button>
            <Button
              variant="primary"
              onClick={handleJoinSession}
              disabled={actionLoading}
              className="flex-1"
            >
              {actionLoading ? "Cargando..." : "Confirmar"}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Delete Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Eliminar sesión"
      >
        <div className="space-y-4">
          <p className="text-[var(--color-light)]/80">
            ¿Estás seguro de que quieres eliminar esta sesión?
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
              onClick={handleDeleteSession}
              disabled={actionLoading}
              className="flex-1 bg-[#ff5da2] hover:bg-[#ff5da2]/80"
            >
              {actionLoading ? "Eliminando..." : "Eliminar"}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
