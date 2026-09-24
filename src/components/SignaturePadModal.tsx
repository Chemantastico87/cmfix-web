import React, { useRef, useState, useEffect } from 'react';
import { X, Check, RotateCcw, PenTool, ShieldCheck } from 'lucide-react';

interface SignaturePadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (signatureDataUrl: string) => void;
  title?: string;
  documentType?: 'RECEPTION' | 'DELIVERY' | 'QUOTE';
  customerName?: string;
  repairNumber?: string;
}

export const SignaturePadModal: React.FC<SignaturePadModalProps> = ({
  isOpen,
  onClose,
  onSave,
  title = 'Firma Digital del Cliente',
  documentType = 'RECEPTION',
  customerName = 'Cliente',
  repairNumber
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasSignature, setHasSignature] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const rect = canvas.getBoundingClientRect();
        canvas.width = rect.width * 2;
        canvas.height = rect.height * 2;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.scale(2, 2);
          ctx.lineCap = 'round';
          ctx.lineJoin = 'round';
          ctx.strokeStyle = '#22c55e';
          ctx.lineWidth = 2.5;
        }
        setHasSignature(false);
      }, 50);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const getCoordinates = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    if ('touches' in e) {
      const touch = e.touches[0];
      return {
        x: touch.clientX - rect.left,
        y: touch.clientY - rect.top
      };
    }
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    };
  };

  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    const coords = getCoordinates(e);
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.beginPath();
    ctx.moveTo(coords.x, coords.y);
    setIsDrawing(true);
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing) return;
    e.preventDefault();
    const coords = getCoordinates(e);
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.lineTo(coords.x, coords.y);
    ctx.stroke();
    setHasSignature(true);
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const handleClear = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasSignature(false);
  };

  const handleSave = () => {
    const canvas = canvasRef.current;
    if (!canvas || !hasSignature) return;
    const dataUrl = canvas.toDataURL('image/png');
    onSave(dataUrl);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-brand-carbon border border-brand-green/60 rounded-2xl w-full max-w-lg shadow-neon overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-brand-border bg-brand-surface/60">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-brand-green/20 text-brand-green border border-brand-green/40 flex items-center justify-center">
              <PenTool className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-white text-sm">{title}</h3>
              <p className="text-[11px] text-slate-400">
                {customerName} {repairNumber ? `· ${repairNumber}` : ''}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-brand-surface transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-5 flex-1 flex flex-col">
          <p className="text-xs text-slate-300 mb-3">
            Firme en el recuadro usando su dedo en pantalla táctil o el ratón:
          </p>

          <div className="relative border-2 border-dashed border-brand-border hover:border-brand-green/50 rounded-xl bg-brand-dark overflow-hidden flex-1 min-h-[200px] flex items-center justify-center touch-none">
            <canvas
              ref={canvasRef}
              onMouseDown={startDrawing}
              onMouseMove={draw}
              onMouseUp={stopDrawing}
              onMouseLeave={stopDrawing}
              onTouchStart={startDrawing}
              onTouchMove={draw}
              onTouchEnd={stopDrawing}
              className="w-full h-full cursor-crosshair"
            />
            {!hasSignature && (
              <span className="absolute pointer-events-none text-slate-600 text-xs font-mono uppercase tracking-widest select-none">
                Área de firma digital
              </span>
            )}
          </div>

          {/* Legal disclaimer */}
          <div className="mt-3 p-3 rounded-xl bg-brand-surface/40 border border-brand-border/60 flex items-start gap-2">
            <ShieldCheck className="w-4 h-4 text-brand-green shrink-0 mt-0.5" />
            <p className="text-[10px] text-slate-400 leading-tight">
              {documentType === 'RECEPTION'
                ? 'El cliente autoriza la recepción y apertura técnica para diagnóstico del dispositivo. Se exime al taller de pérdida de datos no respaldados previamente.'
                : documentType === 'DELIVERY'
                ? 'El cliente declara haber recibido el dispositivo reparado, comprobado su funcionamiento en mostrador y aceptado la entrega conforme.'
                : 'Aceptación de presupuesto y condiciones generales del servicio técnico.'}
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-brand-border bg-brand-surface/40 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={handleClear}
            className="px-3.5 py-2 rounded-xl border border-brand-border text-slate-300 hover:text-white hover:bg-brand-surface text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Borrar</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-slate-400 hover:text-white text-xs font-semibold transition-colors"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={!hasSignature}
              className="px-5 py-2.5 rounded-xl bg-brand-green hover:bg-brand-green-neon text-black font-extrabold text-xs flex items-center gap-1.5 shadow-neon disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            >
              <Check className="w-4 h-4 stroke-[3]" />
              <span>Guardar Firma</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
