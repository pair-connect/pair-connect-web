import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Check, X, Plus } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/contexts/AuthContext";
import { api } from "@/utils/api";
import { Project } from "@/types";
import { SectionWrapper } from "@/components/layout/SectionWrapper";

export const CreateSession: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();

  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [touched, setTouched] = useState(false);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    date: "",
    time: "08:00",
    duration: 60,
    maxParticipants: 2,
    link: "",
    isPrivate: false,
  });

  useEffect(() => {
    if (!isAuthenticated || !user) {
      navigate("/?register=true");
      return;
    }

    const fetchProject = async () => {
      if (!projectId) return;

      try {
        setLoading(true);
        const data = await api.projects.getProject(projectId);

        if (data.ownerId !== user.id) {
          navigate("/mis-proyectos");
          return;
        }

        setProject(data);
      } catch (err: unknown) {
        console.error("Error fetching project:", err);
        navigate("/mis-proyectos");
      } finally {
        setLoading(false);
      }
    };

    fetchProject();
  }, [projectId, isAuthenticated, user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setTouched(true);

    if (!isAuthenticated || !user) {
      setError("Debes estar autenticado para crear una sesión");
      navigate("/?register=true");
      return;
    }

    // Verificar que hay token
    const token = localStorage.getItem("accessToken");
    console.log("Token exists:", !!token, "Token length:", token?.length);
    if (!token) {
      setError("Tu sesión ha expirado. Por favor, inicia sesión nuevamente.");
      setTimeout(() => {
        navigate("/?register=true");
      }, 2000);
      return;
    }

    if (!formData.title.trim()) {
      setError("El título es requerido");
      return;
    }

    if (!formData.date) {
      setError("La fecha es requerida");
      return;
    }

    try {
      setSaving(true);

      // Combine date and time
      const dateTime = new Date(`${formData.date}T${formData.time}`);

      const session = await api.sessions.createSession({
        projectId: projectId!,
        title: formData.title,
        description: formData.description,
        date: dateTime.toISOString(),
        duration: formData.duration,
        maxParticipants: formData.maxParticipants,
        link: formData.link || undefined,
      });

      navigate(`/sesion/${session.id}`);
    } catch (err: unknown) {
      console.error("Error creating session:", err);
      const errorMessage =
        err instanceof Error ? err.message : "Error al crear la sesión";
      setError(errorMessage);

      // Si es error de autenticación, redirigir al login
      if (
        errorMessage.includes("autenticado") ||
        errorMessage.includes("sesión ha expirado")
      ) {
        setTimeout(() => {
          navigate("/?register=true");
        }, 2000);
      }
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-white/60">Cargando...</p>
      </div>
    );
  }

  if (!project || !isAuthenticated || !user) {
    return null;
  }

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
              onClick={() => navigate(`/proyectos/${projectId}`)}
              className="cursor-pointer p-2 text-white/60 hover:text-[#4ad3e5] transition-colors"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>
            <h1 className="text-3xl md:text-5xl font-bold">
              <span className="text-white">Detalles de la </span>
              <span className="gradient-text">sesión</span>
            </h1>
          </div>

          <div className="flex gap-2">
            <button
              onClick={handleSubmit}
              disabled={saving}
              className="cursor-pointer p-2 text-[#4ad3e5] hover:text-[#4ad3e5]/80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Check className="w-6 h-6" />
            </button>
            <button
              onClick={() => navigate(`/proyectos/${projectId}`)}
              className="cursor-pointer p-2 text-white/60 hover:text-[#ff5da2] transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Column - Project Info */}
            <div className="space-y-6">
              {/* Project Card */}
              <Card>
                <h2
                  className="text-xl font-bold text-[#4ad3e5] mb-4"
                  style={{ color: "#4ad3e5" }}
                >
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
                    <h3
                      className="font-bold text-white mb-2"
                      style={{ color: "#ffffff" }}
                    >
                      {project.title}
                    </h3>
                    <p
                      className="text-white/70 text-sm"
                      style={{ color: "rgba(255, 255, 255, 0.7)" }}
                    >
                      {project.description || "Sin descripción"}
                    </p>
                  </div>
                </div>
              </Card>

              {/* Participants Placeholder */}
              <Card>
                <h2
                  className="text-xl font-bold text-[#4ad3e5] mb-4"
                  style={{ color: "#4ad3e5" }}
                >
                  Participantes confirmados/as
                </h2>
                <p
                  className="text-white/60 text-sm"
                  style={{ color: "rgba(255, 255, 255, 0.6)" }}
                >
                  No hay participantes confirmados/as
                </p>
              </Card>

              {/* Interested Placeholder */}
              <Card>
                <h2
                  className="text-xl font-bold text-[#4ad3e5] mb-4"
                  style={{ color: "#4ad3e5" }}
                >
                  Coders interesados
                </h2>
                <p
                  className="text-white/60 text-sm"
                  style={{ color: "rgba(255, 255, 255, 0.6)" }}
                >
                  Parece que no se ha apuntado nadie aún
                </p>
              </Card>

              {/* Recommended Coders */}
              <Card>
                <h2
                  className="text-xl font-bold text-[#4ad3e5] mb-4"
                  style={{ color: "#4ad3e5" }}
                >
                  Coders recomendados
                </h2>
                <p
                  className="text-white/60 text-sm mb-4"
                  style={{ color: "rgba(255, 255, 255, 0.6)" }}
                >
                  Te podría interesar estos/as otros/as coders para tu proyecto
                </p>
                <div className="flex -space-x-2">
                  {["Superman", "Ironman", "Catwoman2", "Arya"].map(
                    (name, i) => (
                      <div
                        key={name}
                        className="w-10 h-10 rounded-full bg-gradient-to-r from-[#4ad3e5] to-[#ff5da2] flex items-center justify-center text-white font-bold text-sm border-2 border-[#13161D]"
                        title={name}
                      >
                        {name[0]}
                      </div>
                    )
                  )}
                </div>
              </Card>
            </div>

            {/* Right Column - Form */}
            <div className="space-y-6">
              {/* Título de la sesión - Campo destacado */}
              <Card className="border-2 border-[#4ad3e5]">
                <div>
                  <label
                    className="block text-base font-bold text-white mb-3"
                    style={{ color: "#ffffff", fontSize: "16px" }}
                  >
                    Título de la sesión{" "}
                    <span style={{ color: "#ff5da2" }}>*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) =>
                      setFormData({ ...formData, title: e.target.value })
                    }
                    placeholder="Ej: Crear CRUD de users y libros, Implementar autenticación..."
                    className={`w-full px-4 py-4 bg-[#13161D] border-2 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-[#4ad3e5] transition-colors text-lg ${
                      touched && !formData.title.trim()
                        ? "border-[#ff5da2]"
                        : "border-[#4ad3e5]"
                    }`}
                    style={{
                      color: "#ffffff",
                      backgroundColor: "#13161D",
                      fontSize: "16px",
                    }}
                    required
                    autoFocus
                  />
                  {touched && !formData.title.trim() && (
                    <p
                      className="mt-2 text-sm font-medium"
                      style={{ color: "#ff5da2" }}
                    >
                      ⚠️ Este campo es obligatorio
                    </p>
                  )}
                </div>
              </Card>

              {/* Date & Time */}
              <Card>
                <div className="space-y-4">
                  {/* Date */}
                  <div>
                    <label
                      className="block text-sm font-medium text-white mb-2"
                      style={{ color: "#ffffff" }}
                    >
                      Fecha
                    </label>
                    <input
                      type="date"
                      value={formData.date}
                      onChange={(e) =>
                        setFormData({ ...formData, date: e.target.value })
                      }
                      className="w-full px-4 py-3 bg-[#13161D] border border-[#4ad3e5]/30 rounded-lg text-white focus:outline-none focus:border-[#4ad3e5] transition-colors"
                      style={{ color: "#ffffff", backgroundColor: "#13161D" }}
                    />
                  </div>

                  {/* Time & Duration */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label
                        className="block text-sm font-medium text-white mb-2"
                        style={{ color: "#ffffff" }}
                      >
                        Hora
                      </label>
                      <input
                        type="time"
                        value={formData.time}
                        onChange={(e) =>
                          setFormData({ ...formData, time: e.target.value })
                        }
                        className="w-full px-4 py-3 bg-[#13161D] border border-[#4ad3e5]/30 rounded-lg text-white focus:outline-none focus:border-[#4ad3e5] transition-colors"
                        style={{ color: "#ffffff", backgroundColor: "#13161D" }}
                      />
                    </div>
                    <div>
                      <label
                        className="block text-sm font-medium text-white mb-2"
                        style={{ color: "#ffffff" }}
                      >
                        Duración
                      </label>
                      <select
                        value={formData.duration}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            duration: parseInt(e.target.value),
                          })
                        }
                        className="w-full px-4 py-3 bg-[#13161D] border border-[#4ad3e5]/30 rounded-lg text-white focus:outline-none focus:border-[#4ad3e5] transition-colors"
                        style={{ color: "#ffffff", backgroundColor: "#13161D" }}
                      >
                        <option value={30}>30 min</option>
                        <option value={60}>01:00</option>
                        <option value={90}>01:30</option>
                        <option value={120}>02:00</option>
                        <option value={180}>03:00</option>
                      </select>
                    </div>
                  </div>

                  {/* Description */}
                  <div>
                    <label
                      className="block text-sm font-medium text-white mb-2"
                      style={{ color: "#ffffff" }}
                    >
                      Descripción de la sesión
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          description: e.target.value,
                        })
                      }
                      placeholder="modelos y endpoints"
                      rows={3}
                      className="w-full px-4 py-3 bg-[#13161D] border border-[#4ad3e5]/30 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-[#4ad3e5] transition-colors resize-none"
                      style={{ color: "#ffffff", backgroundColor: "#13161D" }}
                    />
                  </div>

                  {/* Max Participants & Private */}
                  <div className="grid grid-cols-2 gap-4 items-end">
                    <div>
                      <label
                        className="block text-sm font-medium text-white mb-2"
                        style={{ color: "#ffffff" }}
                      >
                        Límite de participantes
                      </label>
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          min={1}
                          max={10}
                          value={formData.maxParticipants}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              maxParticipants: parseInt(e.target.value) || 2,
                            })
                          }
                          className="w-20 px-4 py-3 bg-[#13161D] border border-[#4ad3e5]/30 rounded-lg text-white focus:outline-none focus:border-[#4ad3e5] transition-colors text-center"
                          style={{
                            color: "#ffffff",
                            backgroundColor: "#13161D",
                          }}
                        />
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="isPrivate"
                        checked={formData.isPrivate}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            isPrivate: e.target.checked,
                          })
                        }
                        className="w-5 h-5 rounded border-[#4ad3e5]/30 bg-[#13161D] text-[#4ad3e5] focus:ring-[#4ad3e5]"
                      />
                      <label
                        htmlFor="isPrivate"
                        className="text-white text-sm"
                        style={{ color: "#ffffff" }}
                      >
                        Sesión privada
                      </label>
                    </div>
                  </div>

                  {/* Link */}
                  <div>
                    <label
                      className="block text-sm font-medium text-white mb-2"
                      style={{ color: "#ffffff" }}
                    >
                      Enlace a la sesión
                    </label>
                    <input
                      type="url"
                      value={formData.link}
                      onChange={(e) =>
                        setFormData({ ...formData, link: e.target.value })
                      }
                      placeholder="http://www.zoomlink.com"
                      className="w-full px-4 py-3 bg-[#13161D] border border-[#4ad3e5]/30 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-[#4ad3e5] transition-colors"
                      style={{ color: "#ffffff", backgroundColor: "#13161D" }}
                    />
                  </div>
                </div>
              </Card>

              {/* Languages */}
              <Card>
                <h2
                  className="text-xl font-bold text-white mb-4"
                  style={{ color: "#ffffff" }}
                >
                  Lenguajes y frameworks
                </h2>
                <p
                  className="text-white/60 text-sm mb-4"
                  style={{ color: "rgba(255, 255, 255, 0.6)" }}
                >
                  Lenguaje de esta sesión
                </p>
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
                    <p className="text-white/40">
                      No hay lenguajes en el proyecto
                    </p>
                  )}
                </div>
              </Card>

              {/* Stack & Level */}
              <Card>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label
                      className="block text-sm font-medium text-white mb-2"
                      style={{ color: "#ffffff" }}
                    >
                      Stack
                    </label>
                    <div
                      className="px-4 py-3 bg-[#13161D] border border-[#4ad3e5]/30 rounded-lg"
                      style={{ color: "rgba(255, 255, 255, 0.6)" }}
                    >
                      {project.stack}
                    </div>
                  </div>
                  <div>
                    <label
                      className="block text-sm font-medium text-white mb-2"
                      style={{ color: "#ffffff" }}
                    >
                      Nivel
                    </label>
                    <div
                      className="px-4 py-3 bg-[#13161D] border border-[#4ad3e5]/30 rounded-lg"
                      style={{ color: "rgba(255, 255, 255, 0.6)" }}
                    >
                      {project.level}
                    </div>
                  </div>
                </div>
              </Card>

              {/* Error */}
              {error && (
                <Card className="border-2 border-red-500">
                  <div
                    className="p-3 bg-red-500/20 rounded-lg"
                    style={{ color: "#ff6b6b" }}
                  >
                    <strong style={{ color: "#ff6b6b", fontSize: "14px" }}>
                      ⚠️ {error}
                    </strong>
                  </div>
                </Card>
              )}

              {/* Actions */}
              <div className="flex gap-3">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => navigate(`/proyectos/${projectId}`)}
                  className="flex-1"
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  disabled={saving}
                  className="flex-1"
                >
                  {saving ? "Creando..." : "Crear sesión"}
                </Button>
              </div>
            </div>
          </div>
        </form>
      </SectionWrapper>
    </div>
  );
};
