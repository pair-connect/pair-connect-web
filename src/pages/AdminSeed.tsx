import React, { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/utils/api';
import { mockUsers, mockProjects, mockSessions } from '@/data/mockData';
import { projectId, publicAnonKey } from '@/utils/supabase/info';

const API_BASE_URL = `https://${projectId}.supabase.co/functions/v1/make-server-39ee6a8c`;

export const AdminSeed: React.FC = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);
  const [seedCompleted, setSeedCompleted] = useState(false);

  const addLog = (message: string) => {
    setLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${message}`]);
  };

  const seedDatabase = async () => {
    setLoading(true);
    setLogs([]);
    setSeedCompleted(false);

    try {
      addLog('🌱 Iniciando seed de base de datos...');

      // 1. Create users
      addLog('👥 Creando usuarios...');
      interface CreatedUser {
        oldId: string;
        newId: string;
        accessToken: string;
        email: string;
      }
      const createdUsers: CreatedUser[] = [];

      for (const mockUser of mockUsers) {
        try {
          const response = await fetch(`${API_BASE_URL}/auth/signup`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${publicAnonKey}`,
            },
            body: JSON.stringify({
              name: mockUser.name,
              username: mockUser.username,
              email: mockUser.email,
              password: 'password123',
            }),
          });

          if (!response.ok) {
            const error = await response.json();
            addLog(`❌ Error creando ${mockUser.email}: ${error.error || 'Unknown error'}`);
            continue;
          }

          const { user: newUser, session } = await response.json();

          // Verificar que session y access_token existen
          if (!session || !session.access_token) {
            addLog(`❌ Error: No se obtuvo access_token para ${mockUser.email}`);
            console.error('Missing session or access_token:', { session, newUser });
            continue;
          }

          // Update user profile with full data
          await fetch(`${API_BASE_URL}/users/${newUser.id}`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${session.access_token}`,
            },
            body: JSON.stringify({
              avatar: mockUser.avatar,
              bio: mockUser.bio,
              stack: mockUser.stack,
              level: mockUser.level,
              languages: mockUser.languages,
              contacts: mockUser.contacts,
            }),
          });

          createdUsers.push({
            oldId: mockUser.id,
            newId: newUser.id,
            accessToken: session.access_token,
            email: mockUser.email,
          });

          addLog(`✅ Usuario creado: ${mockUser.email}`);
        } catch (error: unknown) {
          const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
          addLog(`❌ Error con ${mockUser.email}: ${errorMessage}`);
        }
      }

      addLog(`📊 Total de usuarios creados: ${createdUsers.length}`);

      // 2. Create projects
      addLog('📦 Creando proyectos...');
      interface CreatedProject {
        oldId: string;
        newId: string;
      }
      const createdProjects: CreatedProject[] = [];

      for (const mockProject of mockProjects) {
        try {
          const owner = createdUsers.find(u => u.oldId === mockProject.ownerId);
          if (!owner) {
            addLog(`⚠️ Owner no encontrado para proyecto: ${mockProject.title}`);
            continue;
          }

          const response = await fetch(`${API_BASE_URL}/projects`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${owner.accessToken}`,
            },
            body: JSON.stringify({
              title: mockProject.title,
              description: mockProject.description,
              image: mockProject.image,
              stack: mockProject.stack,
              level: mockProject.level,
              languages: mockProject.languages,
            }),
          });

          if (!response.ok) {
            const error = await response.json();
            addLog(`❌ Error creando proyecto ${mockProject.title}: ${error.error}`);
            continue;
          }

          const project = await response.json();
          createdProjects.push({
            oldId: mockProject.id,
            newId: project.id,
          });

          addLog(`✅ Proyecto creado: ${mockProject.title}`);
        } catch (error: unknown) {
          const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
          addLog(`❌ Error con proyecto ${mockProject.title}: ${errorMessage}`);
        }
      }

      addLog(`📊 Total de proyectos creados: ${createdProjects.length}`);

      // 3. Create sessions
      addLog('📅 Creando sesiones...');
      let sessionsCreated = 0;

      for (const mockSession of mockSessions) {
        try {
          const project = createdProjects.find(p => p.oldId === mockSession.projectId);
          const owner = createdUsers.find(u => u.oldId === mockSession.ownerId);

          if (!project || !owner) {
            addLog(`⚠️ Proyecto u owner no encontrado para sesión: ${mockSession.title}`);
            continue;
          }

          const response = await fetch(`${API_BASE_URL}/sessions`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${owner.accessToken}`,
            },
            body: JSON.stringify({
              projectId: project.newId,
              title: mockSession.title,
              description: mockSession.description,
              date: mockSession.date.toISOString(),
              duration: mockSession.duration,
              maxParticipants: mockSession.maxParticipants,
              link: mockSession.link,
            }),
          });

          if (!response.ok) {
            const error = await response.json();
            addLog(`❌ Error creando sesión ${mockSession.title}: ${error.error}`);
            continue;
          }

          sessionsCreated++;
          addLog(`✅ Sesión creada: ${mockSession.title}`);
        } catch (error: unknown) {
          const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
          addLog(`❌ Error con sesión ${mockSession.title}: ${errorMessage}`);
        }
      }

      addLog(`📊 Total de sesiones creadas: ${sessionsCreated}`);

      addLog('🎉 ¡Seed completado exitosamente!');
      addLog('');
      addLog('📝 Credenciales de usuarios de prueba:');
      createdUsers.forEach(user => {
        addLog(`  📧 ${user.email} | 🔑 password123`);
      });

      setSeedCompleted(true);

    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      addLog(`❌ Error fatal: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-[#13161d] rounded-[5px] border border-[#65dde6] p-8">
          <h1 className="text-3xl font-bold text-[#65dde6] mb-2 font-['Source_Code_Pro']">
            🛠️ Admin - Seed Database
          </h1>
          <p className="text-[#8fa6bc] mb-6 font-['Source_Code_Pro']">
            Pobla la base de datos con usuarios, proyectos y sesiones de prueba
          </p>

          <div className="mb-6 p-4 bg-[#0b0c10] rounded border border-[#4ad3e5]/30">
            <h3 className="text-[#4ad3e5] font-bold mb-2 font-['Source_Code_Pro']">
              ℹ️ Información
            </h3>
            <ul className="text-[#8fa6bc] text-sm space-y-1 font-['Source_Code_Pro']">
              <li>• Creará {mockUsers.length} usuarios de prueba</li>
              <li>• Creará {mockProjects.length} proyectos</li>
              <li>• Creará {mockSessions.length} sesiones</li>
              <li>• Contraseña por defecto: <code className="text-[#ff5da2]">password123</code></li>
            </ul>
          </div>

          <Button
            onClick={seedDatabase}
            disabled={loading || seedCompleted}
            className="w-full mb-6"
          >
            {loading ? '⏳ Seeding...' : seedCompleted ? '✅ Seed Completado' : '🚀 Iniciar Seed'}
          </Button>

          {logs.length > 0 && (
            <div className="bg-[#0b0c10] rounded border border-[#65dde6]/30 p-4 max-h-96 overflow-y-auto">
              <h3 className="text-[#65dde6] font-bold mb-3 font-['Source_Code_Pro']">
                📋 Logs
              </h3>
              <div className="space-y-1">
                {logs.map((log, index) => (
                  <div
                    key={index}
                    className={`text-sm font-['Source_Code_Pro'] ${
                      log.includes('❌') ? 'text-[#ff5da2]' :
                      log.includes('✅') ? 'text-[#4ad3e5]' :
                      log.includes('⚠️') ? 'text-[#ffb347]' :
                      'text-[#8fa6bc]'
                    }`}
                  >
                    {log}
                  </div>
                ))}
              </div>
            </div>
          )}

          {seedCompleted && (
            <div className="mt-6 p-4 bg-[#4ad3e5]/10 border border-[#4ad3e5] rounded">
              <h3 className="text-[#4ad3e5] font-bold mb-2 font-['Source_Code_Pro']">
                🎉 ¡Éxito!
              </h3>
              <p className="text-[#8fa6bc] text-sm font-['Source_Code_Pro']">
                La base de datos ha sido poblada. Puedes cerrar esta página y empezar a usar la aplicación.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};