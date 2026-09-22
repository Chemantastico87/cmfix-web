import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  FileText, 
  CheckCircle, 
  XCircle, 
  Download, 
  Printer, 
  Clock, 
  ShieldCheck, 
  AlertTriangle, 
  ArrowLeft,
  Smartphone,
  Phone,
  Mail,
  Calendar
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Quote, CompanySettings } from '../types';
import { dbService } from '../services/db';
import { generateQuotePDF } from '../utils/pdfGenerator';

export const DigitalQuotePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [quote, setQuote] = useState<Quote | null>(null);
  const [settings, setSettings] = useState<CompanySettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [acceptanceNotice, setAcceptanceNotice] = useState(false);

  useEffect(() => {
    const fetchQuote = async () => {
      if (!id) return;
      try {
        const [q, s] = await Promise.all([
          dbService.getQuoteById(id),
          dbService.getCompanySettings()
        ]);
        setQuote(q);
        setSettings(s);
      } catch (err) {
        console.error('Error loading quote:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchQuote();
  }, [id]);

  const handleAccept = async () => {
    if (!quote) return;
    setActionLoading(true);
    try {
      const updated = await dbService.updateQuoteStatus(quote.id, 'ACEPTADO');
      if (updated) {
        setQuote(updated);
        setAcceptanceNotice(true);
        try {
          confetti({
            particleCount: 120,
            spread: 80,
            origin: { y: 0.5 },
            colors: ['#22c55e', '#38ef7d', '#ffffff']
          });
        } catch {}
      }
    } catch (err) {
      console.error('Error accepting quote:', err);
      alert('Hubo un error al aceptar el presupuesto.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    if (!quote) return;
    if (!window.confirm('¿Estás seguro de que deseas rechazar este presupuesto? Podrás volver a solicitar uno nuevo cuando quieras.')) {
      return;
    }
    setActionLoading(true);
    try {
      const updated = await dbService.updateQuoteStatus(quote.id, 'RECHAZADO');
      if (updated) {
        setQuote(updated);
      }
    } catch (err) {
      console.error('Error rejecting quote:', err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleDownloadPDF = async () => {
    if (!quote || !settings) return;
    await generateQuotePDF(quote, settings);
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center text-brand-green font-mono text-sm">
        <div className="animate-spin w-8 h-8 border-2 border-brand-green border-t-transparent rounded-full mr-3" />
        <span>Cargando presupuesto digital...</span>
      </div>
    );
  }

  if (!quote) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4">
        <AlertTriangle className="w-12 h-12 text-amber-400 mb-3" />
        <h2 className="text-xl font-bold text-white">Presupuesto no encontrado</h2>
        <p className="text-sm text-slate-400 mt-1 max-w-sm">
          No se ha podido localizar ningún presupuesto con el identificador indicado ({id}).
        </p>
        <Link
          to="/presupuesto"
          className="mt-6 px-5 py-2.5 rounded-xl bg-brand-green text-black font-bold text-xs"
        >
          Calcular nuevo presupuesto
        </Link>
      </div>
    );
  }

  const statusColors: Record<string, string> = {
    PENDIENTE: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
    ENVIADO: 'bg-blue-500/20 text-blue-300 border-blue-500/40',
    ACEPTADO: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 shadow-neon-sm',
    RECHAZADO: 'bg-red-500/20 text-red-300 border-red-500/40',
    CADUCADO: 'bg-slate-500/20 text-slate-400 border-slate-500/40'
  };

  return (
    <div className="min-h-screen py-10 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
      
      {/* Top back navigation and quick print bar */}
      <div className="flex items-center justify-between mb-6 no-print">
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Volver al inicio</span>
        </Link>

        <div className="flex items-center gap-2">
          <button
            onClick={handlePrint}
            className="px-3 py-1.5 rounded-lg bg-brand-surface border border-brand-border text-slate-300 hover:text-white text-xs font-medium flex items-center gap-1.5 transition-colors"
            title="Imprimir documento"
          >
            <Printer className="w-3.5 h-3.5 text-brand-green" />
            <span className="hidden sm:inline">Imprimir</span>
          </button>

          <button
            onClick={handleDownloadPDF}
            className="px-3.5 py-1.5 rounded-lg bg-brand-green/20 hover:bg-brand-green text-brand-green hover:text-black border border-brand-green/40 text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Descargar PDF</span>
          </button>
        </div>
      </div>

      {/* Acceptance Notification Alert Banner */}
      {acceptanceNotice && (
        <div className="mb-6 p-4 rounded-xl bg-emerald-950/80 border border-emerald-500/60 shadow-neon flex items-start gap-3 animate-fadeIn">
          <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
          <div>
            <h4 className="text-sm font-bold text-emerald-200">Presupuesto aceptado correctamente.</h4>
            <p className="text-xs text-emerald-300/80 mt-0.5">
              Hemos asignado tu orden a nuestros técnicos en taller. Puedes seguir el avance en tiempo real desde la sección de seguimiento con tu código <strong>{quote.quote_number}</strong>.
            </p>
          </div>
        </div>
      )}

      {/* Main Digital Quote Document Card */}
      <div className="bg-brand-carbon border border-brand-border rounded-2xl shadow-card overflow-hidden print-card">
        
        {/* Header with CM FIX branding */}
        <div className="bg-brand-surface p-6 sm:p-8 border-b border-brand-border/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <img 
              src="/cmfix-logo.png" 
              alt="CM FIX" 
              className="h-12 w-auto object-contain filter drop-shadow-[0_0_10px_rgba(34,197,94,0.3)]" 
            />
            <div>
              <h2 className="text-lg font-black text-white">CM FIX</h2>
              <span className="text-xs text-brand-green font-mono">SERVICIOS TECNOLÓGICOS</span>
            </div>
          </div>

          <div className="text-left sm:text-right">
            <span className="text-xs text-slate-400 block font-medium">Nº DE PRESUPUESTO</span>
            <span className="font-mono text-xl sm:text-2xl font-black text-white">{quote.quote_number}</span>
            <div className="mt-1 flex items-center sm:justify-end gap-2">
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${statusColors[quote.status] || 'text-white'}`}>
                {quote.status}
              </span>
            </div>
          </div>
        </div>

        {/* Info Grid (Customer + Company + Dates) */}
        <div className="p-6 sm:p-8 grid grid-cols-1 md:grid-cols-2 gap-6 border-b border-brand-border/60 text-xs">
          
          {/* Customer */}
          <div className="p-4 rounded-xl bg-brand-surface/60 border border-brand-border/60">
            <h4 className="font-bold text-white uppercase tracking-wider text-[11px] mb-2.5 text-brand-green">
              DATOS DEL CLIENTE
            </h4>
            <div className="space-y-1.5 text-slate-300">
              <p className="text-sm font-semibold text-white">{quote.customer?.name || 'Cliente'}</p>
              <p className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-slate-500" />
                <span>{quote.customer?.phone || 'Sin teléfono'}</span>
              </p>
              <p className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-slate-500" />
                <span>{quote.customer?.email || 'Sin email'}</span>
              </p>
              {quote.customer?.address && (
                <p className="text-slate-400 pt-1">{quote.customer.address}</p>
              )}
            </div>
          </div>

          {/* Details & Dates */}
          <div className="p-4 rounded-xl bg-brand-surface/60 border border-brand-border/60">
            <h4 className="font-bold text-white uppercase tracking-wider text-[11px] mb-2.5 text-brand-green">
              DATOS DE LA OPERACIÓN
            </h4>
            <div className="space-y-1.5 text-slate-300">
              <p className="flex items-center justify-between">
                <span className="text-slate-400">Fecha de emisión:</span>
                <span className="font-mono text-white">
                  {new Date(quote.created_at).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                </span>
              </p>
              <p className="flex items-center justify-between">
                <span className="text-slate-400">Válido hasta:</span>
                <span className="font-mono text-white">{quote.valid_until}</span>
              </p>
              <p className="flex items-center justify-between">
                <span className="text-slate-400">Tiempo estimado:</span>
                <span className="font-mono font-bold text-brand-green">{quote.estimated_time}</span>
              </p>
              {quote.accepted_at && (
                <p className="flex items-center justify-between text-emerald-400 pt-1 border-t border-brand-border/40">
                  <span>Aceptado el:</span>
                  <span className="font-mono">
                    {new Date(quote.accepted_at).toLocaleString('es-ES', { dateStyle: 'short', timeStyle: 'short' })}
                  </span>
                </p>
              )}
            </div>
          </div>

        </div>

        {/* Device & Diagnostics Card */}
        <div className="p-6 sm:p-8 border-b border-brand-border/60">
          <div className="p-4 rounded-xl bg-brand-surface/40 border border-brand-border flex items-start gap-4">
            <div className="w-10 h-10 rounded-lg bg-brand-dark flex items-center justify-center text-brand-green shrink-0">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[11px] font-mono text-brand-green uppercase font-bold tracking-wider">
                {quote.device_category}
              </span>
              <h3 className="text-base font-bold text-white">
                {quote.device_brand} {quote.device_model}
              </h3>
              <p className="text-xs text-slate-300 mt-1">
                <strong>Reparación propuesta:</strong> {quote.repair_type}
              </p>
              <p className="text-xs text-slate-400 mt-0.5">
                <strong>Descripción del problema:</strong> {quote.issue_description}
              </p>
            </div>
          </div>
        </div>

        {/* Breakdown Items Table */}
        <div className="p-6 sm:p-8">
          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
            Desglose económico
          </h4>

          <div className="border border-brand-border/80 rounded-xl overflow-hidden mb-6">
            <table className="w-full text-left text-xs">
              <thead className="bg-brand-surface text-slate-300 border-b border-brand-border">
                <tr>
                  <th className="p-3 font-bold">Concepto</th>
                  <th className="p-3 font-bold hidden sm:table-cell">Tipo</th>
                  <th className="p-3 font-bold text-center">Uds.</th>
                  <th className="p-3 font-bold text-right">Precio</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-border/40 text-slate-200">
                {quote.items.map((item, idx) => (
                  <tr key={idx} className="hover:bg-brand-surface/30">
                    <td className="p-3 font-medium text-white">{item.description}</td>
                    <td className="p-3 text-slate-400 hidden sm:table-cell">
                      {item.type === 'PART' ? 'Repuesto / Pieza' : 'Mano de obra'}
                    </td>
                    <td className="p-3 text-center font-mono">{item.quantity}</td>
                    <td className="p-3 text-right font-mono font-bold text-white">{item.price.toFixed(2)} €</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Totals Box */}
          <div className="flex flex-col items-end space-y-2 text-xs">
            <div className="flex justify-between w-64 text-slate-400">
              <span>Base imponible:</span>
              <span className="font-mono text-slate-200 font-semibold">{quote.subtotal.toFixed(2)} €</span>
            </div>
            <div className="flex justify-between w-64 text-slate-400">
              <span>IVA ({quote.vat_rate}%):</span>
              <span className="font-mono text-slate-200 font-semibold">{quote.vat_amount.toFixed(2)} €</span>
            </div>
            <div className="flex justify-between w-64 pt-2 border-t border-brand-border text-base font-extrabold text-white">
              <span className="text-brand-green">TOTAL:</span>
              <span className="font-mono text-xl text-brand-green font-black">{quote.total.toFixed(2)} €</span>
            </div>
          </div>

          {quote.is_orientative && (
            <div className="mt-4 p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 text-xs text-amber-300 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>* Presupuesto orientativo sujeto a verificación técnica física en taller.</span>
            </div>
          )}

          {/* Warranty & Conditions */}
          <div className="mt-6 p-4 rounded-xl bg-brand-surface/40 border border-brand-border text-[11px] text-slate-400 space-y-1">
            <h5 className="font-bold text-slate-300 text-xs flex items-center gap-1.5 mb-1">
              <ShieldCheck className="w-4 h-4 text-brand-green" />
              <span>Garantía y Condiciones del Servicio</span>
            </h5>
            <p>{settings?.warranty_terms || 'Todas nuestras reparaciones disponen de 6 meses de garantía oficial.'}</p>
            <p>La validez de este presupuesto es de {quote.valid_until}. Los precios incluyen IVA desglosado.</p>
          </div>

        </div>

        {/* Client Action Buttons (Accept, Reject, Download) */}
        {quote.status === 'PENDIENTE' && (
          <div className="p-6 bg-brand-surface/80 border-t border-brand-border flex flex-col sm:flex-row items-center justify-between gap-4 no-print">
            <button
              onClick={handleReject}
              disabled={actionLoading}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl border border-red-500/40 text-red-400 hover:bg-red-500/10 text-xs font-bold transition-all flex items-center justify-center gap-1.5"
            >
              <XCircle className="w-4 h-4" />
              <span>Rechazar presupuesto</span>
            </button>

            <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
              <button
                onClick={handleDownloadPDF}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-brand-surface border border-brand-border text-slate-300 hover:text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
              >
                <Download className="w-4 h-4 text-brand-green" />
                <span>Descargar copia PDF</span>
              </button>

              <button
                onClick={handleAccept}
                disabled={actionLoading}
                className="w-full sm:w-auto px-8 py-3 rounded-xl bg-brand-green hover:bg-brand-green-neon text-black font-extrabold text-sm shadow-neon hover:shadow-neon-strong transition-all flex items-center justify-center gap-2 active:scale-95"
              >
                <CheckCircle className="w-4 h-4" />
                <span>ACEPTAR PRESUPUESTO</span>
              </button>
            </div>
          </div>
        )}

        {quote.status === 'ACEPTADO' && (
          <div className="p-6 bg-emerald-950/40 border-t border-emerald-500/40 flex flex-col sm:flex-row items-center justify-between gap-4 no-print">
            <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold">
              <CheckCircle className="w-4 h-4" />
              <span>Presupuesto aceptado correctamente.</span>
            </div>

            <div className="flex items-center gap-3">
              <Link
                to={`/seguimiento`}
                className="px-5 py-2.5 rounded-xl bg-brand-green text-black font-extrabold text-xs shadow-neon transition-all"
              >
                Seguir estado de reparación
              </Link>
              <button
                onClick={handleDownloadPDF}
                className="px-4 py-2.5 rounded-xl bg-brand-surface border border-brand-border text-slate-300 text-xs font-semibold flex items-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Descargar PDF</span>
              </button>
            </div>
          </div>
        )}

      </div>

    </div>
  );
};
