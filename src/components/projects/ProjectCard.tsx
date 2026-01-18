import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Code2, Users, Heart, Calendar } from 'lucide-react';
import { Project, User } from '@/types';
import { Badge } from '@/components/ui/Badge';
import { StackBadge, getStackColorHex } from '@/components/shared/StackBadge';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/utils/api';

interface ProjectCardProps {
  project: Project;
  onToggleInterest?: (projectId: string) => void;
  onRequireAuth?: () => void;
}

export const ProjectCard: React.FC<ProjectCardProps> = ({ project, onToggleInterest, onRequireAuth }) => {
  const { user } = useAuth();
  const [owner, setOwner] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [interestedCount, setInterestedCount] = useState(project.interested?.length || 0);
  const [isInterested, setIsInterested] = useState(false);

  useEffect(() => {
    const fetchOwner = async () => {
      try {
        const ownerData = await api.users.getUser(project.ownerId);
        setOwner(ownerData);
      } catch (error: unknown) {
        console.error('Error loading project owner:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchOwner();
  }, [project.ownerId]);

  useEffect(() => {
    if (user && project.interested) {
      setIsInterested(project.interested.includes(user.id));
      setInterestedCount(project.interested.length);
    }
  }, [user, project.interested]);

  if (loading || !owner) {
    return (
      <div className="bg-[var(--color-dark-card)] rounded-[5px] p-5 border-2 border-[#4ad3e5] animate-pulse">
        <div className="w-full h-40 bg-[var(--color-dark-card)] rounded-[5px] mb-4 opacity-50"></div>
        <div className="h-6 bg-[var(--color-dark-card)] rounded mb-2 opacity-50"></div>
        <div className="h-4 bg-[var(--color-dark-card)] rounded mb-4 w-3/4 opacity-50"></div>
      </div>
    );
  }

  const handleToggleInterest = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!user) {
      if (onRequireAuth) {
        onRequireAuth();
      }
      return;
    }
    
    if (onToggleInterest) {
      onToggleInterest(project.id);
    }
    
    // Optimistic update
    if (isInterested) {
      setIsInterested(false);
      setInterestedCount(prev => Math.max(0, prev - 1));
    } else {
      setIsInterested(true);
      setInterestedCount(prev => prev + 1);
    }
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('es-ES', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    }).format(date);
  };

  // Color variants for cards based on project stack
  const isOwner = user?.id === project.ownerId;
  const borderColor = getStackColorHex(project.stack);

  return (
    <div 
      className="relative bg-[var(--color-dark-card)] rounded-[5px] p-5 transition-all duration-300 hover:scale-[1.02]"
      style={{
        border: `2px solid ${borderColor}`
      }}
    >
      {/* Interest Button - Show for non-owners (authenticated or not) */}
      {!isOwner && (
        <button
          onClick={handleToggleInterest}
          className="absolute top-4 right-4 p-2 rounded-full bg-[var(--color-dark-card)]/80 hover:bg-[var(--color-dark-card)] transition-colors z-10"
          aria-label={isInterested ? 'Ya no me interesa' : 'Me interesa este proyecto'}
          title={isInterested ? 'Ya no me interesa' : user ? 'Me interesa este proyecto' : 'Inicia sesión para mostrar interés'}
        >
          <Heart 
            className={`w-5 h-5 ${isInterested ? 'fill-[#ff5da2] text-[#ff5da2]' : 'text-[var(--color-gray-blue)]'}`}
          />
        </button>
      )}

      {/* Interest Indicator for Owner */}
      {isOwner && interestedCount > 0 && (
        <div className="absolute top-4 right-4 flex items-center gap-2 px-3 py-1.5 bg-[#ff5da2]/20 border border-[#ff5da2] rounded-full">
          <Heart className="w-4 h-4 text-[#ff5da2] fill-[#ff5da2]" />
          <span className="text-xs font-bold text-[#ff5da2] font-['Source_Code_Pro']">
            {interestedCount}
          </span>
        </div>
      )}

      {user ? (
        <Link to={`/proyectos/${project.id}`} className="block">
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

          {/* Project Title */}
          <h3 
            className="text-xl font-bold text-[var(--color-light)] mb-2 hover:text-[#4ad3e5] transition-colors font-['Source_Code_Pro']"
          >
            {project.title}
          </h3>

          {/* Description */}
          <p className="text-[var(--color-gray-blue)] text-sm mb-4 line-clamp-2 font-['Source_Code_Pro']">
            {project.description}
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
          <div className="grid grid-cols-2 gap-3 text-sm font-['Source_Code_Pro'] mb-3">
            <div className="flex items-center gap-2">
              <span 
                className="text-xs px-2 py-1 rounded bg-[#4ad3e5]/10 text-[#4ad3e5] border border-[#4ad3e5]/30"
              >
                {project.level}
              </span>
            </div>
            <div className="flex items-center gap-2 text-[var(--color-gray-blue)]">
              <Calendar className="w-4 h-4 text-[#4ad3e5]" />
              <span>{formatDate(project.createdAt)}</span>
            </div>
          </div>

          {/* Stack Badge */}
          <div className="mb-3 pt-3 border-t border-[#4ad3e5]/20">
            <StackBadge stack={project.stack} size="sm" className="font-bold font-['Source_Code_Pro']" />
          </div>

          {/* Owner Info */}
          <div className="pt-4 border-t border-[#4ad3e5]/20 flex items-center gap-2">
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

          {/* No Sessions Badge */}
          {!isOwner && (
            <div className="mt-3 pt-3 border-t border-[#4ad3e5]/20">
              <span className="text-xs text-[var(--color-gray-blue)] font-['Source_Code_Pro']">
                {isInterested 
                  ? '✓ Mostraste interés - El owner puede crear una sesión' 
                  : 'Sin sesiones activas - Muestra interés para activarlo'}
              </span>
            </div>
          )}
        </Link>
      ) : (
        <div 
          onClick={() => {
            if (onRequireAuth) {
              onRequireAuth();
            } else {
              window.location.href = `/?login=true&redirect=/proyectos/${project.id}`;
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

          {/* Project Title */}
          <h3 
            className="text-xl font-bold text-[var(--color-light)] mb-2 hover:text-[#4ad3e5] transition-colors font-['Source_Code_Pro']"
          >
            {project.title}
          </h3>

          {/* Description */}
          <p className="text-[var(--color-gray-blue)] text-sm mb-4 line-clamp-2 font-['Source_Code_Pro']">
            {project.description}
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
          <div className="grid grid-cols-2 gap-3 text-sm font-['Source_Code_Pro'] mb-3">
            <div className="flex items-center gap-2">
              <span 
                className="text-xs px-2 py-1 rounded bg-[#4ad3e5]/10 text-[#4ad3e5] border border-[#4ad3e5]/30"
              >
                {project.level}
              </span>
            </div>
            <div className="flex items-center gap-2 text-[var(--color-gray-blue)]">
              <Calendar className="w-4 h-4 text-[#4ad3e5]" />
              <span>{formatDate(project.createdAt)}</span>
            </div>
          </div>

          {/* Stack Badge */}
          <div className="mb-3 pt-3 border-t border-[#4ad3e5]/20">
            <StackBadge stack={project.stack} size="sm" className="font-bold font-['Source_Code_Pro']" />
          </div>

          {/* Owner Info */}
          <div className="pt-4 border-t border-[#4ad3e5]/20 flex items-center gap-2">
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
          <div className="mt-3 pt-3 border-t border-[#4ad3e5]/20">
            <span className="text-xs text-[var(--color-gray-blue)] font-['Source_Code_Pro']">
              🔒 Inicia sesión para ver detalles y participar
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
