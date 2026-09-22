import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Search, 
  Plus, 
  Phone, 
  Mail, 
  MessageSquare, 
  Wrench, 
  Euro,
  X
} from 'lucide-react';
import { AdminLayout } from '../../components/AdminLayout';
import { dbService } from '../../services/db';
import { Customer } from '../../types';

export const AdminCustomersPage: React.FC = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  // New Customer Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [notes, setNotes] = useState('');

  const loadCustomers = async () => {
    setLoading(true);
    try {
      const data = await dbService.getCustomers();
      setCustomers(data);
    } catch (err) {
      console.error('Error loading customers:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCustomers();
  }, []);

  const handleCreateCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await dbService.createCustomer({
        name,
        phone,
        email,
        address,
        notes
      });
      setIsModalOpen(false);
      setName('');
      setPhone('');
      setEmail('');
      setAddress('');
      setNotes('');
      loadCustomers();
    } catch (err) {
      console.error('Error creating customer:', err);
    }
  };

  const openWhatsApp = (phoneStr: string) => {
    const clean = phoneStr.replace(/\D/g, '');
    window.open(`https://wa.me/${clean}?text=Hola%20desde%20CM%20FIX`, '_blank');
  };

  const filtered = customers.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.phone.includes(search) ||
      c.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <AdminLayout>
      <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto w-full">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-white flex items-center gap-2">
              <Users className="w-6 h-6 text-brand-green" />
              <span>Directorio de Clientes</span>
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">
              Gestión de clientes, historial de reparaciones, facturación acumulada y contacto directo.
            </p>
          </div>

          <button
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2 rounded-xl bg-brand-green hover:bg-brand-green-neon text-black font-extrabold text-xs flex items-center gap-1.5 shadow-neon transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Nuevo Cliente</span>
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
              placeholder="Buscar por nombre, teléfono o email..."
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
                  <th className="p-3.5 font-bold">Cliente</th>
                  <th className="p-3.5 font-bold">Teléfono</th>
                  <th className="p-3.5 font-bold">Email</th>
                  <th className="p-3.5 font-bold text-center">Reparaciones</th>
                  <th className="p-3.5 font-bold text-right">Total Gastado</th>
                  <th className="p-3.5 font-bold text-center">Contacto</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-border/40 text-slate-200">
                {filtered.map((c) => (
                  <tr key={c.id} className="hover:bg-brand-surface/30">
                    <td className="p-3.5">
                      <div className="font-bold text-white text-sm">{c.name}</div>
                      {c.address && <div className="text-[10px] text-slate-500">{c.address}</div>}
                    </td>
                    <td className="p-3.5 font-mono text-slate-300">{c.phone}</td>
                    <td className="p-3.5 text-slate-400">{c.email}</td>
                    <td className="p-3.5 text-center font-mono font-bold text-brand-green">
                      {c.repairs_count || 1}
                    </td>
                    <td className="p-3.5 text-right font-mono font-bold text-white">
                      {(c.total_spent || 0).toFixed(2)} €
                    </td>
                    <td className="p-3.5">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => openWhatsApp(c.phone)}
                          className="p-1.5 rounded-lg bg-emerald-950/60 hover:bg-emerald-900 text-emerald-400"
                          title="Enviar WhatsApp"
                        >
                          <MessageSquare className="w-3.5 h-3.5" />
                        </button>
                        <a
                          href={`tel:${c.phone}`}
                          className="p-1.5 rounded-lg bg-brand-surface hover:bg-brand-elevated text-slate-300"
                          title="Llamar"
                        >
                          <Phone className="w-3.5 h-3.5 text-brand-green" />
                        </a>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Modal: New Customer */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 backdrop-blur-sm animate-fadeIn">
            <form 
              onSubmit={handleCreateCustomer}
              className="bg-brand-carbon border border-brand-green/40 rounded-2xl max-w-md w-full p-6 shadow-neon"
            >
              <div className="flex items-center justify-between pb-3 border-b border-brand-border/60 mb-4">
                <h3 className="text-lg font-black text-white">Nuevo Cliente</h3>
                <button type="button" onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Nombre Completo *</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    placeholder="Ej. Roberto Gómez"
                    className="w-full bg-brand-dark border border-brand-border rounded-xl px-3 py-2 text-white"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Teléfono / WhatsApp *</label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required
                    placeholder="Ej. 600 123 456"
                    className="w-full bg-brand-dark border border-brand-border rounded-xl px-3 py-2 text-white"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Correo Electrónico *</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="cliente@email.com"
                    className="w-full bg-brand-dark border border-brand-border rounded-xl px-3 py-2 text-white"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Dirección (Opcional)</label>
                  <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Calle, Ciudad"
                    className="w-full bg-brand-dark border border-brand-border rounded-xl px-3 py-2 text-white"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Notas Internas (Opcional)</label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={2}
                    placeholder="Datos específicos del cliente..."
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
                  Guardar Cliente
                </button>
              </div>
            </form>
          </div>
        )}

      </div>
    </AdminLayout>
  );
};
