import React, { useState, useEffect } from 'react';
import { Bell, X, Volume2, CheckCircle2 } from 'lucide-react';
import { 
  requestNotificationPermission, 
  playNotificationSound,
  showSystemNotification,
  saveNotificationSettings,
  getNotificationSettings
} from '../services/notificationService';

export const NotificationPrompt: React.FC = () => {
  const [showPrompt, setShowPrompt] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  useEffect(() => {
    // Solo mostrar si no se ha descartado en esta sesión y el permiso no está otorgado o se puede pedir
    const dismissed = sessionStorage.getItem('cmfix_notif_prompt_dismissed');
    const hasNotificationSupport = 'Notification' in window;
    
    if (hasNotificationSupport && Notification.permission !== 'granted' && !dismissed) {
      setShowPrompt(true);
    }
  }, []);

  const handleEnable = async () => {
    // 1. Reproducir sonido de confirmación
    playNotificationSound();

    // 2. Solicitar permiso al navegador / sistema operativo
    const permission = await requestNotificationPermission();

    // 3. Guardar ajuste activo
    saveNotificationSettings({
      soundEnabled: true,
      systemNotificationsEnabled: permission === 'granted'
    });

    if (permission === 'granted') {
      showSystemNotification(
        '🔔 ¡Notificaciones de CM FIX Activadas!',
        'A partir de ahora recibirás avisos sonoros y en pantalla cuando entre un nuevo presupuesto en el taller.'
      );
      setStatusMessage('¡Notificaciones y sonido activados correctamente!');
    } else {
      setStatusMessage('Alerta sonora de campana activada. (Permiso de pantalla no concedido en el navegador).');
    }

    setTimeout(() => {
      setShowPrompt(false);
      setStatusMessage(null);
    }, 3500);
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    sessionStorage.setItem('cmfix_notif_prompt_dismissed', 'true');
  };

  if (!showPrompt) return null;

  return (
    <div className="bg-gradient-to-r from-emerald-950 via-brand-carbon to-teal-950 border-b-2 border-brand-green p-3 sm:p-4 text-white shadow-neon animate-fadeIn sticky top-0 z-40">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-brand-green/20 border border-brand-green/60 flex items-center justify-center text-brand-green shrink-0 shadow-neon-sm animate-pulse">
            <Bell className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-extrabold text-xs sm:text-sm text-white flex items-center gap-1.5">
              <span>Activar Notificaciones de Presupuestos (Taller CM FIX)</span>
              <span className="px-2 py-0.5 rounded-full bg-brand-green/20 text-brand-green font-mono text-[10px]">
                RECOMENDADO
              </span>
            </h4>
            <p className="text-[11px] sm:text-xs text-slate-300 mt-0.5">
              Haz clic para que tu móvil u ordenador te avise con campana acústica y notificación emergente cada vez que entre un nuevo presupuesto.
            </p>
          </div>
        </div>

        {statusMessage ? (
          <div className="flex items-center gap-2 text-xs text-emerald-300 font-bold bg-emerald-900/60 px-3 py-1.5 rounded-xl border border-emerald-400/50">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>{statusMessage}</span>
          </div>
        ) : (
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleEnable}
              className="px-4 py-2 rounded-xl bg-brand-green hover:bg-brand-green-neon text-black font-black text-xs flex items-center gap-1.5 shadow-neon transition-all hover:scale-105 active:scale-95"
            >
              <Bell className="w-3.5 h-3.5" />
              <span>Activar Notificaciones Ahora</span>
            </button>

            <button
              onClick={() => playNotificationSound()}
              className="p-2 rounded-xl bg-brand-surface hover:bg-brand-border border border-brand-border text-slate-300 hover:text-white transition-colors"
              title="Probar sonido de campana"
            >
              <Volume2 className="w-4 h-4 text-brand-green" />
            </button>

            <button
              onClick={handleDismiss}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-brand-surface transition-colors"
              title="Cerrar aviso"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

      </div>
    </div>
  );
};
