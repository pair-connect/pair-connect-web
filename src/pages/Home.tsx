import React, { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Calendar } from "@/components/home/Calendar";
import { SessionFilters } from "@/components/home/SessionFilters";
import { SessionsList } from "@/components/home/SessionsList";
import { ProjectsList } from "@/components/home/ProjectsList";
import { AuthModal } from "@/components/auth/AuthModal";
import { ProfileSetupModal } from "@/components/auth/ProfileSetupModal";
import { HeroSection } from "@/components/home/HeroSection";
import { useAuth } from "@/contexts/AuthContext";
import { Stack, Level, Session, Project } from "@/types";
import { api } from "@/utils/api";
import { SectionWrapper } from "@/components/layout/SectionWrapper";

export const Home: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();

  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showProfileSetup, setShowProfileSetup] = useState(false);

  const [sessions, setSessions] = useState<Session[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [projectsLoading, setProjectsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [languageSearchQuery, setLanguageSearchQuery] = useState("");
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>([]);
  const [selectedStack, setSelectedStack] = useState<Stack | "All">("All");
  const [selectedLevel, setSelectedLevel] = useState<Level | "All">("All");
  const [selectedCalendarDate, setSelectedCalendarDate] = useState<
    Date | undefined
  >(undefined);

  // Fetch sessions from API - Solo si está autenticado
  useEffect(() => {
    if (!isAuthenticated) {
      setSessions([]);
      setLoading(false);
      return;
    }

    const fetchSessions = async () => {
      try {
        setLoading(true);
        const data = await api.sessions.getSessions();
        // Convert date strings to Date objects
        const sessionsWithDates = data.map((session) => ({
          ...session,
          date: new Date(session.date),
        }));
        setSessions(sessionsWithDates);
      } catch (error) {
        console.error("Error fetching sessions:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchSessions();
  }, [isAuthenticated]);

  // Fetch projects (always, not just when no sessions)
  useEffect(() => {
    const fetchProjects = async () => {
      if (!loading) {
        try {
          setProjectsLoading(true);
          const data = await api.projects.getProjects();
          // Convert date strings to Date objects
          const projectsWithDates = data.map((project) => ({
            ...project,
            createdAt: new Date(project.createdAt),
            interested: project.interested || [],
          }));
          setProjects(projectsWithDates);
        } catch (error) {
          console.error("Error fetching projects:", error);
        } finally {
          setProjectsLoading(false);
        }
      }
    };

    fetchProjects();
  }, [loading]);

  useEffect(() => {
    const loginParam = searchParams.get("login");
    const registerParam = searchParams.get("register");
    const redirectParam = searchParams.get("redirect");

    if (loginParam === "true") {
      setShowAuthModal(true);
      // Si hay un redirect, guardarlo para después del login
      if (redirectParam) {
        localStorage.setItem('redirectAfterLogin', redirectParam);
      }
      setSearchParams({});
    } else if (registerParam === "true") {
      // Redirigir a la página de registro
      navigate("/register");
      setSearchParams({});
    }
  }, [searchParams, setSearchParams]);

  const handleToggleBookmark = async (sessionId: string) => {
    if (!user) {
      setShowAuthModal(true);
      return;
    }

    try {
      await api.bookmarks.toggleBookmark(sessionId);
      // The user context will be updated when we fetch sessions again
      // For now, we can optimistically update local state
      window.location.reload(); // Simple approach - reload to get fresh data
    } catch (error) {
      console.error("Error toggling bookmark:", error);
    }
  };

  const handleToggleProjectInterest = async (projectId: string) => {
    if (!user) {
      setShowAuthModal(true);
      return;
    }

    try {
      const updatedProject = await api.projects.toggleInterest(projectId);
      // Update the project in the local state
      setProjects((prev) =>
        prev.map((p) =>
          p.id === projectId
            ? { ...p, interested: updatedProject.interested || [] }
            : p
        )
      );
    } catch (error) {
      console.error("Error toggling project interest:", error);
    }
  };

  const toggleLanguageFilter = (lang: string) => {
    setSelectedLanguages((prev) =>
      prev.includes(lang) ? prev.filter((l) => l !== lang) : [...prev, lang]
    );
  };

  const handleStackChange = (stack: Stack | "All") => {
    setSelectedStack(stack);
  };

  const handleLevelChange = (level: Level | "All") => {
    setSelectedLevel(level);
  };

  const handleCalendarDateSelect = (date: Date) => {
    if (
      selectedCalendarDate &&
      new Date(selectedCalendarDate).setHours(0, 0, 0, 0) ===
        new Date(date).setHours(0, 0, 0, 0)
    ) {
      setSelectedCalendarDate(undefined);
    } else {
      setSelectedCalendarDate(date);
    }
  };

  // Filter sessions
  const filteredSessions = sessions.filter((session) => {

    // Search filter
    if (
      searchQuery &&
      !session.title.toLowerCase().includes(searchQuery.toLowerCase())
    ) {
      return false;
    }

    // Calendar date filter
    if (selectedCalendarDate) {
      const sessionDate = new Date(session.date);
      sessionDate.setHours(0, 0, 0, 0);
      const filterDate = new Date(selectedCalendarDate);
      filterDate.setHours(0, 0, 0, 0);

      if (sessionDate.getTime() !== filterDate.getTime()) {
        return false;
      }
    }

    // Language filter (would need to check project languages)
    // Stack filter
    // Level filter

    return true;
  });

  // Sort by date
  const sortedSessions = [...filteredSessions].sort(
    (a, b) => a.date.getTime() - b.date.getTime()
  );

  return (
    <div className="min-h-screen">
      {/* Hero Section with Shooting Stars */}
      <HeroSection />

      {/* Sessions Section - Clean Redesign */}
      <SectionWrapper withBottomMargin>
        <div className="space-y-6">
          {/* Header */}
          <h2 className="text-xl md:text-2xl font-bold text-[var(--color-light)]">
            Sesiones programadas
          </h2>

          {/* Main Grid: Calendar + Filters */}
          <div className="grid grid-cols-1 md:grid-cols-[200px_1fr] lg:grid-cols-[240px_1fr] gap-4 md:gap-4 lg:gap-6">
            {/* Left: Compact Calendar */}
            <div className="w-full max-w-[200px] md:max-w-[200px] mx-auto md:mx-0 lg:max-w-[240px] space-y-3">
              <Calendar
                sessions={sessions}
                selectedDate={selectedCalendarDate}
                onDateSelect={handleCalendarDateSelect}
              />
              {selectedCalendarDate && (
                <button
                  onClick={() => setSelectedCalendarDate(undefined)}
                  className="w-full text-xs text-[#ff5da2] hover:text-[#ff7db8] transition-colors"
                >
                  Limpiar fecha
                </button>
              )}
              
              {/* Legend */}
              <div className="bg-[var(--color-dark-card)] rounded-lg border border-[#4ad3e5]/30 p-2.5">
                <label className="block text-xs text-[#8fa6bc] mb-2">Leyenda</label>
                <div className="space-y-1.5">
                  <div className="flex items-center gap-1.5">
                    <div className="w-3 h-3 rounded border border-[#069a9a]" />
                    <span className="text-xs text-[var(--color-light)]">Frontend</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-3 h-3 rounded border border-[#ff5da2]" />
                    <span className="text-xs text-[var(--color-light)]">Backend</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-3 h-3 rounded border border-[#a16ee4]" />
                    <span className="text-xs text-[var(--color-light)]">Fullstack</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Search and Filters */}
            <SessionFilters
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              selectedStack={selectedStack}
              onStackChange={handleStackChange}
              selectedLevel={selectedLevel}
              onLevelChange={handleLevelChange}
              selectedLanguages={selectedLanguages}
              onToggleLanguage={toggleLanguageFilter}
              languageSearchQuery={languageSearchQuery}
              onLanguageSearchChange={setLanguageSearchQuery}
            />
          </div>
        </div>
      </SectionWrapper>

      {/* Sessions Section - Scrollable Box - Solo visible para usuarios/as autenticados/as */}
      {isAuthenticated && sortedSessions.length > 0 && (
        <SessionsList
          sessions={sortedSessions}
          loading={loading}
          onToggleBookmark={handleToggleBookmark}
          onRequireAuth={() => setShowAuthModal(true)}
        />
      )}

      {/* Projects Section - Carousel */}
      <ProjectsList
        projects={projects}
        loading={projectsLoading}
        isAuthenticated={isAuthenticated}
        onToggleInterest={handleToggleProjectInterest}
        onRequireAuth={() => setShowAuthModal(true)}
      />

      {/* Modals */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onShowProfileSetup={() => setShowProfileSetup(true)}
      />

      <ProfileSetupModal
        isOpen={showProfileSetup}
        onClose={() => setShowProfileSetup(false)}
      />
    </div>
  );
};
