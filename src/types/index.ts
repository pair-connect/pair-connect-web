// Core type definitions for Pair Connect

export type Stack = 'Frontend' | 'Backend' | 'Fullstack';
export type Level = 'Junior' | 'Mid' | 'Senior';
export type Theme = 'light' | 'dark';

export interface PrivacySettings {
  showEmail: boolean;
  showContacts: boolean;
  showProjects: boolean;
  showSessions: boolean;
  showBio: boolean;
  showLanguages: boolean;
  showStack: boolean;
  showLevel: boolean;
}

export interface User {
  id: string;
  username: string;
  name: string;
  email: string;
  avatar?: string;
  bio?: string;
  stack: Stack;
  level: Level;
  languages: string[];
  contacts: {
    email?: string;
    github?: string;
    linkedin?: string;
    discord?: string;
  };
  bookmarks: string[]; // session IDs
  profilePublic?: boolean; // Si el perfil es público o privado
  privacySettings?: PrivacySettings; // Configuración granular de privacidad
}

export interface Project {
  id: string;
  ownerId: string;
  title: string;
  description: string;
  image?: string;
  stack: Stack;
  level: Level;
  languages: string[];
  createdAt: Date;
  interested?: string[]; // user IDs - usuarios interesados en el proyecto
}

export interface Session {
  id: string;
  projectId: string;
  ownerId: string;
  title: string;
  description: string;
  date: Date;
  duration: number; // in minutes
  maxParticipants: number;
  participants: string[]; // user IDs
  interested: string[]; // user IDs
  link?: string | null; // null if user doesn't have access
}

export interface ProjectRequest {
  id: string;
  projectId: string;
  userId: string;
  status: 'pending' | 'accepted' | 'rejected';
  message?: string;
  createdAt: Date;
  updatedAt: Date;
  user?: User; // Populated when fetching requests
}

export interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => void;
  updateProfile: (data: Partial<User>) => Promise<void>;
}

export interface RegisterData {
  name: string;
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
}