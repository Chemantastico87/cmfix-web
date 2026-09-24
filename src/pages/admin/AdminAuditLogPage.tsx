import React, { useState, useEffect } from 'react';
import { 
  History, 
  Search, 
  Filter, 
  RefreshCw, 
  ShieldCheck, 
  Clock, 
  User, 
  FileText, 
  Wrench, 
  Package 
} from 'lucide-react';
import { AdminLayout } from '../../components/AdminLayout';
import { dbService } from '../../services/db';
import { AuditLogEntry } from '../../types';

export const AdminAuditLogPage: React.FC = () => {
  const [logs, setLogs] = useState<AuditLogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterEntity, setFilterEntity] = useState<string>('ALL');

  const loadLogs = async () => {
    setLoading(true);
    try {
      const data = await dbService.getAuditLogs();
      setLogs(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLogs();
  }, []);

  const filteredLogs = logs.filter(log => {
    const matchSearch =
      log.user_name.toLowerCase().includes(search.toLowerCase()) ||
      log.action.toLowerCase().includes(search.toLowerCase()) ||
      log.details.toLowerCase().includes(search.toLowerCase()) ||
      (log.entity_code && log.entity_code.toLowerCase().includes(search.toLowerCase()));

    const matchEntity = filterEntity === 'ALL' || log.entity_type === filterEntity;

    return matchSearch && matchEntity;
  });

  const getActionBadgeColor = (action: string) => {
    if (action.includes('CHECKIN') || action.includes('SIGN')) {
      return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40';
    }
    if (action.includes('DIAGNOSTIC')) {
      return 'bg-cyan-500/20 text-cyan-400 border-cyan-500/40';
    }
    if (action.includes('STATUS')) {
      return 'bg-blue-500/20 text-blue-400 border-blue-500/40';
    }
    if (action.includes('DELETE') || action.includes('CANCEL')) {
      return 'bg-red-500/20 text-red-400 border-red-500/40';
    }
    return 'bg-amber-500/20 text-amber-400 border-amber-500/40';
  };

  return (
    <AdminLayout>
      <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-brand-green/20 text-brand-green border border-brand-green/40 flex items-center justify-center">
              <History className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-white">
                Registro de Auditoría y Trazabilidad (Audit Log)
              </h1>
              <p className="text-xs text-slate-400">
                Historial cronológico inmutable de acciones, cambios de estado, firmas y recepciones técnicas
              </p>
            </div>
          </div>

          <button
            onClick={loadLogs}
            className="px-3.5 py-2 rounded-xl bg-brand-surface hover:bg-brand-elevated border border-brand-border text-slate-300 hover:text-white text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Actualizar</span>
          </button>
        </div>

        {/* Filters */}
        <div className="p-4 rounded-xl bg-brand-carbon border border-brand-border flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por usuario, acción o código CMF..."
              className="w-full pl-9 pr-4 py-2 rounded-lg bg-brand-dark border border-brand-border text-white text-xs focus:border-brand-green focus:outline-none"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Filter className="w-4 h-4 text-slate-500" />
            <select
              value={filterEntity}
              onChange={(e) => setFilterEntity(e.target.value)}
              className="px-3 py-2 rounded-lg bg-brand-dark border border-brand-border text-xs text-white focus:border-brand-green focus:outline-none cursor-pointer"
            >
              <option value="ALL">Todas las entidades</option>
              <option value="REPAIR">Reparaciones</option>
              <option value="QUOTE">Presupuestos</option>
              <option value="INVENTORY">Inventario</option>
              <option value="CUSTOMER">Clientes</option>
            </select>
          </div>
        </div>

        {/* Audit Log Table */}
        <div className="rounded-2xl bg-brand-carbon border border-brand-border overflow-hidden shadow-card">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-brand-surface/80 border-b border-brand-border text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="p-3.5">Fecha y Hora</th>
                  <th className="p-3.5">Usuario / Rol</th>
                  <th className="p-3.5">Acción</th>
                  <th className="p-3.5">Código / Referencia</th>
                  <th className="p-3.5">Detalle de la Operación</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-border/40">
                {loading ? (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-slate-400 font-mono">
                      Cargando registro de auditoría...
                    </td>
                  </tr>
                ) : filteredLogs.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-slate-500">
                      No se encontraron registros de auditoría.
                    </td>
                  </tr>
                ) : (
                  filteredLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-brand-surface/30 transition-colors">
                      <td className="p-3.5 text-slate-300 font-mono text-[11px] whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <Clock className="w-3 h-3 text-slate-500" />
                          <span>{new Date(log.timestamp).toLocaleString('es-ES')}</span>
                        </div>
                      </td>

                      <td className="p-3.5 whitespace-nowrap">
                        <div className="flex items-center gap-1.5 font-semibold text-white">
                          <User className="w-3.5 h-3.5 text-brand-green" />
                          <span>{log.user_name}</span>
                          <span className="text-[10px] text-slate-500 font-mono">({log.user_role})</span>
                        </div>
                      </td>

                      <td className="p-3.5 whitespace-nowrap">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${getActionBadgeColor(log.action)}`}>
                          {log.action}
                        </span>
                      </td>

                      <td className="p-3.5 font-mono font-bold text-brand-green whitespace-nowrap">
                        {log.entity_code || log.entity_id}
                      </td>

                      <td className="p-3.5 text-slate-300">
                        {log.details}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </AdminLayout>
  );
};
