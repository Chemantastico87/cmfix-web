import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserRole } from '../types';
import { supabase, isSupabaseConfigured } from '../services/supabase';

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  isCreator?: boolean;
}

export interface ManagedUser {
  id: string;
  name: string;
  email: string;
  username: string;
  password: string;
  role: UserRole;
  active: boolean;
  createdAt: string;
  createdBy?: string;
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
  // Gestión de Plantilla / Usuarios
  managedUsers: ManagedUser[];
  getManagedUsers: () => ManagedUser[];
  createManagedUser: (userData: {
    name: string;
    email: string;
    username?: string;
    password: string;
    role: UserRole;
  }) => { success: boolean; error?: string; user?: ManagedUser };
  updateManagedUser: (id: string, updates: Partial<ManagedUser>) => { success: boolean; error?: string };
  deleteManagedUser: (id: string) => { success: boolean; error?: string };
  changeManagedUserPassword: (id: string, newPass: string) => { success: boolean; error?: string };
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const SESSION_AUTH_KEY = 'cmfix_active_session';
const CUSTOM_PASSWORDS_KEY = 'cmfix_custom_passwords';
const MANAGED_USERS_KEY = 'cmfix_custom_users';

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

function getStoredManagedUsers(): ManagedUser[] {
  try {
    const raw = localStorage.getItem(MANAGED_USERS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveStoredManagedUsers(data: ManagedUser[]): void {
  try {
    localStorage.setItem(MANAGED_USERS_KEY, JSON.stringify(data));
  } catch (err) {
    console.error('Error saving managed users:', err);
  }
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [managedUsers, setManagedUsers] = useState<ManagedUser[]>([]);

  useEffect(() => {
    const initAuth = async () => {
      // 1. Limpiar completamente cualquier sesión antigua guardada en localStorage
      try {
        localStorage.removeItem('cmfix_auth_session');
        localStorage.removeItem('cmfix_auth');
      } catch {}

      // 2. Cargar lista de usuarios creados
      setManagedUsers(getStoredManagedUsers());

      // 3. Comprobar sesión activa persistente (localStorage o sessionStorage)
      try {
        const saved = localStorage.getItem(SESSION_AUTH_KEY) || sessionStorage.getItem(SESSION_AUTH_KEY);
        if (saved) {
          const parsed = JSON.parse(saved);
          const isTech = parsed.isCreator ?? (parsed.email?.includes('tecnic') || parsed.id === 'tech-cmfix');
          setUser({ ...parsed, isCreator: isTech });
        } else {
          setUser(null);
        }
      } catch {
        localStorage.removeItem(SESSION_AUTH_KEY);
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
            const isTech = cleanUser.includes('tecnico') || cleanUser.includes('technico');
            const authUser: AuthUser = {
              id: data.user.id,
              email: data.user.email || cleanUser,
              name: isTech ? 'Técnico Creador (Super Admin)' : 'Maury (Administrador)',
              role: 'ADMIN',
              isCreator: isTech
            };
            setUser(authUser);
            sessionStorage.setItem(SESSION_AUTH_KEY, JSON.stringify(authUser));
            localStorage.setItem(SESSION_AUTH_KEY, JSON.stringify(authUser));
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

      // A) CHEMA (ADMINISTRADOR / SUPER ADMIN)
      const isChemaUser = 
        cleanUser === 'chema@cmfix.es' || 
        cleanUser === 'admin@cmfix.es' || 
        cleanUser === 'chema' || 
        cleanUser === 'admin' ||
        cleanUser === 'tecnico@cmfix.es' ||
        cleanUser === 'tecnico' ||
        cleanUser === 'taller@cmfix.es' ||
        normalizedUser.includes('chema');

      const currentAdminPass = customStore.admin?.password || DEFAULT_PASSWORDS.admin;
      const isChemaPass = 
        cleanPass === currentAdminPass || 
        cleanPass === 'ChemaFix2026!' || 
        cleanPass === 'chema123' ||
        cleanPass === 'mauri123' || 
        cleanPass === 'maury123' ||
        cleanPass === 'tecnico123';

      if (isChemaUser && isChemaPass) {
        const adminUser: AuthUser = {
          id: 'admin-chema',
          email: 'admin@cmfix.es',
          name: 'Chema (Administrador)',
          role: 'ADMIN',
          isCreator: true
        };
        setUser(adminUser);
        sessionStorage.setItem(SESSION_AUTH_KEY, JSON.stringify(adminUser));
        localStorage.setItem(SESSION_AUTH_KEY, JSON.stringify(adminUser));
        setLoading(false);
        return { success: true };
      }

      // B) MAURY (ADMINISTRADOR TALLER)
      const isMauryUser = 
        cleanUser === 'maury@cmfix.es' || 
        cleanUser === 'mauri@cmfix.es' || 
        cleanUser === 'cmfixespana@gmail.com' || 
        cleanUser === 'cmfix@gmail.com' || 
        cleanUser === 'maury' || 
        cleanUser === 'mauri' ||
        normalizedUser.includes('maury') ||
        normalizedUser.includes('mauri');

      const currentMauryPass = customStore.tecnico?.password || DEFAULT_PASSWORDS.tecnico;
      const isMauryPass = 
        cleanPass === currentMauryPass || 
        cleanPass === 'MauryFix2026!' || 
        cleanPass === 'MauriFix2026!' ||
        cleanPass === 'mauri123' || 
        cleanPass === 'maury123' ||
        cleanPass === currentAdminPass;

      if (isMauryUser && isMauryPass) {
        const mauryUser: AuthUser = {
          id: 'admin-maury',
          email: 'cmfixespana@gmail.com',
          name: 'Maury (Administrador)',
          role: 'ADMIN',
          isCreator: false
        };
        setUser(mauryUser);
        sessionStorage.setItem(SESSION_AUTH_KEY, JSON.stringify(mauryUser));
        localStorage.setItem(SESSION_AUTH_KEY, JSON.stringify(mauryUser));
        setLoading(false);
        return { success: true };
      }

      // C) USUARIOS CREADOS DE LA PLANTILLA
      const currentManaged = getStoredManagedUsers();
      const matchedManaged = currentManaged.find(u => 
        u.active !== false && 
        (u.email.toLowerCase() === cleanUser || (u.username && u.username.toLowerCase() === cleanUser)) &&
        u.password === cleanPass
      );

      if (matchedManaged) {
        const authUser: AuthUser = {
          id: matchedManaged.id,
          email: matchedManaged.email,
          name: matchedManaged.name,
          role: matchedManaged.role,
          isCreator: false
        };
        setUser(authUser);
        sessionStorage.setItem(SESSION_AUTH_KEY, JSON.stringify(authUser));
        localStorage.setItem(SESSION_AUTH_KEY, JSON.stringify(authUser));
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

  // --- Funciones de Gestión de Plantilla / Nuevos Usuarios ---
  const getManagedUsers = (): ManagedUser[] => {
    return getStoredManagedUsers();
  };

  const createManagedUser = (userData: {
    name: string;
    email: string;
    username?: string;
    password: string;
    role: UserRole;
  }): { success: boolean; error?: string; user?: ManagedUser } => {
    if (!userData.name?.trim()) {
      return { success: false, error: 'El nombre completo es obligatorio.' };
    }
    if (!userData.password || userData.password.trim().length < 4) {
      return { success: false, error: 'La contraseña debe tener al menos 4 caracteres.' };
    }

    const cleanEmail = (userData.email || '').trim().toLowerCase();
    const cleanUsername = (userData.username || cleanEmail.split('@')[0] || '').trim().toLowerCase();

    if (!cleanEmail && !cleanUsername) {
      return { success: false, error: 'Se requiere al menos un correo o nombre de usuario.' };
    }

    const currentUsers = getStoredManagedUsers();
    const exists = currentUsers.some(
      u => (cleanEmail && u.email.toLowerCase() === cleanEmail) || 
           (cleanUsername && u.username.toLowerCase() === cleanUsername)
    );

    if (
      exists || 
      cleanEmail === 'cmfixespana@gmail.com' || 
      cleanEmail === 'tecnico@cmfix.es' || 
      cleanEmail === 'technico@cmfix.es' ||
      cleanUsername === 'maury' ||
      cleanUsername === 'tecnico' ||
      cleanUsername === 'technico'
    ) {
      return { success: false, error: 'Ya existe un usuario o técnico con ese identificador.' };
    }

    const newUser: ManagedUser = {
      id: 'usr-' + Date.now(),
      name: userData.name.trim(),
      email: cleanEmail || `${cleanUsername}@cmfix.es`,
      username: cleanUsername,
      password: userData.password.trim(),
      role: userData.role || 'TECNICO',
      active: true,
      createdAt: new Date().toLocaleDateString('es-ES', { 
        day: '2-digit', 
        month: '2-digit', 
        year: 'numeric' 
      }),
      createdBy: user?.name || 'Técnico Creador'
    };

    const updated = [newUser, ...currentUsers];
    saveStoredManagedUsers(updated);
    setManagedUsers(updated);
    return { success: true, user: newUser };
  };

  const updateManagedUser = (id: string, updates: Partial<ManagedUser>): { success: boolean; error?: string } => {
    const currentUsers = getStoredManagedUsers();
    const index = currentUsers.findIndex(u => u.id === id);
    if (index === -1) {
      return { success: false, error: 'Usuario no encontrado.' };
    }

    currentUsers[index] = { ...currentUsers[index], ...updates };
    saveStoredManagedUsers(currentUsers);
    setManagedUsers([...currentUsers]);
    return { success: true };
  };

  const deleteManagedUser = (id: string): { success: boolean; error?: string } => {
    const currentUsers = getStoredManagedUsers();
    const filtered = currentUsers.filter(u => u.id !== id);
    saveStoredManagedUsers(filtered);
    setManagedUsers(filtered);
    return { success: true };
  };

  const changeManagedUserPassword = (id: string, newPass: string): { success: boolean; error?: string } => {
    if (!newPass || newPass.trim().length < 4) {
      return { success: false, error: 'La nueva contraseña debe tener al menos 4 caracteres.' };
    }
    return updateManagedUser(id, { password: newPass.trim() });
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
      localStorage.removeItem(SESSION_AUTH_KEY);
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
      isSupabaseLive: isSupabaseConfigured,
      managedUsers,
      getManagedUsers,
      createManagedUser,
      updateManagedUser,
      deleteManagedUser,
      changeManagedUserPassword
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
