import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Bell, 
  X, 
  ExternalLink, 
  MessageCircle, 
  Volume2, 
  CheckCircle2, 
  Sparkles 
} from 'lucide-react';
import { Quote } from '../types';
import { 
  getNotificationSettings, 
  getWhatsAppNotificationUrl,
  playNotificationSound 
} from '../services/notificationService';

export const NotificationBanner: React.FC = () => {
  const [activeQuote, setActiveQuote] = useState<Quote | null>(null);
  const [settings, setSettings] = useState(getNotificationSettings());

  useEffect(() => {
    const handleNewQuote = (e: Event) => {
      const customEvent = e as CustomEvent<{ quote: Quote }>;
      if (customEvent.detail?.quote) {
        setActiveQuote(customEvent.detail.quote);
        setSettings(getNotificationSettings());
      }
    };

    window.addEventListener('cmfix:new_quote', handleNewQuote);
    return () => {
      window.removeEventListener('cmfix:new_quote', handleNewQuote);
    };
  }, []);

  if (!activeQuote) return null;

  const mauryWaUrl = getWhatsAppNotificationUrl('maury', activeQuote);

  return (
    <div className="fixed top-4 right-4 z-50 max-w-md w-[calc(100vw-2rem)] sm:w-96 animate-bounce-short shadow-neon-strong">
      <div className="bg-brand-carbon/95 border-2 border-brand-green rounded-2xl p-4 sm:p-5 backdrop-blur-xl shadow-2xl text-white relative">
        
        {/* Glow effect bar */}
        <div className="absolute -top-1 left-4 right-4 h-1 bg-gradient-to-r from-brand-green-neon via-emerald-400 to-brand-green rounded-full shadow-[0_0_12px_#22c55e]" />

        {/* Close Button */}
        <button
          onClick={() => setActiveQuote(null)}
          className="absolute top-3 right-3 p-1 rounded-lg text-slate-400 hover:text-white hover:bg-brand-surface transition-colors"
          title="Cerrar aviso"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header Badge */}
        <div className="flex items-center gap-2 mb-2.5">
          <div className="w-8 h-8 rounded-xl bg-brand-green/20 border border-brand-green/60 flex items-center justify-center text-brand-green animate-pulse">
            <Bell className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[10px] font-mono font-black uppercase tracking-wider text-brand-green block leading-none">
              NUEVO PRESUPUESTO ENTRANTE
            </span>
            <span className="text-xs font-bold text-white font-mono">
              {activeQuote.quote_number}
            </span>
          </div>
        </div>

        {/* Quote Details */}
        <div className="bg-brand-surface/70 border border-brand-border/60 rounded-xl p-3 mb-3 space-y-1.5 text-xs">
          <div className="flex items-center justify-between">
            <span className="text-slate-400">Cliente:</span>
            <span className="font-bold text-white truncate max-w-[180px]">
              {activeQuote.customer?.name || 'Cliente particular'}
            </span>
          </div>
          {activeQuote.customer?.phone && (
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Teléfono:</span>
              <span className="font-mono text-emerald-300 font-semibold">
                {activeQuote.customer.phone}
              </span>
            </div>
          )}
          <div className="flex items-center justify-between">
            <span className="text-slate-400">Dispositivo:</span>
            <span className="text-slate-200 truncate max-w-[180px]">
              {activeQuote.device_brand} {activeQuote.device_model}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-400">Avería:</span>
            <span className="text-slate-200 truncate max-w-[180px]">
              {activeQuote.repair_type}
            </span>
          </div>
          <div className="flex items-center justify-between pt-1 border-t border-brand-border/40">
            <span className="text-slate-300 font-semibold">Total Presupuestado:</span>
            <span className="font-mono font-black text-brand-green text-sm">
              {Number(activeQuote.total || 0).toFixed(2)} €
            </span>
          </div>
        </div>

        {/* Action Button for Maury */}
        <div className="space-y-2">
          <a
            href={mauryWaUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 w-full py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs shadow-neon transition-all"
            title="Avisar a Maury (+34 661 99 10 60)"
          >
            <MessageCircle className="w-4 h-4" />
            <span>Avisar a Maury por WhatsApp</span>
          </a>

          <div className="pt-1 flex items-center justify-between gap-2">
            <Link
              to={`/presupuesto/${activeQuote.id || activeQuote.quote_number}`}
              onClick={() => setActiveQuote(null)}
              className="flex-1 py-2 px-3 rounded-xl bg-brand-surface hover:bg-brand-border border border-brand-border text-center text-xs font-bold text-slate-200 hover:text-white transition-colors flex items-center justify-center gap-1.5"
            >
              <ExternalLink className="w-3.5 h-3.5 text-brand-green" />
              <span>Ver Presupuesto</span>
            </Link>

            <button
              onClick={() => playNotificationSound()}
              className="p-2 rounded-xl bg-brand-surface hover:bg-brand-border border border-brand-border text-slate-400 hover:text-white transition-colors"
              title="Volver a reproducir sonido"
            >
              <Volume2 className="w-4 h-4 text-brand-green" />
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
