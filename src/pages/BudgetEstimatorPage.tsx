import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { 
  Calculator, 
  Smartphone, 
  Laptop, 
  Monitor, 
  Tablet, 
  Gamepad2, 
  HelpCircle, 
  CheckCircle, 
  AlertTriangle, 
  ArrowRight, 
  ArrowLeft, 
  ShieldCheck, 
  Clock, 
  Upload, 
  FileText,
  Sparkles,
  Phone,
  Mail,
  User,
  Info,
  Globe,
  Code,
  Layers,
  MessageCircle
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { DeviceCategory, PricingCatalogItem, CompanySettings } from '../types';
import { dbService } from '../services/db';
import { getWhatsAppNotificationUrl } from '../services/notificationService';

export const BudgetEstimatorPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // Settings & Catalog from database
  const [settings, setSettings] = useState<CompanySettings | null>(null);
  const [catalog, setCatalog] = useState<PricingCatalogItem[]>([]);
  const [loadingInitial, setLoadingInitial] = useState(true);

  // Wizard Steps: 1: Device/Model -> 2: Repair -> 3: Calculation Review -> 4: Customer Details -> 5: Success
  const [step, setStep] = useState<number>(1);

  // Form State
  const [category, setCategory] = useState<DeviceCategory>('iPhone');
  const [brand, setBrand] = useState('Apple');
  const [model, setModel] = useState('');
  const [repairType, setRepairType] = useState('Cambio de pantalla');
  const [urgency, setUrgency] = useState<'ESTANDAR' | 'URGENTE'>('ESTANDAR');
  const [issueDescription, setIssueDescription] = useState('');
  const [observations, setObservations] = useState('');

  // Customer Contact State
  const [name, setName] = useState('');
  const [surname, setSurname] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [acceptedPrivacy, setAcceptedPrivacy] = useState(false);

  // Submission State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createdQuoteNumber, setCreatedQuoteNumber] = useState<string | null>(null);
  const [createdQuoteId, setCreatedQuoteId] = useState<string | null>(null);

  // Load Initial Settings & Catalog
  useEffect(() => {
    const load = async () => {
      try {
        const [sett, cat] = await Promise.all([
          dbService.getCompanySettings(),
          dbService.getPricingCatalog()
        ]);
        setSettings(sett);
        setCatalog(cat);

        // If navigated with initial state from HomePage quick form
        if (location.state) {
          const s = location.state as any;
          if (s.category) setCategory(s.category);
          if (s.brand) setBrand(s.brand);
          if (s.model) setModel(s.model);
          if (s.issue) setRepairType(s.issue);
          if (s.description) setIssueDescription(s.description);
          if (s.model) setStep(2); // advance to repair choice
        }
      } catch (err) {
        console.error('Error loading pricing catalog:', err);
      } finally {
        setLoadingInitial(false);
      }
    };
    load();
  }, [location.state]);

  // Handle Category Change
  const handleCategorySelect = (cat: DeviceCategory) => {
    setCategory(cat);
    if (cat === 'iPhone') setBrand('Apple');
    else if (cat === 'Samsung') setBrand('Samsung');
    else if (cat === 'Xiaomi') setBrand('Xiaomi');
    else if (cat === 'Mac') setBrand('Apple');
    else if (cat === 'Android') setBrand('Google Pixel');
    else if (cat === 'Portátil') setBrand('Lenovo');
    else if (cat === 'PC') setBrand('Sobremesa');
    else if (cat === 'Tablet') setBrand('Apple iPad');
    else if (cat === 'Consola') setBrand('Sony PlayStation');
    else if (cat === 'Página Web') {
      setBrand('Desarrollo Web');
      setModel('Web Corporativa Profesional');
      setRepairType('Desarrollo completo desde cero + Dominio + SSL');
    }
    else if (cat === 'App Móvil') {
      setBrand('Desarrollo App / Software');
      setModel('Web App / PWA Multiplataforma');
      setRepairType('Desarrollo de App a Medida + Base de Datos');
    }
    else setBrand('');
  };

  // Popular Models per Category for quick tap
  const popularModels: Record<string, string[]> = {
    iPhone: ['iPhone 15 / 15 Pro', 'iPhone 14 / 14 Pro', 'iPhone 13 / 13 Pro', 'iPhone 12 / 12 Pro', 'iPhone 11 / 11 Pro', 'iPhone SE'],
    Samsung: ['Galaxy S24 / S24 Ultra', 'Galaxy S23 / S23 Ultra', 'Galaxy S22', 'Galaxy A54 5G', 'Galaxy A34', 'Galaxy Z Flip'],
    Xiaomi: ['Xiaomi 13 / 13 Pro', 'Xiaomi 12', 'Redmi Note 13 Pro', 'Redmi Note 12', 'POCO X6 Pro', 'POCO F5'],
    Android: ['Google Pixel 8', 'Google Pixel 7a', 'OPPO Find X5', 'Realme GT', 'Motorola Edge'],
    Portátil: ['Lenovo IdeaPad / Legion', 'HP Pavilion / Omen', 'Asus ZenBook / ROG', 'Acer Nitro / Swift', 'Dell XPS'],
    PC: ['Torre Gaming Intel', 'Torre Gaming AMD Ryzen', 'PC Oficina Sobremesa', 'Workstation'],
    Mac: ['MacBook Pro 14" / 16"', 'MacBook Air M1 / M2', 'iMac 24"', 'Mac mini'],
    Tablet: ['iPad Pro 11" / 12.9"', 'iPad Air', 'iPad 10ª Gen', 'Samsung Galaxy Tab S9', 'Lenovo Tab M10'],
    Consola: ['PlayStation 5', 'PlayStation 4 Pro', 'Nintendo Switch OLED', 'Xbox Series X', 'Xbox Series S'],
    'Página Web': [
      'Landing Page / Web One-Page',
      'Web Corporativa Profesional',
      'Tienda Online / E-commerce',
      'Web a Medida + Panel Administrable'
    ],
    'App Móvil': [
      'Web App / PWA Multiplataforma',
      'App Móvil Nativa (iOS & Android)',
      'App de Gestión Interna / Taller / CRM',
      'Portal / Área Privada de Clientes'
    ],
    Otro: ['Dispositivo personalizado']
  };

  // Repairs list per Category
  const isMobile = ['iPhone', 'Samsung', 'Xiaomi', 'Android'].includes(category);
  const isComputer = ['PC', 'Portátil', 'Mac'].includes(category);
  const isWeb = category === 'Página Web';
  const isApp = category === 'App Móvil';
  const isWebOrApp = isWeb || isApp;

  const repairOptions = isWeb
    ? [
        'Desarrollo completo desde cero + Dominio + SSL',
        'Rediseño y modernización de web existente',
        'Integración de pasarela de pago (Bizum, Tarjeta, Stripe)',
        'Optimización SEO en Google y velocidad de carga',
        'Mantenimiento web anual + Soporte técnico continuo',
        'Añadir nuevas funciones / Programación a medida'
      ]
    : isApp
    ? [
        'Desarrollo de App a Medida + Base de Datos',
        'Publicación en Google Play y Apple App Store',
        'Panel de control administrativo en la nube',
        'Sistema de notificaciones push automáticas',
        'Integración de pagos y suscripciones online',
        'Mantenimiento mensual y soporte evolutivo'
      ]
    : isMobile
    ? [
        'Cambio de pantalla OLED / AMOLED',
        'Cambio de batería',
        'Conector de carga USB-C / Lightning',
        'Cámara trasera / delantera',
        'Altavoz / Micrófono',
        'Tapa trasera de cristal',
        'Reparación de placa base',
        'Diagnóstico general (No enciende)',
        'Otro problema'
      ]
    : isComputer
    ? [
        'Cambio a disco SSD NVMe + Clonado',
        'Ampliación de memoria RAM',
        'Limpieza y cambio de pasta térmica',
        'Formateo e instalación Windows 11',
        'Recuperación de datos de disco',
        'Reparación de placa base / cortos',
        'Sustitución de teclado / bisagras',
        'Eliminación de virus y optimización',
        'Diagnóstico general',
        'Otro problema'
      ]
    : [
        'Cambio de pantalla / cristal',
        'Batería o alimentación',
        'Conector o puerto HDMI/Carga',
        'Limpieza interna y pasta térmica',
        'Reparación electrónica',
        'Diagnóstico general',
        'Otro problema'
      ];

  // Dynamic Price Calculation
  const calculatePrice = () => {
    // 1. Check if exact match in pricing catalog
    const catalogMatch = catalog.find(
      c => c.category === category && 
           (model ? c.model.toLowerCase().includes(model.toLowerCase()) : false) &&
           c.repair_type.toLowerCase().includes(repairType.toLowerCase())
    );

    let partCost = 0;
    let laborCost = settings?.hourly_labor_rate || 35;
    let basePrice = 0;
    let isOrientative = true;
    let estimatedTime = '24-48 horas';

    if (catalogMatch) {
      partCost = catalogMatch.part_cost;
      laborCost = catalogMatch.labor_cost;
      basePrice = catalogMatch.sale_price;
      estimatedTime = catalogMatch.estimated_time;
      isOrientative = false; // Known exact catalog price
    } else if (category === 'Página Web') {
      let webBase = 290;
      estimatedTime = '3-5 días laborables';
      partCost = 50;

      if (model.includes('Corporativa')) {
        webBase = 590;
        partCost = 90;
        estimatedTime = '7-12 días laborables';
      } else if (model.includes('Tienda') || model.includes('E-commerce')) {
        webBase = 990;
        partCost = 150;
        estimatedTime = '15-20 días laborables';
      } else if (model.includes('Medida') || model.includes('Panel')) {
        webBase = 1490;
        partCost = 200;
        estimatedTime = '2-3 semanas';
      }

      if (repairType.includes('Rediseño')) {
        webBase = Math.round(webBase * 0.85);
      } else if (repairType.includes('SEO')) {
        webBase += 150;
      } else if (repairType.includes('pasarela')) {
        webBase += 120;
      } else if (repairType.includes('Mantenimiento')) {
        webBase = 180;
        partCost = 30;
        estimatedTime = 'Inmediato (Anual)';
      }

      laborCost = webBase - partCost;
      basePrice = webBase;
      isOrientative = true;
    } else if (category === 'App Móvil') {
      let appBase = 790;
      estimatedTime = '10-15 días laborables';
      partCost = 100;

      if (model.includes('Nativa') || model.includes('Stores')) {
        appBase = 1850;
        partCost = 250;
        estimatedTime = '3-4 semanas';
      } else if (model.includes('Gestión') || model.includes('CRM') || model.includes('Taller')) {
        appBase = 1350;
        partCost = 200;
        estimatedTime = '2-3 semanas';
      } else if (model.includes('Portal') || model.includes('Área Privada')) {
        appBase = 950;
        partCost = 150;
        estimatedTime = '10-15 días laborables';
      }

      if (repairType.includes('Stores')) {
        appBase += 190;
      } else if (repairType.includes('notificaciones')) {
        appBase += 120;
      } else if (repairType.includes('pagos')) {
        appBase += 150;
      } else if (repairType.includes('Mantenimiento')) {
        appBase = 240;
        partCost = 40;
        estimatedTime = 'Inmediato (Trimestral)';
      }

      laborCost = appBase - partCost;
      basePrice = appBase;
      isOrientative = true;
    } else {
      // Heuristic estimation based on repair type
      if (repairType.includes('pantalla')) {
        partCost = category === 'iPhone' ? 95 : 75;
        laborCost = 35;
        estimatedTime = '1-2 horas';
      } else if (repairType.includes('batería')) {
        partCost = 20;
        laborCost = 25;
        estimatedTime = '45 minutos';
      } else if (repairType.includes('Conector')) {
        partCost = 15;
        laborCost = 30;
        estimatedTime = '1 hora';
      } else if (repairType.includes('SSD')) {
        partCost = 55;
        laborCost = 35;
        estimatedTime = '24 horas';
      } else if (repairType.includes('pasta térmica') || repairType.includes('Limpieza')) {
        partCost = 8;
        laborCost = 37;
        estimatedTime = '24 horas';
      } else if (repairType.includes('Formateo') || repairType.includes('Windows')) {
        partCost = 0;
        laborCost = 40;
        estimatedTime = '24 horas';
      } else if (repairType.includes('Diagnóstico')) {
        partCost = 0;
        laborCost = 0; // Free initial diagnostic
        estimatedTime = '24 horas';
      } else {
        partCost = 30;
        laborCost = 35;
        estimatedTime = '24-48 horas';
      }
      basePrice = partCost + laborCost;
    }

    if (urgency === 'URGENTE') {
      const extraLabor = (category === 'Página Web' || category === 'App Móvil') ? 150 : 20;
      laborCost += extraLabor;
      basePrice += extraLabor;
      estimatedTime = (category === 'Página Web' || category === 'App Móvil') ? 'Express (Prioridad técnica)' : 'Urgente (< 3 horas)';
    }

    const vatRate = settings?.default_vat || 21;
    const vatAmount = (basePrice * vatRate) / 100;
    const total = basePrice + vatAmount;

    return {
      partCost,
      laborCost,
      subtotal: basePrice,
      vatRate,
      vatAmount,
      total,
      isOrientative,
      estimatedTime
    };
  };

  const pricing = calculatePrice();

  // Final Submission
  const handleSubmitQuote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!acceptedPrivacy) {
      alert('Debes aceptar la política de privacidad para enviar la solicitud.');
      return;
    }

    setIsSubmitting(true);
    try {
      const fullCustomerName = `${name} ${surname}`.trim();
      const quote = await dbService.createQuote({
        customerName: fullCustomerName,
        customerPhone: phone,
        customerEmail: email,
        deviceCategory: category,
        deviceBrand: brand,
        deviceModel: model || `${brand} ${category}`,
        repairType,
        issueDescription: `${issueDescription} ${observations ? '— Obs: ' + observations : ''}`.trim() || repairType,
        subtotal: pricing.subtotal,
        vatRate: pricing.vatRate,
        isOrientative: pricing.isOrientative,
        estimatedTime: pricing.estimatedTime,
        items: [
          {
            id: 'qi-1',
            description: `${repairType} (${category} ${model})`,
            type: pricing.partCost > 0 ? 'PART' : 'LABOR',
            cost: pricing.partCost,
            price: pricing.subtotal,
            quantity: 1
          }
        ]
      });

      setCreatedQuoteNumber(quote.quote_number);
      setCreatedQuoteId(quote.id);
      setStep(5); // Success step

      // Celebration Confetti
      try {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#22c55e', '#38ef7d', '#ffffff', '#00ff66']
        });
      } catch {}
    } catch (err) {
      console.error('Error creating quote:', err);
      alert('Ocurrió un error al procesar tu solicitud. Por favor intenta de nuevo.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen py-10 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
      
      {/* Title & Wizard Tracker */}
      <div className="text-center mb-8">
        <span className="text-xs font-mono font-bold text-brand-green uppercase tracking-widest">
          SISTEMA DE PRESUPUESTOS INTELIGENTE
        </span>
        <h1 className="text-2xl sm:text-4xl font-extrabold text-white mt-1">
          Presupuesto Online en 2 Minutos
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-2">
          Calcula al instante el coste orientativo con piezas y mano de obra desglosadas.
        </p>

        {/* Step indicator pills */}
        {step < 5 && (
          <div className="flex items-center justify-center gap-2 mt-6">
            {[
              { num: 1, label: isWebOrApp ? 'Proyecto' : 'Dispositivo' },
              { num: 2, label: isWebOrApp ? 'Servicio' : 'Avería' },
              { num: 3, label: 'Desglose' },
              { num: 4, label: 'Tus Datos' }
            ].map((s) => (
              <div
                key={s.num}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
                  step === s.num
                    ? 'bg-brand-green text-black shadow-neon-sm'
                    : step > s.num
                    ? 'bg-brand-surface text-brand-green border border-brand-green/40'
                    : 'bg-brand-carbon text-slate-400 border border-brand-border'
                }`}
              >
                <span>{s.num}.</span>
                <span>{s.label}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* STEP 1: DISPOSITIVO O PROYECTO WEB/APP */}
      {step === 1 && (
        <div className="bg-brand-carbon/90 border border-brand-border rounded-2xl p-6 sm:p-8 shadow-card backdrop-blur-md animate-fadeIn">
          <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-brand-green text-black text-xs font-black flex items-center justify-center">1</span>
            <span>{isWebOrApp ? 'Selecciona tu tipo de proyecto digital' : 'Selecciona tu categoría de dispositivo'}</span>
          </h2>

          {/* Category Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3 mb-6">
            {[
              { cat: 'iPhone', icon: Smartphone },
              { cat: 'Samsung', icon: Smartphone },
              { cat: 'Xiaomi', icon: Smartphone },
              { cat: 'Android', icon: Smartphone },
              { cat: 'Portátil', icon: Laptop },
              { cat: 'PC', icon: Monitor },
              { cat: 'Mac', icon: Laptop },
              { cat: 'Tablet', icon: Tablet },
              { cat: 'Consola', icon: Gamepad2 },
              { cat: 'Página Web', icon: Globe, badge: '¡Nuevo!' },
              { cat: 'App Móvil', icon: Code, badge: '¡Nuevo!' },
              { cat: 'Otro', icon: HelpCircle }
            ].map((item) => {
              const IconC = item.icon;
              const isSelected = category === item.cat;
              return (
                <button
                  key={item.cat}
                  type="button"
                  onClick={() => handleCategorySelect(item.cat as DeviceCategory)}
                  className={`relative p-3 rounded-xl border flex flex-col items-center justify-center gap-2 text-center transition-all ${
                    isSelected
                      ? 'bg-brand-surface border-brand-green text-white shadow-neon-sm'
                      : 'bg-brand-dark/70 border-brand-border/80 text-slate-400 hover:text-white hover:border-slate-600'
                  }`}
                >
                  {item.badge && (
                    <span className="absolute -top-1.5 -right-1 bg-brand-green text-black text-[9px] font-black px-1.5 py-0.2 rounded-full uppercase tracking-tighter shadow-neon-sm">
                      {item.badge}
                    </span>
                  )}
                  <IconC className={`w-5 h-5 ${isSelected ? 'text-brand-green' : 'text-slate-400'}`} />
                  <span className="text-xs font-bold">{item.cat}</span>
                </button>
              );
            })}
          </div>

          {/* Brand & Model Input */}
          <div className="space-y-4 pt-4 border-t border-brand-border/60">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  {isWebOrApp ? 'Marca o Nombre de tu Negocio' : 'Marca'}
                </label>
                <input
                  type="text"
                  value={brand}
                  onChange={(e) => setBrand(e.target.value)}
                  placeholder={isWebOrApp ? 'Ej. Empresa de servicios, Clínica, Tienda...' : 'Ej. Apple, Samsung, Xiaomi...'}
                  required
                  className="w-full bg-brand-dark border border-brand-border rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-brand-green"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  {isWebOrApp ? 'Tipo de Web o Aplicación deseada' : 'Modelo exacto'}
                </label>
                <input
                  type="text"
                  value={model}
                  onChange={(e) => setModel(e.target.value)}
                  placeholder={isWebOrApp ? 'Ej. Web Corporativa, Tienda Online, PWA...' : 'Ej. iPhone 13 Pro, Galaxy S23...'}
                  required
                  className="w-full bg-brand-dark border border-brand-border rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-brand-green"
                />
              </div>
            </div>

            {/* Popular models quick chips */}
            {popularModels[category] && (
              <div>
                <span className="text-xs text-slate-400 block mb-2">
                  {isWebOrApp ? `Soluciones habituales de ${category}:` : `Modelos habituales de ${category}:`}
                </span>
                <div className="flex flex-wrap gap-2">
                  {popularModels[category].map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => setModel(m)}
                      className={`text-xs px-3 py-1 rounded-lg border transition-all ${
                        model === m
                          ? 'bg-brand-green/20 border-brand-green text-brand-green font-bold'
                          : 'bg-brand-dark border-brand-border text-slate-300 hover:border-slate-500'
                      }`}
                    >
                      {m}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Step 1 Next Button */}
          <div className="mt-8 flex justify-end">
            <button
              type="button"
              disabled={!brand.trim() || !model.trim()}
              onClick={() => setStep(2)}
              className="px-6 py-3 rounded-xl bg-brand-green hover:bg-brand-green-neon text-black font-extrabold text-sm flex items-center gap-2 shadow-neon disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            >
              <span>{isWebOrApp ? 'Continuar a Requisitos' : 'Continuar a la Avería'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 2: TIPO DE REPARACIÓN O DESARROLLO */}
      {step === 2 && (
        <div className="bg-brand-carbon/90 border border-brand-border rounded-2xl p-6 sm:p-8 shadow-card backdrop-blur-md animate-fadeIn">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-brand-green text-black text-xs font-black flex items-center justify-center">2</span>
              <span>{isWebOrApp ? `¿Qué alcance o requerimiento buscas para tu ${model}?` : `¿Qué necesita reparación en tu ${model}?`}</span>
            </h2>
            <button
              type="button"
              onClick={() => setStep(1)}
              className="text-xs text-slate-400 hover:text-white flex items-center gap-1"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>{isWebOrApp ? 'Cambiar tipo' : 'Cambiar modelo'}</span>
            </button>
          </div>

          {/* Repair / Solution Options Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
            {repairOptions.map((opt) => {
              const isSelected = repairType === opt;
              return (
                <button
                  key={opt}
                  type="button"
                  onClick={() => setRepairType(opt)}
                  className={`p-3.5 rounded-xl border text-left flex items-center justify-between transition-all ${
                    isSelected
                      ? 'bg-brand-surface border-brand-green text-white shadow-neon-sm'
                      : 'bg-brand-dark/70 border-brand-border/80 text-slate-300 hover:border-slate-500'
                  }`}
                >
                  <span className="text-sm font-semibold">{opt}</span>
                  {isSelected && <CheckCircle className="w-4 h-4 text-brand-green shrink-0 ml-2" />}
                </button>
              );
            })}
          </div>

          {/* Urgency / Timeline Selector */}
          <div className="p-4 rounded-xl bg-brand-surface border border-brand-border/80 mb-6">
            <label className="block text-xs font-semibold text-slate-300 mb-2">
              {isWebOrApp ? 'Plazo de entrega y desarrollo' : 'Prioridad de la reparación'}
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setUrgency('ESTANDAR')}
                className={`p-3 rounded-lg border text-left transition-all ${
                  urgency === 'ESTANDAR'
                    ? 'border-brand-green bg-brand-dark text-white'
                    : 'border-brand-border text-slate-400 hover:text-white'
                }`}
              >
                <div className="font-bold text-xs text-brand-green">
                  {isWebOrApp ? 'Plazo Normal de Desarrollo' : 'Estándar (24 - 48h)'}
                </div>
                <div className="text-[11px] text-slate-400">
                  {isWebOrApp ? 'Entregas por fases y revisión continua' : 'Sin recargo adicional'}
                </div>
              </button>

              <button
                type="button"
                onClick={() => setUrgency('URGENTE')}
                className={`p-3 rounded-lg border text-left transition-all ${
                  urgency === 'URGENTE'
                    ? 'border-amber-400 bg-amber-950/20 text-white'
                    : 'border-brand-border text-slate-400 hover:text-white'
                }`}
              >
                <div className="font-bold text-xs text-amber-400">
                  {isWebOrApp ? '⚡ Entrega Express / Prioritaria' : '⚡ Urgente Express (< 3h)'}
                </div>
                <div className="text-[11px] text-slate-400">
                  {isWebOrApp ? 'Dedicación full time prioritaria (+150 €)' : 'Mano de obra preferente (+20 €)'}
                </div>
              </button>
            </div>
          </div>

          {/* Details / Description */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              {isWebOrApp ? 'Detalles de tu proyecto o funcionalidades clave (opcional)' : 'Detalles adicionales del problema (opcional)'}
            </label>
            <textarea
              value={issueDescription}
              onChange={(e) => setIssueDescription(e.target.value)}
              rows={2}
              placeholder={isWebOrApp 
                ? 'Ej. Queremos pasarela Bizum y Stripe, formulario de reservas, multi-idioma...' 
                : 'Explica qué síntomas notas: rayas en pantalla, táctil congelado, sonido metálico...'}
              className="w-full bg-brand-dark border border-brand-border rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-brand-green resize-none"
            />
          </div>

          {/* Nav Buttons */}
          <div className="mt-8 flex items-center justify-between">
            <button
              type="button"
              onClick={() => setStep(1)}
              className="px-4 py-2.5 rounded-xl border border-brand-border text-slate-300 hover:text-white text-xs font-semibold flex items-center gap-1.5"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Atrás</span>
            </button>

            <button
              type="button"
              onClick={() => setStep(3)}
              className="px-6 py-3 rounded-xl bg-brand-green hover:bg-brand-green-neon text-black font-extrabold text-sm flex items-center gap-2 shadow-neon transition-all"
            >
              <span>Ver Cálculo de Presupuesto</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 3: DESGLOSE Y PRECIO ORIENTATIVO */}
      {step === 3 && (
        <div className="bg-brand-carbon/90 border border-brand-border rounded-2xl p-6 sm:p-8 shadow-card backdrop-blur-md animate-fadeIn">
          <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-brand-green text-black text-xs font-black flex items-center justify-center">3</span>
            <span>Estimación del Presupuesto</span>
          </h2>

          {/* Orientative Warning Notice Box */}
          <div className="mb-6 p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div className="text-xs text-amber-200/90 leading-relaxed">
              <strong className="text-amber-300 font-bold block mb-0.5">
                {isWebOrApp ? 'Presupuesto Estimado de Desarrollo' : 'Presupuesto Orientativo'}
              </strong>
              {isWebOrApp
                ? `Cálculo orientativo según especificaciones (${repairType}). Incluye diseño, desarrollo de software, pruebas y despliegue. Tras solicitarlo nos pondremos en contacto para cerrar el alcance al detalle sin compromiso.`
                : `Este cálculo se basa en el fallo descrito (${repairType}). Si al examinar físicamente el equipo en el taller se detectan daños internos adicionales (por ejemplo en placa base o humedad), se informará antes de realizar cualquier intervención.`}
            </div>
          </div>

          {/* Device & Work Summary Card */}
          <div className="p-4 rounded-xl bg-brand-surface border border-brand-border mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="text-xs font-mono text-brand-green uppercase font-bold">{category}</span>
              <h3 className="text-base font-bold text-white">{brand} — {model}</h3>
              <p className="text-xs text-slate-400 mt-0.5">
                {isWebOrApp ? 'Solución:' : 'Intervención:'} {repairType}
              </p>
            </div>
            <div className="text-right">
              <span className="text-xs text-slate-400 block">Tiempo estimado:</span>
              <span className="text-xs font-mono font-bold text-brand-green flex items-center gap-1 justify-end">
                <Clock className="w-3.5 h-3.5" />
                <span>{pricing.estimatedTime}</span>
              </span>
            </div>
          </div>

          {/* Itemized Breakdown Table */}
          <div className="border border-brand-border rounded-xl overflow-hidden mb-6">
            <div className="bg-brand-dark px-4 py-2.5 border-b border-brand-border flex items-center justify-between text-xs font-bold text-slate-300">
              <span>Concepto</span>
              <span>Importe</span>
            </div>

            <div className="p-4 space-y-3 text-sm">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-white font-medium">
                    {isWebOrApp ? 'Infraestructura / Dominio / Servidores:' : 'Repuesto / Pieza:'}
                  </span>
                  <p className="text-xs text-slate-400">
                    {isWebOrApp ? 'Configuración inicial y entorno de producción' : `${repairType} calidad homologada`}
                  </p>
                </div>
                <span className="font-mono text-slate-200">{pricing.partCost.toFixed(2)} €</span>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <span className="text-white font-medium">
                    {isWebOrApp ? 'Desarrollo de Software y Diseño UI/UX:' : 'Mano de obra especializada:'}
                  </span>
                  <p className="text-xs text-slate-400">
                    {isWebOrApp ? 'Programación completa, maquetación responsive y testing' : 'Montaje, calibración y test de calidad'}
                  </p>
                </div>
                <span className="font-mono text-slate-200">{pricing.laborCost.toFixed(2)} €</span>
              </div>

              <div className="pt-3 border-t border-brand-border/60 flex items-center justify-between text-xs text-slate-400">
                <span>Subtotal (Base Imponible):</span>
                <span className="font-mono font-semibold text-slate-300">{pricing.subtotal.toFixed(2)} €</span>
              </div>

              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>IVA ({pricing.vatRate}%):</span>
                <span className="font-mono font-semibold text-slate-300">{pricing.vatAmount.toFixed(2)} €</span>
              </div>

              <div className="pt-3 border-t border-brand-border flex items-center justify-between text-base font-bold text-white bg-brand-surface/60 -mx-4 -mb-4 p-4 rounded-b-xl">
                <span className="text-brand-green text-glow-subtle">PRECIO TOTAL ESTIMADO:</span>
                <span className="font-mono text-xl text-brand-green font-extrabold">{pricing.total.toFixed(2)} €</span>
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={() => setStep(2)}
              className="px-4 py-2.5 rounded-xl border border-brand-border text-slate-300 hover:text-white text-xs font-semibold flex items-center gap-1.5"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Atrás</span>
            </button>

            <button
              type="button"
              onClick={() => setStep(4)}
              className="px-6 py-3 rounded-xl bg-brand-green hover:bg-brand-green-neon text-black font-extrabold text-sm flex items-center gap-2 shadow-neon transition-all"
            >
              <span>Solicitar este Presupuesto</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 4: DATOS DEL CLIENTE Y ENVÍO */}
      {step === 4 && (
        <form 
          onSubmit={handleSubmitQuote}
          className="bg-brand-carbon/90 border border-brand-border rounded-2xl p-6 sm:p-8 shadow-card backdrop-blur-md animate-fadeIn"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-brand-green text-black text-xs font-black flex items-center justify-center">4</span>
              <span>Datos para emitir tu presupuesto</span>
            </h2>
            <button
              type="button"
              onClick={() => setStep(3)}
              className="text-xs text-slate-400 hover:text-white flex items-center gap-1"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Ver desglose</span>
            </button>
          </div>

          <p className="text-xs text-slate-400 mb-6">
            Te asignaremos inmediatamente un código único de seguimiento (CMF-2026-XXXXX) y podrás descargar o aceptar tu presupuesto digitalmente.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Nombre *
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Tu nombre"
                  required
                  className="w-full bg-brand-dark border border-brand-border rounded-xl pl-9 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-brand-green"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Apellidos *
              </label>
              <input
                type="text"
                value={surname}
                onChange={(e) => setSurname(e.target.value)}
                placeholder="Tus apellidos"
                required
                className="w-full bg-brand-dark border border-brand-border rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-brand-green"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Teléfono de contacto / WhatsApp *
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="Ej. 624 89 20 41"
                  required
                  className="w-full bg-brand-dark border border-brand-border rounded-xl pl-9 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-brand-green"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Correo Electrónico *
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="tuemail@ejemplo.com"
                  required
                  className="w-full bg-brand-dark border border-brand-border rounded-xl pl-9 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-brand-green"
                />
              </div>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Observaciones para el técnico (opcional)
              </label>
              <textarea
                value={observations}
                onChange={(e) => setObservations(e.target.value)}
                rows={2}
                placeholder="¿Prefieres que te contactemos por llamada o WhatsApp? ¿Algún horario preferido?"
                className="w-full bg-brand-dark border border-brand-border rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-brand-green resize-none"
              />
            </div>
          </div>

          {/* Privacy checkbox */}
          <div className="mt-6 pt-4 border-t border-brand-border/60">
            <label className="flex items-start gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={acceptedPrivacy}
                onChange={(e) => setAcceptedPrivacy(e.target.checked)}
                required
                className="mt-0.5 rounded bg-brand-dark border-brand-border text-brand-green focus:ring-0 w-4 h-4 cursor-pointer"
              />
              <span className="text-xs text-slate-400">
                He leído y acepto la <Link to="/privacidad" target="_blank" className="text-brand-green underline hover:text-white">política de privacidad</Link> de CM FIX para la gestión y notificación de mi presupuesto y reparación.
              </span>
            </label>
          </div>

          {/* Submit Button */}
          <div className="mt-8 flex items-center justify-between">
            <button
              type="button"
              onClick={() => setStep(3)}
              className="px-4 py-2.5 rounded-xl border border-brand-border text-slate-300 hover:text-white text-xs font-semibold flex items-center gap-1.5"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Atrás</span>
            </button>

            <button
              type="submit"
              disabled={isSubmitting || !acceptedPrivacy}
              className="px-8 py-3.5 rounded-xl bg-brand-green hover:bg-brand-green-neon text-black font-extrabold text-sm flex items-center gap-2 shadow-neon hover:shadow-neon-strong disabled:opacity-40 disabled:cursor-not-allowed transition-all active:scale-95"
            >
              {isSubmitting ? (
                <span>Generando presupuesto...</span>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Solicitar presupuesto</span>
                </>
              )}
            </button>
          </div>
        </form>
      )}

      {/* STEP 5: SUCCESS & DIRECT ACCESS */}
      {step === 5 && (
        <div className="bg-brand-carbon border border-brand-green/50 rounded-2xl p-8 sm:p-10 shadow-neon text-center animate-fadeIn">
          <div className="w-16 h-16 rounded-2xl bg-brand-green/20 text-brand-green border border-brand-green/40 flex items-center justify-center mx-auto mb-5 shadow-neon">
            <CheckCircle className="w-8 h-8" />
          </div>

          <h2 className="text-2xl sm:text-3xl font-black text-white">
            ¡Presupuesto Generado con Éxito!
          </h2>

          <p className="text-slate-300 text-sm mt-2 max-w-md mx-auto">
            Hemos registrado tu solicitud en el taller de CM FIX con el siguiente número identificador:
          </p>

          <div className="my-6 p-4 rounded-xl bg-brand-surface border border-brand-green inline-block">
            <span className="text-xs text-slate-400 block mb-1">CÓDIGO DE SEGUIMIENTO</span>
            <span className="font-mono text-2xl sm:text-3xl font-black text-brand-green tracking-wider">
              {createdQuoteNumber}
            </span>
          </div>

          <p className="text-xs text-slate-400 max-w-lg mx-auto mb-8">
            Puedes consultar tu presupuesto digital ahora mismo para aceptarlo, descargarlo en PDF oficial o revisar las condiciones de garantía.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link
              to={`/presupuesto/${createdQuoteId || createdQuoteNumber}`}
              className="px-6 py-3.5 rounded-xl bg-brand-green hover:bg-brand-green-neon text-black font-extrabold text-sm flex items-center gap-2 shadow-neon transition-all"
            >
              <FileText className="w-4 h-4" />
              <span>Ver mi Presupuesto Digital</span>
            </Link>

            <Link
              to={`/seguimiento`}
              className="px-6 py-3.5 rounded-xl bg-brand-surface border border-brand-border hover:border-brand-green/50 text-white font-bold text-sm flex items-center gap-2 transition-all"
            >
              <span>Consultar Seguimiento</span>
            </Link>
          </div>

          {/* Acceso directo WhatsApp para Maury y Eli */}
          <div className="mt-8 pt-6 border-t border-brand-border/60 max-w-lg mx-auto">
            <span className="text-xs font-bold text-slate-300 block mb-3">
              ¿Deseas confirmación express? Notifica a los técnicos directamente por WhatsApp:
            </span>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <a
                href={getWhatsAppNotificationUrl('maury', {
                  id: createdQuoteId || '',
                  quote_number: createdQuoteNumber || 'CMF',
                  customer_id: 'online',
                  customer: { id: 'c1', name: `${name} ${surname}`.trim(), phone, email, created_at: '' },
                  device_category: category,
                  device_brand: brand,
                  device_model: model || `${brand} ${category}`,
                  repair_type: repairType,
                  issue_description: issueDescription,
                  photos: [],
                  items: [],
                  subtotal: pricing.subtotal,
                  vat_rate: pricing.vatRate,
                  vat_amount: (pricing.subtotal * pricing.vatRate) / 100,
                  total: pricing.total,
                  is_orientative: true,
                  status: 'PENDIENTE',
                  estimated_time: pricing.estimatedTime,
                  created_at: new Date().toISOString(),
                  valid_until: ''
                })}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-2 shadow-sm transition-all hover:scale-105"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Avisar a Maury (WhatsApp)</span>
              </a>

              <a
                href={getWhatsAppNotificationUrl('eli', {
                  id: createdQuoteId || '',
                  quote_number: createdQuoteNumber || 'CMF',
                  customer_id: 'online',
                  customer: { id: 'c1', name: `${name} ${surname}`.trim(), phone, email, created_at: '' },
                  device_category: category,
                  device_brand: brand,
                  device_model: model || `${brand} ${category}`,
                  repair_type: repairType,
                  issue_description: issueDescription,
                  photos: [],
                  items: [],
                  subtotal: pricing.subtotal,
                  vat_rate: pricing.vatRate,
                  vat_amount: (pricing.subtotal * pricing.vatRate) / 100,
                  total: pricing.total,
                  is_orientative: true,
                  status: 'PENDIENTE',
                  estimated_time: pricing.estimatedTime,
                  created_at: new Date().toISOString(),
                  valid_until: ''
                })}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs flex items-center gap-2 shadow-sm transition-all hover:scale-105"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Avisar al Técnico Eli (WhatsApp)</span>
              </a>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
