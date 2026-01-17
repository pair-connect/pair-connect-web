import React, { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { SectionWrapper } from '@/components/layout/SectionWrapper';

const API_BASE_URL = 'https://crfrnnvmhrmhuqcbvpoh.supabase.co/functions/v1/make-server-39ee6a8c';

// Datos de usuarios con nombres normales
const usersData = [
  {
    name: 'Alex Martínez',
    username: 'alexdev',
    email: 'alex@example.com',
    password: 'password123',
    stack: 'Frontend',
    level: 'Mid',
    languages: ['JavaScript', 'React', 'TypeScript', 'CSS'],
    bio: 'Frontend developer apasionado por crear interfaces increíbles',
    contacts: {
      github: 'https://github.com/alexdev',
      linkedin: 'https://linkedin.com/in/alexdev'
    }
  },
  {
    name: 'Sofía García',
    username: 'sofiacodes',
    email: 'sofia@example.com',
    password: 'password123',
    stack: 'Backend',
    level: 'Senior',
    languages: ['Python', 'Django', 'PostgreSQL', 'Docker'],
    bio: 'Backend engineer especializada en APIs escalables',
    contacts: {
      github: 'https://github.com/sofiacodes',
      linkedin: 'https://linkedin.com/in/sofiacodes'
    }
  },
  {
    name: 'Carlos Ruiz',
    username: 'carlosdev',
    email: 'carlos@example.com',
    password: 'password123',
    stack: 'Fullstack',
    level: 'Mid',
    languages: ['JavaScript', 'Node.js', 'React', 'MongoDB'],
    bio: 'Fullstack developer con experiencia en startups',
    contacts: {
      github: 'https://github.com/carlosdev',
      linkedin: 'https://linkedin.com/in/carlosdev'
    }
  },
  {
    name: 'María López',
    username: 'marialopez',
    email: 'maria@example.com',
    password: 'password123',
    stack: 'Frontend',
    level: 'Junior',
    languages: ['HTML', 'CSS', 'JavaScript', 'Vue'],
    bio: 'Desarrolladora frontend junior aprendiendo React',
    contacts: {
      github: 'https://github.com/marialopez'
    }
  },
  {
    name: 'David Chen',
    username: 'davidchen',
    email: 'david@example.com',
    password: 'password123',
    stack: 'Backend',
    level: 'Mid',
    languages: ['Java', 'Spring Boot', 'MySQL', 'Redis'],
    bio: 'Backend developer con experiencia en sistemas empresariales',
    contacts: {
      github: 'https://github.com/davidchen',
      linkedin: 'https://linkedin.com/in/davidchen'
    }
  },
  {
    name: 'Laura Sánchez',
    username: 'laurasan',
    email: 'laura@example.com',
    password: 'password123',
    stack: 'Fullstack',
    level: 'Senior',
    languages: ['TypeScript', 'Next.js', 'PostgreSQL', 'GraphQL'],
    bio: 'Fullstack engineer con pasión por el código limpio',
    contacts: {
      github: 'https://github.com/laurasan',
      linkedin: 'https://linkedin.com/in/laurasan',
      discord: 'laurasan#1234'
    }
  },
  {
    name: 'Pablo Torres',
    username: 'pablotorres',
    email: 'pablo@example.com',
    password: 'password123',
    stack: 'Frontend',
    level: 'Mid',
    languages: ['React', 'TypeScript', 'Tailwind', 'Next.js'],
    bio: 'Frontend developer especializado en React y diseño UI/UX',
    contacts: {
      github: 'https://github.com/pablotorres'
    }
  },
  {
    name: 'Ana Fernández',
    username: 'anafernandez',
    email: 'ana@example.com',
    password: 'password123',
    stack: 'Backend',
    level: 'Junior',
    languages: ['Python', 'Flask', 'SQLite'],
    bio: 'Backend developer junior aprendiendo Django',
    contacts: {
      github: 'https://github.com/anafernandez'
    }
  }
];

// Datos de proyectos
const projectsData = [
  {
    title: 'E-commerce Platform',
    description: 'Plataforma de comercio electrónico moderna con React y Node.js. Incluye carrito de compras, sistema de pagos y panel de administración.',
    stack: 'Fullstack',
    level: 'Mid',
    languages: ['JavaScript', 'React', 'Node.js', 'MongoDB']
  },
  {
    title: 'Task Management App',
    description: 'Aplicación de gestión de tareas con drag & drop, filtros avanzados y colaboración en tiempo real.',
    stack: 'Frontend',
    level: 'Junior',
    languages: ['React', 'TypeScript', 'CSS']
  },
  {
    title: 'REST API con Django',
    description: 'API REST completa con autenticación JWT, documentación con Swagger y tests unitarios.',
    stack: 'Backend',
    level: 'Senior',
    languages: ['Python', 'Django', 'PostgreSQL']
  },
  {
    title: 'Portfolio Personal',
    description: 'Portfolio personal responsive con animaciones y diseño moderno. Incluye sección de proyectos y contacto.',
    stack: 'Frontend',
    level: 'Junior',
    languages: ['HTML', 'CSS', 'JavaScript']
  },
  {
    title: 'Sistema de Chat',
    description: 'Sistema de chat en tiempo real con WebSockets, salas privadas y notificaciones push.',
    stack: 'Fullstack',
    level: 'Mid',
    languages: ['Node.js', 'Socket.io', 'React', 'MongoDB']
  },
  {
    title: 'Dashboard Analytics',
    description: 'Dashboard de analytics con gráficos interactivos, exportación de datos y filtros personalizados.',
    stack: 'Frontend',
    level: 'Mid',
    languages: ['React', 'TypeScript', 'Chart.js', 'Tailwind']
  },
  {
    title: 'Microservicios con Spring',
    description: 'Arquitectura de microservicios con Spring Boot, API Gateway y service discovery.',
    stack: 'Backend',
    level: 'Senior',
    languages: ['Java', 'Spring Boot', 'Docker', 'Kubernetes']
  },
  {
    title: 'Blog con Next.js',
    description: 'Blog personal con Next.js, Markdown, búsqueda y sistema de comentarios.',
    stack: 'Fullstack',
    level: 'Mid',
    languages: ['Next.js', 'TypeScript', 'Prisma', 'PostgreSQL']
  }
];

// Helper para hacer requests sin auth
const fetchNoAuth = async (url: string, options: RequestInit = {}) => {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Request failed' }));
    throw new Error((error as any).error || `Request failed with status ${response.status}`);
  }

  return response.json();
};

// Helper para hacer requests con auth
const fetchWithAuth = async (url: string, token: string, options: RequestInit = {}) => {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
    ...options.headers,
  };

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Request failed' }));
    throw new Error((error as any).error || `Request failed with status ${response.status}`);
  }

  return response.json();
};

export const SeedDatabase: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);
  const [completed, setCompleted] = useState(false);

  const addLog = (message: string) => {
    setLogs(prev => [...prev, message]);
    console.log(message);
  };

  const seedDatabase = async () => {
    setLoading(true);
    setLogs([]);
    setCompleted(false);

    const createdUsers: Array<{ user: any; token: string }> = [];
    const createdProjects: any[] = [];

    try {
      // 1. Crear usuarios
      addLog('📝 Creando usuarios...');
      for (const userData of usersData) {
        try {
          // Intentar crear usuario
          const signupResponse: any = await fetchNoAuth(`${API_BASE_URL}/auth/signup`, {
            method: 'POST',
            body: JSON.stringify({
              name: userData.name,
              username: userData.username,
              email: userData.email,
              password: userData.password,
            }),
          });

          let token: string;
          let user: any;

          if (signupResponse.needsLogin) {
            // Si necesita login, hacer login
            const loginResponse: any = await fetchNoAuth(`${API_BASE_URL}/auth/login`, {
              method: 'POST',
              body: JSON.stringify({
                email: userData.email,
                password: userData.password,
              }),
            });

            token = loginResponse.accessToken;
            user = loginResponse.user;
          } else if (signupResponse.user) {
            // Usuario creado directamente
            user = signupResponse.user;
            // Necesitamos hacer login para obtener el token
            const loginResponse: any = await fetchNoAuth(`${API_BASE_URL}/auth/login`, {
              method: 'POST',
              body: JSON.stringify({
                email: userData.email,
                password: userData.password,
              }),
            });
            token = loginResponse.accessToken;
          } else {
            // Usuario ya existe, intentar login
            const loginResponse: any = await fetchNoAuth(`${API_BASE_URL}/auth/login`, {
              method: 'POST',
              body: JSON.stringify({
                email: userData.email,
                password: userData.password,
              }),
            });
            token = loginResponse.accessToken;
            user = loginResponse.user;
          }

          // Actualizar perfil con datos completos
          await fetchWithAuth(
            `${API_BASE_URL}/users/${user.id}`,
            token,
            {
              method: 'PUT',
              body: JSON.stringify({
                stack: userData.stack,
                level: userData.level,
                languages: userData.languages,
                bio: userData.bio,
                contacts: userData.contacts,
              }),
            }
          );

          createdUsers.push({ user: { ...user, ...userData }, token });
          addLog(`  ✅ Usuario creado: ${userData.username} (${userData.name})`);
        } catch (error: any) {
          addLog(`  ❌ Error creando usuario ${userData.username}: ${error.message}`);
        }
      }

      addLog(`\n✅ ${createdUsers.length} usuarios creados\n`);

      // 2. Crear proyectos
      addLog('📁 Creando proyectos...');
      for (let i = 0; i < projectsData.length && i < createdUsers.length; i++) {
        const projectData = projectsData[i];
        const { user, token } = createdUsers[i];

        try {
          const project: any = await fetchWithAuth(
            `${API_BASE_URL}/projects`,
            token,
            {
              method: 'POST',
              body: JSON.stringify({
                title: projectData.title,
                description: projectData.description,
                stack: projectData.stack,
                level: projectData.level,
                languages: projectData.languages,
              }),
            }
          );

          createdProjects.push({ ...project, ownerToken: token });
          addLog(`  ✅ Proyecto creado: ${projectData.title} (por ${user.username})`);
        } catch (error: any) {
          addLog(`  ❌ Error creando proyecto ${projectData.title}: ${error.message}`);
        }
      }

      addLog(`\n✅ ${createdProjects.length} proyectos creados\n`);

      // 3. Crear sesiones
      addLog('📅 Creando sesiones...');
      const sessionCounts = [2, 1, 3, 1, 2, 1, 2, 1]; // Sesiones por proyecto

      for (let i = 0; i < createdProjects.length; i++) {
        const project = createdProjects[i];
        const sessionCount = sessionCounts[i] || 1;

        for (let j = 0; j < sessionCount; j++) {
          try {
            // Fecha futura (próximos 7-30 días)
            const daysFromNow = 7 + Math.floor(Math.random() * 23);
            const sessionDate = new Date();
            sessionDate.setDate(sessionDate.getDate() + daysFromNow);
            sessionDate.setHours(10 + Math.floor(Math.random() * 8), 0, 0, 0);

            const durations = [60, 90, 120, 150];
            const duration = durations[Math.floor(Math.random() * durations.length)];

            const sessionTitles = [
              'Implementar funcionalidad principal',
              'Refactorizar código legacy',
              'Agregar tests unitarios',
              'Optimizar rendimiento',
              'Implementar nuevas features',
              'Code review y mejoras',
            ];

            const sessionDescriptions = [
              'Vamos a trabajar en la implementación de la funcionalidad principal del proyecto.',
              'Necesitamos refactorizar código legacy para mejorar mantenibilidad.',
              'Sesión enfocada en escribir tests unitarios para aumentar cobertura.',
              'Optimización de queries y rendimiento general de la aplicación.',
              'Implementación de nuevas features solicitadas por el equipo.',
              'Code review y aplicación de mejoras sugeridas.',
            ];

            const titleIndex = Math.floor(Math.random() * sessionTitles.length);

            const session: any = await fetchWithAuth(
              `${API_BASE_URL}/sessions`,
              project.ownerToken,
              {
                method: 'POST',
                body: JSON.stringify({
                  projectId: project.id,
                  title: sessionTitles[titleIndex],
                  description: sessionDescriptions[titleIndex],
                  date: sessionDate.toISOString(),
                  duration: duration,
                  maxParticipants: 3 + Math.floor(Math.random() * 3), // 3-5 participantes
                  link: `https://meet.google.com/${Math.random().toString(36).substring(7)}`,
                }),
              }
            );

            addLog(`  ✅ Sesión creada: ${session.title} (${sessionDate.toLocaleDateString('es-ES')})`);
          } catch (error: any) {
            addLog(`  ❌ Error creando sesión para proyecto ${project.title}: ${error.message}`);
          }
        }
      }

      // 4. Agregar interés en algunos proyectos
      addLog('\n💖 Agregando interés en proyectos...');
      for (let i = 0; i < createdProjects.length; i++) {
        const project = createdProjects[i];
        
        // Algunos usuarios muestran interés en proyectos que no son suyos
        const interestedUsers = createdUsers
          .filter(u => u.user.id !== project.ownerId)
          .slice(0, Math.floor(Math.random() * 3) + 1); // 1-3 usuarios interesados

        for (const interestedUser of interestedUsers) {
          try {
            await fetchWithAuth(
              `${API_BASE_URL}/projects/${project.id}/interested`,
              interestedUser.token,
              { method: 'POST' }
            );
            addLog(`  ✅ ${interestedUser.user.username} mostró interés en "${project.title}"`);
          } catch (error) {
            // Ignorar errores silenciosamente
          }
        }
      }

      addLog('\n🎉 ¡Seeding completado exitosamente!');
      addLog(`\n📊 Resumen:`);
      addLog(`   - ${createdUsers.length} usuarios creados`);
      addLog(`   - ${createdProjects.length} proyectos creados`);
      addLog(`   - Sesiones creadas para cada proyecto`);
      addLog(`   - Interés agregado en varios proyectos\n`);
      
      setCompleted(true);

    } catch (error: any) {
      addLog(`\n❌ Error durante el seeding: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen">
      <SectionWrapper verticalPadding="py-12" maxWidth="max-w-4xl">
        <Card className="p-8">
          <h1 className="text-3xl font-bold gradient-text font-poppins mb-4">
            🌱 Seeding de Base de Datos
          </h1>
          <p className="text-light-secondary mb-6">
            Este script poblará la base de datos con usuarios, proyectos y sesiones de prueba.
          </p>

          <div className="mb-6">
            <Button
              onClick={seedDatabase}
              disabled={loading}
              variant="primary"
              className="w-full md:w-auto"
            >
              {loading ? 'Poblando base de datos...' : '🚀 Ejecutar Seeding'}
            </Button>
          </div>

          {logs.length > 0 && (
            <div className="bg-[#0b0c10] rounded-lg p-4 border border-[#4ad3e5]/30 max-h-96 overflow-y-auto">
              <div className="space-y-1 font-mono text-sm">
                {logs.map((log, index) => (
                  <div key={index} className="text-[#8fa6bc]">
                    {log}
                  </div>
                ))}
              </div>
            </div>
          )}

          {completed && (
            <div className="mt-6 p-4 bg-cyan/20 border border-cyan rounded-lg">
              <p className="text-cyan font-bold">
                ✅ Seeding completado. Puedes cerrar esta página y ver los datos en la aplicación.
              </p>
            </div>
          )}

          <div className="mt-8 pt-6 border-t border-[#4ad3e5]/30">
            <h3 className="text-xl font-bold mb-4 font-poppins">Credenciales de prueba:</h3>
            <div className="space-y-2 text-sm">
              <p className="text-light-secondary">
                Todos los usuarios tienen la contraseña: <code className="bg-[#13161d] px-2 py-1 rounded">password123</code>
              </p>
              <div className="grid md:grid-cols-2 gap-2 mt-4">
                {usersData.map((user) => (
                  <div key={user.email} className="bg-[#13161d] p-3 rounded border border-[#4ad3e5]/20">
                    <p className="font-bold text-cyan">{user.username}</p>
                    <p className="text-xs text-[#8fa6bc]">{user.email}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Card>
      </SectionWrapper>
    </div>
  );
};
