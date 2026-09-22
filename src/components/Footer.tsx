import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Phone, 
  Mail, 
  MapPin, 
  Clock, 
  MessageSquare, 
  ShieldCheck, 
  Cpu, 
  Wrench,
  ArrowRight
} from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-brand-carbon border-t border-brand-border/60 text-slate-400 text-sm mt-auto">
      {/* Top Banner with Badge */}
      <div className="border-b border-brand-border/40 py-8 bg-brand-surface/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <img 
              src="/cmfix-logo.png" 
              alt="CM FIX" 
              className="h-10 w-auto object-contain filter drop-shadow-[0_0_10px_rgba(34,197,94,0.3)]" 
            />
            <div className="hidden sm:block">
              <span className="text-xs font-mono font-bold tracking-widest text-brand-green uppercase">
                REPARA / SOLUCIONA / CONECTA
              </span>
              <p className="text-xs text-slate-400">Servicio técnico especializado en dispositivos de última generación.</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <a
              href="https://wa.me/34624892041?text=Hola%20CM%20FIX,%20necesito%20informaci%C3%B3n%20sobre%20una%20reparaci%C3%B3n"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition-all shadow-sm active:scale-95"
            >
              <MessageSquare className="w-4 h-4" />
              <span>WhatsApp Directo</span>
            </a>
            <a
              href="tel:+34624892041"
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-brand-surface border border-brand-border hover:border-brand-green/60 text-slate-200 font-semibold text-xs transition-all"
            >
              <Phone className="w-4 h-4 text-brand-green" />
              <span>Llamar al Taller</span>
            </a>
          </div>
        </div>
      </div>

      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          
          {/* Column 1: Brand & Bio */}
          <div className="space-y-4">
            <h3 className="text-white font-bold text-base flex items-center gap-2">
              <Cpu className="w-4 h-4 text-brand-green" />
              <span>CM FIX Tecnología</span>
            </h3>
            <p className="text-xs leading-relaxed text-slate-400">
              Especialistas en microelectrónica, reparación de smartphones, ordenadores gaming, portátiles y mantenimiento informático para particulares y empresas.
            </p>
            <div className="flex items-center gap-2 text-xs text-brand-green font-medium">
              <ShieldCheck className="w-4 h-4" />
              <span>6 Meses de Garantía en todas las intervenciones</span>
            </div>
          </div>

          {/* Column 2: Servicios Rápidos */}
          <div className="space-y-3">
            <h4 className="text-white font-semibold text-sm">Servicios Destacados</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link to="/servicios" className="hover:text-brand-green transition-colors flex items-center gap-1.5">
                  <ArrowRight className="w-3 h-3 text-brand-green" />
                  <span>Reparación de Pantallas iPhone y Android</span>
                </Link>
              </li>
              <li>
                <Link to="/servicios" className="hover:text-brand-green transition-colors flex items-center gap-1.5">
                  <ArrowRight className="w-3 h-3 text-brand-green" />
                  <span>Cambio de Batería de Alta Capacidad</span>
                </Link>
              </li>
              <li>
                <Link to="/servicios" className="hover:text-brand-green transition-colors flex items-center gap-1.5">
                  <ArrowRight className="w-3 h-3 text-brand-green" />
                  <span>Limpieza de Portátiles y Pasta Térmica</span>
                </Link>
              </li>
              <li>
                <Link to="/servicios" className="hover:text-brand-green transition-colors flex items-center gap-1.5">
                  <ArrowRight className="w-3 h-3 text-brand-green" />
                  <span>Ampliación a Discos SSD NVMe y RAM</span>
                </Link>
              </li>
              <li>
                <Link to="/servicios" className="hover:text-brand-green transition-colors flex items-center gap-1.5">
                  <ArrowRight className="w-3 h-3 text-brand-green" />
                  <span>Recuperación de Datos y Reparación de Placa</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Enlaces Rápidos */}
          <div className="space-y-3">
            <h4 className="text-white font-semibold text-sm">Plataforma</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link to="/presupuesto" className="hover:text-brand-green transition-colors">
                  Calculadora de Presupuestos
                </Link>
              </li>
              <li>
                <Link to="/seguimiento" className="hover:text-brand-green transition-colors">
                  Seguimiento de Reparación en Vivo
                </Link>
              </li>
              <li>
                <Link to="/contacto" className="hover:text-brand-green transition-colors">
                  Horarios y Localización
                </Link>
              </li>
              <li>
                <Link to="/login" className="hover:text-brand-green transition-colors">
                  Acceso Técnicos CM FIX
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Contacto */}
          <div className="space-y-3">
            <h4 className="text-white font-semibold text-sm">Contacto & Taller</h4>
            <div className="space-y-2.5 text-xs">
              <div className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-brand-green shrink-0 mt-0.5" />
                <span>Calle Tecnología 14, Local 2, 28030 Madrid</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-brand-green shrink-0" />
                <a href="tel:+34624892041" className="hover:text-white">+34 624 89 20 41</a>
              </div>
              <div className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-brand-green shrink-0" />
                <a href="mailto:info@cmfix.es" className="hover:text-white">info@cmfix.es</a>
              </div>
              <div className="flex items-start gap-2.5">
                <Clock className="w-4 h-4 text-brand-green shrink-0 mt-0.5" />
                <span>Lun - Vie: 09:30 - 14:00 | 16:30 - 20:00<br />Sábados: 10:00 - 14:00</span>
              </div>
            </div>
          </div>

        </div>

        {/* Bottom Bar: Legals & Copyright */}
        <div className="mt-10 pt-6 border-t border-brand-border/40 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-4">
          <p>© {new Date().getFullYear()} CM FIX. Todos los derechos reservados. "Tu tecnología en buenas manos".</p>
          <div className="flex items-center space-x-4">
            <Link to="/privacidad" className="hover:text-slate-300">Privacidad</Link>
            <span>•</span>
            <Link to="/cookies" className="hover:text-slate-300">Cookies</Link>
            <span>•</span>
            <Link to="/aviso-legal" className="hover:text-slate-300">Aviso Legal</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};
