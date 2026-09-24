import React, { useState } from 'react';
import { 
  ShieldCheck, 
  KeyRound, 
  Eye, 
  EyeOff, 
  CheckCircle2, 
  AlertCircle, 
  UserCheck, 
  RefreshCw, 
  Lock,
  Sparkles,
  Info
} from 'lucide-react';
import { AdminLayout } from '../../components/AdminLayout';
import { useAuth } from '../../context/AuthContext';

export const AdminSecurityPage: React.FC = () => {
  const { user, changePassword, getPasswordsInfo, resetToDefaultPassword } = useAuth();

  // Form for active user
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [savingSelf, setSavingSelf] = useState(false);
  const [selfSuccess, setSelfSuccess] = useState<string | null>(null);
  const [selfError, setSelfError] = useState<string | null>(null);

  // Modal / Quick change for other or specific account
  const [overrideTarget, setOverrideTarget] = useState<'admin' | 'tecnico' | null>(null);
  const [overridePass, setOverridePass] = useState('');
  const [overrideConfirm, setOverrideConfirm] = useState('');
  const [showOverridePass, setShowOverridePass] = useState(false);
  const [savingOverride, setSavingOverride] = useState(false);
  const [overrideSuccess, setOverrideSuccess] = useState<string | null>(null);
  const [overrideError, setOverrideError] = useState<string | null>(null);

  const passwordsInfo = getPasswordsInfo();

  // Password strength meter
  const calculateStrength = (pass: string) => {
    if (!pass) return { score: 0, label: '', color: 'bg-slate-700' };
    let score = 0;
    if (pass.length >= 6) score += 1;
    if (pass.length >= 8) score += 1;
    if (/[A-Z]/.test(pass)) score += 1;
    if (/[0-9]/.test(pass)) score += 1;
    if (/[^A-Za-z0-9]/.test(pass)) score += 1;

    if (score <= 2) return { score: 1, label: 'Básica', color: 'bg-amber-500' };
    if (score <= 4) return { score: 2, label: 'Buena', color: 'bg-emerald-400' };
    return { score: 3, label: 'Muy Segura', color: 'bg-brand-green-neon' };
  };

  const strength = calculateStrength(newPassword);

  const handleSelfSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSelfError(null);
    setSelfSuccess(null);

    if (newPassword !== confirmPassword) {
      setSelfError('Las nuevas contraseñas no coinciden.');
      return;
    }

    if (newPassword.length < 4) {
      setSelfError('La nueva contraseña debe tener al menos 4 caracteres.');
      return;
    }

    // Determine target based on user email/name
    const isMaury = user?.email?.includes('gmail') || user?.email?.includes('maury') || user?.name?.includes('Maury');
    const target = isMaury ? 'admin' : 'tecnico';

    setSavingSelf(true);
    try {
      const res = await changePassword(target, currentPassword, newPassword, false);
      if (res.success) {
        setSelfSuccess(`¡Contraseña de ${isMaury ? 'Maury' : 'Técnico'} actualizada correctamente!`);
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        setTimeout(() => setSelfSuccess(null), 5000);
      } else {
        setSelfError(res.error || 'Error al cambiar la contraseña.');
      }
    } catch (err: any) {
      setSelfError(err.message || 'Error inesperado al cambiar la contraseña.');
    } finally {
      setSavingSelf(false);
    }
  };

  const handleOverrideSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!overrideTarget) return;
    setOverrideError(null);
    setOverrideSuccess(null);

    if (overridePass !== overrideConfirm) {
      setOverrideError('Las contraseñas no coinciden.');
      return;
    }

    if (overridePass.length < 4) {
      setOverrideError('La contraseña debe tener al menos 4 caracteres.');
      return;
    }

    setSavingOverride(true);
    try {
      const res = await changePassword(overrideTarget, '', overridePass, true);
      if (res.success) {
        setOverrideSuccess(`¡Contraseña para ${overrideTarget === 'admin' ? 'Chema (Administrador Principal)' : 'Maury (Administrador Taller)'} cambiada con éxito!`);
        setOverridePass('');
        setOverrideConfirm('');
        setTimeout(() => {
          setOverrideTarget(null);
          setOverrideSuccess(null);
        }, 2000);
      } else {
        setOverrideError(res.error || 'Error al asignar la contraseña.');
      }
    } catch (err: any) {
      setOverrideError(err.message || 'Error inesperado.');
    } finally {
      setSavingOverride(false);
    }
  };

  const handleReset = (target: 'admin' | 'tecnico') => {
    const targetName = target === 'admin' ? 'Chema' : 'Maury';
    const defaultKey = target === 'admin' ? 'chema123' : 'maury123';
    if (confirm(`¿Restablecer la contraseña de ${targetName} a la clave por defecto (${defaultKey})?`)) {
      resetToDefaultPassword(target);
      alert(`Contraseña de ${targetName} restablecida a "${defaultKey}".`);
      window.location.reload();
    }
  };

  return (
    <AdminLayout>
      <div className="p-4 sm:p-6 lg:p-8 space-y-8 max-w-4xl mx-auto w-full">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-brand-border/60 pb-5">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-md bg-brand-green/20 text-brand-green border border-brand-green/40 text-[10px] font-mono font-bold tracking-wider uppercase">
                Panel de Seguridad
              </span>
              <span className="px-2.5 py-0.5 rounded-md bg-brand-surface text-slate-300 border border-brand-border text-[10px] font-mono">
                Mismos Derechos de Administrador
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white flex items-center gap-2.5">
              <KeyRound className="w-7 h-7 text-brand-green" />
              <span>Cambiar y Gestionar Contraseñas</span>
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Gestión independiente y directa de claves de acceso tanto para <strong>Maury</strong> como para el <strong>Técnico de Taller</strong>.
            </p>
          </div>
        </div>

        {/* SECTION 1: CAMBIAR MI PROPIA CONTRASEÑA */}
        <div className="bg-brand-carbon border border-brand-border rounded-2xl p-6 sm:p-7 shadow-card space-y-5">
          <div className="flex items-center justify-between border-b border-brand-border/60 pb-4">
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Lock className="w-4 h-4 text-brand-green" />
                <span>Cambiar Mi Contraseña de Acceso</span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Sesión actual: <strong className="text-brand-green">{user?.name}</strong> ({user?.email})
              </p>
            </div>
            <span className="text-[10px] font-mono font-bold px-2 py-1 rounded bg-brand-surface text-slate-300 border border-brand-border">
              {user?.role}
            </span>
          </div>

          {selfSuccess && (
            <div className="p-4 rounded-xl bg-emerald-950/70 border border-emerald-500/60 text-emerald-300 text-xs flex items-center gap-2 shadow-neon animate-fadeIn">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{selfSuccess}</span>
            </div>
          )}

          {selfError && (
            <div className="p-4 rounded-xl bg-red-950/70 border border-red-500/60 text-red-300 text-xs flex items-center gap-2 animate-fadeIn">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
              <span>{selfError}</span>
            </div>
          )}

          <form onSubmit={handleSelfSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Contraseña Actual *
              </label>
              <div className="relative">
                <input
                  type={showCurrent ? 'text' : 'password'}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Introduce tu contraseña actual"
                  required
                  className="w-full bg-brand-dark border border-brand-border rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-brand-green pr-10 font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowCurrent(!showCurrent)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white p-1"
                >
                  {showCurrent ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Nueva Contraseña *
                </label>
                <div className="relative">
                  <input
                    type={showNew ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Mínimo 4 caracteres"
                    required
                    className="w-full bg-brand-dark border border-brand-border rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-brand-green pr-10 font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNew(!showNew)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white p-1"
                  >
                    {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {newPassword && (
                  <div className="mt-2 flex items-center gap-2">
                    <div className="flex-1 h-1.5 bg-brand-dark rounded-full overflow-hidden flex gap-1">
                      <div className={`h-full flex-1 rounded-full ${strength.score >= 1 ? strength.color : 'bg-transparent'}`} />
                      <div className={`h-full flex-1 rounded-full ${strength.score >= 2 ? strength.color : 'bg-transparent'}`} />
                      <div className={`h-full flex-1 rounded-full ${strength.score >= 3 ? strength.color : 'bg-transparent'}`} />
                    </div>
                    <span className="text-[10px] font-mono text-slate-400">
                      {strength.label}
                    </span>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Confirmar Nueva Contraseña *
                </label>
                <div className="relative">
                  <input
                    type={showConfirm ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Repite la nueva contraseña"
                    required
                    className="w-full bg-brand-dark border border-brand-border rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-brand-green pr-10 font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm(!showConfirm)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white p-1"
                  >
                    {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={savingSelf || !newPassword || !currentPassword}
                className="px-6 py-2.5 rounded-xl bg-brand-green hover:bg-brand-green-neon text-black font-extrabold text-xs flex items-center gap-2 shadow-neon transition-all active:scale-95 disabled:opacity-40"
              >
                <span>{savingSelf ? 'Guardando...' : 'Actualizar Mi Contraseña'}</span>
              </button>
            </div>
          </form>
        </div>

        {/* SECTION 2: GESTIÓN DE AMBAS CUENTAS (MISMOS DERECHOS) */}
        <div className="bg-brand-carbon border border-brand-border rounded-2xl p-6 sm:p-7 shadow-card space-y-5">
          <div className="border-b border-brand-border/60 pb-4">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-brand-green" />
              <span>Gestión de Cuentas del Taller (Chema y Maury)</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Ambos tenéis rango de administrador con plenos derechos para actualizar o recuperar el acceso de cualquiera de las dos cuentas.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Account Card: Chema */}
            <div className="p-5 rounded-xl bg-brand-dark/80 border-2 border-brand-green/40 space-y-3 shadow-neon-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-brand-green/20 border border-brand-green/40 flex items-center justify-center text-brand-green font-bold text-xs">
                    C
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">Chema</h3>
                    <span className="text-[10px] text-brand-green font-mono">Administrador Principal</span>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-950 text-emerald-300 border border-emerald-800">
                  Activo
                </span>
              </div>

              <div className="space-y-1 text-xs text-slate-300">
                <p><span className="text-slate-500">Email / Usuario:</span> admin@cmfix.es / chema@cmfix.es</p>
                <p>
                  <span className="text-slate-500">Último cambio:</span>{' '}
                  <span className="font-mono text-slate-400">{passwordsInfo.adminUpdatedAt || 'Clave inicial oficial'}</span>
                </p>
              </div>

              <div className="pt-2 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setOverrideTarget('admin');
                    setOverridePass('');
                    setOverrideConfirm('');
                    setOverrideError(null);
                    setOverrideSuccess(null);
                  }}
                  className="flex-1 px-3 py-2 rounded-lg bg-brand-surface hover:bg-brand-surface/80 border border-brand-border text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
                >
                  <KeyRound className="w-3.5 h-3.5 text-brand-green" />
                  <span>Asignar Contraseña</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleReset('admin')}
                  title="Restablecer a contraseña por defecto (chema123)"
                  className="p-2 rounded-lg bg-brand-surface hover:bg-brand-surface/80 border border-brand-border text-slate-400 hover:text-white transition-colors"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Account Card: Maury */}
            <div className="p-5 rounded-xl bg-brand-dark/80 border border-brand-border space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 font-bold text-xs">
                    M
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">Maury</h3>
                    <span className="text-[10px] text-emerald-400 font-mono">Administrador Taller</span>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-950 text-emerald-300 border border-emerald-800">
                  Activo
                </span>
              </div>

              <div className="space-y-1 text-xs text-slate-300">
                <p><span className="text-slate-500">Email:</span> cmfixespana@gmail.com / maury@cmfix.es</p>
                <p>
                  <span className="text-slate-500">Último cambio:</span>{' '}
                  <span className="font-mono text-slate-400">{passwordsInfo.tecnicoUpdatedAt || 'Clave inicial oficial'}</span>
                </p>
              </div>

              <div className="pt-2 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setOverrideTarget('tecnico');
                    setOverridePass('');
                    setOverrideConfirm('');
                    setOverrideError(null);
                    setOverrideSuccess(null);
                  }}
                  className="flex-1 px-3 py-2 rounded-lg bg-brand-surface hover:bg-brand-surface/80 border border-brand-border text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
                >
                  <KeyRound className="w-3.5 h-3.5 text-brand-green" />
                  <span>Asignar Contraseña</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleReset('tecnico')}
                  title="Restablecer a contraseña por defecto (maury123)"
                  className="p-2 rounded-lg bg-brand-surface hover:bg-brand-surface/80 border border-brand-border text-slate-400 hover:text-white transition-colors"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

          </div>

          {/* Quick Override Modal / Box if open */}
          {overrideTarget && (
            <div className="mt-4 p-5 rounded-xl bg-brand-surface border border-brand-green/50 animate-fadeIn space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  <KeyRound className="w-4 h-4 text-brand-green" />
                  <span>
                    Asignar nueva clave directa para{' '}
                    <strong className="text-brand-green">
                      {overrideTarget === 'admin' ? 'Maury' : 'Técnico de Taller'}
                    </strong>
                  </span>
                </h4>
                <button
                  type="button"
                  onClick={() => setOverrideTarget(null)}
                  className="text-slate-400 hover:text-white text-xs"
                >
                  Cancelar
                </button>
              </div>

              {overrideSuccess && (
                <div className="p-3 rounded-lg bg-emerald-950/80 border border-emerald-500/60 text-emerald-300 text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{overrideSuccess}</span>
                </div>
              )}

              {overrideError && (
                <div className="p-3 rounded-lg bg-red-950/80 border border-red-500/60 text-red-300 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" />
                  <span>{overrideError}</span>
                </div>
              )}

              <form onSubmit={handleOverrideSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Nueva Clave *</label>
                  <div className="relative">
                    <input
                      type={showOverridePass ? 'text' : 'password'}
                      value={overridePass}
                      onChange={(e) => setOverridePass(e.target.value)}
                      placeholder="Nueva contraseña"
                      required
                      className="w-full bg-brand-dark border border-brand-border rounded-lg px-3 py-2 text-white font-mono"
                    />
                    <button
                      type="button"
                      onClick={() => setShowOverridePass(!showOverridePass)}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white p-1"
                    >
                      {showOverridePass ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Repetir Nueva Clave *</label>
                  <input
                    type={showOverridePass ? 'text' : 'password'}
                    value={overrideConfirm}
                    onChange={(e) => setOverrideConfirm(e.target.value)}
                    placeholder="Confirmar contraseña"
                    required
                    className="w-full bg-brand-dark border border-brand-border rounded-lg px-3 py-2 text-white font-mono"
                  />
                </div>

                <div className="sm:col-span-2 flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setOverrideTarget(null)}
                    className="px-4 py-2 rounded-lg border border-brand-border text-slate-300 hover:text-white text-xs font-semibold"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={savingOverride || !overridePass}
                    className="px-5 py-2 rounded-lg bg-brand-green hover:bg-brand-green-neon text-black text-xs font-bold shadow-neon"
                  >
                    {savingOverride ? 'Guardando...' : 'Guardar Nueva Contraseña'}
                  </button>
                </div>
              </form>
            </div>
          )}

        </div>

        {/* SECTION 3: RECOMENDACIONES DE SEGURIDAD */}
        <div className="bg-brand-carbon/60 border border-brand-border/60 rounded-2xl p-5 text-xs text-slate-400 flex items-start gap-3">
          <Info className="w-5 h-5 text-brand-green shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h4 className="text-white font-bold">Privacidad y Seguridad en CM FIX</h4>
            <p>
              Tanto Maury como el Técnico tienen acceso completo a la gestión del taller. Por seguridad, no compartáis estas credenciales con clientes. Si olvidáis alguna clave, podéis restablecerla en cualquier momento pulsando el botón de restablecer.
            </p>
          </div>
        </div>

      </div>
    </AdminLayout>
  );
};
