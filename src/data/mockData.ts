import { User, Project, Session } from '@/types';

// Lista de lenguajes disponibles
export const availableLanguages = [
  "JavaScript",
  "TypeScript",
  "Python",
  "React",
  "Vue",
  "Angular",
  "Node.js",
  "Express",
  "Django",
  "FastAPI",
  "Java",
  "Spring Boot",
  "Go",
  "Rust",
  "C#",
  ".NET",
  "PHP",
  "Laravel",
  "Ruby",
  "Rails",
  "PostgreSQL",
  "MongoDB",
  "MySQL",
  "Redis",
  "Docker",
  "Kubernetes",
];

// Mock users para seeding
export const mockUsers: User[] = [
  {
    id: 'user1',
    username: 'dev1',
    name: 'Developer One',
    email: 'dev1@example.com',
    avatar: '/avatars/user1.png',
    bio: 'Full stack developer passionate about clean code',
    stack: 'Fullstack',
    level: 'Mid',
    languages: ['JavaScript', 'TypeScript', 'React', 'Node.js'],
    contacts: {
      email: 'dev1@example.com',
      github: 'https://github.com/dev1',
    },
    bookmarks: [],
  },
  {
    id: 'user2',
    username: 'dev2',
    name: 'Developer Two',
    email: 'dev2@example.com',
    avatar: '/avatars/user2.png',
    bio: 'Frontend specialist',
    stack: 'Frontend',
    level: 'Senior',
    languages: ['React', 'TypeScript', 'Vue'],
    contacts: {
      email: 'dev2@example.com',
      github: 'https://github.com/dev2',
    },
    bookmarks: [],
  },
];

// Mock projects para seeding
export const mockProjects: Project[] = [
  {
    id: 'project1',
    ownerId: 'user1',
    title: 'E-commerce Platform',
    description: 'Modern e-commerce platform with React and Node.js',
    image: '/photos/project1.png',
    stack: 'Fullstack',
    level: 'Mid',
    languages: ['JavaScript', 'React', 'Node.js', 'MongoDB'],
    createdAt: new Date(),
    interested: [],
  },
  {
    id: 'project2',
    ownerId: 'user2',
    title: 'Task Management App',
    description: 'Collaborative task management application',
    image: '/photos/project2.png',
    stack: 'Frontend',
    level: 'Junior',
    languages: ['React', 'TypeScript'],
    createdAt: new Date(),
    interested: [],
  },
];

// Mock sessions para seeding
export const mockSessions: Session[] = [
  {
    id: 'session1',
    projectId: 'project1',
    ownerId: 'user1',
    title: 'Setup project structure',
    description: 'Initial project setup and configuration',
    date: new Date(Date.now() + 86400000), // Tomorrow
    duration: 120,
    maxParticipants: 4,
    participants: ['user1'],
    interested: [],
  },
  {
    id: 'session2',
    projectId: 'project2',
    ownerId: 'user2',
    title: 'Implement authentication',
    description: 'Add user authentication system',
    date: new Date(Date.now() + 172800000), // Day after tomorrow
    duration: 90,
    maxParticipants: 3,
    participants: ['user2'],
    interested: [],
  },
];

// Helper function to get project by ID
export const getProjectById = (projectId: string): Project | undefined => {
  return mockProjects.find(project => project.id === projectId);
};
