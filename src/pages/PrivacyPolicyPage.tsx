import React from 'react';
import { Shield, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

export const PrivacyPolicyPage: React.FC = () => {
  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto text-slate-300">
      <Link to="/" className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white mb-6">
        <ArrowLeft className="w-4 h-4" />
        <span>Volver a CM FIX</span>
      </Link>

      <div className="bg-brand-carbon border border-brand-border rounded-2xl p-8 shadow-card space-y-6">
        <div className="flex items-center gap-3 pb-4 border-b border-brand-border/60">
          <Shield className="w-8 h-8 text-brand-green" />
          <h1 className="text-2xl sm:text-3xl font-black text-white">Política de Privacidad y Protección de Datos</h1>
        </div>

        <p className="text-xs text-slate-400">Última actualización: Septiembre 2026</p>

        <section className="space-y-3 text-xs leading-relaxed">
          <h2 className="text-sm font-bold text-white uppercase tracking-wider text-brand-green">1. Responsable del Tratamiento</h2>
          <p>
            El responsable del tratamiento de los datos recabados en este sitio web es <strong>CM FIX (Maury)</strong>, con domicilio en La Línea de la Concepción y alrededores (Cádiz). Teléfono de atención: +34 661 99 10 60. Correo de contacto: cmfixespana@gmail.com.
          </p>
        </section>

        <section className="space-y-3 text-xs leading-relaxed">
          <h2 className="text-sm font-bold text-white uppercase tracking-wider text-brand-green">2. Finalidad del Tratamiento</h2>
          <p>Los datos personales proporcionados (nombre, teléfono, correo electrónico, datos técnicos del dispositivo y avería) se recaban con las siguientes finalidades:</p>
          <ul className="list-disc list-inside space-y-1 pl-2">
            <li>Emisión y notificación de presupuestos solicitados por el usuario.</li>
            <li>Gestión y ejecución técnica de la orden de reparación asignada.</li>
            <li>Notificación en tiempo real del cambio de estados en el timeline de la reparación.</li>
            <li>Cumplimiento de las obligaciones legales y fiscales de facturación y garantía.</li>
          </ul>
        </section>

        <section className="space-y-3 text-xs leading-relaxed">
          <h2 className="text-sm font-bold text-white uppercase tracking-wider text-brand-green">3. Custodia de Dispositivos y Confidencialidad</h2>
          <p>
            CM FIX garantiza que no accederá a ningún dato personal, fotografías ni documentos contenidos en los soportes de almacenamiento de los dispositivos de los clientes, salvo aquello estrictamente indispensable para verificar el funcionamiento del hardware o cuando el cliente solicite un servicio explícito de recuperación o copia de seguridad.
          </p>
        </section>

        <section className="space-y-3 text-xs leading-relaxed">
          <h2 className="text-sm font-bold text-white uppercase tracking-wider text-brand-green">4. Derechos del Usuario (ARCO)</h2>
          <p>
            El usuario podrá ejercer en cualquier momento sus derechos de acceso, rectificación, supresión, limitación del tratamiento y portabilidad enviando una solicitud por escrito a <strong>info@cmfix.es</strong> junto con una copia de su documento de identidad.
          </p>
        </section>
      </div>
    </div>
  );
};
