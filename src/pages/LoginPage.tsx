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
  KeyRound
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login, user, isSupabaseLive } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // If already logged in, redirect to /admin
  React.useEffect(() => {
    if (user) {
      navigate('/admin');
    }
  }, [user, navigate]);

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

  const handleQuickDemoLogin = async (role: 'ADMIN' | 'TECNICO') => {
    setLoading(true);
    setErrorMsg(null);
    const demoEmail = role === 'ADMIN' ? 'admin@cmfix.es' : 'tecnico@cmfix.es';
    const res = await login(demoEmail, 'demo1234', role);
    if (res.success) {
      navigate('/admin');
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
            {isSupabaseLive ? 'Acceso mediante Supabase Auth' : 'Acceso de gestión técnica'}
          </p>
        </div>

        {errorMsg && (
          <div className="mb-6 p-3 rounded-xl bg-red-950/60 border border-red-500/40 text-red-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Correo Electrónico
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@cmfix.es"
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
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full bg-brand-dark border border-brand-border rounded-xl pl-9 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-brand-green"
              />
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

        {/* Quick Demo Access Bar */}
        <div className="mt-8 pt-6 border-t border-brand-border/60 text-center">
          <span className="text-xs text-slate-400 block mb-3">
            Acceso Rápido de Prueba (Demo 0 €):
          </span>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => handleQuickDemoLogin('ADMIN')}
              className="px-3 py-2 rounded-lg bg-brand-surface border border-brand-green/30 hover:border-brand-green text-slate-200 text-xs font-semibold flex items-center justify-center gap-1.5 transition-all"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-brand-green" />
              <span>Rol Administrador</span>
            </button>

            <button
              type="button"
              onClick={() => handleQuickDemoLogin('TECNICO')}
              className="px-3 py-2 rounded-lg bg-brand-surface border border-brand-border hover:border-slate-500 text-slate-300 text-xs font-semibold flex items-center justify-center gap-1.5 transition-all"
            >
              <Wrench className="w-3.5 h-3.5 text-blue-400" />
              <span>Rol Técnico</span>
            </button>
          </div>
        </div>

      </div>

    </div>
  );
};
