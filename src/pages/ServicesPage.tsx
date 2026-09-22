import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Smartphone, 
  Laptop, 
  Monitor, 
  Tablet, 
  Wrench, 
  ShieldCheck, 
  HardDrive, 
  Cpu, 
  Check, 
  ArrowRight,
  Calculator,
  Globe,
  Code
} from 'lucide-react';
import { DeviceCategory } from '../types';

export const ServicesPage: React.FC = () => {
  const categories: Array<{
    title: string;
    categoryKey?: DeviceCategory;
    icon: any;
    description: string;
    items: Array<{ name: string; price: string; time: string }>;
  }> = [
    {
      title: 'Reparación de Smartphones',
      categoryKey: 'iPhone',
      icon: Smartphone,
      description: 'Especialistas en Apple iPhone, Samsung Galaxy, Xiaomi y las principales marcas del mercado.',
      items: [
        { name: 'Cambio de pantalla OLED / AMOLED', price: 'Desde 45 €', time: '1-2 horas' },
        { name: 'Sustitución de batería de alta capacidad', price: 'Desde 29 €', time: '45 minutos' },
        { name: 'Conector de carga USB-C / Lightning', price: 'Desde 35 €', time: '1 hora' },
        { name: 'Reparación de cámaras y cristal de lente', price: 'Desde 30 €', time: '1-2 horas' },
        { name: 'Altavoz auricular y micrófono', price: 'Desde 30 €', time: '1 hora' },
        { name: 'Tapa trasera de cristal (Láser)', price: 'Desde 40 €', time: '2 horas' }
      ]
    },
    {
      title: 'Portátiles y Laptops (Windows & Mac)',
      categoryKey: 'Portátil',
      icon: Laptop,
      description: 'Mantenimiento térmico preventivo, optimización de velocidad y sustitución de piezas mecánicas.',
      items: [
        { name: 'Limpieza interna y pasta térmica (Kryonaut)', price: 'Desde 40 €', time: '24 horas' },
        { name: 'Cambio a disco SSD NVMe Ultra Rápido', price: 'Desde 65 €', time: '24 horas' },
        { name: 'Ampliación de memoria RAM DDR4 / DDR5', price: 'Desde 40 €', time: '1-2 horas' },
        { name: 'Sustitución de teclado y touchpad', price: 'Desde 45 €', time: '24-48 horas' },
        { name: 'Reparación de bisagras y carcasa', price: 'Desde 45 €', time: '24-48 horas' },
        { name: 'Cambio de pantalla LED / IPS', price: 'Desde 75 €', time: '24 horas' }
      ]
    },
    {
      title: 'PC Sobremesa y Torres Gaming',
      categoryKey: 'PC',
      icon: Monitor,
      description: 'Montaje de equipos a medida, diagnóstico de cuellos de botella y reparación de componentes.',
      items: [
        { name: 'Montaje completo de PC Gaming por piezas', price: 'Desde 60 €', time: '24-48 horas' },
        { name: 'Diagnóstico de placa base y fuente alimentación', price: 'Desde 25 €', time: '24 horas' },
        { name: 'Sustitución y mantenimiento refrigeración líquida', price: 'Desde 45 €', time: '24 horas' },
        { name: 'Actualización de gráfica (GPU) y procesador', price: 'Desde 35 €', time: '1-2 horas' },
        { name: 'Optimización de BIOS y perfiles XMP / EXPO', price: 'Desde 25 €', time: '1 hora' },
        { name: 'Cable management profesional y airflow', price: 'Desde 35 €', time: '2-4 horas' }
      ]
    },
    {
      title: 'Software, Sistema y Seguridad',
      categoryKey: 'Otro',
      icon: HardDrive,
      description: 'Solución a pantallazos azules, virus persistentes y pérdida de información confidencial.',
      items: [
        { name: 'Instalación limpia de Windows 11 con drivers', price: '40 €', time: 'En el día' },
        { name: 'Eliminación completa de malware y spyware', price: 'Desde 35 €', time: '24 horas' },
        { name: 'Recuperación de datos de discos dañados', price: 'Desde 50 €', time: '24-72 horas' },
        { name: 'Configuración de copias de seguridad en nube', price: 'Desde 30 €', time: '1-2 horas' },
        { name: 'Traspaso de datos móvil antiguo a nuevo', price: 'Desde 25 €', time: '1 hora' },
        { name: 'Reinstalación y puesta a punto macOS', price: '45 €', time: 'En el día' }
      ]
    },
    {
      title: 'Desarrollo Web Profesional y E-commerce',
      categoryKey: 'Página Web',
      icon: Globe,
      description: 'Páginas web modernas, de carga ultra rápida, optimizadas para móviles y posicionamiento SEO en Google.',
      items: [
        { name: 'Landing Page de Captación / One-Page', price: 'Desde 290 €', time: '3-5 días' },
        { name: 'Web Corporativa Profesional para Negocios', price: 'Desde 590 €', time: '7-12 días' },
        { name: 'Tienda Online E-commerce (Stripe / Bizum)', price: 'Desde 990 €', time: '15-20 días' },
        { name: 'Web a Medida + Panel Administrable', price: 'Desde 1.490 €', time: '2-3 semanas' },
        { name: 'Mantenimiento Web Anual + Soporte Continuo', price: 'Desde 180 €/año', time: 'Inmediato' },
        { name: 'Auditoría SEO Técnico y Velocidad Web', price: 'Desde 150 €', time: '48-72 horas' }
      ]
    },
    {
      title: 'Apps Móviles y Software a Medida',
      categoryKey: 'App Móvil',
      icon: Code,
      description: 'Aplicaciones móviles para iOS y Android, portales web interactivos y software de gestión para empresas.',
      items: [
        { name: 'Web App Progresiva Multiplataforma (PWA)', price: 'Desde 790 €', time: '10-15 días' },
        { name: 'App Móvil para iOS y Android (App Store / Play Store)', price: 'Desde 1.850 €', time: '3-4 semanas' },
        { name: 'Software de Gestión / CRM / ERP a Medida', price: 'Desde 1.350 €', time: '2-3 semanas' },
        { name: 'Portal Privado o Área de Clientes Online', price: 'Desde 950 €', time: '10-15 días' },
        { name: 'Integración de Pasarelas, API y Base de Datos', price: 'Desde 390 €', time: '3-5 días' },
        { name: 'Mantenimiento Evolutivo y Soporte de App', price: 'Desde 240 €/trim.', time: 'Continuo' }
      ]
    }
  ];

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto mb-16">
        <span className="text-xs font-mono font-bold text-brand-green uppercase tracking-widest">
          SERVICIOS PROFESIONALES CM FIX
        </span>
        <h1 className="text-3xl sm:text-5xl font-black text-white mt-2">
          Todo lo que tu tecnología necesita, bajo el mismo techo.
        </h1>
        <p className="mt-4 text-slate-300 text-sm sm:text-base leading-relaxed">
          Trabajamos con instrumental de precisión y piezas homologadas. Todas las intervenciones cuentan con 6 meses de garantía oficial por escrito.
        </p>
      </div>

      {/* Grid of categories */}
      <div className="space-y-12">
        {categories.map((cat, idx) => {
          const IconC = cat.icon;
          return (
            <div 
              key={idx}
              className="bg-brand-carbon/80 border border-brand-border rounded-2xl p-6 sm:p-8 shadow-card backdrop-blur-sm"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-6 border-b border-brand-border/60">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-brand-surface border border-brand-green/30 flex items-center justify-center text-brand-green shadow-neon-sm">
                    <IconC className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-xl sm:text-2xl font-bold text-white">{cat.title}</h2>
                    <p className="text-xs text-slate-400 mt-0.5">{cat.description}</p>
                  </div>
                </div>

                <Link
                  to="/presupuesto"
                  state={{ category: cat.categoryKey }}
                  className="px-4 py-2 rounded-lg bg-brand-green/15 text-brand-green border border-brand-green/30 hover:bg-brand-green hover:text-black text-xs font-bold transition-all flex items-center gap-1.5 self-start sm:self-auto"
                >
                  <Calculator className="w-3.5 h-3.5" />
                  <span>Presupuestar este tipo</span>
                </Link>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {cat.items.map((item, iIdx) => (
                  <div 
                    key={iIdx}
                    className="p-4 rounded-xl bg-brand-surface/70 border border-brand-border/60 hover:border-brand-green/40 transition-all flex flex-col justify-between"
                  >
                    <div>
                      <h3 className="font-semibold text-white text-sm">{item.name}</h3>
                      <div className="flex items-center gap-2 mt-2 text-xs text-slate-400">
                        <span className="text-brand-green font-mono font-semibold">{item.time}</span>
                      </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-brand-border/40 flex items-center justify-between">
                      <span className="text-xs text-slate-400">Precio estimado:</span>
                      <span className="text-sm font-bold text-brand-green font-mono">{item.price}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* CTA Box */}
      <div className="mt-16 p-8 rounded-2xl bg-gradient-to-r from-brand-surface to-brand-carbon border border-brand-green/40 text-center relative overflow-hidden shadow-neon">
        <div className="relative z-10 max-w-2xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-black text-white">¿No encuentras tu avería en la lista?</h2>
          <p className="text-xs sm:text-sm text-slate-300 mt-2">
            Hacemos microelectrónica avanzada, reparación de pistas y componentes específicos. Cuéntanos tu caso y realizaremos un diagnóstico.
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-4">
            <Link
              to="/presupuesto"
              className="px-6 py-3 rounded-xl bg-brand-green text-black font-extrabold text-sm shadow-neon hover:bg-brand-green-neon transition-all"
            >
              Pedir Presupuesto Personalizado
            </Link>
            <a
              href="https://wa.me/34624892041?text=Hola%20CM%20FIX,%20tengo%20una%20aver%C3%ADa%20que%20no%20aparece%20en%20la%20web"
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-3 rounded-xl bg-brand-dark border border-brand-border text-white text-sm font-bold hover:border-brand-green/60 transition-all"
            >
              Consultar por WhatsApp
            </a>
          </div>
        </div>
      </div>

    </div>
  );
};
