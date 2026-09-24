import React, { useState, useEffect } from 'react';
import { X, Search, History, Smartphone, Calendar, Wrench, CheckCircle, Tag, Euro } from 'lucide-react';
import { Repair } from '../types';
import { dbService } from '../services/db';

interface DeviceHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialQuery?: string;
}

export const DeviceHistoryModal: React.FC<DeviceHistoryModalProps> = ({
  isOpen,
  onClose,
  initialQuery = ''
}) => {
  const [query, setQuery] = useState(initialQuery);
  const [history, setHistory] = useState<Repair[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (initialQuery) {
        setQuery(initialQuery);
        executeSearch(initialQuery);
      } else {
        loadRecentHistory();
      }
    }
  }, [isOpen, initialQuery]);

  const loadRecentHistory = async () => {
    setLoading(true);
    try {
      const repairs = await dbService.getRepairs();
      setHistory(repairs.slice(0, 10));
      setSearched(false);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const executeSearch = async (term: string) => {
    if (!term.trim()) {
      loadRecentHistory();
      return;
    }
    setLoading(true);
    setSearched(true);
    try {
      const results = await dbService.getDeviceHistory(term);
      setHistory(results);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    executeSearch(query);
  };

  if (!isOpen) return null;

  const totalSpent = history.reduce((acc, r) => acc + (r.price_total || 0), 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-brand-carbon border border-brand-green/60 rounded-2xl w-full max-w-3xl shadow-neon overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-brand-border bg-brand-surface/60 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-brand-green/20 text-brand-green border border-brand-green/40 flex items-center justify-center">
              <History className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-white text-base">Historial de Reparaciones del Dispositivo</h3>
              <p className="text-xs text-slate-400">
                Consulta antecedentes técnicos por IMEI, Número de Serie o Modelo
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-brand-surface transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search Bar */}
        <div className="p-4 bg-brand-dark border-b border-brand-border/60">
          <form onSubmit={handleSearchSubmit} className="flex gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Escribe IMEI, número de serie, cliente o modelo..."
                className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-brand-surface/70 border border-brand-border text-white text-xs placeholder-slate-500 focus:border-brand-green focus:outline-none"
              />
            </div>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-brand-green hover:bg-brand-green-neon text-black font-extrabold text-xs shadow-neon transition-all"
            >
              Buscar
            </button>
          </form>
        </div>

        {/* Results summary if found */}
        {history.length > 0 && (
          <div className="px-5 py-2.5 bg-brand-surface/30 border-b border-brand-border/40 flex items-center justify-between text-xs">
            <span className="text-slate-400">
              Registros encontrados: <strong className="text-white">{history.length}</strong>
            </span>
            <span className="text-slate-400 flex items-center gap-1.5">
              Total acumulado taller: 
              <strong className="text-brand-green font-mono font-bold text-sm">
                {totalSpent.toFixed(2)} €
              </strong>
            </span>
          </div>
        )}

        {/* Timeline List */}
        <div className="p-5 flex-1 overflow-y-auto space-y-4">
          {loading ? (
            <div className="p-8 text-center text-xs text-brand-green font-mono">
              Buscando historial técnico...
            </div>
          ) : history.length === 0 ? (
            <div className="p-8 text-center text-slate-500 text-xs">
              {searched ? 'No se encontraron antecedentes para este criterio.' : 'No hay registros previos.'}
            </div>
          ) : (
            history.map((rep) => (
              <div
                key={rep.id}
                className="p-4 rounded-xl bg-brand-surface/40 border border-brand-border/70 hover:border-brand-green/40 transition-colors space-y-3"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2.5 border-b border-brand-border/40">
                  <div className="flex items-center gap-2.5">
                    <span className="font-mono text-xs font-bold text-brand-green">
                      {rep.repair_number}
                    </span>
                    <span className="text-xs text-slate-400">·</span>
                    <span className="text-xs font-bold text-white">
                      {rep.device_brand} {rep.device_model}
                    </span>
                    {rep.serial_imei && (
                      <span className="text-[10px] font-mono text-slate-400 bg-brand-dark px-1.5 py-0.5 rounded border border-brand-border">
                        IMEI: {rep.serial_imei}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-3 text-xs">
                    <span className="text-slate-400 flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-brand-green" />
                      {new Date(rep.entry_date).toLocaleDateString('es-ES')}
                    </span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-brand-green/20 text-brand-green border border-brand-green/40">
                      {rep.status}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-slate-400 block text-[11px]">Trabajo realizado / Avería:</span>
                    <p className="text-slate-200 mt-0.5 font-medium">{rep.work_performed || rep.issue_description}</p>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">Diagnóstico técnico:</span>
                    <p className="text-slate-200 mt-0.5 italic">{rep.diagnosis || 'Revisión técnica conforme.'}</p>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1 text-xs">
                  <span className="text-slate-400">
                    Cliente: <strong className="text-white">{rep.customer?.name}</strong>
                  </span>
                  <span className="font-mono font-bold text-brand-green text-sm">
                    {Number(rep.price_total || 0).toFixed(2)} €
                  </span>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-brand-border bg-brand-surface/40 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-brand-surface hover:bg-brand-elevated text-slate-200 text-xs font-semibold"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
