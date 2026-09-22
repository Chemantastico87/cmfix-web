import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserRole } from '../types';
import { supabase, isSupabaseConfigured } from '../services/supabase';

interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
}

interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  login: (email: string, pass: string, demoRole?: UserRole) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  isSupabaseLive: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const LOCAL_AUTH_KEY = 'cmfix_auth_session';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      if (isSupabaseConfigured && supabase) {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          // Fetch profile
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single();

          setUser({
            id: session.user.id,
            email: session.user.email || '',
            name: profile?.full_name || 'Técnico CM FIX',
            role: (profile?.role as UserRole) || 'ADMIN'
          });
        }
      } else {
        // Local mode session
        const saved = localStorage.getItem(LOCAL_AUTH_KEY);
        if (saved) {
          try {
            setUser(JSON.parse(saved));
          } catch {
            localStorage.removeItem(LOCAL_AUTH_KEY);
          }
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email: string, pass: string, demoRole: UserRole = 'ADMIN'): Promise<{ success: boolean; error?: string }> => {
    setLoading(true);
    try {
      if (isSupabaseConfigured && supabase) {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password: pass
        });
        if (error) {
          setLoading(false);
          return { success: false, error: error.message };
        }
        if (data.user) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', data.user.id)
            .single();

          const authUser: AuthUser = {
            id: data.user.id,
            email: data.user.email || email,
            name: profile?.full_name || 'Técnico CM FIX',
            role: (profile?.role as UserRole) || 'ADMIN'
          };
          setUser(authUser);
          setLoading(false);
          return { success: true };
        }
      }

      // Local / Demo mode login
      const mockUser: AuthUser = {
        id: 'user-' + Date.now(),
        email: email || 'admin@cmfix.es',
        name: demoRole === 'ADMIN' ? 'Chema (Administrador)' : 'Técnico Taller CM FIX',
        role: demoRole
      };
      setUser(mockUser);
      localStorage.setItem(LOCAL_AUTH_KEY, JSON.stringify(mockUser));
      setLoading(false);
      return { success: true };
    } catch (err: any) {
      setLoading(false);
      return { success: false, error: err.message || 'Error al iniciar sesión' };
    }
  };

  const logout = async () => {
    if (isSupabaseConfigured && supabase) {
      await supabase.auth.signOut();
    }
    setUser(null);
    localStorage.removeItem(LOCAL_AUTH_KEY);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, isSupabaseLive: isSupabaseConfigured }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
