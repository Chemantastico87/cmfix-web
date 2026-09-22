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

export const INITIAL_CUSTOMERS: Customer[] = [];

export const INITIAL_QUOTES: Quote[] = [];

export const INITIAL_REPAIRS: Repair[] = [];
