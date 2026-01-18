import { apiBaseUrl, publicAnonKey } from '@/utils/supabase/info';
import { User, Project, Session, ProjectRequest } from '@/types';

const API_BASE_URL = apiBaseUrl;

if (!API_BASE_URL) {
  throw new Error('Missing API URL. Please configure VITE_API_URL in your .env.local file.');
}

if (!publicAnonKey) {
  console.error('❌ Missing VITE_SUPABASE_ANON_KEY in .env.local');
  throw new Error('Missing Supabase Anon Key. Please configure VITE_SUPABASE_ANON_KEY in your .env.local file.');
}

// Helper to get auth token from localStorage
const getAuthToken = (): string | null => {
  return localStorage.getItem('accessToken');
};

// Helper to make requests without authentication (for public endpoints)
const fetchNoAuth = async <T = unknown>(url: string, options: RequestInit = {}): Promise<T> => {
  if (!publicAnonKey) {
    throw new Error('Supabase Anon Key is missing. Please check your .env.local file.');
  }

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    'apikey': publicAnonKey, // Required by Supabase even for public endpoints
    'Authorization': `Bearer ${publicAnonKey}`, // Required by Supabase Edge Functions
    ...options.headers,
  };

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(error.error || `Request failed with status ${response.status}`);
  }

  return response.json() as Promise<T>;
};

// Helper to make authenticated requests
const fetchWithAuth = async <T = unknown>(url: string, options: RequestInit = {}): Promise<T> => {
  const token = getAuthToken();
  
  if (!token) {
    throw new Error('No estás autenticado. Por favor, inicia sesión.');
  }

  if (!publicAnonKey) {
    throw new Error('Supabase Anon Key is missing. Please check your .env.local file.');
  }
  
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    'apikey': publicAnonKey, // Required by Supabase Edge Functions
    'Authorization': `Bearer ${token}`,
    ...options.headers,
  };

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (!response.ok) {
    if (response.status === 401) {
      // Token inválido o expirado
      localStorage.removeItem('accessToken');
      // Dispatch custom event to notify AuthContext
      window.dispatchEvent(new CustomEvent('auth:session-expired'));
      throw new Error('Tu sesión ha expirado. Por favor, inicia sesión nuevamente.');
    }
    
    const error = await response.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(error.error || `Request failed with status ${response.status}`);
  }

  return response.json() as Promise<T>;
};

// ==================== USER API ====================

export const userApi = {
  getUser: async (userId: string): Promise<User> => {
    // Public endpoint - users can view other users' profiles
    return fetchNoAuth(`${API_BASE_URL}/users/${userId}`);
  },

  updateUser: async (userId: string, updates: Partial<User>): Promise<User> => {
    // Requires auth - users can only update their own profile
    return fetchWithAuth(`${API_BASE_URL}/users/${userId}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  },

  uploadAvatar: async (userId: string, file: File): Promise<{ avatar: string; user: User }> => {
    // Requires auth - users can only upload their own avatar
    const formData = new FormData();
    formData.append('file', file);

    const token = getAuthToken();
    if (!token) {
      throw new Error('No estás autenticado. Por favor, inicia sesión.');
    }

    if (!publicAnonKey) {
      throw new Error('Supabase Anon Key is missing. Please check your .env.local file.');
    }

    const headers: HeadersInit = {
      'apikey': publicAnonKey, // Required by Supabase Edge Functions
      'Authorization': `Bearer ${token}`,
      // Don't set Content-Type for FormData - browser will set it with boundary
    };

    const response = await fetch(`${API_BASE_URL}/users/${userId}/avatar`, {
      method: 'POST',
      headers,
      body: formData,
    });

    if (!response.ok) {
      if (response.status === 401) {
        // Token inválido o expirado
        localStorage.removeItem('accessToken');
        // Dispatch custom event to notify AuthContext
        window.dispatchEvent(new CustomEvent('auth:session-expired'));
        throw new Error('Tu sesión ha expirado. Por favor, inicia sesión nuevamente.');
      }
      
      const error = await response.json().catch(() => ({ error: 'Upload failed' }));
      throw new Error(error.error || `Upload failed with status ${response.status}`);
    }

    return response.json();
  },

  searchUsers: async (params?: {
    q?: string;
    stack?: string;
    level?: string;
  }): Promise<User[]> => {
    // Public endpoint - anyone can search users
    const searchParams = new URLSearchParams();
    if (params?.q) searchParams.set('q', params.q);
    if (params?.stack) searchParams.set('stack', params.stack);
    if (params?.level) searchParams.set('level', params.level);

    const url = `${API_BASE_URL}/users${searchParams.toString() ? `?${searchParams}` : ''}`;
    return fetchNoAuth(url);
  },
};

// ==================== PROJECT API ====================

export const projectApi = {
  createProject: async (projectData: Omit<Project, 'id' | 'ownerId' | 'createdAt'>): Promise<Project> => {
    return fetchWithAuth(`${API_BASE_URL}/projects`, {
      method: 'POST',
      body: JSON.stringify(projectData),
    });
  },

  getProjects: async (params?: {
    ownerId?: string;
    stack?: string;
    level?: string;
  }): Promise<Project[]> => {
    const searchParams = new URLSearchParams();
    if (params?.ownerId) searchParams.set('ownerId', params.ownerId);
    if (params?.stack) searchParams.set('stack', params.stack);
    if (params?.level) searchParams.set('level', params.level);

    const url = `${API_BASE_URL}/projects${searchParams.toString() ? `?${searchParams}` : ''}`;
    return fetchNoAuth(url);
  },

  getProject: async (projectId: string): Promise<Project> => {
    return fetchNoAuth(`${API_BASE_URL}/projects/${projectId}`);
  },

  updateProject: async (projectId: string, updates: Partial<Project>): Promise<Project> => {
    return fetchWithAuth(`${API_BASE_URL}/projects/${projectId}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  },

  deleteProject: async (projectId: string): Promise<{ success: boolean }> => {
    return fetchWithAuth(`${API_BASE_URL}/projects/${projectId}`, {
      method: 'DELETE',
    });
  },

  toggleInterest: async (projectId: string): Promise<Project> => {
    return fetchWithAuth(`${API_BASE_URL}/projects/${projectId}/interested`, {
      method: 'POST',
    });
  },

  getProjectRequests: async (projectId: string): Promise<ProjectRequest[]> => {
    return fetchWithAuth(`${API_BASE_URL}/projects/${projectId}/requests`);
  },

  updateProjectRequest: async (projectId: string, requestId: string, action: 'accept' | 'reject'): Promise<ProjectRequest> => {
    return fetchWithAuth(`${API_BASE_URL}/projects/${projectId}/requests/${requestId}`, {
      method: 'POST',
      body: JSON.stringify({ action }),
    });
  },
};

// ==================== SESSION API ====================

export const sessionApi = {
  createSession: async (sessionData: Omit<Session, 'id' | 'ownerId' | 'participants' | 'interested'>): Promise<Session> => {
    return fetchWithAuth(`${API_BASE_URL}/sessions`, {
      method: 'POST',
      body: JSON.stringify(sessionData),
    });
  },

  getSessions: async (params?: {
    projectId?: string;
    ownerId?: string;
  }): Promise<Session[]> => {
    const searchParams = new URLSearchParams();
    if (params?.projectId) searchParams.set('projectId', params.projectId);
    if (params?.ownerId) searchParams.set('ownerId', params.ownerId);

    const url = `${API_BASE_URL}/sessions${searchParams.toString() ? `?${searchParams}` : ''}`;
    return fetchNoAuth(url);
  },

  getSession: async (sessionId: string): Promise<Session> => {
    return fetchNoAuth(`${API_BASE_URL}/sessions/${sessionId}`);
  },

  updateSession: async (sessionId: string, updates: Partial<Session>): Promise<Session> => {
    return fetchWithAuth(`${API_BASE_URL}/sessions/${sessionId}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  },

  deleteSession: async (sessionId: string): Promise<{ success: boolean }> => {
    return fetchWithAuth(`${API_BASE_URL}/sessions/${sessionId}`, {
      method: 'DELETE',
    });
  },

  joinSession: async (sessionId: string): Promise<Session> => {
    return fetchWithAuth(`${API_BASE_URL}/sessions/${sessionId}/join`, {
      method: 'POST',
    });
  },

  leaveSession: async (sessionId: string): Promise<Session> => {
    return fetchWithAuth(`${API_BASE_URL}/sessions/${sessionId}/leave`, {
      method: 'POST',
    });
  },

  toggleInterest: async (sessionId: string): Promise<Session> => {
    return fetchWithAuth(`${API_BASE_URL}/sessions/${sessionId}/interested`, {
      method: 'POST',
    });
  },
};

// ==================== BOOKMARK API ====================

export const bookmarkApi = {
  toggleBookmark: async (sessionId: string): Promise<{ bookmarks: string[]; isBookmarked: boolean }> => {
    return fetchWithAuth(`${API_BASE_URL}/bookmarks/toggle`, {
      method: 'POST',
      body: JSON.stringify({ sessionId }),
    });
  },

  getBookmarks: async (): Promise<Session[]> => {
    return fetchWithAuth(`${API_BASE_URL}/bookmarks`);
  },
};

// Export all APIs
export const api = {
  users: userApi,
  projects: projectApi,
  sessions: sessionApi,
  bookmarks: bookmarkApi,
};

export default api;
