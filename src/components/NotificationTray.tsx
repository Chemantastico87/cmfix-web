import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Bell, 
  X, 
  Volume2, 
  CheckCircle2, 
  ExternalLink, 
  MessageSquare, 
  RefreshCw,
  Trash2,
  CheckCheck
} from 'lucide-react';
import { 
  getStoredNotifications, 
  getUnreadNotificationsCount, 
  markAllNotificationsAsRead, 
  playNotificationSound, 
  requestNotificationPermission,
  showSystemNotification,
  saveNotificationSettings,
  getNotificationSettings,
  QuoteNotificationItem,
  getWhatsAppNotificationUrl
} from '../services/notificationService';
import { Quote } from '../types';

interface NotificationTrayProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NotificationTray: React.FC<NotificationTrayProps> = ({ isOpen, onClose }) => {
  const [notifications, setNotifications] = useState<QuoteNotificationItem[]>(getStoredNotifications());
  const [unreadCount, setUnreadCount] = useState<number>(getUnreadNotificationsCount());
  const [hasPermission, setHasPermission] = useState<boolean>(
    typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted'
  );
  const [alertFeedback, setAlertFeedback] = useState<string | null>(null);

  const refreshList = () => {
    setNotifications(getStoredNotifications());
    setUnreadCount(getUnreadNotificationsCount());
    if (typeof window !== 'undefined' && 'Notification' in window) {
      setHasPermission(Notification.permission === 'granted');
    }
  };

  useEffect(() => {
    if (isOpen) {
      refreshList();
    }
  }, [isOpen]);

  useEffect(() => {
    window.addEventListener('cmfix:notifications_updated', refreshList);
    window.addEventListener('cmfix:new_quote', refreshList);
    return () => {
      window.removeEventListener('cmfix:notifications_updated', refreshList);
      window.removeEventListener('cmfix:new_quote', refreshList);
    };
  }, []);

  if (!isOpen) return null;

  const handleTestSound = () => {
    playNotificationSound();
    setAlertFeedback('🔊 Timbre de prueba emitido correctamente.');
    setTimeout(() => setAlertFeedback(null), 3000);
  };

  const handleRequestPermission = async () => {
    playNotificationSound();
    const perm = await requestNotificationPermission();
    setHasPermission(perm === 'granted');
    saveNotificationSettings({ soundEnabled: true, systemNotificationsEnabled: perm === 'granted' });
    if (perm === 'granted') {
      showSystemNotification(
        '🔔 CM FIX: ¡Notificaciones Activas!',
        'Las alertas sonoras y de pantalla están configuradas para Maury y Eli.'
      );
      setAlertFeedback('✓ ¡Notificaciones de pantalla y sonido activadas!');
    } else {
      setAlertFeedback('Permiso bloqueado en el navegador. Las alertas sonoras seguirán sonando.');
    }
    setTimeout(() => setAlertFeedback(null), 3500);
  };

  const handleMarkAllRead = () => {
    markAllNotificationsAsRead();
    refreshList();
    setAlertFeedback('✓ Todas las notificaciones marcadas como leídas.');
    setTimeout(() => setAlertFeedback(null), 2500);
  };

  const handleForceUpdateApp = async () => {
    if ('serviceWorker' in navigator) {
      const registrations = await navigator.serviceWorker.getRegistrations();
      for (const reg of registrations) {
        await reg.update();
      }
      if ('caches' in window) {
        const cacheKeys = await caches.keys();
        await Promise.all(cacheKeys.map(k => caches.delete(k)));
      }
    }
    window.location.reload();
  };

  // Helper para convertir el item en un objeto Quote para WhatsApp
  const makeQuoteFromItem = (item: QuoteNotificationItem): Quote => ({
    id: item.quoteId,
    quote_number: item.quoteNumber,
    customer_id: '',
    device_category: 'Smartphone' as any,
    device_brand: item.device.split(' ')[0] || 'Dispositivo',
    device_model: item.device.split(' ').slice(1).join(' ') || '',
    repair_type: item.repairType,
    issue_description: item.repairType,
    estimated_time: '24-48h',
    items: [],
    subtotal: item.total,
    vat_rate: 21,
    vat_amount: 0,
    total: item.total,
    is_orientative: true,
    valid_until: '',
    status: 'PENDIENTE',
    created_at: new Date().toISOString(),
    customer: {
      id: '',
      name: item.customerName,
      phone: item.customerPhone,
      email: '',
      created_at: ''
    }
  });

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-end p-2 sm:p-4 animate-fadeIn pointer-events-auto">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity" 
        onClick={onClose} 
      />

      {/* Drawer Card */}
      <div className="relative w-full max-w-md bg-brand-carbon border-2 border-brand-green/70 rounded-2xl shadow-2xl p-4 sm:p-5 text-white z-10 backdrop-blur-xl flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-brand-border">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-brand-green/20 border border-brand-green flex items-center justify-center text-brand-green">
              <Bell className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-black text-white flex items-center gap-2">
                <span>Notificaciones CM FIX</span>
                {unreadCount > 0 && (
                  <span className="px-2 py-0.5 rounded-full bg-red-500 text-white font-mono text-[10px] font-black animate-pulse">
                    {unreadCount} nuevas
                  </span>
                )}
              </h3>
              <p className="text-[10px] text-slate-400">Canal directo para Maury y Eli</p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllRead}
                className="p-1.5 rounded-lg text-slate-400 hover:text-brand-green hover:bg-brand-surface text-xs"
                title="Marcar todas como leídas"
              >
                <CheckCheck className="w-4 h-4" />
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-brand-surface"
              title="Cerrar"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Action Controls */}
        <div className="py-2.5 border-b border-brand-border/60 flex items-center gap-2">
          <button
            onClick={handleTestSound}
            className="flex-1 py-1.5 px-2.5 rounded-xl bg-brand-surface hover:bg-brand-border border border-brand-border text-slate-200 hover:text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
            title="Hacer sonar campana de prueba"
          >
            <Volume2 className="w-3.5 h-3.5 text-brand-green" />
            <span>Probar Timbre</span>
          </button>

          {!hasPermission ? (
            <button
              onClick={handleRequestPermission}
              className="flex-1 py-1.5 px-2.5 rounded-xl bg-brand-green hover:bg-brand-green-neon text-black text-xs font-extrabold flex items-center justify-center gap-1.5 shadow-neon transition-all"
              title="Permitir alertas en pantalla del móvil u ordenador"
            >
              <Bell className="w-3.5 h-3.5" />
              <span>Activar Alertas</span>
            </button>
          ) : (
            <div className="flex-1 py-1.5 px-2.5 rounded-xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 text-xs font-bold flex items-center justify-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>Alertas Activas</span>
            </div>
          )}
        </div>

        {/* Feedback message */}
        {alertFeedback && (
          <div className="my-2 p-2 rounded-lg bg-brand-surface border border-brand-green/40 text-brand-green text-xs font-semibold animate-fadeIn flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
            <span>{alertFeedback}</span>
          </div>
        )}

        {/* Notifications List */}
        <div className="flex-1 overflow-y-auto py-2 space-y-2.5 divide-y divide-brand-border/30">
          {notifications.length === 0 ? (
            <div className="py-10 text-center space-y-2">
              <Bell className="w-8 h-8 text-slate-600 mx-auto opacity-40" />
              <p className="text-xs text-slate-400 font-medium">
                No hay notificaciones de presupuestos registradas todavía.
              </p>
              <p className="text-[11px] text-slate-500">
                Cuando un cliente calcule un presupuesto, sonará el timbre y aparecerá aquí de inmediato.
              </p>
            </div>
          ) : (
            notifications.map((item) => {
              const quoteObj = makeQuoteFromItem(item);
              const mauryWa = getWhatsAppNotificationUrl('maury', quoteObj);
              const eliWa = getWhatsAppNotificationUrl('eli', quoteObj);

              return (
                <div 
                  key={item.id}
                  className={`pt-2.5 first:pt-0 rounded-xl transition-all ${
                    item.read ? 'opacity-85' : 'bg-brand-surface/40 p-2.5 border border-brand-green/30'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="font-mono font-black text-brand-green">{item.quoteNumber}</span>
                    <span className="text-[10px] text-slate-400">{item.timestamp}</span>
                  </div>

                  <div className="text-xs font-bold text-white truncate">{item.customerName}</div>
                  <div className="text-[11px] text-slate-300 mt-0.5">
                    {item.device} · <span className="text-brand-green font-medium">{item.repairType}</span>
                  </div>

                  <div className="mt-2 flex items-center justify-between pt-2 border-t border-brand-border/30 text-xs">
                    <span className="font-mono font-black text-white text-sm">
                      {Number(item.total || 0).toFixed(2)} €
                    </span>

                    <div className="flex items-center gap-1.5">
                      <a
                        href={mauryWa}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-2 py-1 rounded-lg bg-emerald-950 hover:bg-emerald-900 border border-emerald-500/50 text-emerald-300 text-[10px] font-bold flex items-center gap-1"
                        title="Enviar aviso a WhatsApp de Maury"
                      >
                        <MessageSquare className="w-3 h-3 text-emerald-400" />
                        <span>Maury</span>
                      </a>

                      <a
                        href={eliWa}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-2 py-1 rounded-lg bg-teal-950 hover:bg-teal-900 border border-teal-500/50 text-teal-300 text-[10px] font-bold flex items-center gap-1"
                        title="Enviar aviso a WhatsApp de Eli"
                      >
                        <MessageSquare className="w-3 h-3 text-teal-400" />
                        <span>Eli</span>
                      </a>

                      <Link
                        to="/admin/presupuestos"
                        onClick={onClose}
                        className="px-2 py-1 rounded-lg bg-brand-green/20 hover:bg-brand-green/30 text-brand-green border border-brand-green/40 text-[10px] font-bold flex items-center gap-1"
                      >
                        <span>Abrir</span>
                        <ExternalLink className="w-3 h-3" />
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer actions */}
        <div className="pt-3 border-t border-brand-border flex items-center justify-between text-xs text-slate-400">
          <Link
            to="/admin/configuracion"
            onClick={onClose}
            className="hover:text-brand-green transition-colors text-[11px]"
          >
            Ajustes teléfonos y avisos →
          </Link>

          <button
            onClick={handleForceUpdateApp}
            className="hover:text-white transition-colors text-[10px] font-mono flex items-center gap-1 text-slate-500"
            title="Limpiar caché de la PWA y recargar la última versión"
          >
            <RefreshCw className="w-3 h-3" />
            <span>Recargar App</span>
          </button>
        </div>

      </div>
    </div>
  );
};
