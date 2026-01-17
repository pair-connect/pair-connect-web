import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Clock, Users, Heart } from 'lucide-react';
import { Session, User, Project } from '@/types';
import { Badge } from '@/components/ui/Badge';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/utils/api';

interface SessionCardProps {
  session: Session;
  onToggleBookmark?: (sessionId: string) => void;
  onRequireAuth?: () => void;
}

export const SessionCard: React.FC<SessionCardProps> = ({ session, onToggleBookmark, onRequireAuth }) => {
  const { user } = useAuth();
  const [project, setProject] = useState<Project | null>(null);
  const [owner, setOwner] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [projectData, ownerData] = await Promise.all([
          api.projects.getProject(session.projectId),
          api.users.getUser(session.ownerId)
        ]);
        setProject(projectData);
        setOwner(ownerData);
      } catch (error) {
        console.error('Error loading session card data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [session.projectId, session.ownerId]);

  if (loading || !project || !owner) {
    return (
      <div className="bg-[var(--color-dark-card)] rounded-[5px] p-5 border-2 border-[#4ad3e5] animate-pulse">
        <div className="w-full h-40 bg-[var(--color-dark-card)] rounded-[5px] mb-4 opacity-50"></div>
        <div className="h-6 bg-[var(--color-dark-card)] rounded mb-2 opacity-50"></div>
        <div className="h-4 bg-[var(--color-dark-card)] rounded mb-4 w-3/4 opacity-50"></div>
      </div>
    );
  }

  const isBookmarked = user?.bookmarks.includes(session.id) || false;
  const isParticipant = session.participants.includes(user?.id || '');
  const isInterested = session.interested.includes(user?.id || '');

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('es-ES', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    }).format(date);
  };

  const formatTime = (date: Date) => {
    return new Intl.DateTimeFormat('es-ES', {
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  // Color variants for cards based on project stack
  const getStackColor = (stack: string): string => {
    switch (stack) {
      case 'Frontend':
        return '#069a9a'; // Cyan oscuro
      case 'Backend':
        return '#ff5da2'; // Rosa magenta
      case 'Fullstack':
        return '#a16ee4'; // Lila purple
      default:
        return '#069a9a';
    }
  };

  const borderColor = getStackColor(project.stack);

  return (
    <div 
      className="relative bg-[var(--color-dark-card)] rounded-[5px] p-5 transition-all duration-300 hover:scale-[1.02]"
      style={{
        border: `2px solid ${borderColor}`
      }}
    >
      {/* Bookmark Button - Show always, but require auth if not logged in */}
      {onToggleBookmark && (
        <button
          onClick={() => {
            if (!user && onRequireAuth) {
              onRequireAuth();
            } else if (user) {
              onToggleBookmark(session.id);
            }
          }}
          className="absolute top-4 right-4 p-2 rounded-full bg-[var(--color-dark-card)]/80 hover:bg-[var(--color-dark-card)] transition-colors z-10"
          aria-label={isBookmarked ? 'Quitar de favoritos' : user ? 'Añadir a favoritos' : 'Inicia sesión para guardar en favoritos'}
          title={isBookmarked ? 'Quitar de favoritos' : user ? 'Añadir a favoritos' : 'Inicia sesión para guardar en favoritos'}
        >
          <Heart 
            className={`w-5 h-5 ${isBookmarked ? 'fill-[#ff5da2] text-[#ff5da2]' : 'text-[var(--color-gray-blue)]'}`}
          />
        </button>
      )}

      {/* Status Indicator */}
      {(isParticipant || isInterested) && (
        <div className="absolute top-4 left-4 flex gap-2">
          {isParticipant && (
            <div className="w-3 h-3 rounded-full bg-[#4ad3e5] animate-pulse" title="Participando" />
          )}
          {isInterested && (
            <div className="w-3 h-3 rounded-full bg-[#ff5da2] animate-pulse" title="Interesado" />
          )}
        </div>
      )}

      {user ? (
        <Link to={`/sesion/${session.id}`} className="block">
          {/* Project Image */}
          {project.image && (
            <div className="w-full h-40 mb-4 rounded-[5px] overflow-hidden">
              <img 
                src={project.image} 
                alt={project.title}
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
              />
            </div>
          )}

          {/* Session Title */}
          <h3 
            className="text-xl font-bold text-[var(--color-light)] mb-2 hover:text-[#4ad3e5] transition-colors font-['Source_Code_Pro']"
          >
            {session.title}
          </h3>

          {/* Project Title */}
          <p className="text-sm text-[#65dde6] mb-3 font-['Source_Code_Pro']">
            Proyecto: {project.title}
          </p>

          {/* Description */}
          <p className="text-[var(--color-gray-blue)] text-sm mb-4 line-clamp-2 font-['Source_Code_Pro']">
            {session.description}
          </p>

          {/* Languages */}
          <div className="flex flex-wrap gap-2 mb-4">
            {project.languages.slice(0, 3).map(lang => (
              <Badge key={lang} variant="gradient">
                {lang}
              </Badge>
            ))}
            {project.languages.length > 3 && (
              <Badge variant="solid" className="bg-[var(--color-dark-card)] text-[var(--color-light)] border-[#4ad3e5]">
                +{project.languages.length - 3}
              </Badge>
            )}
          </div>

          {/* Info Grid */}
          <div className="grid grid-cols-2 gap-3 text-sm font-['Source_Code_Pro']">
            <div className="flex items-center gap-2 text-[var(--color-gray-blue)]">
              <Calendar className="w-4 h-4 text-[#4ad3e5]" />
              <span>{formatDate(session.date)}</span>
            </div>
            <div className="flex items-center gap-2 text-[var(--color-gray-blue)]">
              <Clock className="w-4 h-4 text-[#4ad3e5]" />
              <span>{formatTime(session.date)}</span>
            </div>
            <div className="flex items-center gap-2 text-[var(--color-gray-blue)]">
              <Users className="w-4 h-4 text-[#4ad3e5]" />
              <span>{session.participants.length}/{session.maxParticipants}</span>
            </div>
            <div className="flex items-center gap-2">
              <span 
                className="text-xs px-2 py-1 rounded bg-[#4ad3e5]/10 text-[#4ad3e5] border border-[#4ad3e5]/30"
              >
                {project.level}
              </span>
            </div>
          </div>

          {/* Stack Badge */}
          <div className="mt-3 pt-3 border-t border-[#4ad3e5]/20">
            <span 
              className="text-xs px-3 py-1.5 rounded border-2 font-bold font-['Source_Code_Pro'] inline-block"
              style={{
                borderColor: borderColor,
                color: borderColor
              }}
            >
              {project.stack}
            </span>
          </div>

          {/* Owner Info */}
          <div className="mt-4 pt-4 border-t border-[#4ad3e5]/20 flex items-center gap-2">
            {owner.avatar && (
              <img 
                src={owner.avatar} 
                alt={owner.name}
                className="w-8 h-8 rounded-full object-cover"
              />
            )}
            <span className="text-sm text-[var(--color-gray-blue)] font-['Source_Code_Pro']">
              por <span className="text-[#65dde6]">{owner.name}</span>
            </span>
          </div>
        </Link>
      ) : (
        <div 
          onClick={() => {
            if (onRequireAuth) {
              onRequireAuth();
            } else {
              window.location.href = `/?login=true&redirect=/sesion/${session.id}`;
            }
          }}
          className="block cursor-pointer"
        >
          {/* Project Image */}
          {project.image && (
            <div className="w-full h-40 mb-4 rounded-[5px] overflow-hidden">
              <img 
                src={project.image} 
                alt={project.title}
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
              />
            </div>
          )}

          {/* Session Title */}
          <h3 
            className="text-xl font-bold text-[var(--color-light)] mb-2 hover:text-[#4ad3e5] transition-colors font-['Source_Code_Pro']"
          >
            {session.title}
          </h3>

          {/* Project Title */}
          <p className="text-sm text-[#65dde6] mb-3 font-['Source_Code_Pro']">
            Proyecto: {project.title}
          </p>

          {/* Description */}
          <p className="text-[var(--color-gray-blue)] text-sm mb-4 line-clamp-2 font-['Source_Code_Pro']">
            {session.description}
          </p>

          {/* Languages */}
          <div className="flex flex-wrap gap-2 mb-4">
            {project.languages.slice(0, 3).map(lang => (
              <Badge key={lang} variant="gradient">
                {lang}
              </Badge>
            ))}
            {project.languages.length > 3 && (
              <Badge variant="solid" className="bg-[var(--color-dark-card)] text-[var(--color-light)] border-[#4ad3e5]">
                +{project.languages.length - 3}
              </Badge>
            )}
          </div>

          {/* Info Grid */}
          <div className="grid grid-cols-2 gap-3 text-sm font-['Source_Code_Pro']">
            <div className="flex items-center gap-2 text-[var(--color-gray-blue)]">
              <Calendar className="w-4 h-4 text-[#4ad3e5]" />
              <span>{formatDate(session.date)}</span>
            </div>
            <div className="flex items-center gap-2 text-[var(--color-gray-blue)]">
              <Clock className="w-4 h-4 text-[#4ad3e5]" />
              <span>{formatTime(session.date)}</span>
            </div>
            <div className="flex items-center gap-2 text-[var(--color-gray-blue)]">
              <Users className="w-4 h-4 text-[#4ad3e5]" />
              <span>{session.participants.length}/{session.maxParticipants}</span>
            </div>
            <div className="flex items-center gap-2">
              <span 
                className="text-xs px-2 py-1 rounded bg-[#4ad3e5]/10 text-[#4ad3e5] border border-[#4ad3e5]/30"
              >
                {project.level}
              </span>
            </div>
          </div>

          {/* Stack Badge */}
          <div className="mt-3 pt-3 border-t border-[#4ad3e5]/20">
            <span 
              className="text-xs px-3 py-1.5 rounded border-2 font-bold font-['Source_Code_Pro'] inline-block"
              style={{
                borderColor: borderColor,
                color: borderColor
              }}
            >
              {project.stack}
            </span>
          </div>

          {/* Owner Info */}
          <div className="mt-4 pt-4 border-t border-[#4ad3e5]/20 flex items-center gap-2">
            {owner.avatar && (
              <img 
                src={owner.avatar} 
                alt={owner.name}
                className="w-8 h-8 rounded-full object-cover"
              />
            )}
            <span className="text-sm text-[var(--color-gray-blue)] font-['Source_Code_Pro']">
              por <span className="text-[#65dde6]">{owner.name}</span>
            </span>
          </div>

          {/* Login Prompt */}
          <div className="mt-4 pt-4 border-t border-[#4ad3e5]/20">
            <span className="text-xs text-[var(--color-gray-blue)] font-['Source_Code_Pro']">
              🔒 Inicia sesión para ver detalles y participar
            </span>
          </div>
        </div>
      )}
    </div>
  );
};