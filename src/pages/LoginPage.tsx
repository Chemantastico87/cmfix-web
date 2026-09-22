import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  Lock, 
  Mail, 
  ShieldCheck, 
  ArrowLeft, 
  Sparkles, 
  AlertCircle,
  Wrench,
  KeyRound,
  Eye,
  EyeOff,
  User
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login, logout, user, isSupabaseLive } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);
    const res = await login(email, password);
    if (res.success) {
      navigate('/admin');
    } else {
      setErrorMsg(res.error || 'Credenciales incorrectas');
    }
    setLoading(false);
  };


  return (
    <div className="min-h-screen py-16 px-4 flex flex-col items-center justify-center bg-tech-grid">
      
      <Link to="/" className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white mb-8">
        <ArrowLeft className="w-4 h-4" />
        <span>Volver a la web pública</span>
      </Link>

      <div className="w-full max-w-md bg-brand-carbon border border-brand-border rounded-2xl p-8 shadow-card backdrop-blur-md">
        
        {/* Logo and Header */}
        <div className="text-center mb-8">
          <img 
            src="/cmfix-logo.png" 
            alt="CM FIX" 
            className="h-12 w-auto mx-auto object-contain mb-3 filter drop-shadow-[0_0_12px_rgba(34,197,94,0.4)]" 
          />
          <h1 className="text-xl font-black text-white">Panel de Profesionales CM FIX</h1>
          <p className="text-xs text-slate-400 mt-1">
            {isSupabaseLive ? 'Acceso mediante Supabase Auth' : 'Acceso de gestión técnica y administrativa'}
          </p>
        </div>

        {user && (
          <div className="mb-6 p-4 rounded-xl bg-emerald-950/70 border border-emerald-500/50 text-xs text-emerald-300 space-y-3">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Sesión activa en esta pestaña: <strong>{user.name}</strong></span>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => navigate('/admin')}
                className="flex-1 py-2 px-3 rounded-lg bg-brand-green hover:bg-brand-green-neon text-black font-extrabold text-xs shadow-neon transition-all"
              >
                Continuar al Panel
              </button>
              <button
                type="button"
                onClick={logout}
                className="py-2 px-3 rounded-lg border border-red-500/40 text-red-300 hover:bg-red-950/40 text-xs font-semibold transition-all"
              >
                Cerrar sesión
              </button>
            </div>
          </div>
        )}

        {errorMsg && (
          <div className="mb-6 p-3 rounded-xl bg-red-950/60 border border-red-500/40 text-red-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Usuario o Correo Electrónico
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
              <input
                type="text"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tecnico@cmfix.es o maury@cmfix.es"
                autoCapitalize="none"
                autoCorrect="off"
                spellCheck={false}
                required
                className="w-full bg-brand-dark border border-brand-border rounded-xl pl-9 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-brand-green"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Contraseña
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full bg-brand-dark border border-brand-border rounded-xl pl-9 pr-11 py-2.5 text-sm text-white focus:outline-none focus:border-brand-green"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-2.5 p-1 text-slate-400 hover:text-slate-200 transition-colors focus:outline-none"
                title={showPassword ? 'Ocultar contraseña' : 'Ver contraseña'}
                tabIndex={-1}
              >
                {showPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-brand-green hover:bg-brand-green-neon text-black font-extrabold text-sm shadow-neon transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <KeyRound className="w-4 h-4" />
            <span>{loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}</span>
          </button>
        </form>

      </div>

    </div>
  );
};
