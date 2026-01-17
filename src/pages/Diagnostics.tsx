import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { projectId, publicAnonKey } from '@/utils/supabase/info';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/utils/supabase/client';

const API_BASE_URL = `https://${projectId}.supabase.co/functions/v1/make-server-39ee6a8c`;

export const Diagnostics: React.FC = () => {
  const { user } = useAuth();
  const [logs, setLogs] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [dbStats, setDbStats] = useState<any>(null);

  const addLog = (message: string, type: 'info' | 'success' | 'error' | 'warning' = 'info') => {
    const emoji = type === 'success' ? '✅' : type === 'error' ? '❌' : type === 'warning' ? '⚠️' : 'ℹ️';
    setLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${emoji} ${message}`]);
  };

  // Check database status
  const checkDatabase = async () => {
    setLogs([]);
    setLoading(true);
    addLog('Verificando estado de la base de datos...');

    try {
      // 1. Health check
      addLog('Probando conexión con el servidor...');
      const healthResponse = await fetch(`${API_BASE_URL}/health`, {
        headers: { 'Authorization': `Bearer ${publicAnonKey}` }
      });

      if (!healthResponse.ok) {
        addLog('Error: El servidor no responde', 'error');
        return;
      }
      addLog('Servidor funcionando correctamente', 'success');

      // 2. Get users
      addLog('Consultando usuarios...');
      const usersResponse = await fetch(`${API_BASE_URL}/users`, {
        headers: { 'Authorization': `Bearer ${publicAnonKey}` }
      });

      if (!usersResponse.ok) {
        addLog('Error obteniendo usuarios', 'error');
      } else {
        const users = await usersResponse.json();
        addLog(`Usuarios en BD: ${users.length}`, users.length > 0 ? 'success' : 'warning');
        if (users.length > 0) {
          users.forEach((u: { name?: string; email?: string }) => {
            addLog(`  • ${u.name || 'Sin nombre'} (${u.email || 'Sin email'})`, 'info');
          });
        }
      }

      // 3. Get projects
      addLog('Consultando proyectos...');
      const projectsResponse = await fetch(`${API_BASE_URL}/projects`, {
        headers: { 'Authorization': `Bearer ${publicAnonKey}` }
      });

      if (!projectsResponse.ok) {
        addLog('Error obteniendo proyectos', 'error');
      } else {
        const projects = await projectsResponse.json();
        addLog(`Proyectos en BD: ${projects.length}`, projects.length > 0 ? 'success' : 'warning');
        if (projects.length > 0) {
          projects.slice(0, 5).forEach((p: { title?: string }) => {
            addLog(`  • ${p.title || 'Sin título'}`, 'info');
          });
        }
      }

      // 4. Get sessions
      addLog('Consultando sesiones...');
      const sessionsResponse = await fetch(`${API_BASE_URL}/sessions`, {
        headers: { 'Authorization': `Bearer ${publicAnonKey}` }
      });

      if (!sessionsResponse.ok) {
        addLog('Error obteniendo sesiones', 'error');
      } else {
        const sessions = await sessionsResponse.json();
        addLog(`Sesiones en BD: ${sessions.length}`, sessions.length > 0 ? 'success' : 'warning');
        if (sessions.length > 0) {
          sessions.slice(0, 5).forEach((s: { title?: string }) => {
            addLog(`  • ${s.title || 'Sin título'}`, 'info');
          });
        }
      }

      addLog('Diagnóstico completado', 'success');

    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      addLog(`Error fatal: ${errorMessage}`, 'error');
      console.error('Diagnostic error:', error);
    } finally {
      setLoading(false);
    }
  };

  // Auto-check on mount
  useEffect(() => {
    checkDatabase();
  }, []);

  // Seed one simple user, project, and session
  const runSimpleSeed = async () => {
    setLoading(true);
    setLogs([]);
    
    try {
      // Generate unique identifiers
      const timestamp = Date.now();
      const randomNum = Math.floor(Math.random() * 1000);
      const uniqueId = `${timestamp}_${randomNum}`;
      
      const testEmail = `ana.garcia.${uniqueId}@test.com`;
      const testPassword = 'password123';
      
      // 1. Create a test user
      addLog('Creando usuario de prueba...');
      const signupResponse = await fetch(`${API_BASE_URL}/auth/signup`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${publicAnonKey}`
        },
        body: JSON.stringify({
          name: `Ana García ${randomNum}`,
          username: `ana_dev_${uniqueId}`,
          email: testEmail,
          password: testPassword,
        }),
      });

      if (!signupResponse.ok) {
        const errorText = await signupResponse.text();
        console.error('Signup error response:', errorText);
        
        try {
          const error = JSON.parse(errorText);
          addLog(`❌ Error creando usuario: ${error.error || JSON.stringify(error)}`, 'error');
        } catch (e) {
          addLog(`❌ Error creando usuario: ${errorText}`, 'error');
        }
        return;
      }

      const signupData = await signupResponse.json();
      addLog(`Usuario creado: ${testEmail}`, 'success');

      // 2. Login using Supabase client directly
      addLog('Iniciando sesión...');
      const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
        email: testEmail,
        password: testPassword,
      });

      if (loginError || !loginData.session) {
        addLog(`❌ Error iniciando sesión: ${loginError?.message || 'No session'}`, 'error');
        return;
      }

      const accessToken = loginData.session.access_token;
      const newUser = signupData.user;
      addLog('Sesión iniciada', 'success');

      // 3. Update profile with full data
      addLog('Actualizando perfil...');
      await fetch(`${API_BASE_URL}/users/${newUser.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          stack: 'Backend',
          level: 'Mid',
          languages: ['JavaScript', 'TypeScript', 'React'],
          contacts: { email: newUser.email, github: 'ana-dev' },
        }),
      });
      addLog('Perfil actualizado', 'success');

      // 4. Create a project
      addLog('Creando proyecto...');
      const projectResponse = await fetch(`${API_BASE_URL}/projects`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          title: 'Dashboard Analytics',
          description: 'Sistema de analytics en tiempo real con React y D3.js',
          image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800',
          stack: 'Frontend',
          level: 'Mid',
          languages: ['React', 'TypeScript', 'D3.js'],
        }),
      });

      if (!projectResponse.ok) {
        const error = await projectResponse.json();
        addLog(`Error creando proyecto: ${error.error}`, 'error');
        return;
      }

      const project = await projectResponse.json();
      console.log('Project response:', project); // Debug log
      
      if (!project || !project.id) {
        addLog(`Error: Respuesta de proyecto inválida`, 'error');
        console.error('Invalid project response:', project);
        return;
      }
      
      addLog(`Proyecto creado: ${project.title}`, 'success');

      // 5. Create a session
      addLog('Creando sesión...');
      const sessionDate = new Date();
      sessionDate.setDate(sessionDate.getDate() + 7); // Next week

      const sessionResponse = await fetch(`${API_BASE_URL}/sessions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          projectId: project.id,
          title: 'Implementar gráficos interactivos',
          description: 'Vamos a crear visualizaciones de datos con D3.js',
          date: sessionDate.toISOString(),
          duration: 120,
          maxParticipants: 3,
          link: 'https://meet.google.com/abc-defg-hij',
        }),
      });

      if (!sessionResponse.ok) {
        const error = await sessionResponse.json();
        addLog(`Error creando sesión: ${error.error}`, 'error');
        return;
      }

      addLog('Sesión creada', 'success');
      addLog('', 'info');
      addLog('🎉 Seed simple completado!', 'success');
      addLog(`📧 Usuario: ${testEmail} | 🔑 ${testPassword}`, 'info');
      addLog('', 'info');
      addLog('Ve a la página principal para ver la sesión', 'info');

    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      addLog(`Error fatal: ${errorMessage}`, 'error');
      console.error('Seed error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-[#13161d] rounded-[5px] border border-[#65dde6] p-8">
          <h1 className="text-3xl font-bold text-[#65dde6] mb-2 font-['Source_Code_Pro']">
            🔍 Diagnóstico del Sistema
          </h1>
          <p className="text-[#8fa6bc] mb-6 font-['Source_Code_Pro']">
            Verifica el estado de la base de datos y prueba la creación de datos
          </p>

          {/* User Info */}
          {user && (
            <div className="mb-6 p-4 bg-[#4ad3e5]/10 border border-[#4ad3e5] rounded">
              <h3 className="text-[#4ad3e5] font-bold mb-2 font-['Source_Code_Pro']">
                👤 Usuario actual
              </h3>
              <p className="text-[#8fa6bc] text-sm font-['Source_Code_Pro']">
                {user.name} ({user.email})
              </p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <Button
              onClick={checkDatabase}
              disabled={loading}
              className="bg-[#4ad3e5] hover:bg-[#4ad3e5]/80 text-[#13161d]"
            >
              {loading ? '⏳ Verificando...' : '🔍 Verificar Base de Datos'}
            </Button>

            <Button
              onClick={runSimpleSeed}
              disabled={loading}
              className="bg-gradient-to-r from-[#4ad3e5] to-[#ff5da2] hover:opacity-90"
            >
              {loading ? '⏳ Creando...' : '🌱 Crear 1 Usuario + Proyecto + Sesión'}
            </Button>
          </div>

          {/* Navigation */}
          <div className="flex gap-3 mb-6">
            <Button
              onClick={() => window.location.href = '/admin/seed'}
              variant="outline"
              className="border-[#ff5da2] text-[#ff5da2] hover:bg-[#ff5da2]/10"
            >
              🚀 Ir a Seed Completo
            </Button>
            <Button
              onClick={() => window.location.href = '/'}
              variant="outline"
              className="border-[#65dde6] text-[#65dde6] hover:bg-[#65dde6]/10"
            >
              🏠 Volver al inicio
            </Button>
          </div>

          {/* Logs */}
          {logs.length > 0 && (
            <div className="bg-[var(--color-dark-bg)] rounded border border-[#65dde6]/30 p-4 max-h-[500px] overflow-y-auto">
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
        </div>

        {/* Instructions */}
        <div className="mt-6 bg-[#13161d] rounded-[5px] border border-[#ff5da2]/50 p-6">
          <h3 className="text-[#ff5da2] font-bold mb-3 font-['Source_Code_Pro']">
            💡 Instrucciones
          </h3>
          <ul className="text-[#8fa6bc] text-sm space-y-2 font-['Source_Code_Pro']">
            <li>• <strong>Verificar BD:</strong> Muestra cuántos usuarios, proyectos y sesiones hay</li>
            <li>• <strong>Seed Simple:</strong> Crea 1 usuario + 1 proyecto + 1 sesión (rápido para probar)</li>
            <li>• <strong>Seed Completo:</strong> Crea 4 usuarios + 8 proyectos + 12 sesiones (datos completos)</li>
          </ul>
        </div>
      </div>
    </div>
  );
};