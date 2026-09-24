import React, { useState } from 'react';
import { 
  X, 
  Check, 
  Camera, 
  Upload, 
  Trash2, 
  PenTool, 
  Battery, 
  KeyRound, 
  Eye, 
  EyeOff, 
  Smartphone, 
  History,
  ShieldAlert,
  Paperclip,
  CheckSquare
} from 'lucide-react';
import { Repair, DeviceCheckinData } from '../types';
import { SignaturePadModal } from './SignaturePadModal';

interface DeviceCheckinModalProps {
  isOpen: boolean;
  onClose: () => void;
  repair: Repair;
  onSave: (checkinData: DeviceCheckinData) => void;
  onOpenHistory?: (query: string) => void;
}

const COMMON_ACCESSORIES = [
  'Cable',
  'Cargador de pared',
  'Funda / Carcasa',
  'Tarjeta SIM',
  'Bandeja SIM',
  'Protector templado',
  'Caja original'
];

export const DeviceCheckinModal: React.FC<DeviceCheckinModalProps> = ({
  isOpen,
  onClose,
  repair,
  onSave,
  onOpenHistory
}) => {
  const existing = repair.checkin_data || {};

  const [serialImei, setSerialImei] = useState(existing.serial_imei || repair.serial_imei || '');
  const [passcode, setPasscode] = useState(existing.passcode || '');
  const [showPasscode, setShowPasscode] = useState(false);
  const [batteryLevel, setBatteryLevel] = useState<number>(existing.battery_level ?? 50);
  const [accessories, setAccessories] = useState<string[]>(existing.accessories || []);
  
  const [screenStatus, setScreenStatus] = useState<'INTACTO' | 'LEVE' | 'PROFUNDO' | 'ROTO'>(
    existing.cosmetic_condition?.screen_status || 'INTACTO'
  );
  const [backCover, setBackCover] = useState<'INTACTO' | 'RAYADO' | 'ROTO'>(
    existing.cosmetic_condition?.back_cover || 'INTACTO'
  );
  const [chassisDents, setChassisDents] = useState(existing.cosmetic_condition?.chassis_dents || false);
  const [liquidDamage, setLiquidDamage] = useState(existing.cosmetic_condition?.liquid_damage || false);
  const [cosmeticNotes, setCosmeticNotes] = useState(existing.cosmetic_condition?.notes || '');

  const [photos, setPhotos] = useState<string[]>(existing.intake_photos || repair.photos || []);
  const [signature, setSignature] = useState<string | undefined>(existing.client_signature);
  const [signatureDate, setSignatureDate] = useState<string | undefined>(existing.client_signature_date);
  const [isSignModalOpen, setIsSignModalOpen] = useState(false);

  if (!isOpen) return null;

  const toggleAccessory = (acc: string) => {
    setAccessories(prev => 
      prev.includes(acc) ? prev.filter(a => a !== acc) : [...prev, acc]
    );
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    Array.from(files).forEach(file => {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setPhotos(prev => [...prev, event.target!.result as string]);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const removePhoto = (idx: number) => {
    setPhotos(prev => prev.filter((_, i) => i !== idx));
  };

  const handleSignatureSaved = (dataUrl: string) => {
    setSignature(dataUrl);
    setSignatureDate(new Date().toLocaleString('es-ES'));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const data: DeviceCheckinData = {
      serial_imei: serialImei,
      passcode,
      battery_level: batteryLevel,
      accessories,
      cosmetic_condition: {
        screen_status: screenStatus,
        back_cover: backCover,
        chassis_dents: chassisDents,
        liquid_damage: liquidDamage,
        notes: cosmeticNotes
      },
      intake_photos: photos,
      client_signature: signature,
      client_signature_date: signatureDate
    };
    onSave(data);
    onClose();
  };

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
        <div className="bg-brand-carbon border border-brand-green/60 rounded-2xl w-full max-w-3xl shadow-neon overflow-hidden flex flex-col max-h-[92vh]">
          {/* Header */}
          <div className="p-4 sm:p-5 border-b border-brand-border bg-brand-surface/60 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-brand-green/20 text-brand-green border border-brand-green/40 flex items-center justify-center">
                <Smartphone className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-white text-base">Check-in de Entrada y Recepción Técnica</h3>
                  <span className="font-mono text-xs px-2 py-0.5 rounded bg-brand-dark text-brand-green border border-brand-green/30">
                    {repair.repair_number}
                  </span>
                </div>
                <p className="text-xs text-slate-400">
                  {repair.device_brand} {repair.device_model} · Cliente: <strong className="text-white">{repair.customer?.name}</strong>
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

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-5 flex-1 overflow-y-auto space-y-6">
            
            {/* 1. Identificación y Seguridad */}
            <div className="p-4 rounded-xl bg-brand-surface/40 border border-brand-border space-y-4">
              <h4 className="text-xs font-bold text-brand-green uppercase tracking-wider flex items-center gap-1.5">
                <KeyRound className="w-3.5 h-3.5" />
                <span>1. Identificación, Bloqueo y Batería</span>
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* IMEI / Serie */}
                <div>
                  <label className="text-[11px] font-semibold text-slate-400 block mb-1">
                    IMEI / Número de Serie
                  </label>
                  <div className="flex gap-1.5">
                    <input
                      type="text"
                      value={serialImei}
                      onChange={(e) => setSerialImei(e.target.value)}
                      placeholder="ej. 352948102938472"
                      className="w-full px-3 py-2 rounded-xl bg-brand-dark border border-brand-border text-white text-xs font-mono focus:border-brand-green focus:outline-none"
                    />
                    {serialImei && onOpenHistory && (
                      <button
                        type="button"
                        onClick={() => onOpenHistory(serialImei)}
                        title="Ver historial previo del dispositivo"
                        className="p-2 rounded-xl bg-brand-surface hover:bg-brand-elevated text-brand-green border border-brand-green/40 transition-colors"
                      >
                        <History className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>

                {/* PIN / Clave */}
                <div>
                  <label className="text-[11px] font-semibold text-slate-400 block mb-1">
                    Código PIN / Patrón de Desbloqueo
                  </label>
                  <div className="relative">
                    <input
                      type={showPasscode ? 'text' : 'password'}
                      value={passcode}
                      onChange={(e) => setPasscode(e.target.value)}
                      placeholder="Para pruebas técnicas..."
                      className="w-full px-3 py-2 pr-9 rounded-xl bg-brand-dark border border-brand-border text-white text-xs font-mono focus:border-brand-green focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPasscode(!showPasscode)}
                      className="absolute right-2.5 top-2.5 text-slate-500 hover:text-white"
                    >
                      {showPasscode ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                {/* Batería */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-[11px] font-semibold text-slate-400 flex items-center gap-1">
                      <Battery className="w-3.5 h-3.5 text-brand-green" />
                      <span>Batería al ingresar</span>
                    </label>
                    <span className="text-xs font-bold font-mono text-white">{batteryLevel}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={batteryLevel}
                    onChange={(e) => setBatteryLevel(Number(e.target.value))}
                    className="w-full accent-brand-green cursor-pointer"
                  />
                </div>
              </div>
            </div>

            {/* 2. Accesorios Entregados */}
            <div className="p-4 rounded-xl bg-brand-surface/40 border border-brand-border space-y-3">
              <h4 className="text-xs font-bold text-brand-green uppercase tracking-wider flex items-center gap-1.5">
                <Paperclip className="w-3.5 h-3.5" />
                <span>2. Accesorios Dejados en Custodia</span>
              </h4>

              <div className="flex flex-wrap gap-2">
                {COMMON_ACCESSORIES.map(acc => {
                  const isSelected = accessories.includes(acc);
                  return (
                    <button
                      type="button"
                      key={acc}
                      onClick={() => toggleAccessory(acc)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-medium border flex items-center gap-1.5 transition-all ${
                        isSelected
                          ? 'bg-brand-green/20 text-brand-green border-brand-green/60 shadow-neon-sm'
                          : 'bg-brand-dark/70 text-slate-400 border-brand-border hover:border-slate-500'
                      }`}
                    >
                      <CheckSquare className={`w-3.5 h-3.5 ${isSelected ? 'text-brand-green' : 'text-slate-600'}`} />
                      <span>{acc}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 3. Estado Cosmético y Daños Previos */}
            <div className="p-4 rounded-xl bg-brand-surface/40 border border-brand-border space-y-4">
              <h4 className="text-xs font-bold text-brand-green uppercase tracking-wider flex items-center gap-1.5">
                <ShieldAlert className="w-3.5 h-3.5" />
                <span>3. Inspección Cosmética Previa (Protección de Garantía)</span>
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Pantalla */}
                <div>
                  <label className="text-[11px] font-semibold text-slate-400 block mb-1">
                    Estado Cristal / Pantalla
                  </label>
                  <select
                    value={screenStatus}
                    onChange={(e: any) => setScreenStatus(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-brand-dark border border-brand-border text-xs text-white focus:border-brand-green focus:outline-none"
                  >
                    <option value="INTACTO">Intacto (Sin rayones visibles)</option>
                    <option value="LEVE">Micro-rayaduras superficiales</option>
                    <option value="PROFUNDO">Rayones profundos</option>
                    <option value="ROTO">Fisura o cristal roto</option>
                  </select>
                </div>

                {/* Tapa trasera */}
                <div>
                  <label className="text-[11px] font-semibold text-slate-400 block mb-1">
                    Estado Tapa Trasera
                  </label>
                  <select
                    value={backCover}
                    onChange={(e: any) => setBackCover(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-brand-dark border border-brand-border text-xs text-white focus:border-brand-green focus:outline-none"
                  >
                    <option value="INTACTO">Intacto</option>
                    <option value="RAYADO">Marcas de uso / Rayada</option>
                    <option value="ROTO">Cristal trasero o tapa rota</option>
                  </select>
                </div>
              </div>

              {/* Toggles */}
              <div className="flex flex-wrap gap-4 pt-1">
                <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-300">
                  <input
                    type="checkbox"
                    checked={chassisDents}
                    onChange={(e) => setChassisDents(e.target.checked)}
                    className="rounded bg-brand-dark border-brand-border text-brand-green focus:ring-0 w-4 h-4 cursor-pointer"
                  />
                  <span>Chasis con golpes en esquinas o doblado</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer text-xs text-red-300">
                  <input
                    type="checkbox"
                    checked={liquidDamage}
                    onChange={(e) => setLiquidDamage(e.target.checked)}
                    className="rounded bg-brand-dark border-red-500/50 text-red-500 focus:ring-0 w-4 h-4 cursor-pointer"
                  />
                  <span>Indicador de humedad / mojado activo</span>
                </label>
              </div>

              {/* Observaciones cosméticas */}
              <input
                type="text"
                value={cosmeticNotes}
                onChange={(e) => setCosmeticNotes(e.target.value)}
                placeholder="Observaciones adicionales sobre marcas o defectos previos..."
                className="w-full px-3 py-2 rounded-xl bg-brand-dark border border-brand-border text-xs text-white placeholder-slate-500 focus:border-brand-green focus:outline-none"
              />
            </div>

            {/* 4. Fotografías de Inspección */}
            <div className="p-4 rounded-xl bg-brand-surface/40 border border-brand-border space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-brand-green uppercase tracking-wider flex items-center gap-1.5">
                  <Camera className="w-3.5 h-3.5" />
                  <span>4. Fotografías de Entrada ({photos.length})</span>
                </h4>

                <label className="px-3 py-1.5 rounded-xl bg-brand-dark hover:bg-brand-surface text-brand-green border border-brand-green/40 text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-colors">
                  <Upload className="w-3.5 h-3.5" />
                  <span>Añadir Fotos</span>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    capture="environment"
                    onChange={handlePhotoUpload}
                    className="hidden"
                  />
                </label>
              </div>

              {photos.length === 0 ? (
                <div className="p-6 border-2 border-dashed border-brand-border/60 rounded-xl text-center text-xs text-slate-500">
                  No se han adjuntado fotos aún. Toma fotos de la pantalla, trasera y esquinas para constancia del cliente.
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {photos.map((photo, idx) => (
                    <div key={idx} className="relative group rounded-xl overflow-hidden border border-brand-border bg-black aspect-square">
                      <img src={photo} alt={`Foto ${idx + 1}`} className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => removePhoto(idx)}
                        className="absolute top-1.5 right-1.5 p-1 rounded-lg bg-red-600/80 hover:bg-red-600 text-white transition-opacity opacity-80 group-hover:opacity-100"
                        title="Eliminar foto"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* 5. Firma Digital del Cliente */}
            <div className="p-4 rounded-xl bg-brand-surface/40 border border-brand-border space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-brand-green uppercase tracking-wider flex items-center gap-1.5">
                  <PenTool className="w-3.5 h-3.5" />
                  <span>5. Firma Digital de Recepción</span>
                </h4>

                <button
                  type="button"
                  onClick={() => setIsSignModalOpen(true)}
                  className="px-3 py-1.5 rounded-xl bg-brand-green hover:bg-brand-green-neon text-black font-extrabold text-xs flex items-center gap-1.5 shadow-neon transition-all"
                >
                  <PenTool className="w-3.5 h-3.5" />
                  <span>{signature ? 'Volver a firmar' : 'Firmar en pantalla'}</span>
                </button>
              </div>

              {signature ? (
                <div className="p-3 rounded-xl bg-brand-dark border border-brand-green/40 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <img src={signature} alt="Firma cliente" className="h-12 w-auto bg-white/5 rounded px-2 object-contain" />
                    <div>
                      <span className="text-xs font-bold text-white block">Firma registrada</span>
                      <span className="text-[10px] text-slate-400">{signatureDate || 'Fecha actual'}</span>
                    </div>
                  </div>
                  <span className="text-xs text-emerald-400 font-bold flex items-center gap-1">
                    <Check className="w-4 h-4 stroke-[3]" />
                    <span>Conforme</span>
                  </span>
                </div>
              ) : (
                <p className="text-xs text-slate-400 italic">
                  Pendiente de firma del cliente en mostrador.
                </p>
              )}
            </div>

            {/* Modal actions */}
            <div className="pt-4 border-t border-brand-border flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl text-slate-400 hover:text-white text-xs font-semibold"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-6 py-2.5 rounded-xl bg-brand-green hover:bg-brand-green-neon text-black font-extrabold text-xs flex items-center gap-1.5 shadow-neon transition-all"
              >
                <Check className="w-4 h-4 stroke-[3]" />
                <span>Guardar Check-in</span>
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Signature Pad Sub-modal */}
      <SignaturePadModal
        isOpen={isSignModalOpen}
        onClose={() => setIsSignModalOpen(false)}
        onSave={handleSignatureSaved}
        title="Firma de Resguardo de Entrada en Taller"
        documentType="RECEPTION"
        customerName={repair.customer?.name}
        repairNumber={repair.repair_number}
      />
    </>
  );
};
