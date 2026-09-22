import React from 'react';
import { Cookie, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

export const CookiesPage: React.FC = () => {
  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto text-slate-300">
      <Link to="/" className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white mb-6">
        <ArrowLeft className="w-4 h-4" />
        <span>Volver a CM FIX</span>
      </Link>

      <div className="bg-brand-carbon border border-brand-border rounded-2xl p-8 shadow-card space-y-6">
        <div className="flex items-center gap-3 pb-4 border-b border-brand-border/60">
          <Cookie className="w-8 h-8 text-brand-green" />
          <h1 className="text-2xl sm:text-3xl font-black text-white">Política de Cookies</h1>
        </div>

        <p className="text-xs text-slate-400">Última actualización: Septiembre 2026</p>

        <section className="space-y-3 text-xs leading-relaxed">
          <h2 className="text-sm font-bold text-white uppercase tracking-wider text-brand-green">1. ¿Qué son las cookies?</h2>
          <p>
            Una cookie es un fichero que se descarga en su dispositivo al acceder a determinadas páginas web. Permiten almacenar y recuperar información sobre los hábitos de navegación del usuario o de su equipo para mejorar el servicio y la experiencia.
          </p>
        </section>

        <section className="space-y-3 text-xs leading-relaxed">
          <h2 className="text-sm font-bold text-white uppercase tracking-wider text-brand-green">2. Cookies utilizadas en CM FIX</h2>
          <p>La plataforma web de CM FIX utiliza únicamente cookies técnicas y de sesión necesarias para el correcto funcionamiento del presupuesto online, autenticación segura y persistencia de preferencias de la aplicación PWA. No se emplean cookies de rastreo publicitario de terceros sin consentimiento explícito.</p>
        </section>
      </div>
    </div>
  );
};
