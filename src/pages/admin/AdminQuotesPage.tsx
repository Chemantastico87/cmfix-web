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
  Printer,
  Trash2,
  RefreshCw,
  MessageCircle,
  Bell
} from 'lucide-react';
import { AdminLayout } from '../../components/AdminLayout';
import { dbService } from '../../services/db';
import { Quote, QuoteStatus, CompanySettings, PricingCatalogItem, DeviceCategory } from '../../types';
import { generateQuotePDF } from '../../utils/pdfGenerator';
import { getWhatsAppCustomerQuoteUrl, getWhatsAppNotificationUrl } from '../../services/notificationService';

export const AdminQuotesPage: React.FC = () => {
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [settings, setSettings] = useState<CompanySettings | null>(null);
  const [catalog, setCatalog] = useState<PricingCatalogItem[]>([]);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [loading, setLoading] = useState(true);
  const [convertingId, setConvertingId] = useState<string | null>(null);

  // New Quote Modal State (Manual vs Automatic)
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [newPricingMode, setNewPricingMode] = useState<'AUTO' | 'MANUAL'>('AUTO');
  const [newCustName, setNewCustName] = useState('');
  const [newCustPhone, setNewCustPhone] = useState('');
  const [newCustEmail, setNewCustEmail] = useState('');
  const [newCategory, setNewCategory] = useState<DeviceCategory>('iPhone');
  const [newBrand, setNewBrand] = useState('Apple');
  const [newModel, setNewModel] = useState('');
  const [newRepairType, setNewRepairType] = useState('Cambio de pantalla rota');
  const [newDescription, setNewDescription] = useState('');
  const [newSubtotal, setNewSubtotal] = useState<number>(65);

  const loadData = async () => {
    setLoading(true);
    try {
      const [q, s, cat] = await Promise.all([
        dbService.getQuotes(),
        dbService.getCompanySettings(),
        dbService.getPricingCatalog()
      ]);
      setQuotes(q);
      setSettings(s);
      setCatalog(cat);
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
    if (convertingId) return;
    if (!window.confirm(`¿Deseas convertir el presupuesto ${quote.quote_number} en una orden de reparación activa en taller?`)) {
      return;
    }
    setConvertingId(quote.id);
    try {
      await dbService.updateQuoteStatus(quote.id, 'ACEPTADO');
      alert(`¡Presupuesto ${quote.quote_number} aceptado y orden de reparación creada con éxito!`);
      await loadData();
    } catch (err) {
      console.error('Error converting quote to repair:', err);
    } finally {
      setConvertingId(null);
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

  const handleCreateQuote = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      let subtotalToUse = Number(newSubtotal);
      if (newPricingMode === 'AUTO') {
        const match = catalog.find(item => 
          item.category === newCategory && 
          item.repair_type.toLowerCase() === newRepairType.toLowerCase()
        );
        if (match) subtotalToUse = match.sale_price;
      }

      const quote = await dbService.createQuote({
        customerName: newCustName,
        customerPhone: newCustPhone,
        customerEmail: newCustEmail || 'cliente@cmfix.es',
        deviceCategory: newCategory,
        deviceBrand: newBrand,
        deviceModel: newModel,
        repairType: newRepairType,
        issueDescription: newDescription || newRepairType,
        subtotal: subtotalToUse,
        vatRate: 21,
        isOrientative: newPricingMode === 'AUTO',
        estimatedTime: '24-48 horas',
        items: [
          {
            id: 'qi-' + Date.now(),
            description: `${newRepairType} (${newBrand} ${newModel})`,
            type: 'PART',
            cost: subtotalToUse * 0.5,
            price: subtotalToUse,
            quantity: 1
          }
        ]
      });

      setIsNewModalOpen(false);
      // Reset form
      setNewCustName('');
      setNewCustPhone('');
      setNewCustEmail('');
      setNewModel('');
      setNewDescription('');
      await loadData();
      alert(`¡Presupuesto ${quote.quote_number} generado correctamente!`);
    } catch (err) {
      console.error('Error creating quote:', err);
      alert('Error al generar el presupuesto.');
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
            <button
              onClick={() => setIsNewModalOpen(true)}
              className="px-4 py-2 rounded-xl bg-brand-green hover:bg-brand-green-neon text-black font-extrabold text-xs flex items-center gap-1.5 shadow-neon"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>Nuevo Presupuesto (Manual / Auto)</span>
            </button>
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
                      <div className="flex items-center justify-center gap-1.5">
                        {q.status === 'PENDIENTE' && (
                          <button
                            onClick={() => handleConvertQuoteToRepair(q)}
                            disabled={convertingId === q.id}
                            className="px-2 py-1 rounded-lg bg-brand-green hover:bg-brand-green-neon text-black font-bold text-[10px] flex items-center gap-1 shadow-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            title="Convertir directamente a reparación en taller"
                          >
                            <Wrench className="w-3 h-3" />
                            <span>{convertingId === q.id ? 'Creando...' : 'A Taller'}</span>
                          </button>
                        )}
                        <a
                          href={getWhatsAppCustomerQuoteUrl(q)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1.5 rounded-lg bg-emerald-950/60 hover:bg-emerald-900/80 text-emerald-400 hover:text-emerald-200 border border-emerald-500/40 transition-colors"
                          title={`Enviar Presupuesto al Cliente (${q.customer?.phone || 'Sin teléfono'}) por WhatsApp`}
                        >
                          <MessageCircle className="w-3.5 h-3.5" />
                        </a>
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

        {/* MODAL: NUEVO PRESUPUESTO (MANUAL VS AUTO) */}
        {isNewModalOpen && (
          <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 backdrop-blur-sm animate-fadeIn">
            <div className="bg-brand-carbon border border-brand-green/60 rounded-2xl max-w-xl w-full p-6 shadow-neon max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between pb-4 border-b border-brand-border mb-5">
                <div>
                  <span className="text-[10px] font-mono text-brand-green uppercase font-bold">EMISIÓN DE PRESUPUESTO</span>
                  <h3 className="text-lg font-black text-white">Nuevo Presupuesto CM FIX</h3>
                </div>
                <button onClick={() => setIsNewModalOpen(false)} className="text-slate-400 hover:text-white">
                  <XCircle className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleCreateQuote} className="space-y-4">
                {/* Pricing Mode Toggle */}
                <div className="p-3 rounded-xl bg-brand-surface/60 border border-brand-border flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-300">Modo de Tarificación:</span>
                  <div className="flex p-1 bg-brand-dark rounded-xl border border-brand-border text-xs">
                    <button
                      type="button"
                      onClick={() => setNewPricingMode('AUTO')}
                      className={`px-3 py-1 rounded-lg font-bold transition-all ${
                        newPricingMode === 'AUTO'
                          ? 'bg-brand-green text-black shadow-neon-sm'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      Catálogo Automático
                    </button>
                    <button
                      type="button"
                      onClick={() => setNewPricingMode('MANUAL')}
                      className={`px-3 py-1 rounded-lg font-bold transition-all ${
                        newPricingMode === 'MANUAL'
                          ? 'bg-brand-green text-black shadow-neon-sm'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      Precio Manual
                    </button>
                  </div>
                </div>

                {/* Customer fields */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-slate-300 block mb-1">Nombre Cliente *</label>
                    <input
                      type="text"
                      required
                      value={newCustName}
                      onChange={(e) => setNewCustName(e.target.value)}
                      placeholder="Nombre y apellidos"
                      className="w-full px-3 py-2 rounded-xl bg-brand-dark border border-brand-border text-xs text-white focus:outline-none focus:border-brand-green"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-300 block mb-1">Teléfono (WhatsApp) *</label>
                    <input
                      type="tel"
                      required
                      value={newCustPhone}
                      onChange={(e) => setNewCustPhone(e.target.value)}
                      placeholder="612 345 678"
                      className="w-full px-3 py-2 rounded-xl bg-brand-dark border border-brand-border text-xs text-white font-mono focus:outline-none focus:border-brand-green"
                    />
                  </div>
                </div>

                {/* Device fields */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-slate-300 block mb-1">Categoría</label>
                    <select
                      value={newCategory}
                      onChange={(e: any) => setNewCategory(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-brand-dark border border-brand-border text-xs text-white focus:outline-none focus:border-brand-green"
                    >
                      {['iPhone', 'Samsung', 'Xiaomi', 'Android', 'PC', 'Portátil', 'Tablet', 'Consola', 'Otro'].map(c => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-300 block mb-1">Marca</label>
                    <input
                      type="text"
                      value={newBrand}
                      onChange={(e) => setNewBrand(e.target.value)}
                      placeholder="Apple, Samsung..."
                      className="w-full px-3 py-2 rounded-xl bg-brand-dark border border-brand-border text-xs text-white focus:outline-none focus:border-brand-green"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-300 block mb-1">Modelo *</label>
                    <input
                      type="text"
                      required
                      value={newModel}
                      onChange={(e) => setNewModel(e.target.value)}
                      placeholder="14 Pro, S23..."
                      className="w-full px-3 py-2 rounded-xl bg-brand-dark border border-brand-border text-xs text-white focus:outline-none focus:border-brand-green"
                    />
                  </div>
                </div>

                {/* Repair description */}
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Avería / Trabajo a Presupuestar *</label>
                  <input
                    type="text"
                    required
                    value={newRepairType}
                    onChange={(e) => setNewRepairType(e.target.value)}
                    placeholder="ej. Cambio de pantalla OLED o batería"
                    className="w-full px-3 py-2 rounded-xl bg-brand-dark border border-brand-border text-xs text-white focus:outline-none focus:border-brand-green"
                  />
                </div>

                {/* Price input */}
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">
                    {newPricingMode === 'MANUAL' ? 'Importe Base Manual (€ sin IVA) *' : 'Precio Estimado Catálogo (€ sin IVA)'}
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    min="0"
                    required
                    value={newSubtotal}
                    onChange={(e) => setNewSubtotal(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-brand-dark border border-brand-border text-xs text-white font-mono focus:outline-none focus:border-brand-green"
                  />
                </div>

                <div className="p-3 rounded-xl bg-brand-surface/60 border border-brand-border flex items-center justify-between text-xs">
                  <span className="text-slate-400">Total con IVA (21%):</span>
                  <span className="font-mono font-black text-brand-green text-base">
                    {(Number(newSubtotal) * 1.21).toFixed(2)} €
                  </span>
                </div>

                {/* Action buttons */}
                <div className="flex justify-end gap-3 pt-3 border-t border-brand-border">
                  <button
                    type="button"
                    onClick={() => setIsNewModalOpen(false)}
                    className="px-4 py-2 rounded-xl text-slate-400 hover:text-white text-xs font-semibold"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2.5 rounded-xl bg-brand-green hover:bg-brand-green-neon text-black font-extrabold text-xs shadow-neon transition-all"
                  >
                    Emitir Presupuesto
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

      </div>
    </AdminLayout>
  );
};
