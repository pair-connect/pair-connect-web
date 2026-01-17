import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Check, X, Plus, Trash2 } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/contexts/AuthContext";
import { api } from "@/utils/api";
import { SectionWrapper } from "@/components/layout/SectionWrapper";

const STACKS = ["Frontend", "Backend", "Fullstack"];
const LEVELS = ["Junior", "Mid", "Senior"];
const COMMON_LANGUAGES = [
  "JavaScript",
  "TypeScript",
  "Python",
  "React",
  "Vue",
  "Angular",
  "Node.js",
  "Express",
  "Django",
  "FastAPI",
  "Java",
  "Spring Boot",
  "Go",
  "Rust",
  "C#",
  ".NET",
  "PHP",
  "Laravel",
  "Ruby",
  "Rails",
  "PostgreSQL",
  "MongoDB",
  "MySQL",
  "Redis",
  "Docker",
  "Kubernetes",
];

export const CreateProject: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { user, isAuthenticated } = useAuth();

  const isEditMode = !!id;

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    image: "",
    stack: "Fullstack",
    level: "Junior",
    languages: [] as string[],
  });
  const [newLanguage, setNewLanguage] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [touched, setTouched] = useState(false);

  useEffect(() => {
    if (!isAuthenticated || !user) {
      navigate("/?register=true");
      return;
    }

    // Si estamos en modo edición, cargar los datos del proyecto
    if (isEditMode && id) {
      const loadProject = async () => {
        try {
          setLoading(true);
          const project = await api.projects.getProject(id);

          // Verificar que el usuario es el dueño
          if (project.ownerId !== user.id) {
            navigate("/mis-proyectos");
            return;
          }

          const formDataToSet = {
            title: project.title || "",
            description: project.description || "",
            image: project.image || "",
            stack: project.stack || "Fullstack",
            level: project.level || "Junior",
            languages: project.languages || [],
          };

          console.log("Loading project data:", formDataToSet);
          setFormData(formDataToSet);
        } catch (err) {
          console.error("Error loading project:", err);
          navigate("/mis-proyectos");
        } finally {
          setLoading(false);
        }
      };

      loadProject();
    } else {
      setLoading(false);
    }
  }, [isAuthenticated, user, navigate, isEditMode, id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setTouched(true);

    if (!formData.title.trim()) {
      setError("El título es requerido");
      return;
    }

    try {
      setSaving(true);

      if (isEditMode && id) {
        // Modo edición
        await api.projects.updateProject(id, formData);
        navigate(`/proyectos/${id}`);
      } else {
        // Modo creación
        const project = await api.projects.createProject(formData);
        navigate(`/proyectos/${project.id}`);
      }
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : isEditMode
          ? "Error al actualizar el proyecto"
          : "Error al crear el proyecto";
      setError(errorMessage);
    } finally {
      setSaving(false);
    }
  };

  const addLanguage = (lang: string) => {
    const trimmed = lang.trim();
    if (trimmed && !formData.languages.includes(trimmed)) {
      setFormData({ ...formData, languages: [...formData.languages, trimmed] });
    }
    setNewLanguage("");
  };

  const removeLanguage = (lang: string) => {
    setFormData({
      ...formData,
      languages: formData.languages.filter((l) => l !== lang),
    });
  };

  if (!isAuthenticated || !user) {
    return null;
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-white/60">Cargando proyecto...</p>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen relative"
      style={{ color: "#ffffff" }}
    >

      <SectionWrapper className="relative z-10" style={{ color: "#ffffff" }}>
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => {
              if (isEditMode && id) {
                navigate(`/proyectos/${id}`);
              } else {
                navigate("/mis-proyectos");
              }
            }}
            className="cursor-pointer p-2 text-white/60 hover:text-[#4ad3e5] transition-colors"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="text-3xl md:text-5xl font-bold">
            <span className="text-[var(--color-light)]">
              {isEditMode ? "Editar " : "Nuevo "}
            </span>
            <span className="gradient-text">Proyecto</span>
          </h1>
        </div>

        <form onSubmit={handleSubmit}>
          {/* TÍTULO - Campo destacado al inicio */}
          <Card className="mb-6 border-2 border-[#4ad3e5]">
            <div>
              <label
                className="block text-base font-bold text-white mb-3"
                style={{ color: "#ffffff", fontSize: "16px" }}
              >
                Título del proyecto <span style={{ color: "#ff5da2" }}>*</span>
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                placeholder="Ej: Intercambio de libros, Clone de Google, App de tareas..."
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

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Form */}
            <div className="lg:col-span-2 space-y-6">
              {/* Basic Info */}
              <Card>
                <h2 className="text-xl font-bold text-[#4ad3e5] mb-6">
                  Información del proyecto
                </h2>

                <div className="space-y-4">
                  {/* Description */}
                  <div>
                    <label
                      className="block text-sm font-medium text-white mb-2"
                      style={{ color: "#ffffff" }}
                    >
                      Descripción
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          description: e.target.value,
                        })
                      }
                      placeholder="Describe tu proyecto..."
                      rows={4}
                      className="w-full px-4 py-3 bg-[#13161D] border border-[#4ad3e5]/30 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-[#4ad3e5] transition-colors resize-none"
                      style={{ color: "#ffffff" }}
                    />
                  </div>

                  {/* Image URL */}
                  <div>
                    <label
                      className="block text-sm font-medium text-white mb-2"
                      style={{ color: "#ffffff" }}
                    >
                      URL de imagen (opcional)
                    </label>
                    <input
                      type="url"
                      value={formData.image}
                      onChange={(e) =>
                        setFormData({ ...formData, image: e.target.value })
                      }
                      placeholder="https://ejemplo.com/imagen.jpg"
                      className="w-full px-4 py-3 bg-[#13161D] border border-[#4ad3e5]/30 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-[#4ad3e5] transition-colors"
                      style={{ color: "#ffffff" }}
                    />
                  </div>

                  {/* Preview Image */}
                  {formData.image && (
                    <div className="mt-4">
                      <p className="text-sm text-white/60 mb-2">
                        Vista previa:
                      </p>
                      <img
                        src={formData.image}
                        alt="Preview"
                        className="w-full max-w-xs h-40 object-cover rounded-lg border border-[#4ad3e5]"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = "none";
                        }}
                      />
                    </div>
                  )}
                </div>
              </Card>

              {/* Languages */}
              <Card>
                <h2 className="text-xl font-bold text-[#4ad3e5] mb-6">
                  Lenguajes y Frameworks
                </h2>

                {/* Selected Languages */}
                {formData.languages.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-4">
                    {formData.languages.map((lang) => (
                      <Badge
                        key={lang}
                        variant="gradient"
                        className="flex items-center gap-2 pr-1"
                      >
                        {lang}
                        <button
                          type="button"
                          onClick={() => removeLanguage(lang)}
                          className="cursor-pointer p-1 hover:bg-white/20 rounded transition-colors"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}

                {/* Add Custom Language */}
                <div className="flex gap-2 mb-4">
                  <input
                    type="text"
                    value={newLanguage}
                    onChange={(e) => setNewLanguage(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        addLanguage(newLanguage);
                      }
                    }}
                    placeholder="Añadir lenguaje..."
                    className="flex-1 px-4 py-2 bg-[#13161D] border border-[#4ad3e5]/30 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-[#4ad3e5] transition-colors"
                    style={{ color: "#ffffff" }}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => addLanguage(newLanguage)}
                    disabled={!newLanguage.trim()}
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>

                {/* Common Languages */}
                <p className="text-sm text-white/60 mb-2">Lenguajes comunes:</p>
                <div className="flex flex-wrap gap-2">
                  {COMMON_LANGUAGES.filter(
                    (l) => !formData.languages.includes(l)
                  )
                    .slice(0, 12)
                    .map((lang) => (
                      <button
                        key={lang}
                        type="button"
                        onClick={() => addLanguage(lang)}
                        className="cursor-pointer px-3 py-1 bg-[#13161D] border border-[#4ad3e5]/30 rounded-full text-sm text-white/60 hover:border-[#4ad3e5] hover:text-[#4ad3e5] transition-colors"
                      >
                        + {lang}
                      </button>
                    ))}
                </div>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Stack */}
              <Card>
                <h2 className="text-xl font-bold text-[#4ad3e5] mb-4">Stack</h2>
                <div className="space-y-2">
                  {STACKS.map((stack) => (
                    <button
                      key={stack}
                      type="button"
                      onClick={() => setFormData({ ...formData, stack })}
                      className={`cursor-pointer w-full px-4 py-3 rounded-lg text-left transition-colors ${
                        formData.stack === stack
                          ? "bg-[#4ad3e5] text-[#13161D] font-bold"
                          : "bg-[#13161D] border border-[#4ad3e5]/30 text-white hover:border-[#4ad3e5]"
                      }`}
                    >
                      {stack}
                    </button>
                  ))}
                </div>
              </Card>

              {/* Level */}
              <Card>
                <h2 className="text-xl font-bold text-[#4ad3e5] mb-4">Nivel</h2>
                <div className="space-y-2">
                  {LEVELS.map((level) => (
                    <button
                      key={level}
                      type="button"
                      onClick={() => setFormData({ ...formData, level })}
                      className={`cursor-pointer w-full px-4 py-3 rounded-lg text-left transition-colors ${
                        formData.level === level
                          ? "bg-[#ff5da2] text-white font-bold"
                          : "bg-[#13161D] border border-[#4ad3e5]/30 text-white hover:border-[#ff5da2]"
                      }`}
                    >
                      {level}
                    </button>
                  ))}
                </div>
              </Card>

              {/* Actions */}
              <Card>
                {error && (
                  <div
                    className="mb-4 p-3 bg-red-500/20 border border-red-500 rounded-lg text-red-400 text-sm"
                    style={{ color: "#ff6b6b" }}
                  >
                    <strong style={{ color: "#ff6b6b" }}>⚠️ {error}</strong>
                  </div>
                )}

                <div className="flex gap-3">
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => {
                      if (isEditMode && id) {
                        navigate(`/proyectos/${id}`);
                      } else {
                        navigate("/mis-proyectos");
                      }
                    }}
                    className="flex-1"
                  >
                    <X className="w-4 h-4 mr-2" />
                    Cancelar
                  </Button>
                  <Button
                    type="submit"
                    variant="primary"
                    disabled={saving || loading}
                    className="flex-1"
                  >
                    <Check className="w-4 h-4 mr-2" />
                    {saving ? "Guardando..." : isEditMode ? "Guardar" : "Crear"}
                  </Button>
                </div>
              </Card>
            </div>
          </div>
        </form>
      </SectionWrapper>
    </div>
  );
};
