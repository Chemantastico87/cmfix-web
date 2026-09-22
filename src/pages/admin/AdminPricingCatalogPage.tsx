import React, { useState, useEffect } from 'react';
import { 
  Tag, 
  Plus, 
  Search, 
  Filter, 
  Edit3, 
  Trash2, 
  X, 
  Calculator,
  TrendingUp,
  Clock
} from 'lucide-react';
import { AdminLayout } from '../../components/AdminLayout';
import { dbService } from '../../services/db';
import { PricingCatalogItem, DeviceCategory } from '../../types';

export const AdminPricingCatalogPage: React.FC = () => {
  const [items, setItems] = useState<PricingCatalogItem[]>([]);
  const [search, setSearch] = useState('');
  const [filterCat, setFilterCat] = useState<string>('ALL');
  const [loading, setLoading] = useState(true);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [category, setCategory] = useState<DeviceCategory>('iPhone');
  const [brand, setBrand] = useState('Apple');
  const [model, setModel] = useState('');
  const [repairType, setRepairType] = useState('');
  const [partCost, setPartCost] = useState(0);
  const [laborCost, setLaborCost] = useState(35);
  const [salePrice, setSalePrice] = useState(0);
  const [estimatedTime, setEstimatedTime] = useState('1-2 horas');
  const [supplierRef, setSupplierRef] = useState('');
  const [notes, setNotes] = useState('');

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await dbService.getPricingCatalog();
      setItems(data);
    } catch (err) {
      console.error('Error loading pricing items:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const openCreateModal = () => {
    setEditingId(null);
    setCategory('iPhone');
    setBrand('Apple');
    setModel('');
    setRepairType('');
    setPartCost(0);
    setLaborCost(35);
    setSalePrice(0);
    setEstimatedTime('1-2 horas');
    setSupplierRef('');
    setNotes('');
    setIsModalOpen(true);
  };

  const openEditModal = (item: PricingCatalogItem) => {
    setEditingId(item.id);
    setCategory(item.category);
    setBrand(item.brand);
    setModel(item.model);
    setRepairType(item.repair_type);
    setPartCost(item.part_cost);
    setLaborCost(item.labor_cost);
    setSalePrice(item.sale_price);
    setEstimatedTime(item.estimated_time);
    setSupplierRef(item.supplier_ref || '');
    setNotes(item.notes || '');
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        await dbService.updatePricingItem(editingId, {
          category,
          brand,
          model,
          repair_type: repairType,
          part_cost: Number(partCost),
          labor_cost: Number(laborCost),
          sale_price: Number(salePrice),
          estimated_time: estimatedTime,
          supplier_ref: supplierRef,
          notes
        });
      } else {
        await dbService.addPricingItem({
          category,
          brand,
          model,
          repair_type: repairType,
          part_cost: Number(partCost),
          labor_cost: Number(laborCost),
          sale_price: Number(salePrice),
          estimated_time: estimatedTime,
          supplier_ref: supplierRef,
          notes
        });
      }
      setIsModalOpen(false);
      loadData();
    } catch (err) {
      console.error('Error saving pricing item:', err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('¿Eliminar esta tarifa del catálogo?')) return;
    await dbService.deletePricingItem(id);
    loadData();
  };

  // Auto-calculated margin preview inside modal
  const marginPreview = Number(salePrice) - (Number(partCost) + Number(laborCost));

  const filtered = items.filter((i) => {
    const matchSearch =
      i.model.toLowerCase().includes(search.toLowerCase()) ||
      i.repair_type.toLowerCase().includes(search.toLowerCase()) ||
      i.brand.toLowerCase().includes(search.toLowerCase());
    const matchCat = filterCat === 'ALL' || i.category === filterCat;
    return matchSearch && matchCat;
  });

  return (
    <AdminLayout>
      <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto w-full">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-white flex items-center gap-2">
              <Tag className="w-6 h-6 text-brand-green" />
              <span>Matriz de Precios y Reparaciones</span>
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">
              Catálogo administrable: tarifas por modelo, coste de pieza, mano de obra y cálculo automático de margen.
            </p>
          </div>

          <button
            onClick={openCreateModal}
            className="px-4 py-2 rounded-xl bg-brand-green hover:bg-brand-green-neon text-black font-extrabold text-xs flex items-center gap-1.5 shadow-neon transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Añadir Tarifa</span>
          </button>
        </div>

        {/* Search and Filters */}
        <div className="bg-brand-carbon border border-brand-border rounded-xl p-4 flex flex-col sm:flex-row items-center gap-4">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por modelo o tipo de avería..."
              className="w-full bg-brand-dark border border-brand-border rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-brand-green"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Filter className="w-4 h-4 text-slate-500 shrink-0" />
            <select
              value={filterCat}
              onChange={(e) => setFilterCat(e.target.value)}
              className="bg-brand-dark border border-brand-border rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-brand-green w-full sm:w-48"
            >
              <option value="ALL">Todas las categorías</option>
              <option value="iPhone">iPhone</option>
              <option value="Samsung">Samsung</option>
              <option value="Xiaomi">Xiaomi</option>
              <option value="PC">PC Sobremesa</option>
              <option value="Portátil">Portátil</option>
            </select>
          </div>
        </div>

        {/* Pricing Table */}
        <div className="bg-brand-carbon border border-brand-border rounded-2xl overflow-hidden shadow-card">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-brand-surface text-slate-300 border-b border-brand-border">
                <tr>
                  <th className="p-3.5 font-bold">Dispositivo / Modelo</th>
                  <th className="p-3.5 font-bold">Tipo de Reparación</th>
                  <th className="p-3.5 font-bold text-right">Coste Pieza</th>
                  <th className="p-3.5 font-bold text-right">Mano Obra</th>
                  <th className="p-3.5 font-bold text-right">PVP Venta</th>
                  <th className="p-3.5 font-bold text-right">Margen Neto</th>
                  <th className="p-3.5 font-bold text-center">Tiempo</th>
                  <th className="p-3.5 font-bold text-center">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-border/40 text-slate-200">
                {filtered.map((item) => (
                  <tr key={item.id} className="hover:bg-brand-surface/30">
                    <td className="p-3.5">
                      <div className="font-bold text-white">{item.brand} {item.model}</div>
                      <span className="text-[10px] text-brand-green font-mono">({item.category})</span>
                    </td>
                    <td className="p-3.5">
                      <div className="font-medium text-slate-200">{item.repair_type}</div>
                      {item.supplier_ref && (
                        <div className="text-[10px] text-slate-500 font-mono">Ref: {item.supplier_ref}</div>
                      )}
                    </td>
                    <td className="p-3.5 text-right font-mono text-slate-400">{item.part_cost.toFixed(2)} €</td>
                    <td className="p-3.5 text-right font-mono text-slate-400">{item.labor_cost.toFixed(2)} €</td>
                    <td className="p-3.5 text-right font-mono font-bold text-white text-sm">{item.sale_price.toFixed(2)} €</td>
                    <td className="p-3.5 text-right font-mono font-bold text-emerald-400">
                      +{item.margin.toFixed(2)} €
                    </td>
                    <td className="p-3.5 text-center font-mono text-[11px] text-slate-400">
                      {item.estimated_time}
                    </td>
                    <td className="p-3.5">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => openEditModal(item)}
                          className="p-1.5 rounded-lg bg-brand-surface hover:bg-brand-elevated text-slate-300"
                          title="Editar tarifa"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(item.id)}
                          className="p-1.5 rounded-lg bg-red-950/40 hover:bg-red-900 text-red-400"
                          title="Eliminar"
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

        {/* Modal: Create or Edit Pricing Item */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 backdrop-blur-sm animate-fadeIn">
            <form 
              onSubmit={handleSave}
              className="bg-brand-carbon border border-brand-green/40 rounded-2xl max-w-lg w-full p-6 shadow-neon max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between pb-3 border-b border-brand-border/60 mb-4">
                <h3 className="text-lg font-black text-white">
                  {editingId ? 'Editar Tarifa de Reparación' : 'Añadir Nueva Tarifa'}
                </h3>
                <button type="button" onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-3 text-xs">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Categoría</label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value as DeviceCategory)}
                      className="w-full bg-brand-dark border border-brand-border rounded-xl px-3 py-2 text-white"
                    >
                      <option value="iPhone">iPhone</option>
                      <option value="Samsung">Samsung</option>
                      <option value="Xiaomi">Xiaomi</option>
                      <option value="PC">PC Sobremesa</option>
                      <option value="Portátil">Portátil</option>
                      <option value="Tablet">Tablet</option>
                      <option value="Otro">Otro</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Marca</label>
                    <input
                      type="text"
                      value={brand}
                      onChange={(e) => setBrand(e.target.value)}
                      required
                      className="w-full bg-brand-dark border border-brand-border rounded-xl px-3 py-2 text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Modelo Exacto *</label>
                  <input
                    type="text"
                    value={model}
                    onChange={(e) => setModel(e.target.value)}
                    required
                    placeholder="Ej. iPhone 13 Pro"
                    className="w-full bg-brand-dark border border-brand-border rounded-xl px-3 py-2 text-white"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Tipo de Reparación *</label>
                  <input
                    type="text"
                    value={repairType}
                    onChange={(e) => setRepairType(e.target.value)}
                    required
                    placeholder="Ej. Cambio de pantalla OLED Original"
                    className="w-full bg-brand-dark border border-brand-border rounded-xl px-3 py-2 text-white"
                  />
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Coste Pieza (€)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={partCost}
                      onChange={(e) => setPartCost(Number(e.target.value))}
                      required
                      className="w-full bg-brand-dark border border-brand-border rounded-xl px-3 py-2 text-white font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Mano Obra (€)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={laborCost}
                      onChange={(e) => setLaborCost(Number(e.target.value))}
                      required
                      className="w-full bg-brand-dark border border-brand-border rounded-xl px-3 py-2 text-white font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">PVP Venta (€)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={salePrice}
                      onChange={(e) => setSalePrice(Number(e.target.value))}
                      required
                      className="w-full bg-brand-dark border border-brand-border rounded-xl px-3 py-2 text-white font-mono font-bold"
                    />
                  </div>
                </div>

                {/* Auto Calculated Margin Display */}
                <div className="p-3 rounded-xl bg-brand-surface border border-brand-border flex items-center justify-between">
                  <span className="text-slate-400">Margen neto calculado automáticamente:</span>
                  <span className={`font-mono font-bold text-sm ${marginPreview >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                    {marginPreview >= 0 ? `+${marginPreview.toFixed(2)} €` : `${marginPreview.toFixed(2)} €`}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Tiempo Estimado</label>
                    <input
                      type="text"
                      value={estimatedTime}
                      onChange={(e) => setEstimatedTime(e.target.value)}
                      placeholder="Ej. 1-2 horas"
                      className="w-full bg-brand-dark border border-brand-border rounded-xl px-3 py-2 text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Ref. Pieza Proveedor</label>
                    <input
                      type="text"
                      value={supplierRef}
                      onChange={(e) => setSupplierRef(e.target.value)}
                      placeholder="Ej. PAN-IPH-13PRO"
                      className="w-full bg-brand-dark border border-brand-border rounded-xl px-3 py-2 text-white font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Notas Internas</label>
                  <input
                    type="text"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Detalles sobre adhesivos, reprogramador, etc."
                    className="w-full bg-brand-dark border border-brand-border rounded-xl px-3 py-2 text-white"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-5 mt-4 border-t border-brand-border/60">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-brand-border text-slate-300 text-xs font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 rounded-xl bg-brand-green hover:bg-brand-green-neon text-black font-extrabold text-xs shadow-neon"
                >
                  {editingId ? 'Actualizar Tarifa' : 'Guardar Tarifa'}
                </button>
              </div>
            </form>
          </div>
        )}

      </div>
    </AdminLayout>
  );
};
