import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserRole } from '../types';
import { supabase, isSupabaseConfigured } from '../services/supabase';

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
}

export interface StoredPasswordInfo {
  password: string;
  updatedAt: string;
}

export interface CustomPasswordsStore {
  admin?: StoredPasswordInfo;
  tecnico?: StoredPasswordInfo;
}

interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  login: (email: string, pass: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  changePassword: (
    target: 'admin' | 'tecnico',
    currentPass: string,
    newPass: string,
    isOverride?: boolean
  ) => Promise<{ success: boolean; error?: string }>;
  getPasswordsInfo: () => { adminUpdatedAt?: string; tecnicoUpdatedAt?: string };
  resetToDefaultPassword: (target: 'admin' | 'tecnico') => void;
  isSupabaseLive: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const SESSION_AUTH_KEY = 'cmfix_active_session';
const CUSTOM_PASSWORDS_KEY = 'cmfix_custom_passwords';

const DEFAULT_PASSWORDS = {
  admin: 'mauri123',
  tecnico: 'tecnico123'
};

function getStoredPasswords(): CustomPasswordsStore {
  try {
    const raw = localStorage.getItem(CUSTOM_PASSWORDS_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function saveStoredPasswords(data: CustomPasswordsStore): void {
  try {
    localStorage.setItem(CUSTOM_PASSWORDS_KEY, JSON.stringify(data));
  } catch (err) {
    console.error('Error saving custom passwords:', err);
  }
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      // 1. Limpiar completamente cualquier sesión antigua guardada en localStorage
      try {
        localStorage.removeItem('cmfix_auth_session');
        localStorage.removeItem('cmfix_auth');
      } catch {}

      // 2. Comprobar únicamente la sesión activa de la pestaña actual (sessionStorage)
      try {
        const saved = sessionStorage.getItem(SESSION_AUTH_KEY);
        if (saved) {
          const parsed = JSON.parse(saved);
          setUser({ ...parsed, role: 'ADMIN' });
        } else {
          setUser(null);
        }
      } catch {
        sessionStorage.removeItem(SESSION_AUTH_KEY);
        setUser(null);
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
      // 1. Supabase Auth (si está disponible y responde)
      if (isSupabaseConfigured && supabase) {
        try {
          const { data, error } = await supabase.auth.signInWithPassword({
            email: cleanUser,
            password: cleanPass
          });
          if (!error && data.user) {
            const isTech = cleanUser.includes('tecnico');
            const authUser: AuthUser = {
              id: data.user.id,
              email: data.user.email || cleanUser,
              name: isTech ? 'Técnico de Taller CM FIX' : 'Maury (Administrador)',
              role: 'ADMIN' // Mismos derechos
            };
            setUser(authUser);
            sessionStorage.setItem(SESSION_AUTH_KEY, JSON.stringify(authUser));
            setLoading(false);
            return { success: true };
          }
        } catch (err) {
          console.warn('Supabase auth attempt error:', err);
        }
      }

      // 2. Comprobar contraseñas personalizadas y credenciales oficiales
      const customStore = getStoredPasswords();
      const normalizedUser = cleanUser.normalize("NFD").replace(/[\u0300-\u036f]/g, "");

      // A) MAURY (ADMINISTRADOR)
      const isMauryUser = 
        cleanUser === 'maury@cmfix.es' || 
        cleanUser === 'mauri@cmfix.es' || 
        cleanUser === 'cmfixespana@gmail.com' || 
        cleanUser === 'cmfix@gmail.com' || 
        cleanUser === 'admin@cmfix.es' ||
        cleanUser === 'maury' || 
        cleanUser === 'mauri' ||
        cleanUser === 'admin' ||
        normalizedUser.includes('maury') ||
        normalizedUser.includes('mauri');

      const currentAdminPass = customStore.admin?.password || DEFAULT_PASSWORDS.admin;
      const isMauryPass = 
        cleanPass === currentAdminPass || 
        cleanPass === 'MauryFix2026!' || 
        cleanPass === 'MauriFix2026!' ||
        cleanPass === 'mauri123' || 
        cleanPass === 'maury123';

      if (isMauryUser && isMauryPass) {
        const adminUser: AuthUser = {
          id: 'admin-maury',
          email: 'cmfixespana@gmail.com',
          name: 'Maury (Administrador)',
          role: 'ADMIN'
        };
        setUser(adminUser);
        sessionStorage.setItem(SESSION_AUTH_KEY, JSON.stringify(adminUser));
        setLoading(false);
        return { success: true };
      }

      // B) TÉCNICO DE TALLER (ADMINISTRADOR TÉCNICO - MISMOS DERECHOS)
      const isTecnicoUser = 
        cleanUser === 'tecnico@cmfix.es' || 
        cleanUser === 'technico@cmfix.es' || 
        cleanUser === 'taller@cmfix.es' || 
        cleanUser === 'tech@cmfix.es' ||
        cleanUser === 'tecnico' ||
        cleanUser === 'technico' ||
        cleanUser === 'tech' ||
        cleanUser === 'taller' ||
        normalizedUser.includes('tecnic') ||
        normalizedUser.includes('technic') ||
        normalizedUser.includes('taller');

      const currentTecnicoPass = customStore.tecnico?.password || DEFAULT_PASSWORDS.tecnico;
      const isTecnicoPass = 
        cleanPass === currentTecnicoPass || 
        cleanPass === 'TecnicoFix2026!' || 
        cleanPass === 'TechnicoFix2026!' ||
        cleanPass === 'tecnico123' || 
        cleanPass === 'technico123';

      if (isTecnicoUser && isTecnicoPass) {
        const techUser: AuthUser = {
          id: 'tech-cmfix',
          email: 'tecnico@cmfix.es',
          name: 'Técnico de Taller CM FIX',
          role: 'ADMIN' // Mismos derechos que Maury
        };
        setUser(techUser);
        sessionStorage.setItem(SESSION_AUTH_KEY, JSON.stringify(techUser));
        setLoading(false);
        return { success: true };
      }

      setLoading(false);
      return { 
        success: false, 
        error: 'Usuario o contraseña incorrectos. Compruebe los datos e intente de nuevo.' 
      };
    } catch (err: any) {
      setLoading(false);
      return { success: false, error: err.message || 'Error al iniciar sesión' };
    }
  };

  const changePassword = async (
    target: 'admin' | 'tecnico',
    currentPass: string,
    newPass: string,
    isOverride = false
  ): Promise<{ success: boolean; error?: string }> => {
    if (!newPass || newPass.trim().length < 4) {
      return { success: false, error: 'La nueva contraseña debe tener al menos 4 caracteres.' };
    }

    const customStore = getStoredPasswords();
    const activePass = target === 'admin'
      ? (customStore.admin?.password || DEFAULT_PASSWORDS.admin)
      : (customStore.tecnico?.password || DEFAULT_PASSWORDS.tecnico);

    // Validar contraseña actual si no es override administrativo
    if (!isOverride) {
      const trimmedCurrent = currentPass.trim();
      const validCurrent = (target === 'admin')
        ? (trimmedCurrent === activePass || trimmedCurrent === 'mauri123' || trimmedCurrent === 'maury123' || trimmedCurrent === 'MauryFix2026!' || trimmedCurrent === 'MauriFix2026!')
        : (trimmedCurrent === activePass || trimmedCurrent === 'tecnico123' || trimmedCurrent === 'technico123' || trimmedCurrent === 'TecnicoFix2026!' || trimmedCurrent === 'TechnicoFix2026!');

      if (!validCurrent) {
        return { success: false, error: 'La contraseña actual no es correcta.' };
      }
    }

    // Guardar nueva contraseña
    const now = new Date().toLocaleString('es-ES', { 
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric', 
      hour: '2-digit', 
      minute: '2-digit' 
    });

    if (target === 'admin') {
      customStore.admin = {
        password: newPass.trim(),
        updatedAt: now
      };
    } else {
      customStore.tecnico = {
        password: newPass.trim(),
        updatedAt: now
      };
    }

    saveStoredPasswords(customStore);

    // Si hay sesión en Supabase activa, actualizar contraseña remota
    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.auth.updateUser({ password: newPass.trim() });
      } catch (err) {
        console.warn('Could not sync password update to Supabase Auth:', err);
      }
    }

    return { success: true };
  };

  const getPasswordsInfo = () => {
    const customStore = getStoredPasswords();
    return {
      adminUpdatedAt: customStore.admin?.updatedAt,
      tecnicoUpdatedAt: customStore.tecnico?.updatedAt
    };
  };

  const resetToDefaultPassword = (target: 'admin' | 'tecnico') => {
    const customStore = getStoredPasswords();
    if (target === 'admin') {
      delete customStore.admin;
    } else {
      delete customStore.tecnico;
    }
    saveStoredPasswords(customStore);
  };

  const logout = async () => {
    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.auth.signOut();
      } catch {}
    }
    setUser(null);
    try {
      sessionStorage.removeItem(SESSION_AUTH_KEY);
      localStorage.removeItem('cmfix_auth_session');
      localStorage.removeItem('cmfix_auth');
    } catch {}
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      loading, 
      login, 
      logout, 
      changePassword, 
      getPasswordsInfo,
      resetToDefaultPassword,
      isSupabaseLive: isSupabaseConfigured 
    }}>
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
