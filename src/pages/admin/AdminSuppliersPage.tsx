import React, { useState, useEffect } from 'react';
import { 
  Truck, 
  Plus, 
  Search, 
  Phone, 
  Mail, 
  Globe, 
  ExternalLink, 
  Edit3, 
  Trash2,
  X
} from 'lucide-react';
import { AdminLayout } from '../../components/AdminLayout';
import { dbService } from '../../services/db';
import { Supplier } from '../../types';

export const AdminSuppliersPage: React.FC = () => {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [contactPerson, setContactPerson] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [website, setWebsite] = useState('');
  const [notes, setNotes] = useState('');

  const loadSuppliers = async () => {
    setLoading(true);
    try {
      const data = await dbService.getSuppliers();
      setSuppliers(data);
    } catch (err) {
      console.error('Error loading suppliers:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSuppliers();
  }, []);

  const openCreateModal = () => {
    setEditingId(null);
    setName('');
    setContactPerson('');
    setPhone('');
    setEmail('');
    setWebsite('');
    setNotes('');
    setIsModalOpen(true);
  };

  const openEditModal = (s: Supplier) => {
    setEditingId(s.id);
    setName(s.name);
    setContactPerson(s.contact_person || '');
    setPhone(s.phone || '');
    setEmail(s.email || '');
    setWebsite(s.website || '');
    setNotes(s.notes || '');
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        await dbService.updateSupplier(editingId, {
          name,
          contact_person: contactPerson,
          phone,
          email,
          website,
          notes
        });
      } else {
        await dbService.addSupplier({
          name,
          contact_person: contactPerson,
          phone,
          email,
          website,
          notes
        });
      }
      setIsModalOpen(false);
      loadSuppliers();
    } catch (err) {
      console.error('Error saving supplier:', err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('¿Deseas eliminar este proveedor?')) return;
    await dbService.deleteSupplier(id);
    loadSuppliers();
  };

  const filtered = suppliers.filter(
    (s) =>
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      (s.contact_person && s.contact_person.toLowerCase().includes(search.toLowerCase())) ||
      (s.email && s.email.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <AdminLayout>
      <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto w-full">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-white flex items-center gap-2">
              <Truck className="w-6 h-6 text-brand-green" />
              <span>Gestión de Proveedores</span>
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">
              Directorio de distribuidores de pantallas, baterías, herramientas y componentes electrónicos.
            </p>
          </div>

          <button
            onClick={openCreateModal}
            className="px-4 py-2 rounded-xl bg-brand-green hover:bg-brand-green-neon text-black font-extrabold text-xs flex items-center gap-1.5 shadow-neon transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Nuevo Proveedor</span>
          </button>
        </div>

        {/* Search */}
        <div className="bg-brand-carbon border border-brand-border rounded-xl p-4">
          <div className="relative w-full">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar proveedor, contacto o email..."
              className="w-full bg-brand-dark border border-brand-border rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-brand-green"
            />
          </div>
        </div>

        {/* Grid Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((s) => (
            <div
              key={s.id}
              className="p-5 rounded-2xl bg-brand-carbon border border-brand-border hover:border-brand-green/40 transition-all shadow-card flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-bold text-white text-base">{s.name}</h3>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => openEditModal(s)}
                      className="p-1 rounded-md text-slate-400 hover:text-white"
                      title="Editar"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(s.id)}
                      className="p-1 rounded-md text-red-400 hover:text-red-300"
                      title="Eliminar"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {s.contact_person && (
                  <p className="text-xs text-brand-green mt-1">Contacto: {s.contact_person}</p>
                )}

                <div className="mt-4 space-y-2 text-xs text-slate-300">
                  {s.phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="w-3.5 h-3.5 text-slate-500" />
                      <a href={`tel:${s.phone}`} className="hover:text-white">{s.phone}</a>
                    </div>
                  )}
                  {s.email && (
                    <div className="flex items-center gap-2">
                      <Mail className="w-3.5 h-3.5 text-slate-500" />
                      <a href={`mailto:${s.email}`} className="hover:text-white truncate">{s.email}</a>
                    </div>
                  )}
                  {s.website && (
                    <div className="flex items-center gap-2">
                      <Globe className="w-3.5 h-3.5 text-slate-500" />
                      <a href={s.website} target="_blank" rel="noopener noreferrer" className="hover:text-brand-green truncate flex items-center gap-1">
                        <span>{s.website.replace('https://', '')}</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  )}
                </div>

                {s.notes && (
                  <p className="mt-4 text-[11px] text-slate-400 bg-brand-surface p-2.5 rounded-lg border border-brand-border/60">
                    {s.notes}
                  </p>
                )}
              </div>

              <div className="mt-4 pt-3 border-t border-brand-border/60 flex items-center justify-between text-[11px] text-slate-500">
                <span>Piezas asociadas disponibles</span>
                <span className="text-brand-green font-mono font-bold">Activo</span>
              </div>
            </div>
          ))}
        </div>

        {/* Modal: Create or Edit Supplier */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 backdrop-blur-sm animate-fadeIn">
            <form 
              onSubmit={handleSave}
              className="bg-brand-carbon border border-brand-green/40 rounded-2xl max-w-md w-full p-6 shadow-neon"
            >
              <div className="flex items-center justify-between pb-3 border-b border-brand-border/60 mb-4">
                <h3 className="text-lg font-black text-white">
                  {editingId ? 'Editar Proveedor' : 'Añadir Proveedor'}
                </h3>
                <button type="button" onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Nombre de la Empresa *</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    placeholder="Ej. ElectroRepuestos España"
                    className="w-full bg-brand-dark border border-brand-border rounded-xl px-3 py-2 text-white"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Persona de Contacto</label>
                  <input
                    type="text"
                    value={contactPerson}
                    onChange={(e) => setContactPerson(e.target.value)}
                    placeholder="Ej. Laura Méndez"
                    className="w-full bg-brand-dark border border-brand-border rounded-xl px-3 py-2 text-white"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Teléfono</label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="Ej. +34 912 345 678"
                    className="w-full bg-brand-dark border border-brand-border rounded-xl px-3 py-2 text-white"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="pedidos@proveedor.es"
                    className="w-full bg-brand-dark border border-brand-border rounded-xl px-3 py-2 text-white"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Web</label>
                  <input
                    type="url"
                    value={website}
                    onChange={(e) => setWebsite(e.target.value)}
                    placeholder="https://..."
                    className="w-full bg-brand-dark border border-brand-border rounded-xl px-3 py-2 text-white"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Notas / Especialidad</label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={2}
                    placeholder="Ej. Pantallas OLED y componentes microelectrónica"
                    className="w-full bg-brand-dark border border-brand-border rounded-xl px-3 py-2 text-white resize-none"
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
                  Guardar Proveedor
                </button>
              </div>
            </form>
          </div>
        )}

      </div>
    </AdminLayout>
  );
};
