import React, { useState, useEffect } from 'react';
import { 
  Package, 
  Search, 
  Plus, 
  AlertTriangle, 
  CheckCircle, 
  Truck, 
  Edit3, 
  Trash2,
  X
} from 'lucide-react';
import { AdminLayout } from '../../components/AdminLayout';
import { dbService } from '../../services/db';
import { InventoryItem, Supplier } from '../../types';

export const AdminInventoryPage: React.FC = () => {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [search, setSearch] = useState('');
  const [filterLowStock, setFilterLowStock] = useState(false);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [sku, setSku] = useState('');
  const [name, setName] = useState('');
  const [category, setCategory] = useState<any>('iPhone');
  const [deviceBrand, setDeviceBrand] = useState('Apple');
  const [deviceModel, setDeviceModel] = useState('');
  const [supplierId, setSupplierId] = useState('');
  const [cost, setCost] = useState(0);
  const [price, setPrice] = useState(0);
  const [stock, setStock] = useState(0);
  const [minStock, setMinStock] = useState(2);
  const [notes, setNotes] = useState('');

  const loadData = async () => {
    setLoading(true);
    try {
      const [inv, sup] = await Promise.all([
        dbService.getInventory(),
        dbService.getSuppliers()
      ]);
      setItems(inv);
      setSuppliers(sup);
    } catch (err) {
      console.error('Error loading inventory:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const openCreateModal = () => {
    setEditingId(null);
    setSku('REP-' + Math.floor(1000 + Math.random() * 9000));
    setName('');
    setCategory('iPhone');
    setDeviceBrand('Apple');
    setDeviceModel('');
    setSupplierId(suppliers[0]?.id || '');
    setCost(0);
    setPrice(0);
    setStock(1);
    setMinStock(2);
    setNotes('');
    setIsModalOpen(true);
  };

  const openEditModal = (item: InventoryItem) => {
    setEditingId(item.id);
    setSku(item.sku);
    setName(item.name);
    setCategory(item.category);
    setDeviceBrand(item.device_brand || '');
    setDeviceModel(item.device_model || '');
    setSupplierId(item.supplier_id || '');
    setCost(item.cost);
    setPrice(item.price);
    setStock(item.stock);
    setMinStock(item.min_stock);
    setNotes(item.notes || '');
    setIsModalOpen(true);
  };

  const handleSaveItem = async (e: React.FormEvent) => {
    e.preventDefault();
    const sup = suppliers.find(s => s.id === supplierId);
    try {
      if (editingId) {
        await dbService.updateInventoryItem(editingId, {
          sku,
          name,
          category,
          device_brand: deviceBrand,
          device_model: deviceModel,
          supplier_id: supplierId,
          supplier_name: sup?.name,
          cost: Number(cost),
          price: Number(price),
          stock: Number(stock),
          min_stock: Number(minStock),
          notes
        });
      } else {
        await dbService.addInventoryItem({
          sku,
          name,
          category,
          device_brand: deviceBrand,
          device_model: deviceModel,
          supplier_id: supplierId,
          supplier_name: sup?.name,
          cost: Number(cost),
          price: Number(price),
          stock: Number(stock),
          min_stock: Number(minStock),
          notes
        });
      }
      setIsModalOpen(false);
      loadData();
    } catch (err) {
      console.error('Error saving inventory item:', err);
    }
  };

  const handleDeleteItem = async (id: string) => {
    if (!window.confirm('¿Eliminar esta pieza del inventario?')) return;
    await dbService.deleteInventoryItem(id);
    loadData();
  };

  const filtered = items.filter((i) => {
    const matchSearch =
      i.name.toLowerCase().includes(search.toLowerCase()) ||
      i.sku.toLowerCase().includes(search.toLowerCase()) ||
      i.device_model.toLowerCase().includes(search.toLowerCase());
    const matchLowStock = filterLowStock ? i.stock <= i.min_stock : true;
    return matchSearch && matchLowStock;
  });

  const lowStockCount = items.filter(i => i.stock <= i.min_stock).length;

  return (
    <AdminLayout>
      <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto w-full">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-white flex items-center gap-2">
              <Package className="w-6 h-6 text-brand-green" />
              <span>Inventario y Control de Repuestos</span>
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">
              Stock en tiempo real de pantallas, baterías, conectores y consumibles de taller.
            </p>
          </div>

          <div className="flex items-center gap-3">
            {lowStockCount > 0 && (
              <button
                onClick={() => setFilterLowStock(!filterLowStock)}
                className={`px-3 py-1.5 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition-all ${
                  filterLowStock
                    ? 'bg-amber-500 text-black border-amber-400'
                    : 'bg-amber-950/40 text-amber-300 border-amber-500/40 hover:bg-amber-900/40'
                }`}
              >
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>{lowStockCount} Stock Bajo</span>
              </button>
            )}

            <button
              onClick={openCreateModal}
              className="px-4 py-2 rounded-xl bg-brand-green hover:bg-brand-green-neon text-black font-extrabold text-xs flex items-center gap-1.5 shadow-neon transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Añadir Pieza</span>
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="bg-brand-carbon border border-brand-border rounded-xl p-4">
          <div className="relative w-full">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por referencia SKU, pieza, modelo..."
              className="w-full bg-brand-dark border border-brand-border rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-brand-green"
            />
          </div>
        </div>

        {/* Table */}
        <div className="bg-brand-carbon border border-brand-border rounded-2xl overflow-hidden shadow-card">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-brand-surface text-slate-300 border-b border-brand-border">
                <tr>
                  <th className="p-3.5 font-bold">Referencia (SKU)</th>
                  <th className="p-3.5 font-bold">Pieza / Descripción</th>
                  <th className="p-3.5 font-bold">Dispositivo / Modelo</th>
                  <th className="p-3.5 font-bold text-right">Coste</th>
                  <th className="p-3.5 font-bold text-right">PVP</th>
                  <th className="p-3.5 font-bold text-center">Stock</th>
                  <th className="p-3.5 font-bold text-center">Estado</th>
                  <th className="p-3.5 font-bold text-center">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-border/40 text-slate-200">
                {filtered.map((item) => {
                  const isLow = item.stock <= item.min_stock;
                  return (
                    <tr key={item.id} className="hover:bg-brand-surface/30">
                      <td className="p-3.5 font-mono font-bold text-brand-green">{item.sku}</td>
                      <td className="p-3.5">
                        <div className="font-semibold text-white">{item.name}</div>
                        {item.supplier_name && (
                          <div className="text-[10px] text-slate-500 flex items-center gap-1 mt-0.5">
                            <Truck className="w-3 h-3 text-slate-500" />
                            <span>{item.supplier_name}</span>
                          </div>
                        )}
                      </td>
                      <td className="p-3.5">
                        <span className="text-slate-300">{item.device_brand} {item.device_model}</span>
                        <span className="text-[10px] text-slate-500 block">({item.category})</span>
                      </td>
                      <td className="p-3.5 text-right font-mono text-slate-400">{item.cost.toFixed(2)} €</td>
                      <td className="p-3.5 text-right font-mono font-bold text-white">{item.price.toFixed(2)} €</td>
                      <td className="p-3.5 text-center font-mono font-bold text-sm">
                        <span className={item.stock === 0 ? 'text-red-400' : isLow ? 'text-amber-400' : 'text-slate-200'}>
                          {item.stock}
                        </span>
                        <span className="text-[10px] text-slate-500 block font-normal">min: {item.min_stock}</span>
                      </td>
                      <td className="p-3.5 text-center">
                        {item.stock === 0 ? (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-950/60 text-red-400 border border-red-500/30">
                            Agotado
                          </span>
                        ) : isLow ? (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-950/60 text-amber-400 border border-amber-500/40 animate-pulse">
                            ⚠️ Stock bajo
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-950/60 text-emerald-400 border border-emerald-500/30">
                            Disponible
                          </span>
                        )}
                      </td>
                      <td className="p-3.5">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => openEditModal(item)}
                            className="p-1.5 rounded-lg bg-brand-surface hover:bg-brand-elevated text-slate-300"
                            title="Editar pieza"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteItem(item.id)}
                            className="p-1.5 rounded-lg bg-red-950/40 hover:bg-red-900 text-red-400"
                            title="Eliminar"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Modal: Create or Edit Item */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 backdrop-blur-sm animate-fadeIn">
            <form 
              onSubmit={handleSaveItem}
              className="bg-brand-carbon border border-brand-green/40 rounded-2xl max-w-lg w-full p-6 shadow-neon max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between pb-3 border-b border-brand-border/60 mb-4">
                <h3 className="text-lg font-black text-white">
                  {editingId ? 'Editar Pieza de Inventario' : 'Añadir Nueva Pieza'}
                </h3>
                <button type="button" onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-3 text-xs">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Referencia SKU *</label>
                    <input
                      type="text"
                      value={sku}
                      onChange={(e) => setSku(e.target.value)}
                      required
                      className="w-full bg-brand-dark border border-brand-border rounded-xl px-3 py-2 text-white font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Categoría</label>
                    <input
                      type="text"
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      required
                      className="w-full bg-brand-dark border border-brand-border rounded-xl px-3 py-2 text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Nombre / Descripción de la Pieza *</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    placeholder="Ej. Pantalla OLED iPhone 14 Pro Original"
                    className="w-full bg-brand-dark border border-brand-border rounded-xl px-3 py-2 text-white"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Marca Dispositivo</label>
                    <input
                      type="text"
                      value={deviceBrand}
                      onChange={(e) => setDeviceBrand(e.target.value)}
                      className="w-full bg-brand-dark border border-brand-border rounded-xl px-3 py-2 text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Modelo Compatible</label>
                    <input
                      type="text"
                      value={deviceModel}
                      onChange={(e) => setDeviceModel(e.target.value)}
                      placeholder="Ej. iPhone 14 Pro"
                      className="w-full bg-brand-dark border border-brand-border rounded-xl px-3 py-2 text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Proveedor Habitual</label>
                  <select
                    value={supplierId}
                    onChange={(e) => setSupplierId(e.target.value)}
                    className="w-full bg-brand-dark border border-brand-border rounded-xl px-3 py-2 text-white"
                  >
                    <option value="">Sin proveedor asignado</option>
                    {suppliers.map((s) => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Coste Compra (€)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={cost}
                      onChange={(e) => setCost(Number(e.target.value))}
                      required
                      className="w-full bg-brand-dark border border-brand-border rounded-xl px-3 py-2 text-white font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">PVP Venta Cliente (€)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={price}
                      onChange={(e) => setPrice(Number(e.target.value))}
                      required
                      className="w-full bg-brand-dark border border-brand-border rounded-xl px-3 py-2 text-white font-mono"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Stock Actual</label>
                    <input
                      type="number"
                      value={stock}
                      onChange={(e) => setStock(Number(e.target.value))}
                      required
                      className="w-full bg-brand-dark border border-brand-border rounded-xl px-3 py-2 text-white font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Stock Mínimo Alerta</label>
                    <input
                      type="number"
                      value={minStock}
                      onChange={(e) => setMinStock(Number(e.target.value))}
                      required
                      className="w-full bg-brand-dark border border-brand-border rounded-xl px-3 py-2 text-white font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Notas (Ubicación cajón, etc.)</label>
                  <input
                    type="text"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Ej. Cajonera 3, estante B"
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
                  {editingId ? 'Actualizar Pieza' : 'Guardar Pieza'}
                </button>
              </div>
            </form>
          </div>
        )}

      </div>
    </AdminLayout>
  );
};
