import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, AuthContextType, RegisterData } from '@/types';
import { projectId, publicAnonKey } from '@/utils/supabase/info';
import { supabase } from '@/utils/supabase/client';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const API_BASE_URL = `https://${projectId}.supabase.co/functions/v1/make-server-39ee6a8c`;

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Check for existing session on mount
  useEffect(() => {
    const checkSession = async () => {
      try {
        const savedToken = localStorage.getItem('accessToken');
        
        if (savedToken) {
          // Verify token with server
          const response = await fetch(`${API_BASE_URL}/auth/session`, {
            headers: {
              'Authorization': `Bearer ${savedToken}`,
            },
          });

          if (response.ok) {
            const data = await response.json();
            setUser(data.user);
            setAccessToken(savedToken);
            setIsAuthenticated(true);
          } else {
            // Token invalid, clear it
            localStorage.removeItem('accessToken');
          }
        }
      } catch (error) {
        console.error('Error checking session:', error);
        localStorage.removeItem('accessToken');
      } finally {
        setLoading(false);
      }
    };

    checkSession();
  }, []);

  const login = async (email: string, password: string): Promise<void> => {
    try {
      // Use backend login endpoint
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': publicAnonKey, // Required by Supabase Edge Functions
          'Authorization': `Bearer ${publicAnonKey}`, // Required by Supabase Edge Functions
        },
        body: JSON.stringify({ email, password }),
      });

      console.log('Login response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        let error;
        try {
          error = JSON.parse(errorText);
        } catch {
          error = { error: errorText || 'Invalid login credentials' };
        }
        console.error('Login error response:', error);
        throw new Error(error.error || 'Invalid login credentials');
      }

      const data = await response.json();
      console.log('Login success, received data:', { 
        hasUser: !!data.user, 
        hasToken: !!data.accessToken,
        userId: data.user?.id 
      });

      if (!data.user || !data.accessToken) {
        console.error('Invalid response structure:', data);
        throw new Error('Invalid response from server');
      }

      setUser(data.user);
      setAccessToken(data.accessToken);
      setIsAuthenticated(true);
      
      // Save token to localStorage
      localStorage.setItem('accessToken', data.accessToken);
      
      // Check for redirect after login
      const redirectPath = localStorage.getItem('redirectAfterLogin');
      if (redirectPath) {
        localStorage.removeItem('redirectAfterLogin');
        window.location.href = redirectPath;
      }
      
    } catch (error: unknown) {
      console.error('Login error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to login';
      throw new Error(errorMessage);
    }
  };

  const register = async (data: RegisterData): Promise<void> => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${publicAnonKey}`,
        },
        body: JSON.stringify({
          name: data.name,
          username: data.username,
          email: data.email,
          password: data.password,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        const errorMessage = errorData.error || 'Registration failed';
        throw new Error(errorMessage);
      }

      const responseData = await response.json();
      
      // Si hay token en la respuesta, usarlo directamente (registro exitoso con sesión)
      if (responseData.accessToken && responseData.user) {
        setUser(responseData.user);
        setAccessToken(responseData.accessToken);
        setIsAuthenticated(true);
        localStorage.setItem('accessToken', responseData.accessToken);
        
        // Check for redirect after registration
        const redirectPath = localStorage.getItem('redirectAfterLogin');
        if (redirectPath) {
          localStorage.removeItem('redirectAfterLogin');
          window.location.href = redirectPath;
          return;
        }
        return;
      }
      
      // Si el backend indica que necesita login, hacer login automáticamente
      if (responseData.needsLogin) {
        // Esperar un momento para asegurar que el usuario esté completamente creado
        await new Promise(resolve => setTimeout(resolve, 1000));
        // Hacer login automático después del registro
        await login(data.email, data.password);
        return;
      }
      
      // Si solo hay user pero no token, intentar hacer login
      if (responseData.user) {
        await new Promise(resolve => setTimeout(resolve, 1000));
        await login(data.email, data.password);
      }
      
    } catch (error: unknown) {
      console.error('Registration error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to register';
      throw new Error(errorMessage);
    }
  };

  const logout = async () => {
    try {
      // Sign out from Supabase
      await supabase.auth.signOut();
      
      setUser(null);
      setAccessToken(null);
      setIsAuthenticated(false);
      
      // Clear localStorage
      localStorage.removeItem('accessToken');
      
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const updateProfile = async (updates: Partial<User>): Promise<void> => {
    if (!user || !accessToken) {
      throw new Error('Not authenticated');
    }

    try {
      const response = await fetch(`${API_BASE_URL}/users/${user.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify(updates),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Update failed');
      }

      const updatedUser = await response.json();
      setUser(updatedUser); // Update local state immediately
      
    } catch (error: unknown) {
      console.error('Update profile error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to update profile';
      throw new Error(errorMessage);
    }
  };

  // Don't render children until we've checked for existing session
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, login, register, logout, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};