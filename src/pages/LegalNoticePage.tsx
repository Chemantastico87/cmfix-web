import React from 'react';
import { Scale, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

export const LegalNoticePage: React.FC = () => {
  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto text-slate-300">
      <Link to="/" className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white mb-6">
        <ArrowLeft className="w-4 h-4" />
        <span>Volver a CM FIX</span>
      </Link>

      <div className="bg-brand-carbon border border-brand-border rounded-2xl p-8 shadow-card space-y-6">
        <div className="flex items-center gap-3 pb-4 border-b border-brand-border/60">
          <Scale className="w-8 h-8 text-brand-green" />
          <h1 className="text-2xl sm:text-3xl font-black text-white">Aviso Legal</h1>
        </div>

        <section className="space-y-3 text-xs leading-relaxed">
          <h2 className="text-sm font-bold text-white uppercase tracking-wider text-brand-green">1. Información General (LSSI-CE)</h2>
          <p>
            En cumplimiento del artículo 10 de la Ley 34/2002 de Servicios de la Sociedad de la Información y de Comercio Electrónico (LSSI-CE), se informa que el titular del dominio cmfix.es es <strong>CM FIX</strong>, con CIF provisional B-12345678 y domicilio en Calle Tecnología 14, Local 2, 28030 Madrid. Teléfono de atención: +34 624 89 20 41. Correo electrónico: info@cmfix.es.
          </p>
        </section>

        <section className="space-y-3 text-xs leading-relaxed">
          <h2 className="text-sm font-bold text-white uppercase tracking-wider text-brand-green">2. Propiedad Intelectual</h2>
          <p>
            El logotipo, diseños, identidad de marca, software y elementos visuales de CM FIX están protegidos por la legislación española e internacional sobre propiedad industrial e intelectual. Queda prohibida su reproducción sin autorización previa y por escrito.
          </p>
        </section>

        <section className="space-y-3 text-xs leading-relaxed">
          <h2 className="text-sm font-bold text-white uppercase tracking-wider text-brand-green">3. Garantía y Condiciones de Reparación</h2>
          <p>
            Todas las reparaciones realizadas por CM FIX cuentan con una garantía legal de 6 meses en componentes sustituidos y mano de obra a contar desde la fecha de entrega al cliente, cubriendo defectos de la pieza o del montaje técnico, salvo roturas sobrevenidas, caídas posteriores o filtraciones por líquidos.
          </p>
        </section>
      </div>
    </div>
  );
};
