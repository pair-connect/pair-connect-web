import React from "react";
import { SessionCard } from "@/components/sessions/SessionCard";
import { Session } from "@/types";
import { SectionWrapper } from "@/components/layout/SectionWrapper";

interface SessionsListProps {
  sessions: Session[];
  loading: boolean;
  onToggleBookmark: (sessionId: string) => void;
  onRequireAuth: () => void;
}

export const SessionsList: React.FC<SessionsListProps> = ({
  sessions,
  loading,
  onToggleBookmark,
  onRequireAuth,
}) => {
  // Sort sessions by date (earliest first)
  const sortedSessions = [...sessions].sort(
    (a, b) => a.date.getTime() - b.date.getTime()
  );

  return (
    <SectionWrapper verticalPadding="py-12">
      <h2 className="text-2xl md:text-3xl font-bold text-[var(--color-light)] mb-6">
        Sesiones sugeridas para ti
      </h2>
      {loading ? (
        <div className="text-center py-12">
          <p className="text-gray-400 text-lg">Cargando sesiones...</p>
        </div>
      ) : (
        <div className="bg-[var(--color-dark-card)] rounded-lg border border-[#4ad3e5]/30 p-6">
          <div className="overflow-x-auto overflow-y-hidden scrollbar-thin">
            <div className="flex gap-6 pb-4" style={{ minWidth: 'max-content' }}>
              {sortedSessions.map((session) => (
                <div key={session.id} className="shrink-0 w-80 md:w-96">
                  <SessionCard
                    session={session}
                    onToggleBookmark={onToggleBookmark}
                    onRequireAuth={onRequireAuth}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </SectionWrapper>
  );
};
