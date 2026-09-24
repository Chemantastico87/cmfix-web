import React, { useState } from 'react';
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
  Smartphone,
  KeyRound,
  UserCog,
  Sun,
  Moon
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { 
  getStoredNotifications, 
  getUnreadNotificationsCount, 
  markAllNotificationsAsRead,
  QuoteNotificationItem,
  getNotificationSettings
} from '../services/notificationService';

import { NotificationPrompt } from './NotificationPrompt';

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
  const [recentNotifs, setRecentNotifs] = useState<QuoteNotificationItem[]>(getStoredNotifications());

  const refreshNotifs = () => {
    setUnreadCount(getUnreadNotificationsCount());
    setRecentNotifs(getStoredNotifications());
  };

  React.useEffect(() => {
    window.addEventListener('cmfix:notifications_updated', refreshNotifs);
    window.addEventListener('cmfix:new_quote', refreshNotifs);
    return () => {
      window.removeEventListener('cmfix:notifications_updated', refreshNotifs);
      window.removeEventListener('cmfix:new_quote', refreshNotifs);
    };
  }, []);

  const handleMarkAllRead = () => {
    markAllNotificationsAsRead();
    refreshNotifs();
  };

  React.useEffect(() => {
    if (!loading && !user) {
      navigate('/login');
    }
  }, [user, loading, navigate]);

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

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-brand-dark text-slate-100 flex flex-col md:flex-row">
      
      {/* Sidebar for Desktop */}
      <aside className="hidden md:flex flex-col w-64 bg-brand-carbon border-r border-brand-border/80 shrink-0">
        
        {/* Brand header */}
        <div className="p-4 border-b border-brand-border/60 flex items-center justify-between relative">
          <Link to="/admin" className="flex items-center gap-3">
            <img src="/cmfix-logo.png" alt="CM FIX" className="h-8 w-auto object-contain filter drop-shadow-[0_0_8px_rgba(34,197,94,0.4)]" />
          </Link>
          <div className="flex items-center gap-1.5">
            {/* Notification Bell Button */}
            <div className="relative">
              <button
                onClick={() => setNotifOpen(!notifOpen)}
                className={`p-1.5 rounded-lg border transition-all relative ${
                  unreadCount > 0 
                    ? 'bg-brand-green/20 border-brand-green text-brand-green shadow-neon-sm' 
                    : 'bg-brand-surface border-brand-border text-slate-400 hover:text-white'
                }`}
                title="Centro de Notificaciones de Presupuestos"
              >
                <Bell className="w-3.5 h-3.5" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-500 text-white font-mono text-[9px] font-black flex items-center justify-center animate-pulse">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>
            </div>

            <button
              onClick={toggleTheme}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white bg-brand-surface border border-brand-border transition-colors"
              title={theme === 'dark' ? 'Cambiar a Modo Claro' : 'Cambiar a Modo Oscuro'}
            >
              {theme === 'dark' ? <Sun className="w-3.5 h-3.5 text-amber-400" /> : <Moon className="w-3.5 h-3.5 text-sky-400" />}
            </button>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-brand-green/20 text-brand-green font-bold">
              ADMIN
            </span>
          </div>
        </div>

        {/* User preview */}
        <div className="p-4 border-b border-brand-border/40 bg-brand-surface/40">
          <p className="text-xs text-slate-400">Sesión activa:</p>
          <p className="text-xs font-bold text-white truncate">{user.name}</p>
          <p className="text-[10px] text-slate-500 font-mono truncate">{user.email}</p>
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
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-brand-green text-black shadow-neon-sm font-bold'
                    : 'text-slate-300 hover:text-white hover:bg-brand-surface'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-black' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </div>
                {isQuotesTab && unreadCount > 0 && (
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

      {/* Mobile Header Bar */}
      <div className="md:hidden bg-brand-carbon border-b border-brand-border/80 px-4 py-3 flex items-center justify-between sticky top-0 z-40">
        <Link to="/admin" className="flex items-center gap-2">
          <img src="/cmfix-logo.png" alt="CM FIX" className="h-8 w-auto object-contain" />
        </Link>

        <div className="flex items-center gap-2">
          {/* Mobile Bell */}
          <button
            onClick={() => setNotifOpen(!notifOpen)}
            className={`p-1.5 rounded-lg border relative ${
              unreadCount > 0 
                ? 'bg-brand-green/20 border-brand-green text-brand-green' 
                : 'bg-brand-surface border-brand-border text-slate-300'
            }`}
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
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-brand-green/20 text-brand-green font-bold">
            ADMIN
          </span>
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-brand-surface"
          >
            {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Tray Modal / Dropdown de Notificaciones de Presupuestos */}
      {notifOpen && (
        <div className="fixed inset-0 sm:inset-auto sm:top-14 sm:left-64 z-50 p-4 sm:p-0 flex items-start justify-center sm:justify-start">
          <div 
            className="fixed inset-0 bg-black/50 sm:hidden" 
            onClick={() => setNotifOpen(false)} 
          />
          <div className="relative w-full max-w-sm bg-brand-carbon border-2 border-brand-green/60 rounded-2xl shadow-2xl p-4 text-white z-10 backdrop-blur-xl">
            <div className="flex items-center justify-between pb-3 border-b border-brand-border">
              <div className="flex items-center gap-2">
                <Bell className="w-4 h-4 text-brand-green" />
                <span className="text-xs font-bold uppercase tracking-wider">Avisos de Presupuestos</span>
              </div>
              <div className="flex items-center gap-2">
                {unreadCount > 0 && (
                  <button
                    onClick={handleMarkAllRead}
                    className="text-[10px] text-brand-green hover:underline font-semibold"
                  >
                    Marcar leídas
                  </button>
                )}
                <button
                  onClick={() => setNotifOpen(false)}
                  className="p-1 text-slate-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="max-h-80 overflow-y-auto divide-y divide-brand-border/40 py-2 space-y-2">
              {recentNotifs.length === 0 ? (
                <div className="py-6 text-center text-xs text-slate-400">
                  No hay notificaciones de presupuestos registradas todavía.
                </div>
              ) : (
                recentNotifs.map((n) => (
                  <div 
                    key={n.id} 
                    className={`p-2.5 rounded-xl transition-colors ${n.read ? 'bg-brand-surface/40' : 'bg-brand-surface border border-brand-green/30'}`}
                  >
                    <div className="flex items-center justify-between text-[11px] mb-1">
                      <span className="font-mono font-bold text-brand-green">{n.quoteNumber}</span>
                      <span className="text-slate-400 text-[10px]">{n.timestamp}</span>
                    </div>
                    <div className="text-xs font-semibold text-white truncate">{n.customerName}</div>
                    <div className="text-[11px] text-slate-300 truncate">{n.device} · {n.repairType}</div>
                    <div className="mt-2 flex items-center justify-between pt-1 border-t border-brand-border/30">
                      <span className="font-mono font-bold text-white text-xs">{Number(n.total || 0).toFixed(2)} €</span>
                      <div className="flex items-center gap-1.5">
                        <Link
                          to="/admin/presupuestos"
                          onClick={() => setNotifOpen(false)}
                          className="px-2 py-1 rounded-lg bg-brand-green/20 hover:bg-brand-green/30 text-brand-green text-[10px] font-bold"
                        >
                          Ver en Panel
                        </Link>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="pt-2 border-t border-brand-border text-center">
              <Link
                to="/admin/configuracion"
                onClick={() => setNotifOpen(false)}
                className="text-[11px] text-slate-400 hover:text-brand-green transition-colors"
              >
                Configurar teléfonos y alertas de Maury y Eli →
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="md:hidden bg-brand-carbon border-b border-brand-border px-4 py-4 space-y-2 z-40 animate-fadeIn">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setMobileOpen(false)}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-semibold ${
                  isActive ? 'bg-brand-green text-black font-bold' : 'text-slate-300 hover:bg-brand-surface'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{item.label}</span>
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
      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <NotificationPrompt />
        {children}
      </main>

    </div>
  );
};
