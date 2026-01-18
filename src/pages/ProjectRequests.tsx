import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Check, X, Mail, User, Calendar } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/utils/api';
import { ProjectRequest, Project, User as UserType } from '@/types';
import { SectionWrapper } from '@/components/layout/SectionWrapper';

export const ProjectRequests: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();

  const [project, setProject] = useState<Project | null>(null);
  const [requests, setRequests] = useState<ProjectRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthenticated || !user) {
      navigate('/?login=true');
      return;
    }

    const fetchData = async () => {
      if (!id) return;

      try {
        setLoading(true);
        const [projectData, requestsData] = await Promise.all([
          api.projects.getProject(id),
          api.projects.getProjectRequests(id),
        ]);

        setProject(projectData);

        // Verify ownership
        if (projectData.ownerId !== user.id) {
          navigate(`/proyectos/${id}`);
          return;
        }

        setRequests(requestsData);
      } catch (error: unknown) {
        console.error('Error fetching requests:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, user, isAuthenticated, navigate]);

  const handleRequestAction = async (requestId: string, action: 'accept' | 'reject') => {
    if (!id) return;

    try {
      setActionLoading(requestId);
      await api.projects.updateProjectRequest(id, requestId, action);
      
      // Refresh requests
      const updatedRequests = await api.projects.getProjectRequests(id);
      setRequests(updatedRequests);
    } catch (error: unknown) {
      console.error(`Error ${action === 'accept' ? 'accepting' : 'rejecting'} request:`, error);
      alert(`Error al ${action === 'accept' ? 'aceptar' : 'rechazar'} la solicitud`);
    } finally {
      setActionLoading(null);
    }
  };

  const formatDate = (date: Date | string) => {
    const d = typeof date === 'string' ? new Date(date) : date;
    return new Intl.DateTimeFormat('es-ES', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(d);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="border-yellow-500 text-yellow-500">Pendiente</Badge>;
      case 'accepted':
        return <Badge variant="outline" className="border-green-500 text-green-500">Aceptada</Badge>;
      case 'rejected':
        return <Badge variant="outline" className="border-red-500 text-red-500">Rechazada</Badge>;
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-white/60">Cargando solicitudes...</p>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card>
          <p className="text-white/60 mb-4">Proyecto no encontrado</p>
          <Button onClick={() => navigate('/mis-proyectos')}>Volver a mis proyectos</Button>
        </Card>
      </div>
    );
  }

  const pendingRequests = requests.filter(r => r.status === 'pending');
  const acceptedRequests = requests.filter(r => r.status === 'accepted');
  const rejectedRequests = requests.filter(r => r.status === 'rejected');

  return (
    <div className="min-h-screen relative">
      <SectionWrapper className="relative z-10">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={() => navigate(`/proyectos/${id}`)}
            className="cursor-pointer p-2 text-white/60 hover:text-[#4ad3e5] transition-colors"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <div>
            <h1 className="text-3xl md:text-5xl font-bold mb-2">
              <span className="text-white">Solicitudes de </span>
              <span className="gradient-text">{project.title}</span>
            </h1>
            <p className="text-white/60">
              Gestiona las solicitudes de participación en tu proyecto
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/60 text-sm mb-1">Pendientes</p>
                <p className="text-3xl font-bold text-yellow-500">{pendingRequests.length}</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-yellow-500/20 flex items-center justify-center">
                <Calendar className="w-6 h-6 text-yellow-500" />
              </div>
            </div>
          </Card>
          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/60 text-sm mb-1">Aceptadas</p>
                <p className="text-3xl font-bold text-green-500">{acceptedRequests.length}</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center">
                <Check className="w-6 h-6 text-green-500" />
              </div>
            </div>
          </Card>
          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/60 text-sm mb-1">Rechazadas</p>
                <p className="text-3xl font-bold text-red-500">{rejectedRequests.length}</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-red-500/20 flex items-center justify-center">
                <X className="w-6 h-6 text-red-500" />
              </div>
            </div>
          </Card>
        </div>

        {/* Pending Requests */}
        {pendingRequests.length > 0 && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-white mb-4">Solicitudes Pendientes</h2>
            <div className="space-y-4">
              {pendingRequests.map((request) => {
                const requester = request.user as UserType;
                return (
                  <Card key={request.id} className="border-2 border-yellow-500/30">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                          {requester.avatar ? (
                            <img
                              src={requester.avatar}
                              alt={requester.name}
                              className="w-12 h-12 rounded-full object-cover border-2 border-[#4ad3e5]"
                            />
                          ) : (
                            <div className="w-12 h-12 rounded-full bg-gradient-to-r from-[#4ad3e5] to-[#ff5da2] flex items-center justify-center text-white font-bold">
                              {requester.name.charAt(0).toUpperCase()}
                            </div>
                          )}
                          <div>
                            <h3 className="text-lg font-bold text-white">{requester.name}</h3>
                            <p className="text-sm text-white/60">@{requester.username}</p>
                          </div>
                          {getStatusBadge(request.status)}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                          <div className="flex items-center gap-2 text-white/60 text-sm">
                            <Mail className="w-4 h-4" />
                            <span>{requester.email}</span>
                          </div>
                          <div className="flex items-center gap-2 text-white/60 text-sm">
                            <Calendar className="w-4 h-4" />
                            <span>Solicitado: {formatDate(request.createdAt)}</span>
                          </div>
                        </div>

                        {requester.bio && (
                          <p className="text-white/80 text-sm mb-4">{requester.bio}</p>
                        )}

                        <div className="flex flex-wrap gap-2 mb-4">
                          <Badge variant="outline" className="border-[#4ad3e5] text-[#4ad3e5]">
                            {requester.stack}
                          </Badge>
                          <Badge variant="outline" className="border-[#ff5da2] text-[#ff5da2]">
                            {requester.level}
                          </Badge>
                          {requester.languages.slice(0, 3).map((lang) => (
                            <Badge key={lang} variant="gradient">
                              {lang}
                            </Badge>
                          ))}
                        </div>

                        {request.message && (
                          <div className="bg-[#13161d] rounded-lg p-4 mb-4 border border-[#4ad3e5]/30">
                            <p className="text-white/80 text-sm">{request.message}</p>
                          </div>
                        )}
                      </div>

                      <div className="flex flex-col gap-2 ml-4">
                        <Button
                          variant="primary"
                          onClick={() => handleRequestAction(request.id, 'accept')}
                          disabled={actionLoading === request.id}
                          className="min-w-[120px]"
                        >
                          {actionLoading === request.id ? (
                            'Procesando...'
                          ) : (
                            <>
                              <Check className="w-4 h-4 mr-2" />
                              Aceptar
                            </>
                          )}
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => handleRequestAction(request.id, 'reject')}
                          disabled={actionLoading === request.id}
                          className="min-w-[120px] border-red-500 text-red-500 hover:bg-red-500/10"
                        >
                          {actionLoading === request.id ? (
                            'Procesando...'
                          ) : (
                            <>
                              <X className="w-4 h-4 mr-2" />
                              Rechazar
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          </div>
        )}

        {/* Accepted Requests */}
        {acceptedRequests.length > 0 && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-white mb-4">Solicitudes Aceptadas</h2>
            <div className="space-y-4">
              {acceptedRequests.map((request) => {
                const requester = request.user as UserType;
                return (
                  <Card key={request.id} className="border-2 border-green-500/30">
                    <div className="flex items-center gap-3">
                      {requester.avatar ? (
                        <img
                          src={requester.avatar}
                          alt={requester.name}
                          className="w-10 h-10 rounded-full object-cover border-2 border-green-500"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-gradient-to-r from-green-500 to-[#4ad3e5] flex items-center justify-center text-white font-bold">
                          {requester.name.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <div className="flex-1">
                        <h3 className="text-white font-bold">{requester.name}</h3>
                        <p className="text-sm text-white/60">@{requester.username}</p>
                      </div>
                      {getStatusBadge(request.status)}
                      <Link
                        to={`/perfil/${requester.id}`}
                        className="text-[#4ad3e5] hover:underline text-sm"
                      >
                        Ver perfil
                      </Link>
                    </div>
                  </Card>
                );
              })}
            </div>
          </div>
        )}

        {/* Rejected Requests */}
        {rejectedRequests.length > 0 && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-white mb-4">Solicitudes Rechazadas</h2>
            <div className="space-y-4">
              {rejectedRequests.map((request) => {
                const requester = request.user as UserType;
                return (
                  <Card key={request.id} className="border-2 border-red-500/30 opacity-60">
                    <div className="flex items-center gap-3">
                      {requester.avatar ? (
                        <img
                          src={requester.avatar}
                          alt={requester.name}
                          className="w-10 h-10 rounded-full object-cover border-2 border-red-500"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-gradient-to-r from-red-500 to-[#ff5da2] flex items-center justify-center text-white font-bold">
                          {requester.name.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <div className="flex-1">
                        <h3 className="text-white font-bold">{requester.name}</h3>
                        <p className="text-sm text-white/60">@{requester.username}</p>
                      </div>
                      {getStatusBadge(request.status)}
                    </div>
                  </Card>
                );
              })}
            </div>
          </div>
        )}

        {/* Empty State */}
        {requests.length === 0 && (
          <Card>
            <div className="text-center py-12">
              <User className="w-16 h-16 text-white/30 mx-auto mb-4" />
              <p className="text-white/60 mb-2">No hay solicitudes aún</p>
              <p className="text-white/40 text-sm">
                Cuando alguien muestre interés en tu proyecto, aparecerá aquí
              </p>
            </div>
          </Card>
        )}
      </SectionWrapper>
    </div>
  );
};
