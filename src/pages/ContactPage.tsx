import React, { useState } from 'react';
import { 
  Phone, 
  Mail, 
  MapPin, 
  Clock, 
  MessageSquare, 
  Send, 
  CheckCircle2, 
  ShieldCheck,
  Smartphone,
  ExternalLink
} from 'lucide-react';

export const ContactPage: React.FC = () => {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');
  const [sent, setSent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Open WhatsApp with formatted text
    const text = encodeURIComponent(`Hola CM FIX, soy ${name} (${phone}). Consulta: ${message}`);
    window.open(`https://wa.me/34624892041?text=${text}`, '_blank');
    setSent(true);
  };

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      
      {/* Title */}
      <div className="text-center max-w-3xl mx-auto mb-12">
        <span className="text-xs font-mono font-bold text-brand-green uppercase tracking-widest">
          ATENCIÓN Y LOCALIZACIÓN
        </span>
        <h1 className="text-3xl sm:text-5xl font-black text-white mt-1">
          Contacto y Taller CM FIX
        </h1>
        <p className="mt-3 text-slate-300 text-sm sm:text-base">
          Estamos a tu disposición en tienda física o a través de nuestros canales digitales directos.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Direct info cards */}
        <div className="lg:col-span-5 space-y-4">
          
          {/* Main Info Box */}
          <div className="bg-brand-carbon border border-brand-border rounded-2xl p-6 shadow-card space-y-5">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <MapPin className="w-5 h-5 text-brand-green" />
              <span>Visítanos en el Taller</span>
            </h2>

            <div className="space-y-4 text-xs">
              <div className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-brand-green shrink-0 mt-1" />
                <div>
                  <p className="text-white font-semibold">Dirección</p>
                  <p className="text-slate-400 mt-0.5">Calle Tecnología 14, Local 2, 28030 Madrid</p>
                  <span className="text-[11px] text-brand-green">Zona de fácil aparcamiento y metro cercano</span>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Clock className="w-4 h-4 text-brand-green shrink-0 mt-1" />
                <div>
                  <p className="text-white font-semibold">Horario de Taller</p>
                  <p className="text-slate-400 mt-0.5">Lunes a Viernes: 09:30 - 14:00 y 16:30 - 20:00</p>
                  <p className="text-slate-400">Sábados: 10:00 - 14:00</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Phone className="w-4 h-4 text-brand-green shrink-0 mt-1" />
                <div>
                  <p className="text-white font-semibold">Teléfono y WhatsApp</p>
                  <a href="tel:+34624892041" className="text-slate-300 hover:text-brand-green block">+34 624 89 20 41</a>
                  <p className="text-[11px] text-slate-500">Respondemos mensajes en horario comercial</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Mail className="w-4 h-4 text-brand-green shrink-0 mt-1" />
                <div>
                  <p className="text-white font-semibold">Correo Electrónico</p>
                  <a href="mailto:info@cmfix.es" className="text-slate-300 hover:text-brand-green">info@cmfix.es</a>
                </div>
              </div>
            </div>

            {/* Direct Action Buttons */}
            <div className="pt-4 border-t border-brand-border/60 flex flex-col sm:flex-row gap-3">
              <a
                href="https://wa.me/34624892041"
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-all"
              >
                <MessageSquare className="w-4 h-4" />
                <span>Escribir por WhatsApp</span>
              </a>

              <a
                href="tel:+34624892041"
                className="py-3 px-4 rounded-xl bg-brand-surface border border-brand-border text-slate-200 hover:text-white font-bold text-xs flex items-center justify-center gap-2 transition-all"
              >
                <Phone className="w-4 h-4 text-brand-green" />
                <span>Llamar</span>
              </a>
            </div>
          </div>

          {/* Guarantee Badge Card */}
          <div className="p-5 rounded-2xl bg-brand-surface/60 border border-brand-green/30 flex items-center gap-4">
            <ShieldCheck className="w-10 h-10 text-brand-green shrink-0" />
            <div className="text-xs">
              <h4 className="font-bold text-white">Garantía Certificada CM FIX</h4>
              <p className="text-slate-400 mt-0.5 leading-relaxed">
                Todas las reparaciones incluyen comprobante legal, factura si lo requieres y 6 meses de garantía.
              </p>
            </div>
          </div>

        </div>

        {/* Right Column: Fast Contact Form */}
        <div className="lg:col-span-7">
          <form
            onSubmit={handleSubmit}
            className="bg-brand-carbon border border-brand-border rounded-2xl p-6 sm:p-8 shadow-card space-y-4"
          >
            <h2 className="text-xl font-bold text-white mb-2">Envíanos un mensaje rápido</h2>
            <p className="text-xs text-slate-400 mb-4">
              ¿Tienes dudas sobre si merece la pena reparar tu dispositivo o necesitas orientación? Te responderemos a la mayor brevedad.
            </p>

            {sent && (
              <div className="p-4 rounded-xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Se ha abierto el canal de WhatsApp con tu mensaje preparado. ¡Te atenderemos enseguida!</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Tu Nombre *</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Nombre o empresa"
                required
                className="w-full bg-brand-dark border border-brand-border rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-brand-green"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Teléfono de contacto *</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Ej. 624 89 20 41"
                required
                className="w-full bg-brand-dark border border-brand-border rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-brand-green"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">¿En qué podemos ayudarte? *</label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={4}
                placeholder="Describe tu dispositivo o consulta..."
                required
                className="w-full bg-brand-dark border border-brand-border rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-brand-green resize-none"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3.5 px-6 rounded-xl bg-brand-green hover:bg-brand-green-neon text-black font-extrabold text-sm flex items-center justify-center gap-2 shadow-neon transition-all active:scale-95"
            >
              <Send className="w-4 h-4" />
              <span>Enviar consulta a CM FIX</span>
            </button>
          </form>
        </div>

      </div>

    </div>
  );
};
