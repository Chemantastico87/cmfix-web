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
  UserCog
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface AdminLayoutProps {
  children: React.ReactNode;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  const { user, logout, loading } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

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
        <div className="p-5 border-b border-brand-border/60 flex items-center justify-between">
          <Link to="/admin" className="flex items-center gap-3">
            <img src="/cmfix-logo.png" alt="CM FIX" className="h-9 w-auto object-contain filter drop-shadow-[0_0_8px_rgba(34,197,94,0.4)]" />
          </Link>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-brand-green/20 text-brand-green font-bold">
            ADMIN
          </span>
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
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-brand-green text-black shadow-neon-sm font-bold'
                    : 'text-slate-300 hover:text-white hover:bg-brand-surface'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-black' : 'text-slate-400'}`} />
                <span>{item.label}</span>
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
        {children}
      </main>

    </div>
  );
};
