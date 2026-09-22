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
  Printer
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
    if (!window.confirm(`¿Deseas convertir el presupuesto ${quote.quote_number} en una orden de reparación activa?`)) {
      return;
    }
    try {
      await dbService.updateQuoteStatus(quote.id, 'ACEPTADO');
      alert(`¡Orden de reparación ${quote.quote_number} creada con éxito!`);
      loadData();
    } catch (err) {
      console.error('Error converting quote to repair:', err);
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
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                        q.status === 'ACEPTADO' ? 'bg-emerald-950 text-emerald-400 border border-emerald-500/40' :
                        q.status === 'PENDIENTE' ? 'bg-amber-950 text-amber-400 border border-amber-500/40' :
                        'bg-brand-surface text-slate-400 border border-brand-border'
                      }`}>
                        {q.status}
                      </span>
                    </td>
                    <td className="p-3.5 text-right font-mono font-bold text-white text-sm">
                      {q.total.toFixed(2)} €
                    </td>
                    <td className="p-3.5">
                      <div className="flex items-center justify-center gap-2">
                        {q.status === 'PENDIENTE' && (
                          <button
                            onClick={() => handleConvertQuoteToRepair(q)}
                            className="px-2.5 py-1 rounded-lg bg-brand-green hover:bg-brand-green-neon text-black font-bold text-[10px] flex items-center gap-1 shadow-sm transition-all"
                            title="Convertir directamente a reparación"
                          >
                            <Wrench className="w-3 h-3" />
                            <span>Convertir a Taller</span>
                          </button>
                        )}
                        <button
                          onClick={() => handleDownloadPDF(q)}
                          className="p-1.5 rounded-lg bg-brand-surface hover:bg-brand-elevated text-slate-300 hover:text-white border border-brand-border"
                          title="Descargar PDF"
                        >
                          <Download className="w-3.5 h-3.5 text-brand-green" />
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
