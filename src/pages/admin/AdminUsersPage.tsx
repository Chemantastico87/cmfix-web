import React, { useState } from 'react';
import { 
  Users, 
  UserPlus, 
  ShieldCheck, 
  KeyRound, 
  CheckCircle, 
  XCircle, 
  Trash2, 
  Eye, 
  EyeOff, 
  Crown, 
  Wrench, 
  UserCheck, 
  AlertCircle,
  Plus,
  RefreshCw,
  Search,
  Lock,
  Sparkles,
  UserCog
} from 'lucide-react';
import { AdminLayout } from '../../components/AdminLayout';
import { useAuth, ManagedUser } from '../../context/AuthContext';
import { UserRole } from '../../types';

export const AdminUsersPage: React.FC = () => {
  const { 
    user, 
    managedUsers, 
    createManagedUser, 
    updateManagedUser, 
    deleteManagedUser, 
    changeManagedUserPassword 
  } = useAuth();

  // Modal para nuevo usuario
  const [showAddModal, setShowAddModal] = useState(false);
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newUsername, setNewUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newRole, setNewRole] = useState<UserRole>('TECNICO');
  const [showNewPass, setShowNewPass] = useState(false);
  const [addError, setAddError] = useState<string | null>(null);
  const [addSuccess, setAddSuccess] = useState<string | null>(null);

  // Modal para cambio de contraseña de usuario gestionado
  const [passwordModalUser, setPasswordModalUser] = useState<ManagedUser | null>(null);
  const [modalNewPass, setModalNewPass] = useState('');
  const [showModalPass, setShowModalPass] = useState(false);
  const [passError, setPassError] = useState<string | null>(null);
  const [passSuccess, setPassSuccess] = useState<string | null>(null);

  // Filtro de búsqueda
  const [search, setSearch] = useState('');

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setAddError(null);
    setAddSuccess(null);

    const res = createManagedUser({
      name: newName,
      email: newEmail,
      username: newUsername,
      password: newPassword,
      role: newRole
    });

    if (res.success) {
      setAddSuccess(`¡Usuario "${newName}" creado correctamente! Ya puede iniciar sesión.`);
      setNewName('');
      setNewEmail('');
      setNewUsername('');
      setNewPassword('');
      setNewRole('TECNICO');
      setTimeout(() => {
        setAddSuccess(null);
        setShowAddModal(false);
      }, 2000);
    } else {
      setAddError(res.error || 'Error al crear el usuario.');
    }
  };

  const handleChangePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!passwordModalUser) return;
    setPassError(null);
    setPassSuccess(null);

    const res = changeManagedUserPassword(passwordModalUser.id, modalNewPass);
    if (res.success) {
      setPassSuccess(`¡Contraseña de ${passwordModalUser.name} actualizada con éxito!`);
      setModalNewPass('');
      setTimeout(() => {
        setPassSuccess(null);
        setPasswordModalUser(null);
      }, 2000);
    } else {
      setPassError(res.error || 'Error al actualizar la contraseña.');
    }
  };

  const handleToggleActive = (userItem: ManagedUser) => {
    const nextState = !userItem.active;
    updateManagedUser(userItem.id, { active: nextState });
  };

  const handleDeleteUser = (userItem: ManagedUser) => {
    const confirmDelete = window.confirm(
      `¿Estás seguro de que deseas dar de baja y eliminar a "${userItem.name}" (${userItem.email}) de la plantilla?\n\nNo podrá volver a iniciar sesión.`
    );
    if (!confirmDelete) return;

    deleteManagedUser(userItem.id);
  };

  const filteredUsers = managedUsers.filter(u => 
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase()) ||
    (u.username && u.username.toLowerCase().includes(search.toLowerCase())) ||
    u.role.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <AdminLayout>
      <div className="p-4 sm:p-6 lg:p-8 space-y-8 max-w-7xl mx-auto w-full">
        
        {/* Encabezado */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <UserCog className="w-7 h-7 text-brand-green" />
              <h1 className="text-2xl font-black text-white">Gestión de Plantilla y Usuarios</h1>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Administración exclusiva del Técnico Creador para crear nuevos integrantes, técnicos y personal de taller.
            </p>
          </div>

          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2.5 rounded-xl bg-brand-green hover:bg-brand-green-neon text-black font-extrabold text-xs flex items-center justify-center gap-2 shadow-neon transition-all"
          >
            <UserPlus className="w-4 h-4" />
            <span>Añadir Nuevo Usuario</span>
          </button>
        </div>

        {/* Cuentas Fundacionales del Taller */}
        <div>
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-brand-green" />
            <span>Cuentas Principales del Sistema</span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Ficha Chema (Administrador Principal) */}
            <div className="bg-brand-carbon border-2 border-brand-green/60 rounded-2xl p-5 shadow-neon relative overflow-hidden">
              <div className="absolute top-0 right-0 bg-brand-green text-black font-black text-[10px] uppercase px-3 py-0.5 rounded-bl-xl flex items-center gap-1 shadow-sm">
                <Crown className="w-3 h-3 fill-black" />
                <span>Admin Principal</span>
              </div>
              <div className="flex items-start gap-3.5 mt-1">
                <div className="w-12 h-12 rounded-xl bg-brand-green/20 border border-brand-green/40 flex items-center justify-center text-brand-green shrink-0">
                  <Wrench className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                  <h3 className="font-extrabold text-white text-base flex items-center gap-2">
                    <span>Chema</span>
                    {(user?.isCreator || user?.name?.includes('Chema')) && (
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-500/40">
                        Tú (Sesión Activa)
                      </span>
                    )}
                  </h3>
                  <p className="text-xs text-slate-300 font-mono">admin@cmfix.es / chema@cmfix.es</p>
                  <p className="text-[11px] text-slate-400">
                    Administrador general: control de sistema, auditoría, avisos y gestión de taller.
                  </p>
                </div>
              </div>
            </div>

            {/* Ficha Maury */}
            <div className="bg-brand-carbon border border-brand-border rounded-2xl p-5 shadow-card relative overflow-hidden">
              <div className="absolute top-0 right-0 bg-brand-surface border-l border-b border-brand-border text-slate-300 font-bold text-[10px] uppercase px-3 py-0.5 rounded-bl-xl flex items-center gap-1">
                <ShieldCheck className="w-3 h-3 text-emerald-400" />
                <span>Administrador Taller</span>
              </div>
              <div className="flex items-start gap-3.5 mt-1">
                <div className="w-12 h-12 rounded-xl bg-brand-surface border border-brand-border flex items-center justify-center text-slate-300 shrink-0">
                  <UserCheck className="w-6 h-6 text-brand-green" />
                </div>
                <div className="space-y-1">
                  <h3 className="font-extrabold text-white text-base flex items-center gap-2">
                    <span>Maury</span>
                    {(user?.email?.includes('gmail') || user?.name?.includes('Maury')) && (
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-500/40">
                        Tú (Sesión Activa)
                      </span>
                    )}
                  </h3>
                  <p className="text-xs text-slate-300 font-mono">cmfixespana@gmail.com / maury@cmfix.es</p>
                  <p className="text-[11px] text-slate-400">
                    Administrador oficial del taller CM FIX y atención técnica (+34 661 99 10 60).
                  </p>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* Sección de Plantilla Ampliada */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <Users className="w-4 h-4 text-brand-green" />
                <span>Personal y Nuevos Miembros ({managedUsers.length})</span>
              </h2>
              <p className="text-xs text-slate-400">
                Usuarios añadidos que pueden iniciar sesión desde la web oficial.
              </p>
            </div>

            {/* Buscador */}
            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar por nombre, correo o rol..."
                className="w-full bg-brand-carbon border border-brand-border rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-brand-green"
              />
            </div>
          </div>

          {/* Listado / Tabla */}
          {managedUsers.length === 0 ? (
            <div className="bg-brand-carbon border border-brand-border/80 rounded-2xl p-8 text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-brand-surface mx-auto flex items-center justify-center text-slate-500">
                <Users className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-bold text-white">No hay miembros adicionales creados aún</h3>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                Si amplías la plantilla con nuevos técnicos o personal de recepción, puedes darles de alta con su propio usuario y contraseña.
              </p>
              <button
                onClick={() => setShowAddModal(true)}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-brand-green hover:bg-brand-green-neon text-black font-extrabold text-xs shadow-neon transition-all"
              >
                <Plus className="w-4 h-4" />
                <span>Crear Primer Usuario</span>
              </button>
            </div>
          ) : (
            <div className="bg-brand-carbon border border-brand-border rounded-2xl overflow-hidden shadow-card">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-brand-surface text-slate-300 border-b border-brand-border">
                    <tr>
                      <th className="p-3.5 font-bold">Nombre / Identificador</th>
                      <th className="p-3.5 font-bold">Usuario / Correo</th>
                      <th className="p-3.5 font-bold text-center">Rol Asignado</th>
                      <th className="p-3.5 font-bold text-center">Estado</th>
                      <th className="p-3.5 font-bold">Fecha Alta</th>
                      <th className="p-3.5 font-bold text-center">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-brand-border/40 text-slate-200">
                    {filteredUsers.map((u) => (
                      <tr key={u.id} className="hover:bg-brand-surface/30">
                        <td className="p-3.5">
                          <div className="font-bold text-white text-sm">{u.name}</div>
                          {u.username && (
                            <div className="text-[10px] text-slate-500 font-mono">@{u.username}</div>
                          )}
                        </td>
                        <td className="p-3.5 font-mono text-slate-300">
                          {u.email}
                        </td>
                        <td className="p-3.5 text-center">
                          <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${
                            u.role === 'ADMIN' 
                              ? 'bg-purple-950 text-purple-300 border-purple-500/40' 
                              : u.role === 'TECNICO'
                              ? 'bg-emerald-950 text-emerald-300 border-emerald-500/40'
                              : 'bg-blue-950 text-blue-300 border-blue-500/40'
                          }`}>
                            {u.role === 'ADMIN' ? 'Administrador' : u.role === 'TECNICO' ? 'Técnico de Taller' : 'Recepción'}
                          </span>
                        </td>
                        <td className="p-3.5 text-center">
                          <button
                            onClick={() => handleToggleActive(u)}
                            className={`px-2.5 py-1 rounded-full text-[10px] font-bold border transition-all ${
                              u.active 
                                ? 'bg-emerald-950/80 text-emerald-400 border-emerald-500/40 hover:bg-emerald-900' 
                                : 'bg-red-950/80 text-red-400 border-red-500/40 hover:bg-red-900'
                            }`}
                            title="Haz clic para activar o desactivar este usuario"
                          >
                            {u.active ? 'Activo' : 'Desactivado'}
                          </button>
                        </td>
                        <td className="p-3.5 text-slate-400 font-mono text-[11px]">
                          {u.createdAt}
                        </td>
                        <td className="p-3.5">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => {
                                setPasswordModalUser(u);
                                setModalNewPass('');
                                setPassError(null);
                                setPassSuccess(null);
                              }}
                              className="px-2.5 py-1.5 rounded-lg bg-brand-surface hover:bg-brand-elevated text-slate-300 hover:text-white border border-brand-border flex items-center gap-1.5 transition-colors"
                              title="Cambiar contraseña de este usuario"
                            >
                              <KeyRound className="w-3.5 h-3.5 text-brand-green" />
                              <span className="text-[10px] font-semibold">Cambiar Clave</span>
                            </button>
                            <button
                              onClick={() => handleDeleteUser(u)}
                              className="p-1.5 rounded-lg bg-red-950/40 hover:bg-red-900/60 text-red-400 hover:text-red-200 border border-red-500/30 transition-colors"
                              title="Eliminar usuario de la plantilla"
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
          )}
        </div>

        {/* Modal: Añadir Nuevo Usuario */}
        {showAddModal && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-brand-carbon border border-brand-border rounded-2xl w-full max-w-lg p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in duration-150">
              
              <div className="flex items-center justify-between border-b border-brand-border/60 pb-3">
                <div className="flex items-center gap-2">
                  <UserPlus className="w-5 h-5 text-brand-green" />
                  <h3 className="font-extrabold text-white text-base">Añadir Nuevo Usuario a la Plantilla</h3>
                </div>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-brand-surface"
                >
                  ✕
                </button>
              </div>

              {addError && (
                <div className="p-3 rounded-xl bg-red-950/70 border border-red-500/40 text-red-300 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{addError}</span>
                </div>
              )}

              {addSuccess && (
                <div className="p-3 rounded-xl bg-emerald-950/70 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 shrink-0" />
                  <span>{addSuccess}</span>
                </div>
              )}

              <form onSubmit={handleCreateSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Nombre Completo *
                  </label>
                  <input
                    type="text"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    placeholder="ej. Carlos Gómez"
                    required
                    className="w-full bg-brand-dark border border-brand-border rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-brand-green"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Correo Electrónico *
                    </label>
                    <input
                      type="email"
                      value={newEmail}
                      onChange={(e) => setNewEmail(e.target.value)}
                      placeholder="carlos@cmfix.es"
                      required
                      className="w-full bg-brand-dark border border-brand-border rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-brand-green"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Usuario Corto (opcional)
                    </label>
                    <input
                      type="text"
                      value={newUsername}
                      onChange={(e) => setNewUsername(e.target.value)}
                      placeholder="carlos"
                      className="w-full bg-brand-dark border border-brand-border rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-brand-green"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Contraseña Inicial *
                  </label>
                  <div className="relative">
                    <input
                      type={showNewPass ? 'text' : 'password'}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Mínimo 4 caracteres"
                      required
                      className="w-full bg-brand-dark border border-brand-border rounded-xl pl-3.5 pr-10 py-2 text-xs text-white focus:outline-none focus:border-brand-green"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPass(!showNewPass)}
                      className="absolute right-3 top-2 text-slate-400 hover:text-slate-200"
                    >
                      {showNewPass ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Rol en CM FIX *
                  </label>
                  <select
                    value={newRole}
                    onChange={(e) => setNewRole(e.target.value as UserRole)}
                    className="w-full bg-brand-dark border border-brand-border rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-brand-green"
                  >
                    <option value="TECNICO">Técnico de Taller (Reparaciones, Presupuestos, Inventario)</option>
                    <option value="ADMIN">Administrador (Acceso total al panel)</option>
                    <option value="RECEPCION">Recepción y Atención al Cliente</option>
                  </select>
                </div>

                <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-brand-border/40">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="px-4 py-2 rounded-xl bg-brand-surface hover:bg-brand-elevated text-slate-300 text-xs font-semibold border border-brand-border"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-brand-green hover:bg-brand-green-neon text-black text-xs font-extrabold shadow-neon transition-all"
                  >
                    Guardar y Dar de Alta
                  </button>
                </div>
              </form>

            </div>
          </div>
        )}

        {/* Modal: Cambiar Contraseña de Usuario */}
        {passwordModalUser && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-brand-carbon border border-brand-border rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in duration-150">
              
              <div className="flex items-center justify-between border-b border-brand-border/60 pb-3">
                <div className="flex items-center gap-2">
                  <KeyRound className="w-5 h-5 text-brand-green" />
                  <h3 className="font-extrabold text-white text-base">Asignar Nueva Clave</h3>
                </div>
                <button
                  onClick={() => setPasswordModalUser(null)}
                  className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-brand-surface"
                >
                  ✕
                </button>
              </div>

              <div className="p-3 rounded-xl bg-brand-surface border border-brand-border text-xs text-slate-300">
                Cambiando contraseña para: <strong>{passwordModalUser.name}</strong> ({passwordModalUser.email})
              </div>

              {passError && (
                <div className="p-3 rounded-xl bg-red-950/70 border border-red-500/40 text-red-300 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{passError}</span>
                </div>
              )}

              {passSuccess && (
                <div className="p-3 rounded-xl bg-emerald-950/70 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 shrink-0" />
                  <span>{passSuccess}</span>
                </div>
              )}

              <form onSubmit={handleChangePasswordSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Nueva Contraseña
                  </label>
                  <div className="relative">
                    <input
                      type={showModalPass ? 'text' : 'password'}
                      value={modalNewPass}
                      onChange={(e) => setModalNewPass(e.target.value)}
                      placeholder="Mínimo 4 caracteres"
                      required
                      className="w-full bg-brand-dark border border-brand-border rounded-xl pl-3.5 pr-10 py-2 text-xs text-white focus:outline-none focus:border-brand-green"
                    />
                    <button
                      type="button"
                      onClick={() => setShowModalPass(!showModalPass)}
                      className="absolute right-3 top-2 text-slate-400 hover:text-slate-200"
                    >
                      {showModalPass ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-brand-border/40">
                  <button
                    type="button"
                    onClick={() => setPasswordModalUser(null)}
                    className="px-4 py-2 rounded-xl bg-brand-surface hover:bg-brand-elevated text-slate-300 text-xs font-semibold border border-brand-border"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-brand-green hover:bg-brand-green-neon text-black text-xs font-extrabold shadow-neon transition-all"
                  >
                    Actualizar Contraseña
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
