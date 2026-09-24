import React, { useState } from 'react';
import { 
  X, 
  Check, 
  AlertTriangle, 
  HelpCircle, 
  Activity, 
  Smartphone, 
  Battery, 
  Camera, 
  Volume2, 
  Wifi, 
  Cpu,
  Plus
} from 'lucide-react';
import { Repair, DiagnosticItem } from '../types';

interface DiagnosticEngineModalProps {
  isOpen: boolean;
  onClose: () => void;
  repair: Repair;
  onSave: (diagnostics: DiagnosticItem[]) => void;
}

const DEFAULT_DIAGNOSTIC_ITEMS: DiagnosticItem[] = [
  // Pantalla & Táctil
  { id: 'diag-touch', category: 'Pantalla & Táctil', label: 'Panel táctil y respuesta multitoque', status: 'UNTESTED' },
  { id: 'diag-screen', category: 'Pantalla & Táctil', label: 'Panel LCD/OLED (sin manchas ni píxeles muertos)', status: 'UNTESTED' },
  { id: 'diag-truetone', category: 'Pantalla & Táctil', label: 'Sensor de proximidad y True Tone', status: 'UNTESTED' },

  // Batería & Alimentación
  { id: 'diag-bat-health', category: 'Batería & Carga', label: 'Salud y ciclos de batería', status: 'UNTESTED' },
  { id: 'diag-port', category: 'Batería & Carga', label: 'Puerto de carga (amperaje estable)', status: 'UNTESTED' },
  { id: 'diag-wireless', category: 'Batería & Carga', label: 'Carga inalámbrica (si aplica)', status: 'UNTESTED' },

  // Cámaras & Sensores
  { id: 'diag-cam-front', category: 'Cámaras & Sensores', label: 'Cámara frontal y Face ID / Huella', status: 'UNTESTED' },
  { id: 'diag-cam-back', category: 'Cámaras & Sensores', label: 'Cámara trasera y enfoque óptico', status: 'UNTESTED' },
  { id: 'diag-flash', category: 'Cámaras & Sensores', label: 'Flash LED y linterna', status: 'UNTESTED' },

  // Audio & Micrófonos
  { id: 'diag-speaker', category: 'Audio & Micrófonos', label: 'Altavoz multimedia principal', status: 'UNTESTED' },
  { id: 'diag-earpiece', category: 'Audio & Micrófonos', label: 'Auricular superior de llamadas', status: 'UNTESTED' },
  { id: 'diag-mic', category: 'Audio & Micrófonos', label: 'Micrófono principal y cancelación de ruido', status: 'UNTESTED' },

  // Conectividad & Placa
  { id: 'diag-wifi', category: 'Conectividad & Placa', label: 'Antenas Wi-Fi y Bluetooth', status: 'UNTESTED' },
  { id: 'diag-sim', category: 'Conectividad & Placa', label: 'Lector SIM y cobertura móvil 4G/5G', status: 'UNTESTED' },
  { id: 'diag-buttons', category: 'Conectividad & Placa', label: 'Botones físicos (Encendido, Volumen, Mute)', status: 'UNTESTED' },
  { id: 'diag-motherboard', category: 'Conectividad & Placa', label: 'Placa base (ausencia de sobrecalentamiento / cortocircuito)', status: 'UNTESTED' }
];

export const DiagnosticEngineModal: React.FC<DiagnosticEngineModalProps> = ({
  isOpen,
  onClose,
  repair,
  onSave
}) => {
  const [items, setItems] = useState<DiagnosticItem[]>(() => {
    if (repair.diagnostic_checklist && repair.diagnostic_checklist.length > 0) {
      return repair.diagnostic_checklist;
    }
    return DEFAULT_DIAGNOSTIC_ITEMS;
  });

  const [activeCategory, setActiveCategory] = useState<string>('ALL');

  if (!isOpen) return null;

  const categories = ['ALL', ...Array.from(new Set(items.map(i => i.category)))];

  const setItemStatus = (id: string, status: 'OK' | 'FAIL' | 'UNTESTED') => {
    setItems(prev => prev.map(item => item.id === id ? { ...item, status } : item));
  };

  const setItemNotes = (id: string, notes: string) => {
    setItems(prev => prev.map(item => item.id === id ? { ...item, notes } : item));
  };

  const markAllOk = () => {
    setItems(prev => prev.map(item => ({ ...item, status: 'OK' })));
  };

  const handleSave = () => {
    onSave(items);
    onClose();
  };

  const okCount = items.filter(i => i.status === 'OK').length;
  const failCount = items.filter(i => i.status === 'FAIL').length;
  const untestedCount = items.filter(i => i.status === 'UNTESTED').length;

  const filteredItems = activeCategory === 'ALL'
    ? items
    : items.filter(i => i.category === activeCategory);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-brand-carbon border border-brand-green/60 rounded-2xl w-full max-w-3xl shadow-neon overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-brand-border bg-brand-surface/60 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-brand-green/20 text-brand-green border border-brand-green/40 flex items-center justify-center">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-white text-base">Motor de Diagnóstico Estructurado</h3>
                <span className="font-mono text-xs px-2 py-0.5 rounded bg-brand-dark text-brand-green border border-brand-green/30">
                  {repair.repair_number}
                </span>
              </div>
              <p className="text-xs text-slate-400">
                {repair.device_brand} {repair.device_model} · {repair.customer?.name}
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

        {/* Diagnostic Score KPI bar */}
        <div className="px-5 py-3 border-b border-brand-border/60 bg-brand-dark flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5 text-emerald-400 font-semibold">
              <Check className="w-4 h-4 stroke-[3]" />
              <strong>{okCount}</strong> Pasaron
            </span>
            <span className="flex items-center gap-1.5 text-red-400 font-semibold">
              <AlertTriangle className="w-4 h-4" />
              <strong>{failCount}</strong> Fallos
            </span>
            <span className="flex items-center gap-1.5 text-slate-400">
              <HelpCircle className="w-4 h-4" />
              <strong>{untestedCount}</strong> Sin probar
            </span>
          </div>

          <button
            type="button"
            onClick={markAllOk}
            className="px-3 py-1 rounded-lg bg-brand-surface hover:bg-brand-elevated text-brand-green border border-brand-green/40 text-[11px] font-bold transition-all"
          >
            Marcar todo OK
          </button>
        </div>

        {/* Categories Tab Selector */}
        <div className="px-5 py-2.5 bg-brand-surface/30 border-b border-brand-border/40 flex gap-2 overflow-x-auto no-scrollbar">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                activeCategory === cat
                  ? 'bg-brand-green text-black font-bold shadow-neon-sm'
                  : 'bg-brand-dark/80 text-slate-400 hover:text-white border border-brand-border'
              }`}
            >
              {cat === 'ALL' ? 'Todas las pruebas' : cat}
            </button>
          ))}
        </div>

        {/* Test Items List */}
        <div className="p-5 flex-1 overflow-y-auto space-y-3">
          {filteredItems.map(item => (
            <div
              key={item.id}
              className={`p-3.5 rounded-xl border transition-all ${
                item.status === 'OK'
                  ? 'bg-emerald-950/20 border-emerald-500/30'
                  : item.status === 'FAIL'
                  ? 'bg-red-950/20 border-red-500/40'
                  : 'bg-brand-surface/40 border-brand-border'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex-1">
                  <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider block">
                    {item.category}
                  </span>
                  <span className="text-sm font-semibold text-white">
                    {item.label}
                  </span>
                </div>

                {/* 3 Status Toggle Buttons */}
                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    type="button"
                    onClick={() => setItemStatus(item.id, 'OK')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 transition-all ${
                      item.status === 'OK'
                        ? 'bg-emerald-500 text-black shadow-neon-sm'
                        : 'bg-brand-dark border border-brand-border text-slate-400 hover:text-emerald-400'
                    }`}
                  >
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                    <span>OK</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setItemStatus(item.id, 'FAIL')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 transition-all ${
                      item.status === 'FAIL'
                        ? 'bg-red-500 text-white shadow-sm'
                        : 'bg-brand-dark border border-brand-border text-slate-400 hover:text-red-400'
                    }`}
                  >
                    <AlertTriangle className="w-3.5 h-3.5" />
                    <span>FALLO</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setItemStatus(item.id, 'UNTESTED')}
                    className={`px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                      item.status === 'UNTESTED'
                        ? 'bg-slate-700 text-white'
                        : 'bg-brand-dark border border-brand-border text-slate-500 hover:text-slate-300'
                    }`}
                  >
                    N/A
                  </button>
                </div>
              </div>

              {/* Optional note input for this item */}
              {item.status === 'FAIL' && (
                <div className="mt-2.5 pt-2 border-t border-red-500/20">
                  <input
                    type="text"
                    placeholder="Detalla el fallo técnico detectado..."
                    value={item.notes || ''}
                    onChange={(e) => setItemNotes(item.id, e.target.value)}
                    className="w-full px-3 py-1.5 rounded-lg bg-brand-dark/80 border border-red-500/40 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-red-400"
                  />
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-brand-border bg-brand-surface/40 flex items-center justify-between gap-3">
          <p className="text-xs text-slate-400 hidden sm:block">
            Este informe se guardará en la ficha técnica y en el registro de auditoría.
          </p>

          <div className="flex items-center gap-2 ml-auto">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-slate-400 hover:text-white text-xs font-semibold"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="px-6 py-2.5 rounded-xl bg-brand-green hover:bg-brand-green-neon text-black font-extrabold text-xs flex items-center gap-1.5 shadow-neon transition-all"
            >
              <Check className="w-4 h-4 stroke-[3]" />
              <span>Guardar Diagnóstico</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
