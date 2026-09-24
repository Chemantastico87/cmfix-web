import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Wrench, 
  Search, 
  Calculator, 
  Phone, 
  Menu, 
  X, 
  ShieldCheck, 
  LayoutDashboard,
  Smartphone,
  Lock,
  LogOut,
  Sun,
  Moon
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

export const Navbar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const isActive = (path: string) => {
    if (path === '/' && location.pathname === '/') return true;
    if (path !== '/' && location.pathname.startsWith(path)) return true;
    return false;
  };

  const navLinks = [
    { name: 'Inicio', path: '/' },
    { name: 'Servicios', path: '/servicios' },
    { name: 'Presupuestador', path: '/presupuesto' },
    { name: 'Seguimiento', path: '/seguimiento' },
    { name: 'Contacto', path: '/contacto' },
  ];

  return (
    <>
      <header className="sticky top-0 z-40 bg-brand-dark/95 backdrop-blur-md border-b border-brand-border/60 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            
            {/* Official CM FIX Logo */}
            <Link to="/" className="flex items-center gap-3 group py-1">
              <img 
                src="/cmfix-logo.png" 
                alt="CM FIX Logo" 
                className="h-12 w-auto object-contain transition-transform duration-300 group-hover:scale-105 filter drop-shadow-[0_0_12px_rgba(34,197,94,0.35)]" 
              />
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-1 lg:space-x-2">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    isActive(link.path)
                      ? 'text-brand-green bg-brand-green/10 font-semibold shadow-neon-sm'
                      : 'text-slate-300 hover:text-brand-green hover:bg-brand-surface/60'
                  }`}
                >
                  {link.name}
                </Link>
              ))}
            </nav>

            {/* Desktop Action Buttons */}
            <div className="hidden md:flex items-center space-x-3">

              <button
                onClick={toggleTheme}
                className="p-2 rounded-lg text-slate-300 hover:text-white bg-brand-surface/80 border border-brand-border hover:border-brand-green/40 transition-all flex items-center justify-center"
                title={theme === 'dark' ? 'Cambiar a Modo Claro' : 'Cambiar a Modo Oscuro'}
                aria-label="Alternar tema claro y oscuro"
              >
                {theme === 'dark' ? (
                  <Sun className="w-4 h-4 text-amber-400 animate-in spin-in-90 duration-200" />
                ) : (
                  <Moon className="w-4 h-4 text-sky-500 animate-in spin-in-90 duration-200" />
                )}
              </button>

              <Link
                to="/seguimiento"
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold text-slate-300 hover:text-white bg-brand-surface/80 border border-brand-border hover:border-brand-green/50 transition-all duration-200"
                title="Consultar estado de tu reparación"
              >
                <Search className="w-3.5 h-3.5 text-brand-green" />
                <span>Mis Reparaciones</span>
              </Link>

              <Link
                to="/presupuesto"
                className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-bold text-black bg-brand-green hover:bg-brand-green-neon transition-all duration-200 shadow-neon hover:shadow-neon-strong active:scale-95"
              >
                <Calculator className="w-4 h-4" />
                <span>Calcular Presupuesto</span>
              </Link>

              {user ? (
                <div className="flex items-center gap-1.5">
                  <Link
                    to="/admin"
                    className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold text-emerald-400 bg-emerald-950/60 border border-emerald-500/40 hover:bg-emerald-900/60 transition-all"
                    title="Panel de Administración"
                  >
                    <LayoutDashboard className="w-4 h-4" />
                    <span>Panel ({user.name.split(' ')[0]})</span>
                  </Link>
                  <button
                    onClick={logout}
                    className="p-2 text-slate-400 hover:text-red-400 transition-colors"
                    title="Cerrar sesión"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <Link
                  to="/login"
                  className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold text-slate-300 hover:text-white bg-brand-surface/80 border border-brand-border hover:border-brand-green/40 transition-all"
                  title="Acceso al Panel Técnico y Administrativo"
                >
                  <Lock className="w-3.5 h-3.5 text-brand-green" />
                  <span>Acceso Panel</span>
                </Link>
              )}
            </div>

            {/* Mobile menu button & Mobile Bell */}
            <div className="flex md:hidden items-center space-x-2">

              <button
                onClick={toggleTheme}
                className="p-1.5 rounded-lg text-slate-300 hover:text-white bg-brand-surface border border-brand-border"
                title={theme === 'dark' ? 'Modo Claro' : 'Modo Oscuro'}
              >
                {theme === 'dark' ? (
                  <Sun className="w-4 h-4 text-amber-400" />
                ) : (
                  <Moon className="w-4 h-4 text-sky-500" />
                )}
              </button>

              <Link
                to="/presupuesto"
                className="px-3 py-1.5 rounded-lg text-xs font-bold text-black bg-brand-green shadow-neon"
              >
                Presupuesto
              </Link>

              <button
                onClick={() => setIsOpen(!isOpen)}
                className="p-2 rounded-lg text-slate-300 hover:text-brand-green hover:bg-brand-surface focus:outline-none"
                aria-label="Abrir menú"
              >
                {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Drawer */}
        {isOpen && (
          <div className="md:hidden bg-brand-carbon border-b border-brand-border/80 px-4 pt-3 pb-6 space-y-2 animate-fadeIn">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setIsOpen(false)}
                className={`block px-3 py-2.5 rounded-lg text-base font-medium ${
                  isActive(link.path)
                    ? 'text-brand-green bg-brand-green/10 font-bold'
                    : 'text-slate-300 hover:text-brand-green hover:bg-brand-surface'
                }`}
              >
                {link.name}
              </Link>
            ))}


            <div className="pt-3 border-t border-brand-border/60 flex flex-col gap-2.5">
              <Link
                to="/seguimiento"
                onClick={() => setIsOpen(false)}
                className="flex items-center justify-center gap-2 w-full py-2.5 px-4 rounded-lg text-sm font-semibold bg-brand-surface text-slate-200 border border-brand-border"
              >
                <Search className="w-4 h-4 text-brand-green" />
                <span>Consultar Estado de Reparación</span>
              </Link>

              {user ? (
                <div className="flex flex-col gap-2">
                  <Link
                    to="/admin"
                    onClick={() => setIsOpen(false)}
                    className="flex items-center justify-center gap-2 w-full py-2.5 px-4 rounded-lg text-sm font-semibold bg-emerald-950/70 border border-emerald-500/40 text-emerald-300"
                  >
                    <LayoutDashboard className="w-4 h-4" />
                    <span>Panel ({user.name.split(' ')[0]})</span>
                  </Link>
                  <button
                    type="button"
                    onClick={() => {
                      setIsOpen(false);
                      logout();
                    }}
                    className="flex items-center justify-center gap-2 w-full py-2 px-4 rounded-lg text-xs font-semibold text-red-400 hover:bg-red-950/40 border border-red-500/30 transition-colors"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Cerrar sesión</span>
                  </button>
                </div>
              ) : (
                <Link
                  to="/login"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center justify-center gap-2 w-full py-2.5 px-4 rounded-lg text-sm font-semibold bg-brand-surface border border-brand-border text-slate-200 hover:text-white"
                >
                  <Lock className="w-4 h-4 text-brand-green" />
                  <span>Acceso al Panel Técnico</span>
                </Link>
              )}
            </div>
          </div>
        )}
      </header>

    </>
  );
};
