import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  Search, 
  CheckCircle2, 
  Circle, 
  Clock, 
  Wrench, 
  Smartphone, 
  AlertCircle, 
  MessageSquare, 
  Phone, 
  QrCode,
  ShieldCheck,
  Calendar,
  Check
} from 'lucide-react';
import QRCode from 'qrcode';
import { Repair, RepairStatus } from '../types';
import { dbService } from '../services/db';

export const TrackingPage: React.FC = () => {
  const { id: urlId } = useParams<{ id: string }>();

  const [repairNumber, setRepairNumber] = useState(urlId || '');
  const [contactQuery, setContactQuery] = useState('');
  const [repair, setRepair] = useState<Repair | null>(null);
  const [foundQuote, setFoundQuote] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);

  // Auto-search if URL param exists
  useEffect(() => {
    if (urlId) {
      setRepairNumber(urlId);
      performSearch(urlId, '');
    }
  }, [urlId]);

  // Generate QR Code for easy phone sharing
  useEffect(() => {
    if (repair) {
      const url = `${window.location.origin}/seguimiento/${repair.repair_number}`;
      QRCode.toDataURL(url, { width: 140, margin: 1, color: { dark: '#22c55e', light: '#0c120e' } })
        .then(setQrDataUrl)
        .catch(console.error);
    } else if (foundQuote) {
      const url = `${window.location.origin}/presupuesto/${foundQuote.id || foundQuote.quote_number}`;
      QRCode.toDataURL(url, { width: 140, margin: 1, color: { dark: '#22c55e', light: '#0c120e' } })
        .then(setQrDataUrl)
        .catch(console.error);
    } else {
      setQrDataUrl(null);
    }
  }, [repair, foundQuote]);

  const performSearch = async (num: string, contact: string) => {
    if (!num.trim()) return;
    setLoading(true);
    setSearched(true);
    setRepair(null);
    setFoundQuote(null);
    try {
      let found: Repair | null = null;
      if (contact.trim()) {
        found = await dbService.getRepairByTracking(num, contact);
      } else {
        found = await dbService.getRepairById(num);
      }

      if (found) {
        setRepair(found);
      } else {
        // If not found in repairs, check quotes!
        const q = await dbService.getQuoteById(num);
        if (q) {
          // If contact verification is provided, match phone or email
          if (contact.trim()) {
            const cleanContact = contact.trim().toLowerCase().replace(/\s+/g, '');
            const phoneMatch = q.customer?.phone ? q.customer.phone.replace(/\s+/g, '').includes(cleanContact) : false;
            const emailMatch = q.customer?.email ? q.customer.email.toLowerCase().includes(cleanContact) : false;
            if (phoneMatch || emailMatch) {
              setFoundQuote(q);
            } else {
              setFoundQuote(null);
            }
          } else {
            setFoundQuote(q);
          }
        }
      }
    } catch (err) {
      console.error('Error searching repair or quote:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    performSearch(repairNumber, contactQuery);
  };

  // Timeline Step calculation
  const timelineSteps = [
    { key: 'RECIBIDO', label: 'Reparación recibida' },
    { key: 'DIAGNÓSTICO', label: 'Diagnóstico realizado' },
    { key: 'APROBADO', label: 'Presupuesto aceptado' },
    { key: 'EN REPARACIÓN', label: 'Reparación en curso' },
    { key: 'REPARADO', label: 'Reparación terminada' },
    { key: 'LISTO PARA RECOGER', label: 'Lista para recoger' }
  ];

  const getStepIndex = (status: RepairStatus) => {
    switch (status) {
      case 'RECIBIDO': return 0;
      case 'DIAGNÓSTICO': return 1;
      case 'PRESUPUESTO':
      case 'ESPERANDO APROBACIÓN': return 1;
      case 'APROBADO': return 2;
      case 'EN REPARACIÓN':
      case 'ESPERANDO PIEZA': return 3;
      case 'REPARADO': return 4;
      case 'LISTO PARA RECOGER':
      case 'ENTREGADO': return 5;
      default: return 0;
    }
  };

  const currentStepIdx = repair ? getStepIndex(repair.status) : 0;

  return (
    <div className="min-h-screen py-10 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
      
      {/* Search Header */}
      <div className="text-center mb-8">
        <span className="text-xs font-mono font-bold text-brand-green uppercase tracking-widest">
          SEGUIMIENTO EN TIEMPO REAL
        </span>
        <h1 className="text-2xl sm:text-4xl font-extrabold text-white mt-1">
          Estado de tu Reparación o Presupuesto
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-2 max-w-md mx-auto">
          Introduce tu número identificador (ej. CMF-2026-00001) para ver el avance técnico o consultar tu presupuesto digital.
        </p>
      </div>

      {/* Search Form Card */}
      <form 
        onSubmit={handleSearchSubmit}
        className="bg-brand-carbon/90 border border-brand-border rounded-2xl p-5 sm:p-6 shadow-card mb-8 backdrop-blur-md"
      >
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
          <div className="sm:col-span-6">
            <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1">
              Número de Reparación o Presupuesto *
            </label>
            <input
              type="text"
              value={repairNumber}
              onChange={(e) => setRepairNumber(e.target.value)}
              placeholder="Ej. CMF-2026-00001"
              required
              className="w-full bg-brand-dark border border-brand-border rounded-xl px-4 py-2.5 text-sm text-white font-mono placeholder-slate-500 focus:outline-none focus:border-brand-green uppercase"
            />
          </div>

          <div className="sm:col-span-6">
            <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1">
              Teléfono o Email (Opcional)
            </label>
            <input
              type="text"
              value={contactQuery}
              onChange={(e) => setContactQuery(e.target.value)}
              placeholder="Ej. 661991060 o tu@email.com"
              className="w-full bg-brand-dark border border-brand-border rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-brand-green"
            />
          </div>

          <div className="sm:col-span-12 flex justify-end mt-2">
            <button
              type="submit"
              disabled={loading || !repairNumber.trim()}
              className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-brand-green hover:bg-brand-green-neon text-black font-extrabold text-sm flex items-center justify-center gap-2 shadow-neon transition-all active:scale-95 disabled:opacity-40"
            >
              {loading ? (
                <span>Buscando en base de datos...</span>
              ) : (
                <>
                  <Search className="w-4 h-4" />
                  <span>Consultar Estado</span>
                </>
              )}
            </button>
          </div>
        </div>
      </form>

      {/* Result Section: NOT FOUND */}
      {searched && !loading && !repair && !foundQuote && (
        <div className="p-8 rounded-2xl bg-brand-surface/40 border border-brand-border text-center">
          <AlertCircle className="w-10 h-10 text-amber-400 mx-auto mb-3" />
          <h3 className="text-base font-bold text-white">No encontramos ninguna orden o presupuesto con ese código</h3>
          <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
            Verifica que el número coincida con tu código (ej. CMF-2026-00001) o contacta directamente con Maury en el taller.
          </p>
          <a
            href="https://wa.me/34661991060?text=Hola%20Maury,%20tengo%20una%20consulta%20sobre%20mi%20c%C3%B3digo%20de%20reparaci%C3%B3n"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 inline-flex items-center gap-1.5 text-xs font-semibold text-brand-green hover:underline"
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Consultar directamente con Maury en WhatsApp (+34 661 99 10 60)</span>
          </a>
        </div>
      )}

      {/* Result Section: FOUND QUOTE */}
      {foundQuote && !repair && (
        <div className="space-y-6 animate-fadeIn">
          <div className="bg-brand-carbon border border-brand-green/60 rounded-2xl p-6 sm:p-8 shadow-neon">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-brand-border/60">
              <div>
                <span className="text-xs font-mono font-bold text-brand-green uppercase tracking-wider">
                  PRESUPUESTO REGISTRADO EN TALLER
                </span>
                <h2 className="text-xl sm:text-2xl font-black text-white font-mono mt-0.5">
                  {foundQuote.quote_number}
                </h2>
                <p className="text-xs text-slate-300 mt-1">
                  Cliente: <strong className="text-white">{foundQuote.customer?.name || 'Cliente CM FIX'}</strong>
                </p>
              </div>

              <div className="flex items-center gap-4">
                {qrDataUrl && (
                  <div className="p-1.5 rounded-lg bg-brand-dark border border-brand-border text-center">
                    <img src={qrDataUrl} alt="QR Presupuesto" className="w-16 h-16 object-contain" />
                    <span className="text-[9px] text-slate-400 block mt-0.5">Escanear móvil</span>
                  </div>
                )}
                <div className="text-right">
                  <span className="text-xs text-slate-400 block">ESTADO</span>
                  <span className={`inline-block mt-1 px-3 py-1 rounded-full text-xs font-bold border ${
                    foundQuote.status === 'ACEPTADO'
                      ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/50'
                      : foundQuote.status === 'RECHAZADO'
                      ? 'bg-red-500/20 text-red-400 border-red-500/50'
                      : 'bg-amber-500/20 text-amber-300 border-amber-500/50'
                  }`}>
                    {foundQuote.status}
                  </span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 py-5 border-b border-brand-border/40 text-xs">
              <div>
                <span className="text-slate-400 block">Dispositivo</span>
                <span className="text-white font-semibold text-sm">
                  {foundQuote.device_brand} {foundQuote.device_model}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block">Reparación Solicitada</span>
                <span className="text-white font-semibold text-sm">
                  {foundQuote.repair_type}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block">Importe Estimado (con IVA)</span>
                <span className="text-brand-green font-bold text-base font-mono">
                  {Number(foundQuote.total || 0).toFixed(2)} €
                </span>
              </div>
            </div>

            <div className="pt-5 flex flex-wrap items-center justify-between gap-4">
              <p className="text-xs text-slate-300">
                Puedes revisar el desglose técnico completo, aceptar el presupuesto o descargar la factura proforma en PDF.
              </p>
              <Link
                to={`/presupuesto/${foundQuote.id || foundQuote.quote_number}`}
                className="px-6 py-3 rounded-xl bg-brand-green hover:bg-brand-green-neon text-black font-extrabold text-xs flex items-center gap-2 shadow-neon transition-all"
              >
                <span>Ver y Gestionar Presupuesto Digital</span>
              </Link>
            </div>
          </div>
        </div>
      )}

      {repair && (
        <div className="space-y-6 animate-fadeIn">
          
          {/* Main Status Header Card */}
          <div className="bg-brand-carbon border border-brand-border rounded-2xl p-6 sm:p-8 shadow-card">
            
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-brand-border/60">
              <div>
                <span className="text-xs font-mono font-bold text-brand-green uppercase tracking-wider">
                  ORDEN DE SERVICIO
                </span>
                <h2 className="text-xl sm:text-2xl font-black text-white font-mono mt-0.5">
                  {repair.repair_number}
                </h2>
                <p className="text-xs text-slate-300 mt-1">
                  Cliente: <strong className="text-white">{repair.customer?.name}</strong>
                </p>
              </div>

              <div className="flex items-center gap-4">
                {qrDataUrl && (
                  <div className="p-1.5 rounded-lg bg-brand-dark border border-brand-border text-center">
                    <img src={qrDataUrl} alt="QR Seguimiento" className="w-16 h-16 object-contain" />
                    <span className="text-[9px] text-slate-400 block mt-0.5">Escanear móvil</span>
                  </div>
                )}
                <div className="text-right">
                  <span className="text-xs text-slate-400 block">ESTADO ACTUAL</span>
                  <span className="inline-block mt-1 px-3 py-1 rounded-full text-xs font-bold bg-brand-green/20 text-brand-green border border-brand-green/50 shadow-neon-sm">
                    {repair.status}
                  </span>
                </div>
              </div>
            </div>

            {/* VISUAL TIMELINE COMPONENT */}
            <div className="py-8">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-6">
                Línea de tiempo de la reparación
              </h3>

              <div className="relative">
                {/* Desktop horizontal timeline */}
                <div className="hidden md:grid grid-cols-6 gap-2 relative">
                  {/* Connecting background line */}
                  <div className="absolute top-4 left-6 right-6 h-0.5 bg-brand-border -z-0" />
                  
                  {/* Active progress bar line */}
                  <div 
                    className="absolute top-4 left-6 h-0.5 bg-brand-green -z-0 transition-all duration-500 shadow-neon-sm"
                    style={{ width: `${(currentStepIdx / (timelineSteps.length - 1)) * 90}%` }}
                  />

                  {timelineSteps.map((stepItem, idx) => {
                    const isCompleted = idx <= currentStepIdx;
                    const isCurrent = idx === currentStepIdx;
                    return (
                      <div key={idx} className="flex flex-col items-center text-center relative z-10">
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                            isCompleted
                              ? 'bg-brand-green text-black shadow-neon-sm'
                              : 'bg-brand-dark border-2 border-brand-border text-slate-500'
                          } ${isCurrent ? 'ring-4 ring-brand-green/30 animate-pulse' : ''}`}
                        >
                          {isCompleted ? <Check className="w-4 h-4 stroke-[3]" /> : idx + 1}
                        </div>
                        <span className={`text-[11px] font-semibold mt-2.5 leading-tight ${isCompleted ? 'text-white' : 'text-slate-500'}`}>
                          {stepItem.label}
                        </span>
                      </div>
                    );
                  })}
                </div>

                {/* Mobile vertical timeline */}
                <div className="md:hidden space-y-4">
                  {timelineSteps.map((stepItem, idx) => {
                    const isCompleted = idx <= currentStepIdx;
                    const isCurrent = idx === currentStepIdx;
                    return (
                      <div key={idx} className="flex items-start gap-3">
                        <div
                          className={`w-6 h-6 rounded-full shrink-0 flex items-center justify-center text-xs font-bold mt-0.5 ${
                            isCompleted
                              ? 'bg-brand-green text-black shadow-neon-sm'
                              : 'bg-brand-dark border border-brand-border text-slate-500'
                          }`}
                        >
                          {isCompleted ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : idx + 1}
                        </div>
                        <div>
                          <p className={`text-xs font-bold ${isCompleted ? 'text-white' : 'text-slate-500'}`}>
                            {stepItem.label}
                          </p>
                          {isCurrent && (
                            <span className="text-[10px] text-brand-green font-mono">Fase en proceso actual</span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

            </div>

            {/* Device & Public Technician Notes */}
            <div className="pt-6 border-t border-brand-border/60 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-4 rounded-xl bg-brand-surface/60 border border-brand-border/60">
                <span className="text-slate-400 block mb-1">Dispositivo asignado:</span>
                <h4 className="font-bold text-white text-sm">
                  {repair.device_brand} {repair.device_model} ({repair.device_category})
                </h4>
                <p className="text-slate-300 mt-1"><strong>Trabajo:</strong> {repair.work_performed || repair.issue_description}</p>
                {repair.estimated_date && (
                  <p className="text-slate-400 mt-1 flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-brand-green" />
                    <span>Fecha estimada: {new Date(repair.estimated_date).toLocaleDateString('es-ES')}</span>
                  </p>
                )}
              </div>

              <div className="p-4 rounded-xl bg-brand-surface/60 border border-brand-border/60">
                <span className="text-slate-400 block mb-1">Notas del técnico en taller:</span>
                <p className="text-slate-200 leading-relaxed font-medium">
                  {repair.notes_public || 'Tu equipo está en proceso de revisión conforme a los estándares de calidad de CM FIX.'}
                </p>
              </div>
            </div>

            {/* Quick Action buttons */}
            <div className="mt-6 pt-4 border-t border-brand-border/60 flex flex-wrap items-center justify-between gap-4">
              <span className="text-xs text-slate-400">
                ¿Tienes alguna consulta urgente sobre tu reparación?
              </span>

              <a
                href={`https://wa.me/34624892041?text=Hola%20CM%20FIX,%20quisiera%20consultar%20mi%20reparaci%C3%B3n%20${repair.repair_number}`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition-all"
              >
                <MessageSquare className="w-4 h-4" />
                <span>Preguntar por WhatsApp</span>
              </a>
            </div>

          </div>

          {/* Status Updates Log */}
          {repair.status_history && repair.status_history.length > 0 && (
            <div className="bg-brand-carbon/60 border border-brand-border rounded-2xl p-6 shadow-card">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">
                Historial de actualizaciones
              </h3>
              <div className="space-y-3">
                {repair.status_history.map((h, i) => (
                  <div key={i} className="flex items-start gap-3 text-xs pb-3 border-b border-brand-border/40 last:border-0 last:pb-0">
                    <div className="w-2 h-2 rounded-full bg-brand-green mt-1.5 shrink-0 shadow-neon-sm" />
                    <div>
                      <span className="font-mono font-bold text-brand-green">{h.status}</span>
                      <span className="text-slate-400 ml-2">
                        {new Date(h.created_at).toLocaleString('es-ES', { dateStyle: 'short', timeStyle: 'short' })}
                      </span>
                      {h.notes && <p className="text-slate-300 mt-0.5">{h.notes}</p>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      )}

    </div>
  );
};
