import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Search,
  Users,
  Filter,
  X,
  Github,
  Linkedin,
  Mail,
} from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { StackBadge } from "@/components/shared/StackBadge";
import { SectionWrapper } from "@/components/layout/SectionWrapper";
import { api } from "@/utils/api";
import { User } from "@/types";
import { useAuth } from "@/contexts/AuthContext";

export const Community: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStack, setSelectedStack] = useState<string | null>(null);
  const [selectedLevel, setSelectedLevel] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        const allUsers = await api.users.searchUsers({
          q: searchQuery || undefined,
          stack: selectedStack || undefined,
          level: selectedLevel || undefined,
        });
        // Filtrar solo usuarios con perfil público
        const publicUsers = allUsers.filter(
          (user) => user.profilePublic !== false
        );
        setUsers(publicUsers);
      } catch (error: unknown) {
        console.error("Error fetching users:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [searchQuery, selectedStack, selectedLevel]);


  const getLevelColor = (level: string) => {
    // Texto blanco para que contraste con el degradado del badge
    return "text-white";
  };

  const clearFilters = () => {
    setSelectedStack(null);
    setSelectedLevel(null);
    setSearchQuery("");
  };

  const hasActiveFilters = selectedStack || selectedLevel || searchQuery;

  return (
    <div className="min-h-screen bg-[var(--color-dark-bg)]">
      <SectionWrapper verticalPadding="py-12" maxWidth="max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-5xl md:text-6xl font-bold text-center mb-16 text-transparent bg-clip-text gradient-text font-poppins">
            Comunidad
          </h1>
          <div className="flex items-center gap-3 mb-2">
            <Users className="w-10 h-10 text-[#4ad3e5]" />
            <p className="text-[var(--color-light)] text-lg font-bold font-poppins">
              Descubre desarrolladores/as y conecta con la comunidad
            </p>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="mb-8 space-y-4">
            {/* Search Bar */}
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[var(--color-gray-blue)]" />
              <input
                type="text"
                placeholder="Buscar por nombre o username..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-[var(--color-dark-card)] border border-[#4ad3e5]/30 rounded-lg text-[var(--color-light)] placeholder-[var(--color-gray-blue)] focus:outline-none focus:ring-2 focus:ring-[#4ad3e5]"
              />
            </div>

            {/* Filters */}
            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2 px-4 py-2 bg-[var(--color-dark-card)] border border-[#4ad3e5]/30 rounded-lg text-[var(--color-light)] hover:border-[#4ad3e5] transition-colors"
              >
                <Filter className="w-4 h-4" />
                Filtros
              </button>

              {showFilters && (
                <div className="flex flex-wrap gap-3">
                  {/* Stack Filter */}
                  <div className="flex gap-2">
                    {["Frontend", "Backend", "Fullstack"].map((stack) => (
                      <button
                        key={stack}
                        onClick={() =>
                          setSelectedStack(
                            selectedStack === stack ? null : stack
                          )
                        }
                        className={`px-4 py-2 rounded-lg border-2 font-medium transition-colors ${
                          selectedStack === stack
                            ? "border-[#069a9a] text-[#069a9a] bg-transparent"
                            : selectedStack === "Backend" && stack === "Backend"
                            ? "border-[#ff5da2] text-[#ff5da2] bg-transparent"
                            : selectedStack === "Fullstack" && stack === "Fullstack"
                            ? "border-[#a16ee4] text-[#a16ee4] bg-transparent"
                            : "border-[var(--color-dark-border)]/20 text-[var(--color-light)]/60 hover:border-[var(--color-dark-border)]/40"
                        }`}
                      >
                        {stack}
                      </button>
                    ))}
                  </div>

                  {/* Level Filter */}
                  <div className="flex gap-2">
                    {["Junior", "Mid", "Senior"].map((level) => (
                      <button
                        key={level}
                        onClick={() =>
                          setSelectedLevel(
                            selectedLevel === level ? null : level
                          )
                        }
                        className={`px-4 py-2 rounded-lg border font-medium transition-colors ${
                          selectedLevel === level
                            ? getLevelColor(level)
                            : "border-[var(--color-dark-border)]/20 bg-[var(--color-dark-card)] text-[var(--color-light)]/60 hover:border-[var(--color-dark-border)]/40"
                        }`}
                      >
                        {level}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="flex items-center gap-2 px-4 py-2 bg-[#ff5da2]/20 border border-[#ff5da2] rounded-lg text-[#ff5da2] hover:bg-[#ff5da2]/30 transition-colors"
                >
                  <X className="w-4 h-4" />
                  Limpiar filtros
                </button>
              )}
            </div>
          </div>

          {/* Results */}
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#4ad3e5]"></div>
            </div>
          ) : users.length === 0 ? (
            <Card className="p-12 text-center">
              <Users className="w-16 h-16 text-[var(--color-gray-blue)]/20 mx-auto mb-4" />
              <p className="text-[var(--color-light)]/60 text-lg mb-2">
                No se encontraron usuarios/as
              </p>
              <p className="text-[var(--color-gray-blue)] text-sm">
                {hasActiveFilters
                  ? "Intenta ajustar los filtros de búsqueda"
                  : "Aún no hay usuarios/as públicos/as en la comunidad"}
              </p>
            </Card>
          ) : (
            <>
              <div className="mb-4 text-[var(--color-light)]/60">
                {users.length} {users.length === 1 ? "usuario/a encontrado/a" : "usuarios/as encontrados/as"}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {users.map((user) => (
                  <Link
                    key={user.id}
                    to={`/perfil/${user.id}`}
                    className="group"
                  >
                    <Card className="p-6 hover:border-[#4ad3e5] transition-all hover:shadow-lg hover:shadow-[#4ad3e5]/10">
                      {/* Avatar and Basic Info */}
                      <div className="flex items-start gap-4 mb-4">
                        {user.avatar ? (
                          <img
                            src={user.avatar}
                            alt={user.name}
                            className="w-16 h-16 rounded-full object-cover border-2 border-[#4ad3e5]/50"
                          />
                        ) : (
                          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#4ad3e5] to-[#ff5da2] flex items-center justify-center border-2 border-[#4ad3e5]/50">
                            <span className="text-2xl font-bold text-[var(--color-dark-bg)]">
                              {user.name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <h3 className="text-lg font-bold text-[var(--color-light)] mb-1 group-hover:text-[#4ad3e5] transition-colors truncate">
                            {user.name}
                          </h3>
                          <p className="text-[var(--color-light)]/60 text-sm mb-2">
                            @{user.username}
                          </p>
                          <div className="flex flex-wrap gap-2 mt-2">
                            {user.stack && (
                              <StackBadge stack={user.stack} size="sm" />
                            )}
                            {user.level && (
                              <Badge
                                className="text-white border text-xs px-2 py-0.5 bg-gradient-to-r from-[#4ad3e5] to-[#ff5da2]"
                              >
                                {user.level}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Bio */}
                      {user.privacySettings?.showBio !== false && user.bio && (
                        <p className="text-[var(--color-light)]/80 text-sm mb-4 line-clamp-2">
                          {user.bio}
                        </p>
                      )}

                      {/* Contacts */}
                      {user.privacySettings?.showContacts !== false && (
                        (user.contacts.github ||
                          user.contacts.linkedin ||
                          (user.contacts.email && user.privacySettings?.showEmail)) && (
                          <div className="flex items-center gap-3 pt-4 border-t border-[var(--color-dark-border)]/10">
                            {user.contacts.github && (
                              <a
                                href={user.contacts.github}
                                target="_blank"
                                rel="noopener noreferrer"
                                onClick={(e) => e.stopPropagation()}
                                className="text-[var(--color-light)]/60 hover:text-[#4ad3e5] transition-colors"
                                title="GitHub"
                              >
                                <Github className="w-4 h-4" />
                              </a>
                            )}
                            {user.contacts.linkedin && (
                              <a
                                href={user.contacts.linkedin}
                                target="_blank"
                                rel="noopener noreferrer"
                                onClick={(e) => e.stopPropagation()}
                                className="text-[var(--color-light)]/60 hover:text-[#4ad3e5] transition-colors"
                                title="LinkedIn"
                              >
                                <Linkedin className="w-4 h-4" />
                              </a>
                            )}
                            {user.contacts.email &&
                              user.privacySettings?.showEmail && (
                                <a
                                  href={`mailto:${user.contacts.email}`}
                                  onClick={(e) => e.stopPropagation()}
                                  className="text-[var(--color-light)]/60 hover:text-[#4ad3e5] transition-colors"
                                  title="Email"
                                >
                                  <Mail className="w-4 h-4" />
                                </a>
                              )}
                          </div>
                        )
                      )}
                    </Card>
                  </Link>
                ))}
              </div>
            </>
          )}
      </SectionWrapper>
    </div>
  );
};
