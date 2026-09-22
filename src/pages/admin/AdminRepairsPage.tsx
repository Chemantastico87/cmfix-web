import React, { useState, useEffect } from 'react';
import { 
  Wrench, 
  Search, 
  Filter, 
  Plus, 
  CheckCircle2, 
  Clock, 
  Eye, 
  Edit3, 
  MessageSquare, 
  Phone, 
  QrCode,
  Calendar,
  X,
  ArrowRight,
  TrendingUp,
  Tag
} from 'lucide-react';
import QRCode from 'qrcode';
import { AdminLayout } from '../../components/AdminLayout';
import { dbService } from '../../services/db';
import { Repair, RepairStatus, DeviceCategory } from '../../types';

export const AdminRepairsPage: React.FC = () => {
  const [repairs, setRepairs] = useState<Repair[]>([]);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [viewMode, setViewMode] = useState<'KANBAN' | 'LIST'>('KANBAN');
  const [loading, setLoading] = useState(true);

  // Selected Repair Modal
  const [selectedRepair, setSelectedRepair] = useState<Repair | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalStatus, setModalStatus] = useState<RepairStatus>('RECIBIDO');
  const [modalNotesPublic, setModalNotesPublic] = useState('');
  const [modalCost, setModalCost] = useState(0);
  const [modalPrice, setModalPrice] = useState(0);
  const [modalQR, setModalQR] = useState<string | null>(null);

  // New Repair Modal
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [newCustomerName, setNewCustomerName] = useState('');
  const [newCustomerPhone, setNewCustomerPhone] = useState('');
  const [newCategory, setNewCategory] = useState<DeviceCategory>('iPhone');
  const [newBrand, setNewBrand] = useState('Apple');
  const [newModel, setNewModel] = useState('');
  const [newIssue, setNewIssue] = useState('');
  const [newPrice, setNewPrice] = useState(50);

  const statuses: RepairStatus[] = [
    'RECIBIDO',
    'DIAGNÓSTICO',
    'PRESUPUESTO',
    'ESPERANDO APROBACIÓN',
    'APROBADO',
    'EN REPARACIÓN',
    'ESPERANDO PIEZA',
    'REPARADO',
    'LISTO PARA RECOGER',
    'ENTREGADO',
    'CANCELADO'
  ];

  const loadRepairs = async () => {
    setLoading(true);
    try {
      const data = await dbService.getRepairs();
      setRepairs(data);
    } catch (err) {
      console.error('Error loading repairs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRepairs();
  }, []);

  const openRepairDetail = async (repair: Repair) => {
    setSelectedRepair(repair);
    setModalStatus(repair.status);
    setModalNotesPublic(repair.notes_public || '');
    setModalCost(repair.cost_total || 0);
    setModalPrice(repair.price_total || 0);

    const url = `${window.location.origin}/seguimiento/${repair.repair_number}`;
    const qr = await QRCode.toDataURL(url, { width: 140, margin: 1, color: { dark: '#22c55e', light: '#0c120e' } });
    setModalQR(qr);
    setIsModalOpen(true);
  };

  const handleSaveRepairModal = async () => {
    if (!selectedRepair) return;
    try {
      await dbService.updateRepair(selectedRepair.id, {
        cost_total: Number(modalCost),
        price_total: Number(modalPrice)
      });
      await dbService.updateRepairStatus(
        selectedRepair.id,
        modalStatus,
        modalNotesPublic,
        'CM FIX Admin'
      );
      setIsModalOpen(false);
      loadRepairs();
    } catch (err) {
      console.error('Error updating repair:', err);
    }
  };

  const handleCreateNewRepair = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Create quote & convert to repair
      const quote = await dbService.createQuote({
        customerName: newCustomerName,
        customerPhone: newCustomerPhone,
        customerEmail: 'taller@cmfix.es',
        deviceCategory: newCategory,
        deviceBrand: newBrand,
        deviceModel: newModel,
        repairType: newIssue,
        issueDescription: newIssue,
        subtotal: Number(newPrice),
        vatRate: 21,
        isOrientative: false,
        estimatedTime: '24-48 horas'
      });
      await dbService.updateQuoteStatus(quote.id, 'ACEPTADO');
      setIsNewModalOpen(false);
      loadRepairs();
      // Reset
      setNewCustomerName('');
      setNewCustomerPhone('');
      setNewModel('');
      setNewIssue('');
    } catch (err) {
      console.error('Error creating manual repair:', err);
    }
  };

  const sendWhatsAppNotification = (repair: Repair) => {
    const phone = repair.customer?.phone ? repair.customer.phone.replace(/\D/g, '') : '';
    const text = encodeURIComponent(
      `Hola ${repair.customer?.name || 'cliente'}, te informamos desde CM FIX que tu reparación ${repair.repair_number} (${repair.device_brand} ${repair.device_model}) se encuentra en estado: *${repair.status}*.\nPuedes seguirla en vivo aquí: ${window.location.origin}/seguimiento/${repair.repair_number}`
    );
    window.open(`https://wa.me/${phone}?text=${text}`, '_blank');
  };

  // Filtered repairs
  const filtered = repairs.filter((r) => {
    const matchSearch =
      r.repair_number.toLowerCase().includes(search.toLowerCase()) ||
      r.customer?.name.toLowerCase().includes(search.toLowerCase()) ||
      r.device_model.toLowerCase().includes(search.toLowerCase()) ||
      (r.serial_imei && r.serial_imei.includes(search));
    const matchStatus = filterStatus === 'ALL' || r.status === filterStatus;
    return matchSearch && matchStatus;
  });

  return (
    <AdminLayout>
      <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto w-full">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-white flex items-center gap-2">
              <Wrench className="w-6 h-6 text-brand-green" />
              <span>Gestión Integral de Reparaciones</span>
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">
              Control de flujo técnico, estados de taller, costes, beneficio y notificación directa.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center p-1 bg-brand-surface border border-brand-border rounded-xl text-xs font-semibold">
              <button
                onClick={() => setViewMode('KANBAN')}
                className={`px-3 py-1.5 rounded-lg transition-all ${viewMode === 'KANBAN' ? 'bg-brand-green text-black font-bold' : 'text-slate-400 hover:text-white'}`}
              >
                Kanban
              </button>
              <button
                onClick={() => setViewMode('LIST')}
                className={`px-3 py-1.5 rounded-lg transition-all ${viewMode === 'LIST' ? 'bg-brand-green text-black font-bold' : 'text-slate-400 hover:text-white'}`}
              >
                Lista
              </button>
            </div>

            <button
              onClick={() => setIsNewModalOpen(true)}
              className="px-4 py-2 rounded-xl bg-brand-green hover:bg-brand-green-neon text-black font-extrabold text-xs flex items-center gap-1.5 shadow-neon transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Entrada Rápida</span>
            </button>
          </div>
        </div>

        {/* Filters and search bar */}
        <div className="bg-brand-carbon border border-brand-border rounded-xl p-4 flex flex-col sm:flex-row items-center gap-4">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por Nº CMF, cliente, modelo o IMEI..."
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
              {statuses.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
        </div>

        {/* VIEW 1: KANBAN BOARD */}
        {viewMode === 'KANBAN' && (
          <div className="flex gap-4 overflow-x-auto pb-6 scrollbar-thin">
            {[
              { col: 'RECIBIDO', title: '📥 Recibido / Espera', color: 'border-slate-500/40 text-slate-300' },
              { col: 'DIAGNÓSTICO', title: '🔍 En Diagnóstico', color: 'border-blue-500/40 text-blue-300' },
              { col: 'APROBADO', title: '✅ Aprobado / Cola', color: 'border-purple-500/40 text-purple-300' },
              { col: 'EN REPARACIÓN', title: '⚙️ En Reparación', color: 'border-amber-500/40 text-amber-300' },
              { col: 'REPARADO', title: '🔬 Reparado / Tests', color: 'border-teal-500/40 text-teal-300' },
              { col: 'LISTO PARA RECOGER', title: '📦 Listo para Recoger', color: 'border-emerald-500/60 text-emerald-300' }
            ].map((column) => {
              const items = filtered.filter(r => r.status === column.col);
              return (
                <div key={column.col} className="w-72 shrink-0 bg-brand-carbon/70 border border-brand-border rounded-2xl p-3 flex flex-col max-h-[75vh]">
                  <div className={`p-2 rounded-xl bg-brand-surface/80 border mb-3 flex items-center justify-between ${column.color}`}>
                    <span className="text-xs font-bold">{column.title}</span>
                    <span className="font-mono text-xs px-2 py-0.5 rounded-full bg-brand-dark font-bold">
                      {items.length}
                    </span>
                  </div>

                  <div className="space-y-3 overflow-y-auto flex-1 pr-1">
                    {items.map((repair) => (
                      <div
                        key={repair.id}
                        onClick={() => openRepairDetail(repair)}
                        className="p-3.5 rounded-xl bg-brand-surface border border-brand-border hover:border-brand-green/50 cursor-pointer transition-all hover:scale-[1.02] shadow-sm group"
                      >
                        <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
                          <span className="text-brand-green font-bold group-hover:underline">{repair.repair_number}</span>
                          <span>{repair.price_total.toFixed(2)} €</span>
                        </div>

                        <h4 className="font-bold text-white text-xs mt-1 truncate">
                          {repair.device_brand} {repair.device_model}
                        </h4>
                        <p className="text-[11px] text-slate-400 mt-0.5 truncate">
                          {repair.customer?.name}
                        </p>

                        <div className="mt-3 pt-2 border-t border-brand-border/40 flex items-center justify-between text-[10px] text-slate-500">
                          <span className="truncate">{repair.work_performed || repair.issue_description}</span>
                          <span className="text-emerald-400 font-mono font-bold shrink-0">+{repair.profit.toFixed(0)}€</span>
                        </div>
                      </div>
                    ))}
                    {items.length === 0 && (
                      <p className="text-center text-[11px] text-slate-600 py-6">Sin órdenes</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* VIEW 2: LIST TABLE */}
        {viewMode === 'LIST' && (
          <div className="bg-brand-carbon border border-brand-border rounded-2xl overflow-hidden shadow-card">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-brand-surface text-slate-300 border-b border-brand-border">
                  <tr>
                    <th className="p-3.5 font-bold">Nº Orden</th>
                    <th className="p-3.5 font-bold">Cliente</th>
                    <th className="p-3.5 font-bold">Dispositivo</th>
                    <th className="p-3.5 font-bold">Estado</th>
                    <th className="p-3.5 font-bold text-right">Precio</th>
                    <th className="p-3.5 font-bold text-right">Beneficio</th>
                    <th className="p-3.5 font-bold text-center">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-brand-border/40 text-slate-200">
                  {filtered.map((r) => (
                    <tr key={r.id} className="hover:bg-brand-surface/30">
                      <td className="p-3.5 font-mono font-bold text-brand-green">{r.repair_number}</td>
                      <td className="p-3.5">
                        <div className="font-semibold text-white">{r.customer?.name}</div>
                        <div className="text-[10px] text-slate-500">{r.customer?.phone}</div>
                      </td>
                      <td className="p-3.5">
                        <div className="text-white font-medium">{r.device_brand} {r.device_model}</div>
                        <div className="text-[10px] text-slate-500">{r.issue_description}</div>
                      </td>
                      <td className="p-3.5">
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-brand-surface text-brand-green border border-brand-green/30">
                          {r.status}
                        </span>
                      </td>
                      <td className="p-3.5 text-right font-mono font-bold text-white">{r.price_total.toFixed(2)} €</td>
                      <td className="p-3.5 text-right font-mono font-bold text-emerald-400">+{r.profit.toFixed(2)} €</td>
                      <td className="p-3.5">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => openRepairDetail(r)}
                            className="p-1.5 rounded-lg bg-brand-surface hover:bg-brand-elevated text-slate-300 hover:text-white"
                            title="Editar ficha"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => sendWhatsAppNotification(r)}
                            className="p-1.5 rounded-lg bg-emerald-950/60 hover:bg-emerald-900 text-emerald-400"
                            title="Avisar por WhatsApp"
                          >
                            <MessageSquare className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* MODAL: DETALLE / EDICIÓN DE REPARACIÓN */}
        {isModalOpen && selectedRepair && (
          <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 backdrop-blur-sm animate-fadeIn">
            <div className="bg-brand-carbon border border-brand-green/40 rounded-2xl max-w-2xl w-full p-6 shadow-neon max-h-[90vh] overflow-y-auto">
              
              <div className="flex items-center justify-between pb-4 border-b border-brand-border/60 mb-5">
                <div>
                  <span className="text-[10px] font-mono text-brand-green uppercase font-bold">FICHA TÉCNICA</span>
                  <h3 className="text-xl font-black text-white font-mono">{selectedRepair.repair_number}</h3>
                </div>
                <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Customer & Device quick info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-5 text-xs">
                <div className="p-3 rounded-xl bg-brand-surface border border-brand-border">
                  <span className="text-slate-400 block mb-1">Cliente:</span>
                  <p className="font-bold text-white text-sm">{selectedRepair.customer?.name}</p>
                  <p className="text-slate-400 mt-0.5">{selectedRepair.customer?.phone}</p>
                </div>

                <div className="p-3 rounded-xl bg-brand-surface border border-brand-border">
                  <span className="text-slate-400 block mb-1">Dispositivo:</span>
                  <p className="font-bold text-white text-sm">{selectedRepair.device_brand} {selectedRepair.device_model}</p>
                  <p className="text-slate-400 mt-0.5">Cat: {selectedRepair.device_category}</p>
                </div>
              </div>

              {/* Status Selector */}
              <div className="space-y-4 mb-5">
                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                    Cambiar Estado Actual
                  </label>
                  <select
                    value={modalStatus}
                    onChange={(e) => setModalStatus(e.target.value as RepairStatus)}
                    className="w-full bg-brand-dark border border-brand-border rounded-xl px-4 py-2.5 text-sm text-brand-green font-bold focus:outline-none focus:border-brand-green"
                  >
                    {statuses.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                    Notas Públicas para el Cliente (Visible en /seguimiento)
                  </label>
                  <textarea
                    value={modalNotesPublic}
                    onChange={(e) => setModalNotesPublic(e.target.value)}
                    rows={2}
                    placeholder="Ej. Tu pantalla ha sido instalada y está superando los tests de calibración."
                    className="w-full bg-brand-dark border border-brand-border rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-brand-green resize-none"
                  />
                </div>

                {/* Financials: Cost & Sale Price */}
                <div className="grid grid-cols-2 gap-4 pt-2">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Coste Piezas (€)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={modalCost}
                      onChange={(e) => setModalCost(Number(e.target.value))}
                      className="w-full bg-brand-dark border border-brand-border rounded-xl px-4 py-2 text-xs text-white font-mono focus:outline-none focus:border-brand-green"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Precio Venta Cliente (€)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={modalPrice}
                      onChange={(e) => setModalPrice(Number(e.target.value))}
                      className="w-full bg-brand-dark border border-brand-border rounded-xl px-4 py-2 text-xs text-white font-mono focus:outline-none focus:border-brand-green"
                    />
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-brand-surface border border-brand-border flex items-center justify-between text-xs">
                  <span className="text-slate-400">Beneficio Neto Calculado:</span>
                  <span className="font-mono font-bold text-emerald-400 text-sm">
                    +{(Number(modalPrice) - Number(modalCost)).toFixed(2)} €
                  </span>
                </div>
              </div>

              {/* QR and Direct WhatsApp Notification */}
              <div className="p-4 rounded-xl bg-brand-dark border border-brand-border flex items-center justify-between gap-4 mb-6">
                <div className="flex items-center gap-3">
                  {modalQR && <img src={modalQR} alt="QR" className="w-16 h-16 rounded object-contain" />}
                  <div>
                    <span className="text-xs font-bold text-white block">QR de Seguimiento</span>
                    <span className="text-[10px] text-slate-400">Pega en el resguardo o imprime</span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => sendWhatsAppNotification(selectedRepair)}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition-all"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>Avisar WhatsApp</span>
                </button>
              </div>

              {/* Modal action buttons */}
              <div className="flex justify-end gap-3 pt-3 border-t border-brand-border/60">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-brand-border text-slate-300 text-xs font-semibold hover:text-white"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleSaveRepairModal}
                  className="px-6 py-2 rounded-xl bg-brand-green hover:bg-brand-green-neon text-black font-extrabold text-xs shadow-neon"
                >
                  Guardar Cambios
                </button>
              </div>

            </div>
          </div>
        )}

        {/* MODAL: ENTRADA RÁPIDA DE REPARACIÓN */}
        {isNewModalOpen && (
          <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 backdrop-blur-sm animate-fadeIn">
            <form 
              onSubmit={handleCreateNewRepair}
              className="bg-brand-carbon border border-brand-green/40 rounded-2xl max-w-lg w-full p-6 shadow-neon"
            >
              <div className="flex items-center justify-between pb-3 border-b border-brand-border/60 mb-4">
                <h3 className="text-lg font-black text-white">Entrada Rápida en Taller</h3>
                <button type="button" onClick={() => setIsNewModalOpen(false)} className="text-slate-400 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Nombre del Cliente *</label>
                  <input
                    type="text"
                    value={newCustomerName}
                    onChange={(e) => setNewCustomerName(e.target.value)}
                    required
                    placeholder="Ej. Carlos Mendoza"
                    className="w-full bg-brand-dark border border-brand-border rounded-xl px-3 py-2 text-white"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Teléfono / WhatsApp *</label>
                  <input
                    type="tel"
                    value={newCustomerPhone}
                    onChange={(e) => setNewCustomerPhone(e.target.value)}
                    required
                    placeholder="Ej. 624 89 20 41"
                    className="w-full bg-brand-dark border border-brand-border rounded-xl px-3 py-2 text-white"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Marca</label>
                    <input
                      type="text"
                      value={newBrand}
                      onChange={(e) => setNewBrand(e.target.value)}
                      required
                      className="w-full bg-brand-dark border border-brand-border rounded-xl px-3 py-2 text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Modelo Exacto *</label>
                    <input
                      type="text"
                      value={newModel}
                      onChange={(e) => setNewModel(e.target.value)}
                      required
                      placeholder="Ej. iPhone 14 Pro"
                      className="w-full bg-brand-dark border border-brand-border rounded-xl px-3 py-2 text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Avería o Trabajo a Realizar *</label>
                  <input
                    type="text"
                    value={newIssue}
                    onChange={(e) => setNewIssue(e.target.value)}
                    required
                    placeholder="Ej. Sustitución de pantalla OLED"
                    className="w-full bg-brand-dark border border-brand-border rounded-xl px-3 py-2 text-white"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Precio Acordado con Cliente (€) *</label>
                  <input
                    type="number"
                    step="0.01"
                    value={newPrice}
                    onChange={(e) => setNewPrice(Number(e.target.value))}
                    required
                    className="w-full bg-brand-dark border border-brand-border rounded-xl px-3 py-2 text-white font-mono"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-5 mt-4 border-t border-brand-border/60">
                <button
                  type="button"
                  onClick={() => setIsNewModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-brand-border text-slate-300 text-xs font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 rounded-xl bg-brand-green hover:bg-brand-green-neon text-black font-extrabold text-xs shadow-neon"
                >
                  Crear Reparación
                </button>
              </div>
            </form>
          </div>
        )}

      </div>
    </AdminLayout>
  );
};
