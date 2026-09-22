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

  const login = async (inputUser: string, pass: string): Promise<{ success: boolean; error?: string }> => {
    setLoading(true);
    const cleanUser = (inputUser || '').trim().toLowerCase();
    const cleanPass = (pass || '').trim();

    try {
      // 1. If Supabase is connected, try Supabase Auth first
      if (isSupabaseConfigured && supabase) {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: cleanUser,
          password: cleanPass
        });
        if (!error && data.user) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', data.user.id)
            .single();

          const authUser: AuthUser = {
            id: data.user.id,
            email: data.user.email || cleanUser,
            name: profile?.full_name || (cleanUser.includes('maury') ? 'Maury (Administrador)' : 'Técnico CM FIX'),
            role: (profile?.role as UserRole) || 'ADMIN'
          };
          setUser(authUser);
          localStorage.setItem(LOCAL_AUTH_KEY, JSON.stringify(authUser));
          setLoading(false);
          return { success: true };
        }
      }

      // 2. Validate official CM FIX credentials
      // A) MAURY (ADMIN)
      const isMaury = cleanUser === 'maury@cmfix.es' || cleanUser === 'cmfixespana@gmail.com' || cleanUser === 'maury' || cleanUser === 'chema@chemamauri.com' || cleanUser === 'mauri@chemamauri.com';
      const isMauryPass = cleanPass === 'mauri123' || cleanPass === 'MauryFix2026!' || cleanPass === 'chema123' || cleanPass === 'admin';

      if (isMaury && isMauryPass) {
        const adminUser: AuthUser = {
          id: 'admin-maury',
          email: 'cmfixespana@gmail.com',
          name: 'Maury (Administrador)',
          role: 'ADMIN'
        };
        setUser(adminUser);
        localStorage.setItem(LOCAL_AUTH_KEY, JSON.stringify(adminUser));
        setLoading(false);
        return { success: true };
      }

      // B) TECNICO TALLER
      const isTecnico = cleanUser === 'tecnico@cmfix.es' || cleanUser === 'taller@cmfix.es' || cleanUser === 'tecnico';
      const isTecnicoPass = cleanPass === 'tecnico123' || cleanPass === 'TecnicoFix2026!' || cleanPass === 'taller';

      if (isTecnico && isTecnicoPass) {
        const techUser: AuthUser = {
          id: 'tech-cmfix',
          email: 'tecnico@cmfix.es',
          name: 'Técnico Taller CM FIX',
          role: 'TECNICO'
        };
        setUser(techUser);
        localStorage.setItem(LOCAL_AUTH_KEY, JSON.stringify(techUser));
        setLoading(false);
        return { success: true };
      }

      // If credentials do not match
      setLoading(false);
      return { 
        success: false, 
        error: 'Usuario o contraseña incorrectos. Por favor, introduzca las credenciales asignadas para Maury o Técnico.' 
      };
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
