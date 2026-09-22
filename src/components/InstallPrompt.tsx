import React, { useState, useEffect } from 'react';
import { Download, X } from 'lucide-react';

export const InstallPrompt: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handler = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      // Show only if not previously dismissed in this session
      if (!sessionStorage.getItem('cmfix_pwa_dismissed')) {
        setIsVisible(true);
      }
    };

    window.addEventListener('beforeinstallprompt', handler);

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setIsVisible(false);
    }
    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    setIsVisible(false);
    sessionStorage.setItem('cmfix_pwa_dismissed', 'true');
  };

  if (!isVisible) return null;

  return (
    <aside aria-label="Instalación de la app" className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96 z-50 bg-brand-carbon border border-brand-green/40 shadow-neon rounded-xl p-4 flex items-center justify-between gap-3 text-sm animate-bounce-subtle backdrop-blur-lg">
      <div className="flex items-center gap-3">
        <img src="/icon-192.png" alt="CM FIX App" className="w-10 h-10 rounded-lg object-contain shadow-sm bg-black" />
        <div>
          <h4 className="font-bold text-white text-xs">Instalar CM FIX App</h4>
          <p className="text-slate-400 text-xs">Consulta tus reparaciones y presupuestos al instante.</p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={handleInstall}
          className="px-3 py-1.5 rounded-lg bg-brand-green hover:bg-brand-green-neon text-black font-bold text-xs flex items-center gap-1 shadow-sm transition-all"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Instalar</span>
        </button>
        <button
          onClick={handleDismiss}
          className="p-1 rounded-md text-slate-400 hover:text-white"
          aria-label="Cerrar banner de instalación"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </aside>
  );
};
