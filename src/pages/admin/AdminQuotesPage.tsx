import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  FileText, 
  Search, 
  Filter, 
  Download, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Wrench, 
  ExternalLink,
  Plus,
  RefreshCw,
  Printer,
  Trash2
} from 'lucide-react';
import { AdminLayout } from '../../components/AdminLayout';
import { dbService } from '../../services/db';
import { Quote, QuoteStatus, CompanySettings } from '../../types';
import { generateQuotePDF } from '../../utils/pdfGenerator';

export const AdminQuotesPage: React.FC = () => {
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [settings, setSettings] = useState<CompanySettings | null>(null);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    setLoading(true);
    try {
      const [q, s] = await Promise.all([
        dbService.getQuotes(),
        dbService.getCompanySettings()
      ]);
      setQuotes(q);
      setSettings(s);
    } catch (err) {
      console.error('Error loading quotes:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleConvertQuoteToRepair = async (quote: Quote) => {
    if (!window.confirm(`¿Deseas convertir el presupuesto ${quote.quote_number} en una orden de reparación activa en taller?`)) {
      return;
    }
    try {
      await dbService.updateQuoteStatus(quote.id, 'ACEPTADO');
      alert(`¡Presupuesto ${quote.quote_number} aceptado y orden de reparación creada con éxito!`);
      loadData();
    } catch (err) {
      console.error('Error converting quote to repair:', err);
    }
  };

  const handleStatusChange = async (quote: Quote, newStatus: QuoteStatus) => {
    if (quote.status === newStatus) return;
    try {
      await dbService.updateQuoteStatus(quote.id, newStatus);
      await loadData();
    } catch (err) {
      console.error('Error updating quote status:', err);
      alert('Error al actualizar el estado del presupuesto.');
    }
  };

  const handleDeleteQuote = async (quote: Quote) => {
    const confirmDelete = window.confirm(
      `¿Estás seguro de que deseas eliminar permanentemente el presupuesto ${quote.quote_number} (${quote.customer?.name || 'Cliente'})?\n\nEsta acción eliminará el registro de la base de datos y no se puede deshacer.`
    );
    if (!confirmDelete) return;

    try {
      await dbService.deleteQuote(quote.id);
      await loadData();
    } catch (err) {
      console.error('Error deleting quote:', err);
      alert('Error al eliminar el presupuesto.');
    }
  };

  const handleDownloadPDF = async (quote: Quote) => {
    if (!settings) return;
    await generateQuotePDF(quote, settings);
  };

  const filtered = quotes.filter((q) => {
    const matchSearch =
      q.quote_number.toLowerCase().includes(search.toLowerCase()) ||
      q.customer?.name.toLowerCase().includes(search.toLowerCase()) ||
      q.device_model.toLowerCase().includes(search.toLowerCase()) ||
      q.repair_type.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === 'ALL' || q.status === filterStatus;
    return matchSearch && matchStatus;
  });

  return (
    <AdminLayout>
      <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto w-full">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-white flex items-center gap-2">
              <FileText className="w-6 h-6 text-brand-green" />
              <span>Gestión de Presupuestos</span>
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">
              Presupuestos emitidos online y presenciales, seguimiento de aceptación y conversión a taller.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={loadData}
              className="p-2 rounded-xl bg-brand-surface border border-brand-border text-slate-400 hover:text-white"
              title="Recargar"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-brand-green' : ''}`} />
            </button>
            <Link
              to="/presupuesto"
              target="_blank"
              className="px-4 py-2 rounded-xl bg-brand-green hover:bg-brand-green-neon text-black font-extrabold text-xs flex items-center gap-1.5 shadow-neon"
            >
              <Plus className="w-4 h-4" />
              <span>Nuevo Presupuesto</span>
            </Link>
          </div>
        </div>

        {/* Search & Filter */}
        <div className="bg-brand-carbon border border-brand-border rounded-xl p-4 flex flex-col sm:flex-row items-center gap-4">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por Nº CMF, cliente, modelo o avería..."
              className="w-full bg-brand-dark border border-brand-border rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-brand-green"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Filter className="w-4 h-4 text-slate-500 shrink-0" />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="bg-brand-dark border border-brand-border rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-brand-green w-full sm:w-48"
            >
              <option value="ALL">Todos los estados</option>
              <option value="PENDIENTE">PENDIENTE</option>
              <option value="ACEPTADO">ACEPTADO</option>
              <option value="RECHAZADO">RECHAZADO</option>
              <option value="CADUCADO">CADUCADO</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="bg-brand-carbon border border-brand-border rounded-2xl overflow-hidden shadow-card">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-brand-surface text-slate-300 border-b border-brand-border">
                <tr>
                  <th className="p-3.5 font-bold">Nº Presupuesto</th>
                  <th className="p-3.5 font-bold">Fecha</th>
                  <th className="p-3.5 font-bold">Cliente</th>
                  <th className="p-3.5 font-bold">Dispositivo / Avería</th>
                  <th className="p-3.5 font-bold text-center">Estado</th>
                  <th className="p-3.5 font-bold text-right">Total</th>
                  <th className="p-3.5 font-bold text-center">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-border/40 text-slate-200">
                {filtered.map((q) => (
                  <tr key={q.id} className="hover:bg-brand-surface/30">
                    <td className="p-3.5 font-mono font-bold text-brand-green">
                      <Link to={`/presupuesto/${q.id}`} target="_blank" className="hover:underline flex items-center gap-1">
                        <span>{q.quote_number}</span>
                        <ExternalLink className="w-3 h-3 opacity-60" />
                      </Link>
                    </td>
                    <td className="p-3.5 font-mono text-slate-400">
                      {new Date(q.created_at).toLocaleDateString('es-ES')}
                    </td>
                    <td className="p-3.5">
                      <div className="font-semibold text-white">{q.customer?.name}</div>
                      <div className="text-[10px] text-slate-500">{q.customer?.phone}</div>
                    </td>
                    <td className="p-3.5">
                      <div className="text-white font-medium">{q.device_brand} {q.device_model}</div>
                      <div className="text-[10px] text-slate-400">{q.repair_type}</div>
                    </td>
                    <td className="p-3.5 text-center">
                      <select
                        value={q.status}
                        onChange={(e) => handleStatusChange(q, e.target.value as QuoteStatus)}
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border cursor-pointer focus:outline-none transition-colors ${
                          q.status === 'ACEPTADO' 
                            ? 'bg-emerald-950/90 text-emerald-400 border-emerald-500/50 hover:border-emerald-400' 
                            : q.status === 'PENDIENTE' 
                            ? 'bg-amber-950/90 text-amber-400 border-amber-500/50 hover:border-amber-400' 
                            : q.status === 'RECHAZADO'
                            ? 'bg-red-950/90 text-red-400 border-red-500/50 hover:border-red-400'
                            : 'bg-brand-surface text-slate-400 border-brand-border hover:border-slate-500'
                        }`}
                        title="Haz clic para cambiar el estado"
                      >
                        <option value="PENDIENTE" className="bg-brand-carbon text-amber-400">PENDIENTE</option>
                        <option value="ACEPTADO" className="bg-brand-carbon text-emerald-400">ACEPTADO</option>
                        <option value="RECHAZADO" className="bg-brand-carbon text-red-400">RECHAZADO</option>
                        <option value="CADUCADO" className="bg-brand-carbon text-slate-400">CADUCADO</option>
                      </select>
                    </td>
                    <td className="p-3.5 text-right font-mono font-bold text-white text-sm">
                      {q.total.toFixed(2)} €
                    </td>
                    <td className="p-3.5">
                      <div className="flex items-center justify-center gap-2">
                        {q.status === 'PENDIENTE' && (
                          <button
                            onClick={() => handleConvertQuoteToRepair(q)}
                            className="px-2 py-1 rounded-lg bg-brand-green hover:bg-brand-green-neon text-black font-bold text-[10px] flex items-center gap-1 shadow-sm transition-all"
                            title="Convertir directamente a reparación en taller"
                          >
                            <Wrench className="w-3 h-3" />
                            <span>A Taller</span>
                          </button>
                        )}
                        <button
                          onClick={() => handleDownloadPDF(q)}
                          className="p-1.5 rounded-lg bg-brand-surface hover:bg-brand-elevated text-slate-300 hover:text-white border border-brand-border transition-colors"
                          title="Descargar presupuesto en PDF"
                        >
                          <Download className="w-3.5 h-3.5 text-brand-green" />
                        </button>
                        <button
                          onClick={() => handleDeleteQuote(q)}
                          className="p-1.5 rounded-lg bg-red-950/40 hover:bg-red-900/60 text-red-400 hover:text-red-200 border border-red-500/30 transition-colors"
                          title="Eliminar presupuesto"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </AdminLayout>
  );
};
