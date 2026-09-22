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
  ExternalLink
} from 'lucide-react';
import { AdminLayout } from '../../components/AdminLayout';
import { dbService } from '../../services/db';
import { DashboardStats, Quote, Repair } from '../../types';

export const AdminDashboardPage: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentRepairs, setRecentRepairs] = useState<Repair[]>([]);
  const [recentQuotes, setRecentQuotes] = useState<Quote[]>([]);
  const [loading, setLoading] = useState(true);

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
