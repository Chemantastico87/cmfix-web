import React, { useState, useEffect } from 'react';
import { 
  Zap, 
  Search, 
  UserPlus, 
  Smartphone, 
  Wrench, 
  PenTool, 
  Printer, 
  CheckCircle, 
  MessageCircle, 
  Battery, 
  KeyRound, 
  Upload, 
  Plus, 
  RotateCcw,
  Sparkles,
  Euro,
  FileText
} from 'lucide-react';
import { AdminLayout } from '../../components/AdminLayout';
import { dbService } from '../../services/db';
import { Customer, DeviceCategory, PricingCatalogItem, CompanySettings } from '../../types';
import { SignaturePadModal } from '../../components/SignaturePadModal';
import { getWhatsAppNotificationUrl } from '../../services/notificationService';
import { generateQuotePDF } from '../../utils/pdfGenerator';

const POPULAR_BRANDS = ['Apple', 'Samsung', 'Xiaomi', 'Huawei', 'Sony', 'Lenovo', 'HP', 'Nintendo'];
const COMMON_FAULTS = [
  'Cambio de pantalla rota',
  'Cambio de batería',
  'Conector de carga no funciona',
  'Dispositivo mojado / no enciende',
  'Tapa trasera rota',
  'Altavoz / micrófono no se oye',
  'Limpieza y mantenimiento'
];

export const ModoMostradorPage: React.FC = () => {
  // Step tracker: 1: Cliente, 2: Dispositivo & Avería, 3: Check-in & Firma, 4: Ticket Éxito
  const [step, setStep] = useState<number>(1);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [catalog, setCatalog] = useState<PricingCatalogItem[]>([]);
  const [settings, setSettings] = useState<CompanySettings | null>(null);

  // 1. Cliente
  const [customerSearch, setCustomerSearch] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [newCustName, setNewCustName] = useState('');
  const [newCustPhone, setNewCustPhone] = useState('');
  const [newCustEmail, setNewCustEmail] = useState('');

  // 2. Dispositivo & Avería
  const [category, setCategory] = useState<DeviceCategory>('iPhone');
  const [brand, setBrand] = useState('Apple');
  const [model, setModel] = useState('');
  const [repairType, setRepairType] = useState('Cambio de pantalla rota');
  const [issueDescription, setIssueDescription] = useState('');
  
  // Pricing mode: AUTO vs MANUAL
  const [pricingMode, setPricingMode] = useState<'AUTO' | 'MANUAL'>('AUTO');
  const [customPrice, setCustomPrice] = useState<number>(65);

  // 3. Check-in & Custodia
  const [serialImei, setSerialImei] = useState('');
  const [passcode, setPasscode] = useState('');
  const [batteryLevel, setBatteryLevel] = useState<number>(60);
  const [accessories, setAccessories] = useState<string[]>(['Funda / Carcasa']);
  const [screenDamage, setScreenDamage] = useState('ROTO');
  const [clientSignature, setClientSignature] = useState<string | undefined>(undefined);
  const [isSignModalOpen, setIsSignModalOpen] = useState(false);

  // 4. Ticket Creado
  const [createdRepairNumber, setCreatedRepairNumber] = useState<string>('');
  const [createdQuoteId, setCreatedQuoteId] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    loadBaseData();
  }, []);

  const loadBaseData = async () => {
    try {
      const [c, cat, s] = await Promise.all([
        dbService.getCustomers(),
        dbService.getPricingCatalog(),
        dbService.getCompanySettings()
      ]);
      setCustomers(c);
      setCatalog(cat);
      setSettings(s);
    } catch (err) {
      console.error(err);
    }
  };

  // Filtered customer search
  const filteredCustomers = customerSearch.trim() === ''
    ? []
    : customers.filter(c => 
        c.name.toLowerCase().includes(customerSearch.toLowerCase()) ||
        c.phone.includes(customerSearch)
      ).slice(0, 5);

  const handleSelectCustomer = (c: Customer) => {
    setSelectedCustomer(c);
    setNewCustName(c.name);
    setNewCustPhone(c.phone);
    setNewCustEmail(c.email || '');
    setCustomerSearch('');
  };

  const handleClearCustomer = () => {
    setSelectedCustomer(null);
    setNewCustName('');
    setNewCustPhone('');
    setNewCustEmail('');
  };

  // Auto pricing calculation
  const getAutoPrice = () => {
    const match = catalog.find(item => 
      item.category === category &&
      item.repair_type.toLowerCase() === repairType.toLowerCase()
    );
    return match ? match.sale_price : 75;
  };

  const finalSubtotal = pricingMode === 'AUTO' ? getAutoPrice() : Number(customPrice || 0);
  const finalVat = (finalSubtotal * 0.21);
  const finalTotal = finalSubtotal + finalVat;

  const toggleAccessory = (acc: string) => {
    setAccessories(prev => 
      prev.includes(acc) ? prev.filter(a => a !== acc) : [...prev, acc]
    );
  };

  const handleFinalSubmit = async () => {
    if (!newCustName.trim() || !newCustPhone.trim()) {
      alert('Por favor indica nombre y teléfono del cliente.');
      setStep(1);
      return;
    }

    setIsSubmitting(true);
    try {
      // 1. Create Quote
      const quote = await dbService.createQuote({
        customerName: newCustName.trim(),
        customerPhone: newCustPhone.trim(),
        customerEmail: newCustEmail.trim() || 'mostrador@cmfix.es',
        deviceCategory: category,
        deviceBrand: brand,
        deviceModel: model || `${brand} ${category}`,
        repairType,
        issueDescription: issueDescription || `${repairType} (Recepción Mostrador)`,
        subtotal: finalSubtotal,
        vatRate: 21,
        isOrientative: false,
        estimatedTime: '24-48 horas',
        items: [
          {
            id: 'qi-mostrador',
            description: `${repairType} para ${brand} ${model}`,
            type: 'PART',
            cost: finalSubtotal * 0.5,
            price: finalSubtotal,
            quantity: 1
          }
        ]
      });

      // 2. Convert to Workshop Repair
      const repair = await dbService.createRepairFromQuote(quote);

      // 3. Update Check-in data & signature
      await dbService.updateRepairCheckin(repair.id, {
        serial_imei: serialImei,
        passcode,
        battery_level: batteryLevel,
        accessories,
        cosmetic_condition: {
          screen_status: screenDamage as any,
          notes: issueDescription
        },
        client_signature: clientSignature,
        client_signature_date: new Date().toLocaleString('es-ES')
      });

      // 4. Log Audit Action
      await dbService.logAudit({
        user_name: 'Recepción Mostrador',
        user_role: 'RECEPCION',
        action: 'COUNTER_INTAKE',
        entity_type: 'REPAIR',
        entity_id: repair.id,
        entity_code: repair.repair_number,
        details: `Dispositivo recibido en modo mostrador: ${brand} ${model}. PVP: ${finalTotal.toFixed(2)}€.`
      });

      setCreatedRepairNumber(repair.repair_number);
      setCreatedQuoteId(quote.id);
      setStep(4);
    } catch (err) {
      console.error('Error in counter intake:', err);
      alert('Ocurrió un error al registrar la orden en mostrador.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePrintTicket = () => {
    window.print();
  };

  const handleResetForm = () => {
    setStep(1);
    setSelectedCustomer(null);
    setNewCustName('');
    setNewCustPhone('');
    setNewCustEmail('');
    setModel('');
    setIssueDescription('');
    setSerialImei('');
    setPasscode('');
    setClientSignature(undefined);
    setCreatedRepairNumber('');
  };

  return (
    <AdminLayout>
      <div className="p-4 sm:p-6 max-w-5xl mx-auto space-y-6">
        
        {/* Header Banner */}
        <div className="p-4 sm:p-6 rounded-2xl bg-gradient-to-r from-brand-carbon via-brand-surface to-brand-carbon border border-brand-green/50 shadow-neon flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-brand-green text-black flex items-center justify-center font-black shadow-neon">
              <Zap className="w-6 h-6 stroke-[2.5]" />
            </div>
            <div>
              <span className="text-[10px] font-mono uppercase tracking-widest text-brand-green font-bold block">
                TERMINAL DE ATENCIÓN RÁPIDA
              </span>
              <h1 className="text-xl sm:text-2xl font-black text-white">
                Modo Mostrador / Recepción Express
              </h1>
              <p className="text-xs text-slate-300">
                Recepción ágil de dispositivos, firma táctil inmediata y emisión de ticket en 60 segundos.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleResetForm}
              className="px-3 py-2 rounded-xl bg-brand-dark/80 hover:bg-brand-surface border border-brand-border text-slate-300 hover:text-white text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Limpiar</span>
            </button>
          </div>
        </div>

        {/* Wizard Steps Navigation */}
        <div className="grid grid-cols-4 gap-2 text-xs">
          {[
            { num: 1, label: '1. Cliente' },
            { num: 2, label: '2. Dispositivo & Precio' },
            { num: 3, label: '3. Check-in & Firma' },
            { num: 4, label: '4. Ticket Listo' }
          ].map((st) => (
            <button
              key={st.num}
              onClick={() => st.num < step && setStep(st.num)}
              disabled={st.num > step}
              className={`p-3 rounded-xl border text-center transition-all ${
                step === st.num
                  ? 'bg-brand-green text-black font-extrabold border-brand-green shadow-neon-sm'
                  : step > st.num
                  ? 'bg-brand-surface text-brand-green border-brand-green/40 font-bold'
                  : 'bg-brand-dark/50 text-slate-500 border-brand-border opacity-50 cursor-not-allowed'
              }`}
            >
              <span>{st.label}</span>
            </button>
          ))}
        </div>

        {/* STEP 1: CLIENTE */}
        {step === 1 && (
          <div className="p-6 rounded-2xl bg-brand-carbon border border-brand-border space-y-6 animate-fadeIn">
            <div className="flex items-center justify-between pb-4 border-b border-brand-border/60">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-brand-green" />
                <span>Identificación del Cliente</span>
              </h2>
              <span className="text-xs text-slate-400">Búsqueda rápida o alta inmediata</span>
            </div>

            {/* Quick search */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-300">
                Buscar cliente existente (por teléfono o nombre):
              </label>
              <div className="relative">
                <Search className="w-4 h-4 text-slate-500 absolute left-3 top-3.5" />
                <input
                  type="text"
                  value={customerSearch}
                  onChange={(e) => setCustomerSearch(e.target.value)}
                  placeholder="Escribe teléfono o nombre del cliente..."
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-brand-dark border border-brand-border text-white text-sm focus:border-brand-green focus:outline-none"
                />
              </div>

              {filteredCustomers.length > 0 && (
                <div className="p-2 rounded-xl bg-brand-surface border border-brand-green/40 space-y-1">
                  {filteredCustomers.map(c => (
                    <div
                      key={c.id}
                      onClick={() => handleSelectCustomer(c)}
                      className="p-2.5 rounded-lg hover:bg-brand-dark cursor-pointer flex items-center justify-between text-xs transition-colors"
                    >
                      <div>
                        <strong className="text-white block">{c.name}</strong>
                        <span className="text-slate-400">{c.phone} {c.email ? `· ${c.email}` : ''}</span>
                      </div>
                      <span className="px-2 py-1 rounded bg-brand-green/20 text-brand-green font-bold text-[11px]">
                        Seleccionar
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Form fields */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Nombre y Apellidos *
                </label>
                <input
                  type="text"
                  required
                  value={newCustName}
                  onChange={(e) => setNewCustName(e.target.value)}
                  placeholder="ej. Carlos Mendoza"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-brand-dark border border-brand-border text-white text-sm focus:border-brand-green focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Teléfono Móvil (WhatsApp) *
                </label>
                <input
                  type="tel"
                  required
                  value={newCustPhone}
                  onChange={(e) => setNewCustPhone(e.target.value)}
                  placeholder="ej. 612 345 678"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-brand-dark border border-brand-border text-white text-sm font-mono focus:border-brand-green focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Correo Electrónico (Opcional)
                </label>
                <input
                  type="email"
                  value={newCustEmail}
                  onChange={(e) => setNewCustEmail(e.target.value)}
                  placeholder="ej. cliente@email.com"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-brand-dark border border-brand-border text-white text-sm focus:border-brand-green focus:outline-none"
                />
              </div>
            </div>

            <div className="flex justify-end pt-4 border-t border-brand-border/60">
              <button
                type="button"
                disabled={!newCustName.trim() || !newCustPhone.trim()}
                onClick={() => setStep(2)}
                className="px-6 py-3 rounded-xl bg-brand-green hover:bg-brand-green-neon text-black font-extrabold text-sm shadow-neon disabled:opacity-40 disabled:cursor-not-allowed transition-all"
              >
                Continuar a Dispositivo →
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: DISPOSITIVO & AVERÍA & PRECIO */}
        {step === 2 && (
          <div className="p-6 rounded-2xl bg-brand-carbon border border-brand-border space-y-6 animate-fadeIn">
            <div className="flex items-center justify-between pb-4 border-b border-brand-border/60">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Smartphone className="w-5 h-5 text-brand-green" />
                <span>Dispositivo, Avería y Presupuesto</span>
              </h2>
              <span className="text-xs text-brand-green font-mono font-bold">
                Cliente: {newCustName} ({newCustPhone})
              </span>
            </div>

            {/* Category selection */}
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-2">
                Categoría de Dispositivo:
              </label>
              <div className="flex flex-wrap gap-2">
                {(['iPhone', 'Samsung', 'Xiaomi', 'Android', 'PC', 'Portátil', 'Tablet', 'Consola', 'Otro'] as DeviceCategory[]).map(cat => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => {
                      setCategory(cat);
                      if (cat === 'iPhone') setBrand('Apple');
                      else if (cat === 'Samsung') setBrand('Samsung');
                      else if (cat === 'Xiaomi') setBrand('Xiaomi');
                    }}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                      category === cat
                        ? 'bg-brand-green text-black font-bold border-brand-green shadow-neon-sm'
                        : 'bg-brand-dark/80 text-slate-400 border-brand-border hover:border-slate-500'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Brand & Model */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Marca:
                </label>
                <input
                  type="text"
                  value={brand}
                  onChange={(e) => setBrand(e.target.value)}
                  placeholder="ej. Apple, Samsung, Xiaomi..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-brand-dark border border-brand-border text-white text-sm focus:border-brand-green focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Modelo Exacto *:
                </label>
                <input
                  type="text"
                  required
                  value={model}
                  onChange={(e) => setModel(e.target.value)}
                  placeholder="ej. 14 Pro Max, Galaxy S23, Redmi Note 12..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-brand-dark border border-brand-border text-white text-sm focus:border-brand-green focus:outline-none"
                />
              </div>
            </div>

            {/* Quick Fault Tags */}
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-2">
                Avería Declarada / Motivo de Entrada:
              </label>
              <div className="flex flex-wrap gap-2 mb-3">
                {COMMON_FAULTS.map(fault => (
                  <button
                    key={fault}
                    type="button"
                    onClick={() => {
                      setRepairType(fault);
                      if (!issueDescription) setIssueDescription(fault);
                    }}
                    className={`px-3 py-1 rounded-lg text-xs font-medium border transition-colors ${
                      repairType === fault
                        ? 'bg-brand-green/20 text-brand-green border-brand-green/60'
                        : 'bg-brand-dark/60 text-slate-400 border-brand-border hover:border-slate-500'
                    }`}
                  >
                    {fault}
                  </button>
                ))}
              </div>

              <textarea
                rows={2}
                value={issueDescription}
                onChange={(e) => setIssueDescription(e.target.value)}
                placeholder="Detalla observaciones técnicas o síntomas específicos dados por el cliente..."
                className="w-full px-3.5 py-2 rounded-xl bg-brand-dark border border-brand-border text-white text-xs focus:border-brand-green focus:outline-none"
              />
            </div>

            {/* Pricing Mode Toggle: AUTO vs MANUAL */}
            <div className="p-4 rounded-xl bg-brand-surface/40 border border-brand-border space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-white block">Tarificación del Presupuesto</span>
                  <span className="text-[11px] text-slate-400">Alterna entre catálogo automático o precio manual acordado</span>
                </div>

                <div className="flex p-1 rounded-xl bg-brand-dark border border-brand-border text-xs">
                  <button
                    type="button"
                    onClick={() => setPricingMode('AUTO')}
                    className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                      pricingMode === 'AUTO'
                        ? 'bg-brand-green text-black shadow-neon-sm'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Catálogo Automático
                  </button>
                  <button
                    type="button"
                    onClick={() => setPricingMode('MANUAL')}
                    className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                      pricingMode === 'MANUAL'
                        ? 'bg-brand-green text-black shadow-neon-sm'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Precio Manual
                  </button>
                </div>
              </div>

              {pricingMode === 'MANUAL' && (
                <div className="flex items-center gap-3">
                  <label className="text-xs text-slate-300">Importe Base (sin IVA):</label>
                  <div className="relative w-40">
                    <input
                      type="number"
                      min="0"
                      step="0.5"
                      value={customPrice}
                      onChange={(e) => setCustomPrice(Number(e.target.value))}
                      className="w-full px-3 py-2 pl-7 rounded-xl bg-brand-dark border border-brand-border text-white font-mono font-bold text-sm focus:border-brand-green focus:outline-none"
                    />
                    <Euro className="w-3.5 h-3.5 text-brand-green absolute left-2.5 top-3" />
                  </div>
                </div>
              )}

              {/* Price summary badge */}
              <div className="p-3 rounded-xl bg-brand-dark border border-brand-border/60 flex items-center justify-between text-xs">
                <span className="text-slate-300">
                  Subtotal: <strong className="text-white font-mono">{finalSubtotal.toFixed(2)} €</strong> + IVA (21%): <span className="text-slate-400 font-mono">{finalVat.toFixed(2)} €</span>
                </span>
                <span className="text-brand-green font-mono font-black text-base">
                  TOTAL: {finalTotal.toFixed(2)} €
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-brand-border/60">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="px-4 py-2.5 rounded-xl border border-brand-border text-slate-400 hover:text-white text-xs font-semibold"
              >
                ← Volver a Cliente
              </button>

              <button
                type="button"
                onClick={() => setStep(3)}
                className="px-6 py-3 rounded-xl bg-brand-green hover:bg-brand-green-neon text-black font-extrabold text-sm shadow-neon transition-all"
              >
                Continuar a Check-in & Firma →
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: CHECK-IN & FIRMA DIGITAL */}
        {step === 3 && (
          <div className="p-6 rounded-2xl bg-brand-carbon border border-brand-border space-y-6 animate-fadeIn">
            <div className="flex items-center justify-between pb-4 border-b border-brand-border/60">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <PenTool className="w-5 h-5 text-brand-green" />
                <span>Check-in Técnico y Firma del Cliente</span>
              </h2>
              <span className="text-xs text-slate-400">Custodia legal y resguardo</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  IMEI / Número de Serie:
                </label>
                <input
                  type="text"
                  value={serialImei}
                  onChange={(e) => setSerialImei(e.target.value)}
                  placeholder="ej. 352849102839471"
                  className="w-full px-3 py-2 rounded-xl bg-brand-dark border border-brand-border text-white text-xs font-mono focus:border-brand-green focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  PIN o Clave de Desbloqueo:
                </label>
                <input
                  type="text"
                  value={passcode}
                  onChange={(e) => setPasscode(e.target.value)}
                  placeholder="Código de pruebas..."
                  className="w-full px-3 py-2 rounded-xl bg-brand-dark border border-brand-border text-white text-xs font-mono focus:border-brand-green focus:outline-none"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-semibold text-slate-300 flex items-center gap-1">
                    <Battery className="w-3.5 h-3.5 text-brand-green" />
                    <span>Batería:</span>
                  </label>
                  <span className="text-xs font-mono font-bold text-white">{batteryLevel}%</span>
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

            {/* Accessories */}
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-2">
                Accesorios Dejados en Custodia:
              </label>
              <div className="flex flex-wrap gap-2">
                {['Cable', 'Cargador', 'Funda / Carcasa', 'Tarjeta SIM', 'Bandeja SIM', 'Caja original'].map(acc => {
                  const sel = accessories.includes(acc);
                  return (
                    <button
                      key={acc}
                      type="button"
                      onClick={() => toggleAccessory(acc)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                        sel
                          ? 'bg-brand-green/20 text-brand-green border-brand-green/60'
                          : 'bg-brand-dark/80 text-slate-400 border-brand-border'
                      }`}
                    >
                      {sel ? '✓ ' : '+ '}{acc}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Signature Area */}
            <div className="p-4 rounded-xl bg-brand-surface/50 border border-brand-border flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                  <PenTool className="w-4 h-4 text-brand-green" />
                  <span>Firma de Aceptación del Cliente en Pantalla</span>
                </h4>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  El cliente acepta las condiciones de depósito para revisión técnica y presupuesto.
                </p>
              </div>

              <div className="flex items-center gap-3">
                {clientSignature && (
                  <img src={clientSignature} alt="Firma" className="h-10 w-auto bg-white/5 rounded px-2 object-contain" />
                )}
                <button
                  type="button"
                  onClick={() => setIsSignModalOpen(true)}
                  className="px-4 py-2 rounded-xl bg-brand-green hover:bg-brand-green-neon text-black font-extrabold text-xs shadow-neon transition-all"
                >
                  {clientSignature ? 'Cambiar Firma' : 'Firmar en Pantalla'}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-brand-border/60">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="px-4 py-2.5 rounded-xl border border-brand-border text-slate-400 hover:text-white text-xs font-semibold"
              >
                ← Volver a Dispositivo
              </button>

              <button
                type="button"
                disabled={isSubmitting}
                onClick={handleFinalSubmit}
                className="px-8 py-3.5 rounded-xl bg-brand-green hover:bg-brand-green-neon text-black font-extrabold text-sm shadow-neon disabled:opacity-40 transition-all flex items-center gap-2"
              >
                <Zap className="w-4 h-4 stroke-[3]" />
                <span>{isSubmitting ? 'Generando orden...' : 'Emitir Orden y Ticket Mostrador'}</span>
              </button>
            </div>
          </div>
        )}

        {/* STEP 4: TICKET DE ENTRADA & ACCIONES */}
        {step === 4 && (
          <div className="p-8 rounded-2xl bg-brand-carbon border border-brand-green/60 shadow-neon text-center space-y-6 animate-fadeIn">
            <div className="w-16 h-16 rounded-2xl bg-brand-green/20 text-brand-green border border-brand-green/40 flex items-center justify-center mx-auto shadow-neon">
              <CheckCircle className="w-8 h-8 stroke-[2.5]" />
            </div>

            <div>
              <span className="text-xs font-mono font-bold text-brand-green uppercase tracking-widest block">
                ¡ORDEN GENERADA CON ÉXITO!
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-white mt-1">
                Dispositivo Ingresado en Taller
              </h2>
            </div>

            <div className="p-4 rounded-xl bg-brand-dark border border-brand-green/40 inline-block font-mono">
              <span className="text-xs text-slate-400 block mb-1">CÓDIGO DE SEGUIMIENTO</span>
              <span className="text-3xl font-black text-brand-green tracking-wider">
                {createdRepairNumber}
              </span>
            </div>

            {/* Quick summary */}
            <div className="max-w-md mx-auto p-4 rounded-xl bg-brand-surface/40 border border-brand-border text-xs text-left space-y-1.5">
              <div><strong className="text-white">Cliente:</strong> {newCustName} ({newCustPhone})</div>
              <div><strong className="text-white">Dispositivo:</strong> {brand} {model}</div>
              <div><strong className="text-white">Avería:</strong> {repairType}</div>
              <div><strong className="text-white">Importe Previsto:</strong> {finalTotal.toFixed(2)} € (IVA inc.)</div>
              <div><strong className="text-white">Firma:</strong> {clientSignature ? 'Registrada digitalmente' : 'No aportada'}</div>
            </div>

            {/* Action buttons */}
            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={handlePrintTicket}
                className="px-6 py-3 rounded-xl bg-brand-green hover:bg-brand-green-neon text-black font-extrabold text-xs flex items-center gap-2 shadow-neon transition-all"
              >
                <Printer className="w-4 h-4" />
                <span>Imprimir Resguardo de Entrada</span>
              </button>

              <a
                href={getWhatsAppNotificationUrl('maury', {
                  id: createdQuoteId,
                  quote_number: createdRepairNumber,
                  customer_id: 'cust-counter',
                  customer: { id: 'c1', name: newCustName, phone: newCustPhone, email: newCustEmail, created_at: '' },
                  device_category: category,
                  device_brand: brand,
                  device_model: model,
                  repair_type: repairType,
                  issue_description: issueDescription,
                  items: [],
                  subtotal: finalSubtotal,
                  vat_rate: 21,
                  vat_amount: finalVat,
                  total: finalTotal,
                  is_orientative: false,
                  status: 'PENDIENTE',
                  estimated_time: '24-48 horas',
                  created_at: new Date().toISOString(),
                  valid_until: ''
                })}
                target="_blank"
                rel="noopener noreferrer"
                className="px-5 py-3 rounded-xl bg-emerald-950/60 hover:bg-emerald-900/80 text-emerald-400 border border-emerald-500/40 font-bold text-xs flex items-center gap-2 transition-all"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Avisar a Maury por WhatsApp</span>
              </a>

              <button
                type="button"
                onClick={handleResetForm}
                className="px-5 py-3 rounded-xl bg-brand-surface hover:bg-brand-elevated text-white border border-brand-border font-bold text-xs transition-colors"
              >
                Nueva Recepción
              </button>
            </div>
          </div>
        )}

      </div>

      {/* Signature Pad Modal */}
      <SignaturePadModal
        isOpen={isSignModalOpen}
        onClose={() => setIsSignModalOpen(false)}
        onSave={(dataUrl) => setClientSignature(dataUrl)}
        title="Firma Digital en Mostrador"
        documentType="RECEPTION"
        customerName={newCustName || 'Cliente'}
      />
    </AdminLayout>
  );
};
