import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Calculator, 
  Search, 
  Wrench, 
  ShieldCheck, 
  Zap, 
  Clock, 
  Smartphone, 
  Laptop, 
  Monitor, 
  Tablet, 
  HardDrive, 
  Settings, 
  Globe, 
  Cpu,
  ArrowRight,
  CheckCircle2,
  ChevronRight,
  Star,
  Award
} from 'lucide-react';
import { DeviceCategory } from '../types';

export const HomePage: React.FC = () => {
  const navigate = useNavigate();

  // Quick form state
  const [quickCategory, setQuickCategory] = useState<DeviceCategory>('iPhone');
  const [quickBrand, setQuickBrand] = useState('Apple');
  const [quickModel, setQuickModel] = useState('');
  const [quickIssue, setQuickIssue] = useState('Cambio de pantalla');
  const [quickDescription, setQuickDescription] = useState('');

  const handleQuickSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Navigate to /presupuesto with preselected params
    navigate('/presupuesto', {
      state: {
        category: quickCategory,
        brand: quickBrand,
        model: quickModel,
        issue: quickIssue,
        description: quickDescription
      }
    });
  };

  const servicesList = [
    { icon: Smartphone, name: 'Móviles', desc: 'Pantallas OLED, baterías, conectores de carga y microelectrónica.' },
    { icon: Monitor, name: 'Ordenadores PC', desc: 'Montaje gaming, formateo, eliminación de virus y fallos de hardware.' },
    { icon: Laptop, name: 'Portátiles', desc: 'Cambio de pasta térmica, teclados, bisagras y ampliación NVMe.' },
    { icon: Tablet, name: 'Tablets / iPad', desc: 'Digitalizadores, baterías y conectores de carga para iPad y Android.' },
    { icon: Wrench, name: 'Reparaciones Express', desc: 'Diagnóstico en el acto e intervenciones de urgencia en < 2 horas.' },
    { icon: Settings, name: 'Mantenimiento', desc: 'Limpieza por ultrasonidos, reballing y sustitución de pasta térmica.' },
    { icon: Globe, name: 'Servicios Informáticos', desc: 'Configuración de redes, copias de seguridad y asistencia remota.' },
    { icon: HardDrive, name: 'Software y SO', desc: 'Instalación limpia de Windows 11/10, macOS, Linux y recuperación de datos.' }
  ];

  return (
    <div className="flex flex-col min-h-screen bg-tech-grid">
      
      {/* 1. HERO SECTION */}
      <section className="relative overflow-hidden pt-8 pb-16 md:pt-14 md:pb-24 border-b border-brand-border/40">
        {/* Glow ambient effects */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[650px] h-[350px] bg-brand-green/15 blur-[120px] rounded-full pointer-events-none -z-10" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          
          {/* Official CM FIX Cyber Badge */}
          <div className="inline-block mb-6 animate-float">
            <img 
              src="/cmfix-badge.png" 
              alt="CM FIX — Repara, Soluciona, Conecta" 
              className="max-h-24 sm:max-h-28 md:max-h-36 w-auto mx-auto object-contain filter drop-shadow-[0_0_20px_rgba(34,197,94,0.45)]" 
            />
          </div>

          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-surface border border-brand-green/30 text-brand-green-light text-xs font-semibold mb-6">
            <span className="w-2 h-2 rounded-full bg-brand-green animate-pulse" />
            <span>Taller Técnico Especializado en Madrid — Presupuestos en 2 Minutos</span>
          </div>

          <h1 className="text-3xl sm:text-5xl md:text-6xl font-black text-white tracking-tight max-w-4xl mx-auto leading-tight md:leading-tight">
            Reparamos tu tecnología. <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-green via-brand-green-neon to-emerald-300 text-glow">
              Tú sigues adelante.
            </span>
          </h1>

          <p className="mt-5 text-base sm:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
            Reparación de móviles, ordenadores y dispositivos tecnológicos con diagnóstico, presupuesto online orientativo y seguimiento en tiempo real.
          </p>

          {/* Action Buttons */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <Link
              to="/presupuesto"
              className="px-6 py-3.5 rounded-xl bg-brand-green hover:bg-brand-green-neon text-black font-extrabold text-sm md:text-base flex items-center gap-2.5 shadow-neon hover:shadow-neon-strong transition-all active:scale-95"
            >
              <Calculator className="w-5 h-5" />
              <span>Solicitar presupuesto</span>
            </Link>

            <Link
              to="/presupuesto"
              className="px-6 py-3.5 rounded-xl bg-brand-surface hover:bg-brand-elevated text-white border border-brand-green/40 hover:border-brand-green font-bold text-sm md:text-base flex items-center gap-2.5 transition-all"
            >
              <Wrench className="w-5 h-5 text-brand-green" />
              <span>Solicitar reparación</span>
            </Link>

            <Link
              to="/seguimiento"
              className="px-6 py-3.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700/60 font-semibold text-sm md:text-base flex items-center gap-2.5 transition-all"
            >
              <Search className="w-5 h-5 text-brand-green" />
              <span>Ver mis reparaciones</span>
            </Link>
          </div>

          {/* Guarantees row */}
          <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto text-left">
            <div className="p-3.5 rounded-xl bg-brand-surface/60 border border-brand-border flex items-center gap-3">
              <ShieldCheck className="w-7 h-7 text-brand-green shrink-0" />
              <div>
                <h4 className="text-xs font-bold text-white">6 Meses Garantía</h4>
                <p className="text-[11px] text-slate-400">En piezas y mano de obra</p>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-brand-surface/60 border border-brand-border flex items-center gap-3">
              <Clock className="w-7 h-7 text-brand-green shrink-0" />
              <div>
                <h4 className="text-xs font-bold text-white">Reparación Express</h4>
                <p className="text-[11px] text-slate-400">Muchas en el mismo día</p>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-brand-surface/60 border border-brand-border flex items-center gap-3">
              <Award className="w-7 h-7 text-brand-green shrink-0" />
              <div>
                <h4 className="text-xs font-bold text-white">Repuestos Premium</h4>
                <p className="text-[11px] text-slate-400">Originales y Grado A+</p>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-brand-surface/60 border border-brand-border flex items-center gap-3">
              <Zap className="w-7 h-7 text-brand-green shrink-0" />
              <div>
                <h4 className="text-xs font-bold text-white">Seguimiento en Vivo</h4>
                <p className="text-[11px] text-slate-400">Timeline de tu estado</p>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* 2. FORMULARIO RÁPIDO: "¿Qué necesitas reparar?" */}
      <section className="py-14 md:py-20 bg-brand-carbon/80 border-b border-brand-border/60">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center mb-10">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
              ¿Qué necesitas reparar?
            </h2>
            <p className="text-sm text-slate-400 mt-2">
              Indícanos tu dispositivo y avería para obtener una estimación orientativa inmediata.
            </p>
          </div>

          <form 
            onSubmit={handleQuickSubmit}
            className="bg-brand-surface/90 border border-brand-green/30 rounded-2xl p-6 sm:p-8 shadow-card relative overflow-hidden backdrop-blur-md"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-brand-green/10 rounded-bl-full pointer-events-none" />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              
              {/* Tipo de dispositivo */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
                  Tipo de dispositivo
                </label>
                <select
                  value={quickCategory}
                  onChange={(e) => {
                    const cat = e.target.value as DeviceCategory;
                    setQuickCategory(cat);
                    if (cat === 'iPhone') setQuickBrand('Apple');
                    else if (cat === 'Samsung') setQuickBrand('Samsung');
                    else if (cat === 'Xiaomi') setQuickBrand('Xiaomi');
                    else if (cat === 'Mac') setQuickBrand('Apple');
                    else setQuickBrand('');
                  }}
                  className="w-full bg-brand-dark border border-brand-border rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-brand-green transition-colors"
                >
                  <option value="iPhone">iPhone</option>
                  <option value="Samsung">Samsung</option>
                  <option value="Xiaomi">Xiaomi</option>
                  <option value="Android">Otro Android (Huawei, Oppo, Pixel)</option>
                  <option value="Portátil">Portátil (HP, Lenovo, Asus, Acer)</option>
                  <option value="PC">PC Sobremesa / Gaming</option>
                  <option value="Mac">Mac / MacBook</option>
                  <option value="Tablet">Tablet / iPad</option>
                  <option value="Consola">Consola (PlayStation, Nintendo, Xbox)</option>
                  <option value="Otro">Otro Dispositivo</option>
                </select>
              </div>

              {/* Marca */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
                  Marca
                </label>
                <input
                  type="text"
                  value={quickBrand}
                  onChange={(e) => setQuickBrand(e.target.value)}
                  placeholder="Ej. Apple, Samsung, Lenovo..."
                  required
                  className="w-full bg-brand-dark border border-brand-border rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-brand-green transition-colors"
                />
              </div>

              {/* Modelo */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
                  Modelo exacto
                </label>
                <input
                  type="text"
                  value={quickModel}
                  onChange={(e) => setQuickModel(e.target.value)}
                  placeholder="Ej. iPhone 13 Pro, Galaxy S23, Legion 5..."
                  required
                  className="w-full bg-brand-dark border border-brand-border rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-brand-green transition-colors"
                />
              </div>

              {/* Problema */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
                  Problema o reparación solicitada
                </label>
                <select
                  value={quickIssue}
                  onChange={(e) => setQuickIssue(e.target.value)}
                  className="w-full bg-brand-dark border border-brand-border rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-brand-green transition-colors"
                >
                  <option value="Cambio de pantalla">Cambio de pantalla / Cristal roto</option>
                  <option value="Cambio de batería">Cambio de batería (se descarga rápido)</option>
                  <option value="Conector de carga">Conector de carga no funciona</option>
                  <option value="No enciende / Apagado repentino">No enciende / Apagado repentino</option>
                  <option value="Lentitud / Cambio a SSD NVMe">Lentitud / Cambio a SSD NVMe</option>
                  <option value="Limpieza y pasta térmica">Limpieza de ventiladores y pasta térmica</option>
                  <option value="Problemas de software o virus">Problemas de software, Windows o virus</option>
                  <option value="Diagnóstico general">Diagnóstico general</option>
                  <option value="Otro">Otro problema específico</option>
                </select>
              </div>

              {/* Descripción */}
              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
                  Descripción del fallo (opcional)
                </label>
                <textarea
                  value={quickDescription}
                  onChange={(e) => setQuickDescription(e.target.value)}
                  rows={2}
                  placeholder="Cuéntanos más detalles: ¿ha sufrido un golpe, caída en líquido o fue tras una actualización?"
                  className="w-full bg-brand-dark border border-brand-border rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-brand-green transition-colors resize-none"
                />
              </div>

            </div>

            {/* Submit Button */}
            <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-brand-border/60">
              <span className="text-xs text-slate-400">
                ⚡ Presupuesto previo 100% gratuito y sin compromiso.
              </span>

              <button
                type="submit"
                className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-brand-green hover:bg-brand-green-neon text-black font-extrabold text-sm flex items-center justify-center gap-2 shadow-neon hover:shadow-neon-strong transition-all active:scale-95"
              >
                <span>Calcular presupuesto</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </form>

        </div>
      </section>

      {/* 3. SECCIÓN DE SERVICIOS */}
      <section className="py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12">
            <div>
              <span className="text-xs font-mono font-bold tracking-wider text-brand-green uppercase">
                ÁREAS DE ESPECIALIZACIÓN
              </span>
              <h2 className="text-2xl sm:text-4xl font-extrabold text-white mt-1">
                Servicios Técnicos Integrales
              </h2>
            </div>
            <Link
              to="/servicios"
              className="mt-4 md:mt-0 inline-flex items-center gap-1.5 text-sm font-semibold text-brand-green hover:text-brand-green-light transition-colors"
            >
              <span>Ver catálogo completo</span>
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {servicesList.map((srv, idx) => {
              const IconComp = srv.icon;
              return (
                <div
                  key={idx}
                  className="p-6 rounded-2xl bg-brand-surface/60 border border-brand-border/80 hover:border-brand-green/50 hover:bg-brand-surface transition-all duration-300 group hover:-translate-y-1 shadow-sm"
                >
                  <div className="w-12 h-12 rounded-xl bg-brand-dark border border-brand-green/20 flex items-center justify-center text-brand-green group-hover:text-black group-hover:bg-brand-green transition-all mb-4 shadow-neon-sm">
                    <IconComp className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-bold text-white group-hover:text-brand-green-light transition-colors">
                    {srv.name}
                  </h3>
                  <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                    {srv.desc}
                  </p>
                  <Link
                    to="/presupuesto"
                    className="mt-4 inline-flex items-center gap-1 text-xs font-semibold text-slate-400 group-hover:text-brand-green transition-colors"
                  >
                    <span>Pedir presupuesto</span>
                    <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              );
            })}
          </div>

        </div>
      </section>

      {/* 4. BANNER CM FIX — TU TECNOLOGÍA EN BUENAS MANOS */}
      <section className="py-12 bg-brand-carbon/60 border-y border-brand-border/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col lg:flex-row items-center justify-between gap-8">
          <div className="max-w-xl">
            <span className="text-xs font-mono font-bold text-brand-green tracking-widest uppercase">
              EXPERIENCIA Y CONFIANZA
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">
              ¿Por qué confiar tu equipo a CM FIX?
            </h2>
            <div className="mt-4 space-y-2.5">
              <div className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-300">
                <CheckCircle2 className="w-4 h-4 text-brand-green shrink-0 mt-0.5" />
                <span><strong>Presupuestos transparentes:</strong> Sin sorpresas ni costes ocultos antes de reparar.</span>
              </div>
              <div className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-300">
                <CheckCircle2 className="w-4 h-4 text-brand-green shrink-0 mt-0.5" />
                <span><strong>Seguimiento online:</strong> Conoce en todo momento en qué fase está tu reparación con tu código CMF.</span>
              </div>
              <div className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-300">
                <CheckCircle2 className="w-4 h-4 text-brand-green shrink-0 mt-0.5" />
                <span><strong>Seguridad de tus datos:</strong> Tratamos tu información con total confidencialidad bajo RGPD.</span>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            <Link
              to="/presupuesto"
              className="px-6 py-3.5 rounded-xl bg-brand-green hover:bg-brand-green-neon text-black font-extrabold text-sm flex items-center justify-center gap-2 shadow-neon transition-all"
            >
              <Calculator className="w-4 h-4" />
              <span>Calcular Presupuesto Online</span>
            </Link>
            <Link
              to="/contacto"
              className="px-6 py-3.5 rounded-xl bg-brand-surface border border-brand-border hover:border-brand-green/50 text-white font-bold text-sm flex items-center justify-center gap-2 transition-all"
            >
              <span>Dónde Estamos</span>
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
};
