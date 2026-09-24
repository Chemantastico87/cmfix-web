import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Wrench, 
  FileText, 
  Users, 
  Package, 
  Truck, 
  Settings, 
  Tag, 
  LogOut, 
  ExternalLink, 
  Menu, 
  X, 
  Bell, 
  ShieldCheck,
  KeyRound,
  UserCog,
  Sun,
  Moon,
  Volume2,
  RefreshCw
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { 
  getUnreadNotificationsCount, 
  playNotificationSound 
} from '../services/notificationService';
import { NotificationPrompt } from './NotificationPrompt';
import { NotificationTray } from './NotificationTray';

interface AdminLayoutProps {
  children: React.ReactNode;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  const { user, logout, loading } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(getUnreadNotificationsCount());

  const refreshNotifs = () => {
    setUnreadCount(getUnreadNotificationsCount());
  };

  useEffect(() => {
    window.addEventListener('cmfix:notifications_updated', refreshNotifs);
    window.addEventListener('cmfix:new_quote', refreshNotifs);
    return () => {
      window.removeEventListener('cmfix:notifications_updated', refreshNotifs);
      window.removeEventListener('cmfix:new_quote', refreshNotifs);
    };
  }, []);

  useEffect(() => {
    if (!loading && !user) {
      navigate('/login');
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-brand-dark text-brand-green font-mono">
        Cargando panel CM FIX...
      </div>
    );
  }

  if (!user) return null;

  const navItems = [
    { label: 'Dashboard', path: '/admin', icon: LayoutDashboard },
    { label: 'Reparaciones', path: '/admin/reparaciones', icon: Wrench },
    { label: 'Presupuestos', path: '/admin/presupuestos', icon: FileText },
    { label: 'Notificaciones Maury/Eli', path: '/admin/configuracion', icon: Bell },
    { label: 'Clientes', path: '/admin/clientes', icon: Users },
    { label: 'Inventario / Piezas', path: '/admin/inventario', icon: Package },
    { label: 'Proveedores', path: '/admin/proveedores', icon: Truck },
    { label: 'Catálogo de Precios', path: '/admin/precios', icon: Tag },
    { label: 'Gestión de Equipo', path: '/admin/usuarios', icon: UserCog },
    { label: 'Configuración', path: '/admin/configuracion', icon: Settings },
    { label: 'Cambiar Contraseña', path: '/admin/seguridad', icon: KeyRound },
  ];

  const getCurrentSectionTitle = () => {
    const item = navItems.find(i => i.path === location.pathname);
    return item ? item.label : 'Panel de Control';
  };

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const handleTestSound = () => {
    playNotificationSound();
  };

  return (
    <div className="min-h-screen md:h-screen w-full bg-brand-dark text-slate-100 flex flex-col md:flex-row md:overflow-hidden">
      
      {/* Sidebar for Desktop */}
      <aside className="hidden md:flex flex-col w-64 md:h-screen bg-brand-carbon border-r border-brand-border/80 shrink-0">
        
        {/* Brand header */}
        <div className="p-4 border-b border-brand-border/60 flex items-center justify-between relative">
          <Link to="/admin" className="flex items-center gap-3">
            <img 
              src="/cmfix-logo.png" 
              alt="CM FIX" 
              className="h-8 w-auto object-contain filter drop-shadow-[0_0_8px_rgba(34,197,94,0.4)]" 
            />
          </Link>

          <div className="flex items-center gap-1.5">
            {/* Sidebar Bell Button */}
            <button
              onClick={() => setNotifOpen(true)}
              className={`p-1.5 rounded-lg border transition-all relative ${
                unreadCount > 0 
                  ? 'bg-brand-green/20 border-brand-green text-brand-green shadow-neon-sm' 
                  : 'bg-brand-surface border-brand-border text-slate-400 hover:text-white'
              }`}
              title="Centro de Notificaciones de Presupuestos"
            >
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-500 text-white font-mono text-[9px] font-black flex items-center justify-center animate-pulse">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>

            <button
              onClick={toggleTheme}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white bg-brand-surface border border-brand-border transition-colors"
              title={theme === 'dark' ? 'Cambiar a Modo Claro' : 'Cambiar a Modo Oscuro'}
            >
              {theme === 'dark' ? <Sun className="w-3.5 h-3.5 text-amber-400" /> : <Moon className="w-3.5 h-3.5 text-sky-400" />}
            </button>
          </div>
        </div>

        {/* User preview */}
        <div className="p-4 border-b border-brand-border/40 bg-brand-surface/40">
          <p className="text-xs text-slate-400">Sesión activa:</p>
          <p className="text-xs font-bold text-white truncate">{user.name}</p>
          <p className="text-[10px] text-brand-green font-mono truncate uppercase">{user.role}</p>
          <Link
            to="/admin/seguridad"
            className="mt-2 inline-flex items-center gap-1.5 text-[11px] font-semibold text-brand-green hover:underline"
          >
            <KeyRound className="w-3 h-3" />
            <span>Cambiar contraseña</span>
          </Link>
        </div>

        {/* Nav links */}
        <nav className="p-3 space-y-1 flex-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            const isQuotesTab = item.path === '/admin/presupuestos';
            const isNotifTab = item.label.includes('Notificaciones');

            return (
              <Link
                key={item.path + item.label}
                to={item.path}
                className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-brand-green text-black shadow-neon-sm font-bold'
                    : isNotifTab
                    ? 'text-brand-green bg-brand-green/5 hover:bg-brand-green/15 border border-brand-green/20'
                    : 'text-slate-300 hover:text-white hover:bg-brand-surface'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-black' : isNotifTab ? 'text-brand-green' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </div>
                {((isQuotesTab || isNotifTab) && unreadCount > 0) && (
                  <span className={`text-[10px] font-mono font-black px-1.5 py-0.5 rounded-full ${
                    isActive ? 'bg-black text-brand-green' : 'bg-red-500 text-white animate-pulse'
                  }`}>
                    {unreadCount}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Bottom actions */}
        <div className="p-4 border-t border-brand-border/60 space-y-2">
          <Link
            to="/"
            target="_blank"
            className="flex items-center justify-between w-full px-3 py-2 rounded-lg bg-brand-surface text-slate-300 hover:text-white text-xs font-medium transition-colors"
          >
            <span>Ver Web Clientes</span>
            <ExternalLink className="w-3.5 h-3.5 text-brand-green" />
          </Link>

          <button
            onClick={handleLogout}
            className="flex items-center gap-2 w-full px-3 py-2 rounded-lg text-red-400 hover:bg-red-950/40 text-xs font-semibold transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>Cerrar sesión</span>
          </button>
        </div>
      </aside>

      {/* Mobile Top Header Bar */}
      <div className="md:hidden bg-brand-carbon border-b border-brand-border/80 px-4 py-3 flex items-center justify-between sticky top-0 z-40">
        <Link to="/admin" className="flex items-center gap-2">
          <img src="/cmfix-logo.png" alt="CM FIX" className="h-8 w-auto object-contain" />
        </Link>

        <div className="flex items-center gap-2">
          {/* Mobile Bell */}
          <button
            onClick={() => setNotifOpen(true)}
            className={`p-2 rounded-lg border relative flex items-center justify-center ${
              unreadCount > 0 
                ? 'bg-brand-green/20 border-brand-green text-brand-green shadow-neon' 
                : 'bg-brand-surface border-brand-border text-slate-300'
            }`}
            title="Centro de Notificaciones"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-500 text-white font-mono text-[9px] font-black flex items-center justify-center animate-pulse">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          <button
            onClick={toggleTheme}
            className="p-1.5 rounded-lg text-slate-300 hover:text-white bg-brand-surface border border-brand-border"
            title={theme === 'dark' ? 'Modo Claro' : 'Modo Oscuro'}
          >
            {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-sky-400" />}
          </button>

          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-brand-surface"
          >
            {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Navigation */}
      {mobileOpen && (
        <div className="md:hidden bg-brand-carbon border-b border-brand-border px-4 py-4 space-y-2 z-40 animate-fadeIn">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path + item.label}
                to={item.path}
                onClick={() => setMobileOpen(false)}
                className={`flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold ${
                  isActive ? 'bg-brand-green text-black font-bold' : 'text-slate-300 hover:bg-brand-surface'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </div>
                {item.label.includes('Notificaciones') && unreadCount > 0 && (
                  <span className="px-2 py-0.5 rounded-full bg-red-500 text-white font-mono text-[10px]">
                    {unreadCount}
                  </span>
                )}
              </Link>
            );
          })}
          <div className="pt-3 border-t border-brand-border/60 flex items-center justify-between">
            <Link to="/" target="_blank" className="text-xs text-brand-green flex items-center gap-1">
              <span>Web Clientes</span>
              <ExternalLink className="w-3 h-3" />
            </Link>
            <button onClick={handleLogout} className="text-xs text-red-400 flex items-center gap-1">
              <LogOut className="w-3.5 h-3.5" />
              <span>Salir</span>
            </button>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 md:h-screen md:overflow-y-auto">
        
        {/* DESKTOP STICKY TOPBAR HEADER CON CAMPANA PROMINENTE */}
        <header className="hidden md:flex sticky top-0 z-30 bg-brand-carbon/95 backdrop-blur-md border-b border-brand-border/80 px-6 py-3 items-center justify-between gap-4">
          
          {/* Breadcrumb section */}
          <div className="flex items-center gap-2.5">
            <span className="text-xs font-mono font-black text-brand-green bg-brand-green/10 border border-brand-green/30 px-2.5 py-1 rounded-lg">
              CM FIX ADMIN
            </span>
            <span className="text-xs text-slate-500">/</span>
            <span className="text-xs font-bold text-white tracking-wide">
              {getCurrentSectionTitle()}
            </span>
          </div>

          {/* Action Header Items */}
          <div className="flex items-center gap-3">
            
            {/* Quick Test Sound Button */}
            <button
              onClick={handleTestSound}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-brand-surface hover:bg-brand-border border border-brand-border text-slate-300 hover:text-white text-xs font-medium transition-colors"
              title="Probar sonido acústico de campana"
            >
              <Volume2 className="w-3.5 h-3.5 text-brand-green" />
              <span>Probar Timbre</span>
            </button>

            {/* 🔔 BOTÓN PROMINENTE DE CAMPANA DE NOTIFICACIONES */}
            <button
              onClick={() => setNotifOpen(true)}
              className={`relative px-3.5 py-1.5 rounded-xl border flex items-center gap-2 transition-all shadow-sm ${
                unreadCount > 0
                  ? 'bg-brand-green/20 border-brand-green text-brand-green shadow-neon animate-pulse'
                  : 'bg-brand-surface border-brand-border text-slate-200 hover:text-white hover:border-brand-green/50'
              }`}
              title="Avisos y Notificaciones de Presupuestos (Maury y Eli)"
            >
              <Bell className="w-4 h-4 text-brand-green" />
              <span className="text-xs font-black">Avisos Presupuestos</span>
              {unreadCount > 0 ? (
                <span className="px-2 py-0.5 rounded-full bg-red-500 text-white font-mono text-[10px] font-black animate-bounce shadow">
                  {unreadCount} nuevos
                </span>
              ) : (
                <span className="w-2 h-2 rounded-full bg-brand-green/70" />
              )}
            </button>

            {/* User chip */}
            <div className="flex items-center gap-2 pl-3 border-l border-brand-border/60 text-xs">
              <span className="w-2 h-2 rounded-full bg-brand-green shadow-neon-sm" />
              <span className="font-bold text-white truncate max-w-[140px]">{user.name}</span>
              <span className="text-[10px] font-mono text-brand-green bg-brand-green/10 border border-brand-green/30 px-2 py-0.5 rounded">
                {user.role}
              </span>
            </div>

            {/* Web Clientes link */}
            <Link
              to="/"
              target="_blank"
              className="p-2 rounded-xl text-slate-400 hover:text-white bg-brand-surface border border-brand-border transition-colors"
              title="Abrir Web Clientes"
            >
              <ExternalLink className="w-3.5 h-3.5 text-brand-green" />
            </Link>

            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-xl text-slate-400 hover:text-white bg-brand-surface border border-brand-border transition-colors"
              title={theme === 'dark' ? 'Modo Claro' : 'Modo Oscuro'}
            >
              {theme === 'dark' ? <Sun className="w-3.5 h-3.5 text-amber-400" /> : <Moon className="w-3.5 h-3.5 text-sky-400" />}
            </button>

          </div>
        </header>

        {/* Global Notification Prompt Bar */}
        <NotificationPrompt />

        {/* Child Pages Content */}
        {children}
      </main>

      {/* Shared Notification Tray Modal */}
      <NotificationTray isOpen={notifOpen} onClose={() => setNotifOpen(false)} />

    </div>
  );
};
