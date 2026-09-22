import { 
  Customer, 
  PricingCatalogItem, 
  CompanySettings, 
  Quote, 
  Repair, 
  InventoryItem, 
  Supplier 
} from '../types';

export const INITIAL_COMPANY_SETTINGS: CompanySettings = {
  company_name: 'CM FIX',
  trade_name: 'CM FIX — Tu tecnología en buenas manos',
  cif: 'B-12345678',
  phone: '+34 661 99 10 60',
  whatsapp: '+34 661 99 10 60',
  email: 'cmfixespana@gmail.com',
  website: 'https://cmfix.es',
  address: 'La Línea de la Concepción y alrededores',
  city: 'La Línea de la Concepción (Cádiz)',
  postal_code: '11300',
  default_vat: 21,
  quote_validity_days: 15,
  hourly_labor_rate: 35,
  warranty_terms: 'Todas nuestras reparaciones disponen de 6 meses de garantía legal directa en componentes sustituidos y mano de obra conforme a la normativa española.',
  legal_notice: 'CM FIX cumple con la normativa RGPD para la custodia segura de datos técnicos y personales del cliente.',
  privacy_policy: 'Los datos facilitados serán utilizados exclusivamente para la gestión y notificación del estado de tu reparación.',
  notification_template_status: 'Hola {{cliente}}, tu dispositivo {{dispositivo}} (Orden {{numero}}) ha pasado al estado: {{estado}}.',
  notification_template_quote: 'Hola {{cliente}}, el presupuesto para tu {{dispositivo}} está listo por un total de {{total}} €.'
};

export const INITIAL_SUPPLIERS: Supplier[] = [
  {
    id: 'sup-1',
    name: 'ElectroRepuestos España',
    contact_person: 'Carlos Gómez',
    phone: '+34 912 345 678',
    email: 'pedidos@electrorepuestos.es',
    website: 'https://electrorepuestos.es',
    notes: 'Proveedor principal pantallas OLED iPhone y Samsung Service Pack'
  },
  {
    id: 'sup-2',
    name: 'TechParts Europa',
    contact_person: 'Laura Méndez',
    phone: '+34 934 567 890',
    email: 'contacto@techpartseu.com',
    website: 'https://techpartseu.com',
    notes: 'Baterías originales, puertos de carga y pasta térmica Thermal Grizzly'
  },
  {
    id: 'sup-3',
    name: 'Silicon Wholesale Distribution',
    contact_person: 'Marcos Rivas',
    phone: '+34 961 112 233',
    email: 'ventas@silicondist.es',
    website: 'https://silicondist.es',
    notes: 'Discos SSD Kingston/Crucial, memorias RAM DDR4/DDR5'
  }
];

export const INITIAL_INVENTORY: InventoryItem[] = [
  {
    id: 'inv-1',
    sku: 'PAN-IPH-13PRO',
    name: 'Pantalla OLED iPhone 13 Pro (Calidad Original)',
    category: 'iPhone',
    device_brand: 'Apple',
    device_model: 'iPhone 13 Pro',
    supplier_id: 'sup-1',
    supplier_name: 'ElectroRepuestos España',
    cost: 110.00,
    price: 185.00,
    stock: 4,
    min_stock: 2,
    notes: 'Incluye adhesivo sellado estanqueidad'
  },
  {
    id: 'inv-2',
    sku: 'BAT-IPH-13PRO',
    name: 'Batería High Capacity iPhone 13 Pro',
    category: 'iPhone',
    device_brand: 'Apple',
    device_model: 'iPhone 13 Pro',
    supplier_id: 'sup-2',
    supplier_name: 'TechParts Europa',
    cost: 18.00,
    price: 49.00,
    stock: 6,
    min_stock: 3
  },
  {
    id: 'inv-3',
    sku: 'PAN-SAM-S23',
    name: 'Pantalla AMOLED Samsung Galaxy S23 Service Pack',
    category: 'Samsung',
    device_brand: 'Samsung',
    device_model: 'Galaxy S23',
    supplier_id: 'sup-1',
    supplier_name: 'ElectroRepuestos España',
    cost: 125.00,
    price: 195.00,
    stock: 1, // ALERTA STOCK BAJO
    min_stock: 2,
    notes: 'Marco metálico incluido'
  },
  {
    id: 'inv-4',
    sku: 'SSD-CRU-1TB',
    name: 'SSD Crucial P3 Plus 1TB M.2 PCIe Gen4 NVMe',
    category: 'Componentes',
    device_brand: 'Universal',
    device_model: 'PC / Portátil M.2',
    supplier_id: 'sup-3',
    supplier_name: 'Silicon Wholesale Distribution',
    cost: 52.00,
    price: 89.00,
    stock: 8,
    min_stock: 3
  },
  {
    id: 'inv-5',
    sku: 'RAM-COR-16GB',
    name: 'Memoria RAM DDR4 16GB 3200MHz Corsair Vengeance',
    category: 'Componentes',
    device_brand: 'Universal',
    device_model: 'PC Sobremesa',
    supplier_id: 'sup-3',
    supplier_name: 'Silicon Wholesale Distribution',
    cost: 32.00,
    price: 55.00,
    stock: 5,
    min_stock: 2
  },
  {
    id: 'inv-6',
    sku: 'CON-SAM-S23',
    name: 'Placa Conector de Carga USB-C Galaxy S23',
    category: 'Samsung',
    device_brand: 'Samsung',
    device_model: 'Galaxy S23',
    supplier_id: 'sup-2',
    supplier_name: 'TechParts Europa',
    cost: 12.00,
    price: 38.00,
    stock: 0, // SIN STOCK
    min_stock: 2
  }
];

export const INITIAL_PRICING_CATALOG: PricingCatalogItem[] = [
  // iPhone
  {
    id: 'pr-1',
    category: 'iPhone',
    brand: 'Apple',
    model: 'iPhone 13 Pro',
    repair_type: 'Cambio de pantalla OLED',
    part_cost: 110.00,
    labor_cost: 35.00,
    sale_price: 185.00,
    margin: 40.00,
    estimated_time: '1-2 horas',
    supplier_ref: 'PAN-IPH-13PRO'
  },
  {
    id: 'pr-2',
    category: 'iPhone',
    brand: 'Apple',
    model: 'iPhone 13 Pro',
    repair_type: 'Cambio de batería',
    part_cost: 18.00,
    labor_cost: 25.00,
    sale_price: 49.00,
    margin: 6.00,
    estimated_time: '45 minutos',
    supplier_ref: 'BAT-IPH-13PRO'
  },
  {
    id: 'pr-3',
    category: 'iPhone',
    brand: 'Apple',
    model: 'iPhone 14 / 14 Pro',
    repair_type: 'Cambio de pantalla OLED',
    part_cost: 135.00,
    labor_cost: 40.00,
    sale_price: 215.00,
    margin: 40.00,
    estimated_time: '1-2 horas'
  },
  {
    id: 'pr-4',
    category: 'iPhone',
    brand: 'Apple',
    model: 'iPhone 12 / 12 Pro',
    repair_type: 'Cambio de batería',
    part_cost: 16.00,
    labor_cost: 25.00,
    sale_price: 45.00,
    margin: 4.00,
    estimated_time: '45 minutos'
  },
  // Samsung
  {
    id: 'pr-5',
    category: 'Samsung',
    brand: 'Samsung',
    model: 'Galaxy S23',
    repair_type: 'Cambio de pantalla AMOLED',
    part_cost: 125.00,
    labor_cost: 35.00,
    sale_price: 195.00,
    margin: 35.00,
    estimated_time: '2-3 horas',
    supplier_ref: 'PAN-SAM-S23'
  },
  {
    id: 'pr-6',
    category: 'Samsung',
    brand: 'Samsung',
    model: 'Galaxy S23',
    repair_type: 'Conector de carga USB-C',
    part_cost: 12.00,
    labor_cost: 30.00,
    sale_price: 55.00,
    margin: 13.00,
    estimated_time: '1 hora'
  },
  // Xiaomi
  {
    id: 'pr-7',
    category: 'Xiaomi',
    brand: 'Xiaomi',
    model: 'Xiaomi 13 / Redmi Note 12',
    repair_type: 'Cambio de pantalla',
    part_cost: 45.00,
    labor_cost: 30.00,
    sale_price: 89.00,
    margin: 14.00,
    estimated_time: '1-2 horas'
  },
  // PC / Portátil
  {
    id: 'pr-8',
    category: 'Portátil',
    brand: 'Cualquiera',
    model: 'Portátil Windows / Mac',
    repair_type: 'Limpieza interna y pasta térmica',
    part_cost: 8.00,
    labor_cost: 37.00,
    sale_price: 45.00,
    margin: 0.00,
    estimated_time: '24 horas',
    notes: 'Thermal Grizzly Kryonaut + limpieza ventiladores a presión'
  },
  {
    id: 'pr-9',
    category: 'PC',
    brand: 'Sobremesa',
    model: 'Cualquier Torre',
    repair_type: 'Instalación Windows 11 + Optimización',
    part_cost: 0.00,
    labor_cost: 40.00,
    sale_price: 40.00,
    margin: 0.00,
    estimated_time: '24 horas',
    notes: 'Drivers oficiales, antivirus configurado y copia de seguridad opcional'
  },
  {
    id: 'pr-10',
    category: 'PC',
    brand: 'Sobremesa / Portátil',
    model: 'Universal',
    repair_type: 'Cambio a disco SSD NVMe 1TB + Clonado',
    part_cost: 52.00,
    labor_cost: 38.00,
    sale_price: 110.00,
    margin: 20.00,
    estimated_time: '24 horas',
    supplier_ref: 'SSD-CRU-1TB'
  }
];

export const INITIAL_CUSTOMERS: Customer[] = [
  {
    id: 'cust-1',
    name: 'Alejandro Serrano Morales',
    phone: '+34 611 223 344',
    email: 'alejandro.serrano@gmail.com',
    address: 'Av. de América 28, 3ºB, Madrid',
    notes: 'Cliente habitual, siempre solicita factura.',
    created_at: '2026-09-10T10:15:00Z',
    total_spent: 185.00,
    repairs_count: 1
  },
  {
    id: 'cust-2',
    name: 'Lucía Fernández Ramos',
    phone: '+34 655 443 322',
    email: 'lucia.fdez@hotmail.com',
    address: 'Calle Mayor 12, Getafe',
    notes: 'Necesita el móvil urgente por trabajo.',
    created_at: '2026-09-15T14:30:00Z',
    total_spent: 49.00,
    repairs_count: 1
  },
  {
    id: 'cust-3',
    name: 'David Martínez Vilar',
    phone: '+34 688 990 011',
    email: 'david.mtnez@empresa.es',
    address: 'Paseo de la Castellana 120, Madrid',
    created_at: '2026-09-20T09:00:00Z',
    total_spent: 110.00,
    repairs_count: 1
  }
];

export const INITIAL_QUOTES: Quote[] = [
  {
    id: 'quote-1',
    quote_number: 'CMF-2026-00001',
    customer_id: 'cust-1',
    customer: INITIAL_CUSTOMERS[0],
    device_category: 'iPhone',
    device_brand: 'Apple',
    device_model: 'iPhone 13 Pro',
    repair_type: 'Cambio de pantalla OLED',
    issue_description: 'Cristal roto tras caída y manchas moradas en el panel táctil.',
    items: [
      { id: 'qi-1', description: 'Pantalla OLED Calidad Original iPhone 13 Pro', type: 'PART', cost: 110, price: 150, quantity: 1 },
      { id: 'qi-2', description: 'Mano de obra especializada y sellado estanco', type: 'LABOR', cost: 0, price: 35, quantity: 1 }
    ],
    subtotal: 185.00,
    vat_rate: 21,
    vat_amount: 38.85,
    total: 223.85,
    is_orientative: false,
    status: 'ACEPTADO',
    estimated_time: '1-2 horas',
    created_at: '2026-09-10T10:20:00Z',
    accepted_at: '2026-09-10T11:00:00Z',
    valid_until: '2026-09-25',
    notes: 'Presupuesto aceptado por el cliente en local.'
  },
  {
    id: 'quote-2',
    quote_number: 'CMF-2026-00002',
    customer_id: 'cust-2',
    customer: INITIAL_CUSTOMERS[1],
    device_category: 'Samsung',
    device_brand: 'Samsung',
    device_model: 'Galaxy S23',
    repair_type: 'Conector de carga USB-C',
    issue_description: 'El cable baila y solo carga haciendo presión en ángulo.',
    items: [
      { id: 'qi-3', description: 'Módulo de carga USB-C Samsung S23', type: 'PART', cost: 12, price: 25, quantity: 1 },
      { id: 'qi-4', description: 'Mano de obra y micro-soldadura', type: 'LABOR', cost: 0, price: 30, quantity: 1 }
    ],
    subtotal: 55.00,
    vat_rate: 21,
    vat_amount: 11.55,
    total: 66.55,
    is_orientative: true,
    status: 'PENDIENTE',
    estimated_time: '24 horas',
    created_at: '2026-09-21T16:45:00Z',
    valid_until: '2026-10-06'
  },
  {
    id: 'quote-3',
    quote_number: 'CMF-2026-00003',
    customer_id: 'cust-3',
    customer: INITIAL_CUSTOMERS[2],
    device_category: 'PC',
    device_brand: 'Sobremesa Gaming',
    device_model: 'Intel i7 / RTX 3070',
    repair_type: 'Ampliación SSD 1TB + Instalación SO',
    issue_description: 'Disco duro mecánico muy lento. Desea pasar a SSD NVMe de alta velocidad.',
    items: [
      { id: 'qi-5', description: 'SSD Crucial P3 Plus 1TB NVMe PCIe 4.0', type: 'PART', cost: 52, price: 80, quantity: 1 },
      { id: 'qi-6', description: 'Instalación de SO, configuración y clonado de datos', type: 'LABOR', cost: 0, price: 40, quantity: 1 }
    ],
    subtotal: 120.00,
    vat_rate: 21,
    vat_amount: 25.20,
    total: 145.20,
    is_orientative: true,
    status: 'PENDIENTE',
    estimated_time: '24-48 horas',
    created_at: '2026-09-22T08:30:00Z',
    valid_until: '2026-10-07'
  }
];

export const INITIAL_REPAIRS: Repair[] = [
  {
    id: 'rep-1',
    repair_number: 'CMF-2026-00001',
    quote_id: 'quote-1',
    customer_id: 'cust-1',
    customer: INITIAL_CUSTOMERS[0],
    device_category: 'iPhone',
    device_brand: 'Apple',
    device_model: 'iPhone 13 Pro',
    serial_imei: '356890123456789',
    issue_description: 'Pantalla rota y sin respuesta táctil en zona superior.',
    diagnosis: 'Rotura física de cristal y digitalizador. Componentes internos en perfecto estado.',
    work_performed: 'Sustitución de pantalla OLED original con transferencia True Tone y junta adhesiva resistente al agua.',
    cost_total: 110.00,
    price_total: 185.00,
    profit: 75.00,
    status: 'LISTO PARA RECOGER',
    entry_date: '2026-09-10T10:30:00Z',
    estimated_date: '2026-09-10T14:00:00Z',
    completion_date: '2026-09-10T13:45:00Z',
    notes_internal: 'True Tone programado con reprogramadora i2C.',
    notes_public: 'Tu iPhone 13 Pro ya está impecable y verificado al 100%. Puedes pasar a recogerlo en tienda cuando desees.',
    status_history: [
      { id: 'h-1', repair_id: 'rep-1', status: 'RECIBIDO', notes: 'Dispositivo recibido en tienda física.', created_at: '2026-09-10T10:30:00Z' },
      { id: 'h-2', repair_id: 'rep-1', status: 'DIAGNÓSTICO', notes: 'Diagnóstico confirmado. Batería al 88%, placa perfecta.', created_at: '2026-09-10T11:15:00Z' },
      { id: 'h-3', repair_id: 'rep-1', status: 'APROBADO', notes: 'Presupuesto CMF-2026-00001 aceptado.', created_at: '2026-09-10T11:20:00Z' },
      { id: 'h-4', repair_id: 'rep-1', status: 'EN REPARACIÓN', notes: 'Desmontaje y montaje de nuevo panel OLED.', created_at: '2026-09-10T12:00:00Z' },
      { id: 'h-5', repair_id: 'rep-1', status: 'REPARADO', notes: 'Pruebas táctiles, FaceID y True Tone superadas con éxito.', created_at: '2026-09-10T13:30:00Z' },
      { id: 'h-6', repair_id: 'rep-1', status: 'LISTO PARA RECOGER', notes: 'Aviso enviado al cliente.', created_at: '2026-09-10T13:45:00Z' }
    ]
  },
  {
    id: 'rep-2',
    repair_number: 'CMF-2026-00002',
    customer_id: 'cust-2',
    customer: INITIAL_CUSTOMERS[1],
    device_category: 'Portátil',
    device_brand: 'HP',
    device_model: 'Pavilion 15 Gaming',
    serial_imei: '5CD1234XYZ',
    issue_description: 'Se calienta excesivamente y los ventiladores hacen mucho ruido.',
    diagnosis: 'Obstrucción severa por polvo en disipadores y pasta térmica completamente seca y solidificada.',
    work_performed: 'Limpieza completa ultrasonidos de aspas, soplado de conductos y aplicación de pasta térmica Thermal Grizzly Kryonaut.',
    cost_total: 8.00,
    price_total: 45.00,
    profit: 37.00,
    status: 'EN REPARACIÓN',
    entry_date: '2026-09-21T11:00:00Z',
    estimated_date: '2026-09-22T17:00:00Z',
    notes_internal: 'Temperatura inicial en reposo: 72ºC. Esperando bajar a < 45ºC.',
    notes_public: 'Estamos finalizando el cambio de pasta térmica y tests de temperatura bajo estrés.',
    status_history: [
      { id: 'h-7', repair_id: 'rep-2', status: 'RECIBIDO', notes: 'Portátil recibido con cargador original.', created_at: '2026-09-21T11:00:00Z' },
      { id: 'h-8', repair_id: 'rep-2', status: 'DIAGNÓSTICO', notes: 'Thermal throttling detectado al 98% de carga.', created_at: '2026-09-21T12:30:00Z' },
      { id: 'h-9', repair_id: 'rep-2', status: 'EN REPARACIÓN', notes: 'Desmontaje en banco técnico.', created_at: '2026-09-22T09:30:00Z' }
    ]
  }
];
