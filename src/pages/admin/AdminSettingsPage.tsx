import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Settings, 
  Save, 
  CheckCircle2, 
  Building2, 
  Calculator, 
  MessageSquare, 
  KeyRound,
  Bell,
  Volume2
} from 'lucide-react';
import { AdminLayout } from '../../components/AdminLayout';
import { dbService } from '../../services/db';
import { CompanySettings } from '../../types';
import { 
  getNotificationSettings, 
  saveNotificationSettings, 
  NotificationSettings,
  playNotificationSound,
  requestNotificationPermission,
  showSystemNotification
} from '../../services/notificationService';

export const AdminSettingsPage: React.FC = () => {
  const [settings, setSettings] = useState<CompanySettings | null>(null);
  const [notifSettings, setNotifSettings] = useState<NotificationSettings>(getNotificationSettings());
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [testAlertMessage, setTestAlertMessage] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await dbService.getCompanySettings();
        setSettings(data);
        setNotifSettings(getNotificationSettings());
      } catch (err) {
        console.error('Error loading settings:', err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settings) return;
    setSaving(true);
    setSavedSuccess(false);
    try {
      await dbService.updateCompanySettings(settings);
      saveNotificationSettings(notifSettings);
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (err) {
      console.error('Error saving settings:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleTestNotification = async () => {
    // 1. Sonido
    playNotificationSound();

    // 2. Permiso del sistema
    let perm = Notification.permission;
    if (perm !== 'granted') {
      perm = await requestNotificationPermission();
    }

    if (perm === 'granted') {
      showSystemNotification(
        '🔔 Prueba CM FIX: ¡Alerta de Presupuesto!',
        'Notificación de prueba activa para el taller CM FIX (Maury). El sistema sonoro y visual funciona correctamente.'
      );
    }

    setTestAlertMessage('¡Sonido de campana emitido y notificación de prueba enviada!');
    setTimeout(() => setTestAlertMessage(null), 4000);
  };

  const handleChange = (field: keyof CompanySettings, value: any) => {
    if (!settings) return;
    setSettings({ ...settings, [field]: value });
  };

  if (loading || !settings) {
    return (
      <AdminLayout>
        <div className="p-8 text-center text-slate-400 font-mono">Cargando configuración...</div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-4xl mx-auto w-full">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-white flex items-center gap-2">
              <Settings className="w-6 h-6 text-brand-green" />
              <span>Configuración del Sistema y Empresa</span>
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">
              Ajustes fiscales, datos de contacto del taller, condiciones de garantía y plantillas de aviso.
            </p>
          </div>

          <button
            onClick={handleSave}
            disabled={saving}
            className="px-5 py-2.5 rounded-xl bg-brand-green hover:bg-brand-green-neon text-black font-extrabold text-xs flex items-center gap-2 shadow-neon transition-all active:scale-95 disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Guardando...' : 'Guardar Ajustes'}</span>
          </button>
        </div>

        {savedSuccess && (
          <div className="p-4 rounded-xl bg-emerald-950/70 border border-emerald-500/60 text-emerald-300 text-xs flex items-center gap-2 shadow-neon animate-fadeIn">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>¡Configuración de CM FIX guardada correctamente! Los cambios ya son visibles en presupuestos y web.</span>
          </div>
        )}

        {/* Banner de acceso directo a Seguridad y Contraseñas */}
        <div className="bg-gradient-to-r from-brand-carbon to-brand-surface border border-brand-green/40 rounded-2xl p-5 shadow-neon-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-brand-green/20 border border-brand-green/40 flex items-center justify-center text-brand-green shrink-0">
              <KeyRound className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Seguridad y Gestión de Contraseñas</h3>
              <p className="text-xs text-slate-400">
                Cambia tu contraseña personal o gestiona las claves de acceso de Maury y del Técnico de Taller.
              </p>
            </div>
          </div>
          <Link
            to="/admin/seguridad"
            className="px-4 py-2 rounded-xl bg-brand-green hover:bg-brand-green-neon text-black font-extrabold text-xs flex items-center justify-center gap-1.5 shadow-neon transition-all shrink-0"
          >
            <span>Ir a Panel de Contraseñas</span>
          </Link>
        </div>

        <form onSubmit={handleSave} className="space-y-6">
          
          {/* Section 1: Datos de la Empresa */}
          <div className="bg-brand-carbon border border-brand-border rounded-2xl p-6 shadow-card space-y-4">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2 text-brand-green border-b border-brand-border/60 pb-3">
              <Building2 className="w-4 h-4" />
              <span>Datos Fiscales y Comerciales de CM FIX</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Nombre Comercial *</label>
                <input
                  type="text"
                  value={settings.company_name}
                  onChange={(e) => handleChange('company_name', e.target.value)}
                  required
                  className="w-full bg-brand-dark border border-brand-border rounded-xl px-3 py-2 text-white"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">NIF / CIF *</label>
                <input
                  type="text"
                  value={settings.cif}
                  onChange={(e) => handleChange('cif', e.target.value)}
                  required
                  className="w-full bg-brand-dark border border-brand-border rounded-xl px-3 py-2 text-white font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Teléfono Fijo / Móvil *</label>
                <input
                  type="text"
                  value={settings.phone}
                  onChange={(e) => handleChange('phone', e.target.value)}
                  required
                  className="w-full bg-brand-dark border border-brand-border rounded-xl px-3 py-2 text-white"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">WhatsApp de Atención *</label>
                <input
                  type="text"
                  value={settings.whatsapp}
                  onChange={(e) => handleChange('whatsapp', e.target.value)}
                  required
                  className="w-full bg-brand-dark border border-brand-border rounded-xl px-3 py-2 text-white"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Email de Contacto *</label>
                <input
                  type="email"
                  value={settings.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                  required
                  className="w-full bg-brand-dark border border-brand-border rounded-xl px-3 py-2 text-white"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Página Web *</label>
                <input
                  type="url"
                  value={settings.website}
                  onChange={(e) => handleChange('website', e.target.value)}
                  required
                  className="w-full bg-brand-dark border border-brand-border rounded-xl px-3 py-2 text-white"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-slate-300 font-semibold mb-1">Dirección Física del Taller *</label>
                <input
                  type="text"
                  value={settings.address}
                  onChange={(e) => handleChange('address', e.target.value)}
                  required
                  className="w-full bg-brand-dark border border-brand-border rounded-xl px-3 py-2 text-white"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Parámetros de Presupuestos & Impuestos */}
          <div className="bg-brand-carbon border border-brand-border rounded-2xl p-6 shadow-card space-y-4">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2 text-brand-green border-b border-brand-border/60 pb-3">
              <Calculator className="w-4 h-4" />
              <span>Configuración de Presupuestos e Impuestos</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">IVA por Defecto (%) *</label>
                <input
                  type="number"
                  value={settings.default_vat}
                  onChange={(e) => handleChange('default_vat', Number(e.target.value))}
                  required
                  className="w-full bg-brand-dark border border-brand-border rounded-xl px-3 py-2 text-white font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Validez del Presupuesto (Días) *</label>
                <input
                  type="number"
                  value={settings.quote_validity_days}
                  onChange={(e) => handleChange('quote_validity_days', Number(e.target.value))}
                  required
                  className="w-full bg-brand-dark border border-brand-border rounded-xl px-3 py-2 text-white font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Precio Hora Mano Obra (€/h) *</label>
                <input
                  type="number"
                  value={settings.hourly_labor_rate}
                  onChange={(e) => handleChange('hourly_labor_rate', Number(e.target.value))}
                  required
                  className="w-full bg-brand-dark border border-brand-border rounded-xl px-3 py-2 text-white font-mono"
                />
              </div>

              <div className="sm:col-span-3">
                <label className="block text-slate-300 font-semibold mb-1">Texto de Garantía y Condiciones (Aparece en PDF) *</label>
                <textarea
                  value={settings.warranty_terms}
                  onChange={(e) => handleChange('warranty_terms', e.target.value)}
                  rows={2}
                  required
                  className="w-full bg-brand-dark border border-brand-border rounded-xl px-3 py-2 text-white resize-none"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Plantillas de Mensajes WhatsApp / Notificaciones */}
          <div className="bg-brand-carbon border border-brand-border rounded-2xl p-6 shadow-card space-y-4">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2 text-brand-green border-b border-brand-border/60 pb-3">
              <MessageSquare className="w-4 h-4" />
              <span>Plantillas de Notificaciones Automáticas (WhatsApp / SMS)</span>
            </h2>

            <div className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Plantilla al Actualizar Estado de Reparación:
                </label>
                <input
                  type="text"
                  value={settings.notification_template_status}
                  onChange={(e) => handleChange('notification_template_status', e.target.value)}
                  required
                  className="w-full bg-brand-dark border border-brand-border rounded-xl px-3 py-2 text-white font-mono"
                />
                <span className="text-[10px] text-slate-500 block mt-1">
                  Variables disponibles: {"{{cliente}}"}, {"{{numero}}"}, {"{{estado}}"}, {"{{dispositivo}}"}
                </span>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Plantilla al Emitir Presupuesto:
                </label>
                <input
                  type="text"
                  value={settings.notification_template_quote}
                  onChange={(e) => handleChange('notification_template_quote', e.target.value)}
                  required
                  className="w-full bg-brand-dark border border-brand-border rounded-xl px-3 py-2 text-white font-mono"
                />
                <span className="text-[10px] text-slate-500 block mt-1">
                  Variables disponibles: {"{{cliente}}"}, {"{{dispositivo}}"}, {"{{total}}"}
                </span>
              </div>
            </div>
          </div>

          {/* Section 4: Centro de Notificaciones Directas para Maury */}
          <div className="bg-brand-carbon border-2 border-brand-green/60 rounded-2xl p-6 shadow-neon-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-brand-border/60 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-brand-green/20 border border-brand-green/60 flex items-center justify-center text-brand-green shrink-0 shadow-neon-sm">
                  <Bell className="w-5 h-5 animate-pulse" />
                </div>
                <div>
                  <h2 className="text-sm sm:text-base font-black text-white flex items-center gap-2">
                    <span>Centro de Notificaciones Directas (Taller / Maury)</span>
                    <span className="px-2 py-0.5 rounded-full bg-brand-green/20 text-brand-green text-[10px] font-mono font-bold">
                      ACTIVO
                    </span>
                  </h2>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Al introducir un nuevo presupuesto online o en taller, sonará la campana acústica y se enviará el aviso a Maury por WhatsApp.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleTestNotification}
                className="px-4 py-2 rounded-xl bg-brand-surface hover:bg-brand-border border border-brand-green/50 text-brand-green font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm transition-all shrink-0 hover:scale-105 active:scale-95"
              >
                <Volume2 className="w-4 h-4" />
                <span>Probar Sonido y Alerta</span>
              </button>
            </div>

            {testAlertMessage && (
              <div className="p-3.5 rounded-xl bg-emerald-950/80 border border-emerald-500 text-emerald-300 text-xs flex items-center gap-2 shadow-neon animate-fadeIn">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{testAlertMessage}</span>
              </div>
            )}

            {/* Tarjeta de Maury */}
            <div className="max-w-xl">
              <div className="bg-brand-surface/70 border border-emerald-500/40 rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-brand-border/40">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399]" />
                    <span className="text-xs font-black text-white">Canal de WhatsApp y Avisos: Maury (Administrador)</span>
                  </div>
                  <span className="text-[10px] font-mono bg-emerald-950/80 text-emerald-300 px-2 py-0.5 rounded border border-emerald-500/30">
                    Activo
                  </span>
                </div>

                <div className="space-y-3 text-xs">
                  <div>
                    <label className="block text-slate-400 mb-1">Teléfono Móvil / WhatsApp de Maury:</label>
                    <input
                      type="text"
                      value={notifSettings.mauryPhone}
                      onChange={(e) => setNotifSettings({ ...notifSettings, mauryPhone: e.target.value })}
                      className="w-full bg-brand-dark border border-brand-border rounded-lg px-3 py-2 text-white font-mono text-xs focus:border-brand-green focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-400 mb-1">Correo Electrónico de Maury:</label>
                    <input
                      type="email"
                      value={notifSettings.mauryEmail}
                      onChange={(e) => setNotifSettings({ ...notifSettings, mauryEmail: e.target.value })}
                      className="w-full bg-brand-dark border border-brand-border rounded-lg px-3 py-2 text-white font-mono text-xs focus:border-brand-green focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Opciones y Toggles de Alerta */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <label className="flex items-center gap-3 p-3 rounded-xl bg-brand-surface border border-brand-border cursor-pointer hover:border-brand-green/40 transition-colors">
                <input
                  type="checkbox"
                  checked={notifSettings.soundEnabled}
                  onChange={(e) => setNotifSettings({ ...notifSettings, soundEnabled: e.target.checked })}
                  className="w-4 h-4 rounded text-brand-green focus:ring-0 bg-brand-dark border-brand-border"
                />
                <div>
                  <span className="text-xs font-bold text-white block">Campana Acústica de Taller</span>
                  <span className="text-[10px] text-slate-400">Reproduce un doble timbre al entrar un nuevo presupuesto.</span>
                </div>
              </label>

              <label className="flex items-center gap-3 p-3 rounded-xl bg-brand-surface border border-brand-border cursor-pointer hover:border-brand-green/40 transition-colors">
                <input
                  type="checkbox"
                  checked={notifSettings.systemNotificationsEnabled}
                  onChange={(e) => setNotifSettings({ ...notifSettings, systemNotificationsEnabled: e.target.checked })}
                  className="w-4 h-4 rounded text-brand-green focus:ring-0 bg-brand-dark border-brand-border"
                />
                <div>
                  <span className="text-xs font-bold text-white block">Notificaciones Nativas del Dispositivo</span>
                  <span className="text-[10px] text-slate-400">Ventana emergente en la barra de estado de Windows, Mac o móvil.</span>
                </div>
              </label>
            </div>

          </div>

          {/* Bottom Save Button */}
          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={saving}
              className="px-8 py-3 rounded-xl bg-brand-green hover:bg-brand-green-neon text-black font-extrabold text-sm shadow-neon transition-all active:scale-95"
            >
              <span>Guardar Toda la Configuración</span>
            </button>
          </div>

        </form>

      </div>
    </AdminLayout>
  );
};
