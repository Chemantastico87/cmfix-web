import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Wrench, 
  FileText, 
  Users, 
  Euro, 
  AlertTriangle, 
  Clock, 
  CheckCircle2, 
  Package, 
  TrendingUp, 
  Plus, 
  ArrowRight,
  RefreshCw,
  Smartphone,
  ExternalLink,
  Bell,
  Volume2,
  Settings,
  Sparkles
} from 'lucide-react';
import { AdminLayout } from '../../components/AdminLayout';
import { dbService } from '../../services/db';
import { DashboardStats, Quote, Repair } from '../../types';
import { 
  getNotificationSettings, 
  playNotificationSound,
  requestNotificationPermission,
  showSystemNotification,
  saveNotificationSettings
} from '../../services/notificationService';

export const AdminDashboardPage: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentRepairs, setRecentRepairs] = useState<Repair[]>([]);
  const [recentQuotes, setRecentQuotes] = useState<Quote[]>([]);
  const [loading, setLoading] = useState(true);
  const [notifSettings, setNotifSettings] = useState(getNotificationSettings());
  const [hasPermission, setHasPermission] = useState(
    typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted'
  );
  const [testSuccess, setTestSuccess] = useState(false);

  const handleEnableNotifications = async () => {
    playNotificationSound();
    const perm = await requestNotificationPermission();
    setHasPermission(perm === 'granted');
    const updated = saveNotificationSettings({ 
      soundEnabled: true, 
      systemNotificationsEnabled: perm === 'granted' 
    });
    setNotifSettings(updated);
    if (perm === 'granted') {
      showSystemNotification(
        '🔔 CM FIX: ¡Notificaciones Activas!',
        'Avisos configurados correctamente para Maury y Eli.'
      );
    }
    setTestSuccess(true);
    setTimeout(() => setTestSuccess(false), 4000);
  };

  const handleTestSound = () => {
    playNotificationSound();
    setTestSuccess(true);
    setTimeout(() => setTestSuccess(false), 3000);
  };

  const loadData = async () => {
    setLoading(true);
    try {
      const [s, r, q] = await Promise.all([
        dbService.getDashboardStats(),
        dbService.getRepairs(),
        dbService.getQuotes()
      ]);
      setStats(s);
      setRecentRepairs(r.slice(0, 5));
      setRecentQuotes(q.slice(0, 5));
    } catch (err) {
      console.error('Error loading dashboard stats:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  return (
    <AdminLayout>
      <div className="p-4 sm:p-6 lg:p-8 space-y-8 max-w-7xl mx-auto w-full">
        
        {/* Header greeting */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-white flex items-center gap-2">
              <span>Buenos días, CM FIX</span>
              <span className="inline-block w-2.5 h-2.5 rounded-full bg-brand-green shadow-neon-sm animate-pulse" />
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Control central del taller: reparaciones activas, presupuestos, clientes y stock.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={loadData}
              className="p-2 rounded-xl bg-brand-surface border border-brand-border text-slate-400 hover:text-white transition-colors"
              title="Actualizar métricas"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-brand-green' : ''}`} />
            </button>
            <Link
              to="/admin/reparaciones"
              className="px-4 py-2 rounded-xl bg-brand-green hover:bg-brand-green-neon text-black font-extrabold text-xs flex items-center gap-1.5 shadow-neon transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Nueva Reparación</span>
            </Link>
          </div>
        </div>

        {/* 🔔 BANNER DESTACADO: CENTRO DE ALERTAS Y NOTIFICACIONES DE PRESUPUESTOS (MAURY Y ELI) */}
        <div className="bg-gradient-to-r from-brand-carbon via-brand-surface to-brand-carbon border-2 border-brand-green/60 rounded-2xl p-5 shadow-neon-sm space-y-4">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            
            <div className="flex items-start sm:items-center gap-3.5">
              <div className="w-11 h-11 rounded-2xl bg-brand-green/20 border border-brand-green/60 flex items-center justify-center text-brand-green shrink-0 shadow-neon-sm animate-pulse">
                <Bell className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-sm sm:text-base font-black text-white">
                    Notificaciones de Presupuestos (Maury y Eli)
                  </h2>
                  <span className="px-2 py-0.5 rounded-full bg-brand-green/20 text-brand-green text-[10px] font-mono font-black border border-brand-green/40">
                    EN VIVO
                  </span>
                </div>
                <p className="text-xs text-slate-300 mt-0.5">
                  Avisos automáticos con campana acústica y alertas en pantalla al crearse un presupuesto en taller o web pública.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2.5 shrink-0">
              <button
                onClick={handleEnableNotifications}
                className={`px-4 py-2.5 rounded-xl font-black text-xs flex items-center gap-2 shadow-neon transition-all active:scale-95 ${
                  hasPermission 
                    ? 'bg-emerald-600 hover:bg-emerald-500 text-white' 
                    : 'bg-brand-green hover:bg-brand-green-neon text-black animate-bounce-subtle'
                }`}
              >
                <Bell className="w-4 h-4" />
                <span>{hasPermission ? '✓ Notificaciones Activas' : 'Activar Notificaciones Aquí'}</span>
              </button>

              <button
                onClick={handleTestSound}
                className="px-4 py-2.5 rounded-xl bg-brand-surface hover:bg-brand-border border border-brand-border text-white text-xs font-bold flex items-center gap-1.5 transition-colors"
                title="Hacer sonar la campana de prueba"
              >
                <Volume2 className="w-4 h-4 text-brand-green" />
                <span>Probar Timbre</span>
              </button>

              <Link
                to="/admin/configuracion"
                className="px-3.5 py-2.5 rounded-xl bg-brand-surface hover:bg-brand-border border border-brand-border text-slate-300 hover:text-white text-xs font-semibold flex items-center gap-1.5 transition-colors"
                title="Ajustes de teléfonos y correos"
              >
                <Settings className="w-4 h-4 text-brand-green" />
                <span>Ajustes</span>
              </Link>
            </div>

          </div>

          {testSuccess && (
            <div className="p-3 rounded-xl bg-emerald-950/80 border border-emerald-500 text-emerald-300 text-xs flex items-center gap-2 shadow-neon animate-fadeIn">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>¡Campana acústica comprobada y notificaciones verificadas en este dispositivo!</span>
            </div>
          )}

          {/* Sub-barra de canales activos */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-3 border-t border-brand-border/40 text-[11px]">
            <div className="bg-brand-dark/50 p-2 rounded-lg border border-brand-border/30">
              <span className="text-slate-400 block">Canal Maury:</span>
              <span className="font-mono font-bold text-emerald-300 truncate block">{notifSettings.mauryPhone}</span>
            </div>
            <div className="bg-brand-dark/50 p-2 rounded-lg border border-brand-border/30">
              <span className="text-slate-400 block">Canal Eli:</span>
              <span className="font-mono font-bold text-teal-300 truncate block">{notifSettings.eliPhone || 'Configurado'}</span>
            </div>
            <div className="bg-brand-dark/50 p-2 rounded-lg border border-brand-border/30">
              <span className="text-slate-400 block">Campana Sonora:</span>
              <span className="font-bold text-brand-green">Activada (Chime D5/A5)</span>
            </div>
            <div className="bg-brand-dark/50 p-2 rounded-lg border border-brand-border/30">
              <span className="text-slate-400 block">Avisos de Sistema:</span>
              <span className={hasPermission ? 'font-bold text-emerald-400' : 'font-bold text-amber-400'}>
                {hasPermission ? '✓ Permitido' : '⚡ Pulsa "Activar"'}
              </span>
            </div>
          </div>
        </div>

        {/* 1. URGENT ALERT STATUS CARDS (Req 32) */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          
          {/* 🔴 Presupuestos Pendientes */}
          <Link
            to="/admin/presupuestos"
            className="p-4 rounded-2xl bg-red-950/20 border border-red-500/40 hover:border-red-500/80 transition-all group"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-red-300">🔴 Presupuestos pendientes</span>
              <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
            </div>
            <div className="mt-3 flex items-baseline justify-between">
              <span className="text-2xl sm:text-3xl font-black text-white font-mono">
                {stats?.pending_quotes_count || 0}
              </span>
              <span className="text-[11px] text-red-400 group-hover:underline flex items-center gap-0.5">
                <span>Revisar</span>
                <ArrowRight className="w-3 h-3" />
              </span>
            </div>
          </Link>

          {/* 🟠 Reparaciones en curso */}
          <Link
            to="/admin/reparaciones"
            className="p-4 rounded-2xl bg-amber-950/20 border border-amber-500/40 hover:border-amber-500/80 transition-all group"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-amber-300">🟠 Reparaciones en curso</span>
              <Clock className="w-4 h-4 text-amber-400" />
            </div>
            <div className="mt-3 flex items-baseline justify-between">
              <span className="text-2xl sm:text-3xl font-black text-white font-mono">
                {stats?.in_progress_repairs_count || 0}
              </span>
              <span className="text-[11px] text-amber-400 group-hover:underline flex items-center gap-0.5">
                <span>Taller</span>
                <ArrowRight className="w-3 h-3" />
              </span>
            </div>
          </Link>

          {/* 🟢 Reparaciones listas */}
          <Link
            to="/admin/reparaciones"
            className="p-4 rounded-2xl bg-emerald-950/20 border border-emerald-500/40 hover:border-emerald-500/80 transition-all group"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-emerald-300">🟢 Reparaciones listas</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="mt-3 flex items-baseline justify-between">
              <span className="text-2xl sm:text-3xl font-black text-white font-mono">
                {stats?.ready_repairs_count || 0}
              </span>
              <span className="text-[11px] text-emerald-400 group-hover:underline flex items-center gap-0.5">
                <span>Avisar</span>
                <ArrowRight className="w-3 h-3" />
              </span>
            </div>
          </Link>

          {/* ⚠️ Stock bajo */}
          <Link
            to="/admin/inventario"
            className="p-4 rounded-2xl bg-yellow-950/20 border border-yellow-500/40 hover:border-yellow-500/80 transition-all group"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-yellow-300">⚠️ Stock bajo</span>
              <Package className="w-4 h-4 text-yellow-400" />
            </div>
            <div className="mt-3 flex items-baseline justify-between">
              <span className="text-2xl sm:text-3xl font-black text-white font-mono">
                {stats?.low_stock_count || 0}
              </span>
              <span className="text-[11px] text-yellow-400 group-hover:underline flex items-center gap-0.5">
                <span>Reponer</span>
                <ArrowRight className="w-3 h-3" />
              </span>
            </div>
          </Link>

        </div>

        {/* 2. CORE KPI WIDGETS (Req 10) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          
          <div className="p-5 rounded-2xl bg-brand-carbon border border-brand-border/80 shadow-card">
            <div className="flex items-center justify-between text-slate-400 text-xs">
              <span>TOTAL REPARACIONES</span>
              <Wrench className="w-4 h-4 text-brand-green" />
            </div>
            <div className="mt-3 text-2xl sm:text-3xl font-black text-white font-mono">
              {(stats?.in_progress_repairs_count || 0) + (stats?.ready_repairs_count || 0)}
            </div>
            <p className="text-[11px] text-slate-500 mt-1">Activas en taller</p>
          </div>

          <div className="p-5 rounded-2xl bg-brand-carbon border border-brand-border/80 shadow-card">
            <div className="flex items-center justify-between text-slate-400 text-xs">
              <span>CLIENTES REGISTRADOS</span>
              <Users className="w-4 h-4 text-blue-400" />
            </div>
            <div className="mt-3 text-2xl sm:text-3xl font-black text-white font-mono">
              {stats?.total_customers_count || 0}
            </div>
            <p className="text-[11px] text-slate-500 mt-1">Base de clientes registrados</p>
          </div>

          <div className="p-5 rounded-2xl bg-brand-carbon border border-brand-border/80 shadow-card">
            <div className="flex items-center justify-between text-slate-400 text-xs">
              <span>FACTURACIÓN TOTAL</span>
              <Euro className="w-4 h-4 text-brand-green" />
            </div>
            <div className="mt-3 text-2xl sm:text-3xl font-black text-brand-green font-mono">
              {(stats?.total_revenue || 0).toFixed(2)} €
            </div>
            <p className="text-[11px] text-slate-500 mt-1">Ingresos de reparaciones</p>
          </div>

          <div className="p-5 rounded-2xl bg-brand-carbon border border-brand-border/80 shadow-card">
            <div className="flex items-center justify-between text-slate-400 text-xs">
              <span>BENEFICIO ESTIMADO</span>
              <TrendingUp className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="mt-3 text-2xl sm:text-3xl font-black text-emerald-400 font-mono">
              {(stats?.total_profit || 0).toFixed(2)} €
            </div>
            <p className="text-[11px] text-slate-500 mt-1">Margen neto de taller</p>
          </div>

        </div>

        {/* 3. RECENT ACTIVITY TABLES */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Recent Repairs */}
          <div className="bg-brand-carbon border border-brand-border rounded-2xl p-5 sm:p-6 shadow-card">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Wrench className="w-4 h-4 text-brand-green" />
                <span>Últimas Reparaciones</span>
              </h3>
              <Link to="/admin/reparaciones" className="text-xs text-brand-green hover:underline">
                Ver todas
              </Link>
            </div>

            <div className="divide-y divide-brand-border/40 text-xs">
              {recentRepairs.map((r) => (
                <div key={r.id} className="py-3 flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-white">{r.repair_number}</span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-brand-surface text-brand-green border border-brand-green/30">
                        {r.status}
                      </span>
                    </div>
                    <p className="text-slate-400 mt-0.5">{r.customer?.name} — {r.device_brand} {r.device_model}</p>
                  </div>
                  <span className="font-mono font-bold text-slate-200">{r.price_total.toFixed(2)} €</span>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Quotes */}
          <div className="bg-brand-carbon border border-brand-border rounded-2xl p-5 sm:p-6 shadow-card">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <FileText className="w-4 h-4 text-brand-green" />
                <span>Últimos Presupuestos</span>
              </h3>
              <Link to="/admin/presupuestos" className="text-xs text-brand-green hover:underline">
                Ver todos
              </Link>
            </div>

            <div className="divide-y divide-brand-border/40 text-xs">
              {recentQuotes.map((q) => (
                <div key={q.id} className="py-3 flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-white">{q.quote_number}</span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        q.status === 'ACEPTADO' ? 'bg-emerald-950 text-emerald-400' :
                        q.status === 'PENDIENTE' ? 'bg-amber-950 text-amber-400' : 'bg-brand-surface text-slate-400'
                      }`}>
                        {q.status}
                      </span>
                    </div>
                    <p className="text-slate-400 mt-0.5">{q.customer?.name} — {q.repair_type}</p>
                  </div>
                  <div className="text-right">
                    <span className="font-mono font-bold text-brand-green">{q.total.toFixed(2)} €</span>
                    <Link to={`/presupuesto/${q.id}`} target="_blank" className="block text-[10px] text-slate-500 hover:text-white">
                      Abrir ficha ↗
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>
    </AdminLayout>
  );
};
