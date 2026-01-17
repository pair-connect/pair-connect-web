import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  Edit2,
  Mail,
  Github,
  Linkedin,
  MessageCircle,
  Calendar,
  Briefcase,
  Code,
  Award,
  MapPin,
  ExternalLink,
  Plus,
  Upload,
  X,
  Lock,
  Unlock,
  Eye,
  EyeOff,
} from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { useAuth } from "@/contexts/AuthContext";
import { api } from "@/utils/api";
import { User, Session, Project } from "@/types";
import { SectionWrapper } from "@/components/layout/SectionWrapper";

export const Profile: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user: currentUser, isAuthenticated, updateProfile } = useAuth();
  const [profileUser, setProfileUser] = useState<User | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [showContactModal, setShowContactModal] = useState(false);
  const [contactMessage, setContactMessage] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState<Partial<User>>({});
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [showPrivacySettings, setShowPrivacySettings] = useState(false);

  const isOwnProfile = isAuthenticated && currentUser?.id === id;

  useEffect(() => {
    const fetchProfile = async () => {
      const userId = id || currentUser?.id;
      
      if (!userId) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const user = await api.users.getUser(userId);
        setProfileUser(user);
        setEditForm({
          ...user,
          privacySettings: user.privacySettings || {
            showEmail: false,
            showContacts: true,
            showProjects: true,
            showSessions: false,
            showBio: true,
            showLanguages: true,
            showStack: true,
            showLevel: true,
          },
          profilePublic: user.profilePublic !== false, // Default to true
        });

        // Fetch user projects
        const userProjects = await api.projects.getProjects({ ownerId: userId });
        setProjects(userProjects);

        // Fetch user sessions
        const userSessions = await api.sessions.getSessions({ ownerId: userId });
        setSessions(userSessions);
      } catch (error) {
        console.error("Error fetching profile:", error);
        if (isAuthenticated && currentUser && userId === currentUser.id) {
          setProfileUser(currentUser);
          setEditForm(currentUser);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [id, isAuthenticated, currentUser]);

  const handleSaveProfile = async () => {
    if (!currentUser || !isOwnProfile) return;

    try {
      await updateProfile(editForm);
      setProfileUser({ ...profileUser!, ...editForm });
      setIsEditing(false);
      setAvatarPreview(null);
    } catch (error) {
      console.error("Error updating profile:", error);
    }
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !currentUser || !isOwnProfile) return;

    // Validate file type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
    if (!validTypes.includes(file.type)) {
      alert('Tipo de archivo no válido. Solo se permiten JPEG, PNG, WebP y GIF.');
      return;
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      alert('El archivo es demasiado grande. El tamaño máximo es 5MB.');
      return;
    }

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setAvatarPreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    // Upload avatar
    try {
      setUploadingAvatar(true);
      const result = await api.users.uploadAvatar(currentUser.id, file);
      setProfileUser({ ...profileUser!, avatar: result.avatar });
      setEditForm({ ...editForm, avatar: result.avatar });
      // Update current user in context
      await updateProfile({ avatar: result.avatar });
    } catch (error: any) {
      console.error("Error uploading avatar:", error);
      alert(error.message || "Error al subir el avatar. Por favor, intenta de nuevo.");
      setAvatarPreview(null);
    } finally {
      setUploadingAvatar(false);
      // Reset input
      e.target.value = '';
    }
  };

  const handleRemoveAvatar = async () => {
    if (!currentUser || !isOwnProfile) return;

    try {
      await updateProfile({ avatar: null });
      setProfileUser({ ...profileUser!, avatar: undefined });
      setEditForm({ ...editForm, avatar: undefined });
      setAvatarPreview(null);
    } catch (error) {
      console.error("Error removing avatar:", error);
    }
  };

  const getStackColor = (stack: string) => {
    switch (stack) {
      case "Frontend":
        return "border-[#069a9a] text-[#069a9a]";
      case "Backend":
        return "border-[#ff5da2] text-[#ff5da2]";
      case "Fullstack":
        return "border-[#a16ee4] text-[#a16ee4]";
      default:
        return "border-[#4ad3e5] text-[#4ad3e5]";
    }
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case "Junior":
        return "bg-[#4ad3e5]/20 text-[#4ad3e5] border-[#4ad3e5]";
      case "Mid":
        return "bg-[#ff5da2]/20 text-[#ff5da2] border-[#ff5da2]";
      case "Senior":
        return "bg-[#a16ee4]/20 text-[#a16ee4] border-[#a16ee4]";
      default:
        return "bg-[#4ad3e5]/20 text-[#4ad3e5] border-[#4ad3e5]";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--color-dark-bg)]">
        <SectionWrapper>
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#4ad3e5]"></div>
          </div>
        </SectionWrapper>
      </div>
    );
  }

  if (!profileUser) {
    return (
      <div className="min-h-screen bg-[var(--color-dark-bg)]">
        <SectionWrapper>
          <div className="text-center py-20">
            <p className="text-[var(--color-light)] text-xl">Perfil no encontrado</p>
          </div>
        </SectionWrapper>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--color-dark-bg)]">
      {/* Hero Header */}
      <div className="bg-gradient-to-br from-[var(--color-dark-card)] via-[var(--color-dark-bg)] to-[var(--color-dark-card)] border-b border-[#4ad3e5]/20">
        <SectionWrapper>
          <div className="py-8 md:py-12">
            <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
              {/* Avatar */}
              <div className="relative group">
                {(avatarPreview || profileUser.avatar) ? (
                  <img
                    src={avatarPreview || profileUser.avatar}
                    alt={profileUser.name}
                    className="w-32 h-32 md:w-40 md:h-40 rounded-full object-cover border-4 border-[#4ad3e5]/50 shadow-lg shadow-[#4ad3e5]/20"
                  />
                ) : (
                  <div className="w-32 h-32 md:w-40 md:h-40 rounded-full bg-gradient-to-br from-[#4ad3e5] to-[#ff5da2] flex items-center justify-center border-4 border-[#4ad3e5]/50 shadow-lg shadow-[#4ad3e5]/20">
                    <span className="text-5xl md:text-6xl font-bold text-[#0b0c10]">
                      {profileUser.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
                
                {isOwnProfile && (
                  <>
                    {!isEditing ? (
                      <button
                        onClick={() => setIsEditing(true)}
                        className="absolute bottom-0 right-0 p-2 bg-[#4ad3e5] rounded-full shadow-lg hover:bg-[#65dde6] transition-colors"
                      >
                        <Edit2 className="w-4 h-4 text-[var(--color-dark-bg)]" />
                      </button>
                    ) : (
                      <div className="absolute bottom-0 right-0 flex gap-2">
                        <label className="p-2 bg-[#4ad3e5] rounded-full shadow-lg hover:bg-[#65dde6] transition-colors cursor-pointer">
                          <Upload className="w-4 h-4 text-[var(--color-dark-bg)]" />
                          <input
                            type="file"
                            accept="image/jpeg,image/jpg,image/png,image/webp,image/gif"
                            onChange={handleAvatarChange}
                            className="hidden"
                            disabled={uploadingAvatar}
                          />
                        </label>
                        {(profileUser.avatar || avatarPreview) && (
                          <button
                            onClick={handleRemoveAvatar}
                            className="p-2 bg-[#ff5da2] rounded-full shadow-lg hover:bg-[#ff6db0] transition-colors"
                            disabled={uploadingAvatar}
                          >
                            <X className="w-4 h-4 text-[var(--color-light)]" />
                          </button>
                        )}
                      </div>
                    )}
                    {uploadingAvatar && (
                      <div className="absolute inset-0 flex items-center justify-center bg-[#0b0c10]/80 rounded-full">
                        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#4ad3e5]"></div>
                      </div>
                    )}
                  </>
                )}
              </div>

              {/* User Info */}
              <div className="flex-1">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div>
                    <h1 className="text-3xl md:text-4xl font-bold text-[var(--color-light)] mb-2">
                      {profileUser.name}
                    </h1>
                    <p className="text-[var(--color-gray-blue)] text-lg mb-3">@{profileUser.username}</p>
                    <div className="flex flex-wrap items-center gap-3 mb-4">
                      <Badge
                        className={`${getStackColor(profileUser.stack)} border-2 bg-transparent px-4 py-1.5 font-semibold`}
                      >
                        {profileUser.stack} Developer
                      </Badge>
                      <Badge
                        className={`${getLevelColor(profileUser.level)} border px-3 py-1 font-medium`}
                      >
                        {profileUser.level}
                      </Badge>
                    </div>
                    {profileUser.privacySettings?.showBio !== false &&
                      profileUser.bio && (
                        <p className="text-[var(--color-light)]/80 text-base max-w-2xl leading-relaxed">
                          {profileUser.bio}
                        </p>
                      )}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-wrap gap-3">
                    {isOwnProfile ? (
                      <>
                        {isEditing ? (
                          <>
                            <Button
                              variant="outline"
                              onClick={() => {
                                setIsEditing(false);
                                setEditForm(profileUser);
                              }}
                            >
                              Cancelar
                            </Button>
                            <Button variant="primary" onClick={handleSaveProfile}>
                              Guardar cambios
                            </Button>
                          </>
                        ) : (
                          <Button
                            variant="primary"
                            onClick={() => setIsEditing(true)}
                            className="flex items-center gap-2"
                          >
                            <Edit2 className="w-4 h-4" />
                            Editar perfil
                          </Button>
                        )}
                      </>
                    ) : (
                      isAuthenticated && (
                        <Button
                          variant="primary"
                          onClick={() => setShowContactModal(true)}
                          className="flex items-center gap-2"
                        >
                          <MessageCircle className="w-4 h-4" />
                          Contactar
                        </Button>
                      )
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </SectionWrapper>
      </div>

      {/* Main Content */}
      <SectionWrapper>
        <div className="py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Sidebar - Quick Info */}
            <div className="lg:col-span-1 space-y-6">
              {/* Contact Info */}
              <Card className="p-6">
                <h3 className="text-lg font-bold text-[var(--color-light)] mb-4 flex items-center gap-2">
                  <Mail className="w-5 h-5 text-[#4ad3e5]" />
                  Contacto
                </h3>
                <div className="space-y-3">
                  {profileUser.contacts.email &&
                    (isOwnProfile ||
                      profileUser.privacySettings?.showEmail) && (
                      <a
                        href={`mailto:${profileUser.contacts.email}`}
                        className="flex items-center gap-3 text-[var(--color-light)]/80 hover:text-[#4ad3e5] transition-colors group"
                      >
                        <Mail className="w-4 h-4 text-[#4ad3e5] group-hover:scale-110 transition-transform" />
                        <span className="text-sm">
                          {profileUser.contacts.email}
                        </span>
                      </a>
                    )}
                  {profileUser.contacts.email &&
                    !isOwnProfile &&
                    !profileUser.privacySettings?.showEmail && (
                      <p className="text-[var(--color-light)]/40 text-sm italic">
                        Email privado
                      </p>
                    )}
                  {profileUser.privacySettings?.showContacts !== false && (
                    <>
                      {profileUser.contacts.github && (
                        <a
                          href={profileUser.contacts.github}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-3 text-[var(--color-light)]/80 hover:text-[#4ad3e5] transition-colors group"
                        >
                          <Github className="w-4 h-4 text-[#4ad3e5] group-hover:scale-110 transition-transform" />
                          <span className="text-sm flex items-center gap-1">
                            GitHub
                            <ExternalLink className="w-3 h-3" />
                          </span>
                        </a>
                      )}
                      {profileUser.contacts.linkedin && (
                        <a
                          href={profileUser.contacts.linkedin}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-3 text-[var(--color-light)]/80 hover:text-[#4ad3e5] transition-colors group"
                        >
                          <Linkedin className="w-4 h-4 text-[#4ad3e5] group-hover:scale-110 transition-transform" />
                          <span className="text-sm flex items-center gap-1">
                            LinkedIn
                            <ExternalLink className="w-3 h-3" />
                          </span>
                        </a>
                      )}
                      {profileUser.contacts.discord && (
                        <div className="flex items-center gap-3 text-[var(--color-light)]/80">
                          <MessageCircle className="w-4 h-4 text-[#4ad3e5]" />
                          <span className="text-sm">
                            {profileUser.contacts.discord}
                          </span>
                        </div>
                      )}
                    </>
                  )}
                  {profileUser.privacySettings?.showContacts === false &&
                    !isOwnProfile && (
                      <p className="text-[var(--color-light)]/40 text-sm italic">
                        Contactos privados
                      </p>
                    )}
                  {!profileUser.contacts.email &&
                    !profileUser.contacts.github &&
                    !profileUser.contacts.linkedin &&
                    !profileUser.contacts.discord && (
                      <p className="text-[var(--color-light)]/40 text-sm italic">
                        {isOwnProfile && !isEditing
                          ? "Agrega tus contactos en editar perfil"
                          : "Sin contactos disponibles"}
                      </p>
                    )}
                </div>
              </Card>

              {/* Skills */}
              <Card className="p-6">
                <h3 className="text-lg font-bold text-[var(--color-light)] mb-4 flex items-center gap-2">
                  <Code className="w-5 h-5 text-[#4ad3e5]" />
                  Tecnologías
                </h3>
                {isEditing && isOwnProfile ? (
                  <div className="space-y-3">
                    <textarea
                      value={editForm.languages?.join(", ") || ""}
                      onChange={(e) =>
                        setEditForm({
                          ...editForm,
                          languages: e.target.value
                            .split(",")
                            .map((l) => l.trim())
                            .filter(Boolean),
                        })
                      }
                      placeholder="JavaScript, React, TypeScript..."
                      className="w-full px-3 py-2 bg-[var(--color-dark-card)] border border-[#4ad3e5]/30 rounded-lg text-[var(--color-light)] text-sm focus:outline-none focus:ring-2 focus:ring-[#4ad3e5]"
                      rows={3}
                    />
                    <p className="text-xs text-[var(--color-light)]/50">
                      Separa las tecnologías con comas
                    </p>
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {profileUser.languages.length > 0 ? (
                      profileUser.languages.map((lang, index) => (
                        <Badge
                          key={index}
                          variant="gradient"
                          className="px-3 py-1 text-xs font-medium"
                        >
                          {lang}
                        </Badge>
                      ))
                    ) : (
                      <p className="text-[var(--color-light)]/40 text-sm italic">
                        {isOwnProfile ? "Agrega tus tecnologías" : "Sin tecnologías"}
                      </p>
                    )}
                  </div>
                )}
              </Card>

              {/* Stats */}
              <Card className="p-6">
                <h3 className="text-lg font-bold text-[var(--color-light)] mb-4 flex items-center gap-2">
                  <Award className="w-5 h-5 text-[#4ad3e5]" />
                  Estadísticas
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-[var(--color-light)]/60 text-sm">Proyectos</span>
                    <span className="text-[var(--color-light)] font-bold">{projects.length}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[var(--color-light)]/60 text-sm">Sesiones creadas</span>
                    <span className="text-[var(--color-light)] font-bold">
                      {sessions.filter((s) => s.ownerId === profileUser.id).length}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[var(--color-light)]/60 text-sm">Sesiones participadas</span>
                    <span className="text-[var(--color-light)] font-bold">
                      {sessions.filter(
                        (s) =>
                          s.participants.includes(profileUser.id) &&
                          s.ownerId !== profileUser.id
                      ).length}
                    </span>
                  </div>
                </div>
              </Card>

              {/* Privacy Settings - Solo para perfil propio */}
              {isOwnProfile && (
                <Card className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold text-[var(--color-light)] flex items-center gap-2">
                      <Lock className="w-5 h-5 text-[#4ad3e5]" />
                      Privacidad
                    </h3>
                    {!isEditing && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setIsEditing(true);
                          setShowPrivacySettings(true);
                        }}
                      >
                        <Edit2 className="w-4 h-4 mr-2" />
                        Configurar
                      </Button>
                    )}
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-[var(--color-dark-card)] rounded-lg">
                      <div className="flex items-center gap-2">
                        {editForm.profilePublic !== false ? (
                          <Eye className="w-4 h-4 text-[#4ad3e5]" />
                        ) : (
                          <EyeOff className="w-4 h-4 text-[#ff5da2]" />
                        )}
                        <span className="text-[var(--color-light)] text-sm font-medium">
                          Perfil público
                        </span>
                      </div>
                      <span className="text-[var(--color-light)]/60 text-xs">
                        {editForm.profilePublic !== false
                          ? "Visible en la comunidad"
                          : "Solo tú puedes ver tu perfil"}
                      </span>
                    </div>
                    {isEditing && (
                      <div className="space-y-4 pt-4 border-t border-[var(--color-dark-border)]/10">
                        {/* Toggle perfil público */}
                        <div className="flex items-center justify-between">
                          <label className="text-[var(--color-light)] text-sm font-medium">
                            Perfil público
                          </label>
                          <button
                            onClick={() =>
                              setEditForm({
                                ...editForm,
                                profilePublic: !editForm.profilePublic,
                              })
                            }
                            className={`relative w-12 h-6 rounded-full transition-colors ${
                              editForm.profilePublic !== false
                                ? "bg-[#4ad3e5]"
                                : "bg-[var(--color-gray-blue)]/30"
                            }`}
                          >
                            <span
                              className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${
                                editForm.profilePublic !== false
                                  ? "translate-x-6"
                                  : "translate-x-0"
                              }`}
                            />
                          </button>
                        </div>

                        {/* Configuración granular */}
                        <div className="space-y-3">
                          <p className="text-[var(--color-light)]/60 text-xs font-medium">
                            Qué información mostrar públicamente:
                          </p>
                          {[
                            { key: "showEmail", label: "Email" },
                            { key: "showContacts", label: "Contactos" },
                            { key: "showProjects", label: "Proyectos" },
                            { key: "showSessions", label: "Sesiones" },
                            { key: "showBio", label: "Biografía" },
                            { key: "showLanguages", label: "Tecnologías" },
                            { key: "showStack", label: "Stack" },
                            { key: "showLevel", label: "Nivel" },
                          ].map(({ key, label }) => (
                            <div
                              key={key}
                              className="flex items-center justify-between"
                            >
                              <label className="text-[var(--color-light)]/80 text-sm">
                                {label}
                              </label>
                              <button
                                onClick={() => {
                                  const currentSettings = editForm.privacySettings || {
                                    showEmail: false,
                                    showContacts: true,
                                    showProjects: true,
                                    showSessions: false,
                                    showBio: true,
                                    showLanguages: true,
                                    showStack: true,
                                    showLevel: true,
                                  };
                                  setEditForm({
                                    ...editForm,
                                    privacySettings: {
                                      ...currentSettings,
                                      [key]: !currentSettings[key as keyof typeof currentSettings],
                                    },
                                  });
                                }}
                                className={`relative w-10 h-5 rounded-full transition-colors ${
                                  (editForm.privacySettings?.[
                                    key as keyof typeof editForm.privacySettings
                                  ] ?? true) !== false
                                    ? "bg-[#4ad3e5]"
                                    : "bg-[var(--color-gray-blue)]/30"
                                }`}
                              >
                                <span
                                  className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full transition-transform ${
                                    (editForm.privacySettings?.[
                                      key as keyof typeof editForm.privacySettings
                                    ] ?? true) !== false
                                      ? "translate-x-5"
                                      : "translate-x-0"
                                  }`}
                                />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </Card>
              )}
            </div>

            {/* Main Content Area */}
            <div className="lg:col-span-2 space-y-6">
              {/* Bio Section */}
              {isEditing && isOwnProfile ? (
                <Card className="p-6">
                  <h3 className="text-lg font-bold text-[var(--color-light)] mb-4">Biografía</h3>
                  <textarea
                    value={editForm.bio || ""}
                    onChange={(e) =>
                      setEditForm({ ...editForm, bio: e.target.value })
                    }
                    placeholder="Cuéntanos sobre ti, tu experiencia, tus intereses..."
                    className="w-full px-4 py-3 bg-[var(--color-dark-card)] border border-[#4ad3e5]/30 rounded-lg text-[var(--color-light)] placeholder-[var(--color-gray-blue)] focus:outline-none focus:ring-2 focus:ring-[#4ad3e5] resize-none"
                    rows={5}
                  />
                </Card>
              ) : (
                profileUser.privacySettings?.showBio !== false &&
                  profileUser.bio && (
                    <Card className="p-6">
                      <h3 className="text-lg font-bold text-[var(--color-light)] mb-4">Sobre mí</h3>
                      <p className="text-[var(--color-light)]/80 leading-relaxed whitespace-pre-line">
                        {profileUser.bio}
                      </p>
                    </Card>
                  )
              )}

              {/* Edit Stack and Level */}
              {isEditing && isOwnProfile && (
                <Card className="p-6">
                  <h3 className="text-lg font-bold text-[var(--color-light)] mb-4">Especialización</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm text-[var(--color-light)]/60 mb-2">Stack</label>
                      <select
                        value={editForm.stack || "Fullstack"}
                        onChange={(e) =>
                          setEditForm({
                            ...editForm,
                            stack: e.target.value as "Frontend" | "Backend" | "Fullstack",
                          })
                        }
                        className="w-full px-4 py-2 bg-[var(--color-dark-card)] border border-[#4ad3e5]/30 rounded-lg text-[var(--color-light)] focus:outline-none focus:ring-2 focus:ring-[#4ad3e5]"
                      >
                        <option value="Frontend">Frontend</option>
                        <option value="Backend">Backend</option>
                        <option value="Fullstack">Fullstack</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm text-[var(--color-light)]/60 mb-2">Nivel</label>
                      <select
                        value={editForm.level || "Junior"}
                        onChange={(e) =>
                          setEditForm({
                            ...editForm,
                            level: e.target.value as "Junior" | "Mid" | "Senior",
                          })
                        }
                        className="w-full px-4 py-2 bg-[var(--color-dark-card)] border border-[#4ad3e5]/30 rounded-lg text-[var(--color-light)] focus:outline-none focus:ring-2 focus:ring-[#4ad3e5]"
                      >
                        <option value="Junior">Junior</option>
                        <option value="Mid">Mid</option>
                        <option value="Senior">Senior</option>
                      </select>
                    </div>
                  </div>
                </Card>
              )}

              {/* Projects Section */}
              {(isOwnProfile ||
                profileUser.privacySettings?.showProjects !== false) && (
                <Card className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-bold text-[var(--color-light)] flex items-center gap-2">
                      <Briefcase className="w-6 h-6 text-[#4ad3e5]" />
                      Proyectos
                    </h3>
                  {isOwnProfile && (
                    <Link to="/proyectos/nuevo">
                      <Button variant="outline" size="sm" className="flex items-center gap-2">
                        <Plus className="w-4 h-4" />
                        Nuevo proyecto
                      </Button>
                    </Link>
                  )}
                </div>
                {projects.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {projects.map((project) => (
                      <Link
                        key={project.id}
                        to={`/proyectos/${project.id}`}
                        className="group"
                      >
                        <div className="p-4 bg-[var(--color-dark-card)] rounded-lg border border-[#4ad3e5]/20 hover:border-[#4ad3e5] transition-all hover:shadow-lg hover:shadow-[#4ad3e5]/10">
                          {project.image && (
                            <img
                              src={project.image}
                              alt={project.title}
                              className="w-full h-32 object-cover rounded-md mb-3"
                            />
                          )}
                          <h4 className="text-[var(--color-light)] font-semibold mb-2 group-hover:text-[#4ad3e5] transition-colors">
                            {project.title}
                          </h4>
                          <p className="text-[var(--color-light)]/60 text-sm line-clamp-2 mb-3">
                            {project.description}
                          </p>
                          <div className="flex flex-wrap gap-2">
                            <Badge
                              variant="solid"
                              className="bg-transparent text-[var(--color-light)] border border-[#4ad3e5] text-xs"
                            >
                              {project.stack}
                            </Badge>
                            {project.languages.slice(0, 2).map((lang, idx) => (
                              <Badge
                                key={idx}
                                variant="gradient"
                                className="text-xs"
                              >
                                {lang}
                              </Badge>
                            ))}
                            {project.languages.length > 2 && (
                              <Badge
                                variant="solid"
                                className="bg-[var(--color-dark-card)] text-[var(--color-light)] border-[#4ad3e5] text-xs"
                              >
                                +{project.languages.length - 2}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Briefcase className="w-16 h-16 text-white/20 mx-auto mb-4" />
                    <p className="text-white/60 mb-4">
                      {isOwnProfile
                        ? "Aún no has creado proyectos"
                        : "Este/a usuario/a no tiene proyectos públicos"}
                    </p>
                    {isOwnProfile && (
                      <Link to="/proyectos/nuevo">
                        <Button variant="primary" className="flex items-center gap-2 mx-auto">
                          <Plus className="w-4 h-4" />
                          Crear mi primer proyecto
                        </Button>
                      </Link>
                    )}
                  </div>
                )}
              </Card>
              )}

              {/* Sessions Section */}
              {(isOwnProfile ||
                (profileUser.privacySettings?.showSessions !== false &&
                  sessions.length > 0)) && (
                <Card className="p-6">
                  <h3 className="text-xl font-bold text-[var(--color-light)] mb-6 flex items-center gap-2">
                    <Calendar className="w-6 h-6 text-[#4ad3e5]" />
                    Mis Sesiones
                  </h3>
                  <div className="space-y-3">
                    {sessions.slice(0, 5).map((session) => (
                      <Link
                        key={session.id}
                        to={`/sesion/${session.id}`}
                        className="block p-4 bg-[var(--color-dark-card)] rounded-lg border border-[#4ad3e5]/20 hover:border-[#4ad3e5] transition-all group"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h4 className="text-[var(--color-light)] font-semibold mb-1 group-hover:text-[#4ad3e5] transition-colors">
                              {session.title}
                            </h4>
                            <p className="text-[var(--color-light)]/60 text-sm line-clamp-1 mb-2">
                              {session.description}
                            </p>
                            <div className="flex items-center gap-4 text-xs text-[var(--color-light)]/50">
                              <span className="flex items-center gap-1">
                                <Calendar className="w-3 h-3" />
                                {new Date(session.date).toLocaleDateString("es-ES", {
                                  day: "numeric",
                                  month: "short",
                                  year: "numeric",
                                })}
                              </span>
                              <span>
                                {session.participants.length}/{session.maxParticipants}{" "}
                                participantes
                              </span>
                            </div>
                          </div>
                        </div>
                      </Link>
                    ))}
                    {sessions.length > 5 && (
                      <Link
                        to="/"
                        className="block text-center text-[#4ad3e5] hover:text-[#65dde6] transition-colors text-sm font-medium py-2"
                      >
                        Ver todas las sesiones ({sessions.length})
                      </Link>
                    )}
                  </div>
                </Card>
              )}
            </div>
          </div>
        </div>
      </SectionWrapper>

      {/* Contact Modal */}
      <Modal
        isOpen={showContactModal}
        onClose={() => setShowContactModal(false)}
        title={`Contactar a ${profileUser.name}`}
      >
        <div className="space-y-4">
          <p className="text-[var(--color-light)]/80">
            Envía un mensaje a {profileUser.name} para colaborar o hacer una oferta de trabajo.
          {profileUser.contacts.email && (
            <span className="block mt-2 text-sm text-[var(--color-light)]/60">
              O contacta directamente:{" "}
              <a
                href={`mailto:${profileUser.contacts.email}`}
                className="text-[#4ad3e5] hover:underline"
              >
                {profileUser.contacts.email}
              </a>
            </span>
          )}
          </p>
          <textarea
            value={contactMessage}
            onChange={(e) => setContactMessage(e.target.value)}
            placeholder="Escribe tu mensaje aquí..."
            className="w-full px-4 py-3 bg-[var(--color-dark-card)] border border-[#4ad3e5]/30 rounded-lg text-[var(--color-light)] placeholder-[var(--color-gray-blue)] focus:outline-none focus:ring-2 focus:ring-[#4ad3e5] resize-none"
            rows={4}
          />
          <div className="flex gap-3">
            <Button
              variant="ghost"
              onClick={() => {
                setShowContactModal(false);
                setContactMessage("");
              }}
              className="flex-1"
            >
              Cancelar
            </Button>
            <Button
              variant="primary"
              onClick={() => {
                // TODO: Send message
                setShowContactModal(false);
                setContactMessage("");
              }}
              className="flex-1"
            >
              Enviar
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
