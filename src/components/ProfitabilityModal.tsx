import React from 'react';
import { X, TrendingUp, DollarSign, Package, Wrench, ShieldCheck, PieChart } from 'lucide-react';
import { Repair } from '../types';

interface ProfitabilityModalProps {
  isOpen: boolean;
  onClose: () => void;
  repair: Repair;
}

export const ProfitabilityModal: React.FC<ProfitabilityModalProps> = ({
  isOpen,
  onClose,
  repair
}) => {
  if (!isOpen) return null;

  const salePrice = Number(repair.price_total || 0);
  const partsCost = Number(repair.cost_total || 0);
  const profit = salePrice - partsCost;
  const marginPct = salePrice > 0 ? Math.round((profit / salePrice) * 100) : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-brand-carbon border border-brand-green/60 rounded-2xl w-full max-w-lg shadow-neon overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-brand-border bg-brand-surface/60 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-brand-green/20 text-brand-green border border-brand-green/40 flex items-center justify-center">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-white text-base">Análisis de Rentabilidad y Margen</h3>
                <span className="font-mono text-xs px-2 py-0.5 rounded bg-brand-dark text-brand-green border border-brand-green/30">
                  {repair.repair_number}
                </span>
              </div>
              <p className="text-xs text-slate-400">
                {repair.device_brand} {repair.device_model}
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
        <div className="p-5 space-y-4">
          
          {/* Main KPI Badges */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-4 rounded-xl bg-brand-surface/50 border border-brand-border text-center">
              <span className="text-[11px] text-slate-400 block mb-1">Beneficio Bruto Taller</span>
              <span className={`font-mono text-2xl font-black ${profit >= 0 ? 'text-brand-green' : 'text-red-400'}`}>
                {profit >= 0 ? '+' : ''}{profit.toFixed(2)} €
              </span>
            </div>

            <div className="p-4 rounded-xl bg-brand-surface/50 border border-brand-border text-center">
              <span className="text-[11px] text-slate-400 block mb-1">Margen Comercial</span>
              <span className={`font-mono text-2xl font-black ${
                marginPct >= 50 ? 'text-emerald-400' : marginPct >= 30 ? 'text-amber-400' : 'text-red-400'
              }`}>
                {marginPct}%
              </span>
            </div>
          </div>

          {/* Breakdown List */}
          <div className="p-4 rounded-xl bg-brand-dark border border-brand-border/60 space-y-3 text-xs">
            <h4 className="font-bold text-white uppercase text-[11px] tracking-wider mb-2">
              Desglose Económico
            </h4>

            <div className="flex items-center justify-between pb-2 border-b border-brand-border/40">
              <span className="text-slate-300 flex items-center gap-1.5">
                <DollarSign className="w-3.5 h-3.5 text-brand-green" />
                <span>PVP Cobrado al Cliente (sin IVA):</span>
              </span>
              <strong className="font-mono text-white text-sm">
                {salePrice.toFixed(2)} €
              </strong>
            </div>

            <div className="flex items-center justify-between pb-2 border-b border-brand-border/40">
              <span className="text-slate-300 flex items-center gap-1.5">
                <Package className="w-3.5 h-3.5 text-amber-400" />
                <span>Coste Estimado de Piezas / Repuestos:</span>
              </span>
              <span className="font-mono text-red-400 font-semibold">
                -{partsCost.toFixed(2)} €
              </span>
            </div>

            <div className="flex items-center justify-between pt-1">
              <span className="text-slate-200 font-bold flex items-center gap-1.5">
                <TrendingUp className="w-3.5 h-3.5 text-brand-green" />
                <span>Rendimiento neto de mano de obra y taller:</span>
              </span>
              <span className="font-mono text-brand-green font-black text-base">
                {profit.toFixed(2)} €
              </span>
            </div>
          </div>

          {/* Quality Assurance Note */}
          <div className="p-3 rounded-xl bg-brand-surface/30 border border-brand-border/50 flex items-center gap-2 text-xs text-slate-400">
            <ShieldCheck className="w-4 h-4 text-brand-green shrink-0" />
            <span>Márgenes optimizados para garantizar viabilidad y cobertura de garantía técnica oficial.</span>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-brand-border bg-brand-surface/40 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-brand-green hover:bg-brand-green-neon text-black font-extrabold text-xs shadow-neon transition-all"
          >
            Entendido
          </button>
        </div>
      </div>
    </div>
  );
};
