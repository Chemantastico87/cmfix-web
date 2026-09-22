export type DeviceCategory = 
  | 'iPhone'
  | 'Samsung'
  | 'Xiaomi'
  | 'Android'
  | 'PC'
  | 'Portátil'
  | 'Mac'
  | 'Tablet'
  | 'Consola'
  | 'Página Web'
  | 'App Móvil'
  | 'Otro';

export type RepairStatus =
  | 'RECIBIDO'
  | 'DIAGNÓSTICO'
  | 'PRESUPUESTO'
  | 'ESPERANDO APROBACIÓN'
  | 'APROBADO'
  | 'EN REPARACIÓN'
  | 'ESPERANDO PIEZA'
  | 'REPARADO'
  | 'LISTO PARA RECOGER'
  | 'ENTREGADO'
  | 'CANCELADO';

export type QuoteStatus =
  | 'PENDIENTE'
  | 'ENVIADO'
  | 'ACEPTADO'
  | 'RECHAZADO'
  | 'CADUCADO';

export type UserRole = 'ADMIN' | 'TECNICO' | 'RECEPCION';

export interface Customer {
  id: string;
  name: string;
  phone: string;
  email: string;
  address?: string;
  notes?: string;
  created_at: string;
  total_spent?: number;
  repairs_count?: number;
}

export interface QuoteItem {
  id: string;
  description: string;
  type: 'PART' | 'LABOR' | 'OTHER';
  cost: number;
  price: number;
  quantity: number;
}

export interface Quote {
  id: string;
  quote_number: string; // e.g. CMF-2026-00001
  customer_id: string;
  customer?: Customer;
  device_category: DeviceCategory;
  device_brand: string;
  device_model: string;
  repair_type: string;
  issue_description: string;
  photos?: string[];
  items: QuoteItem[];
  subtotal: number;
  vat_rate: number; // e.g. 21
  vat_amount: number;
  total: number;
  is_orientative: boolean;
  status: QuoteStatus;
  estimated_time: string;
  created_at: string;
  accepted_at?: string;
  rejected_at?: string;
  valid_until: string;
  notes?: string;
}

export interface RepairStatusHistory {
  id: string;
  repair_id: string;
  status: RepairStatus;
  notes?: string;
  created_at: string;
  changed_by?: string;
}

export interface Repair {
  id: string;
  repair_number: string; // e.g. CMF-2026-00001
  quote_id?: string;
  customer_id: string;
  customer?: Customer;
  device_category: DeviceCategory;
  device_brand: string;
  device_model: string;
  serial_imei?: string;
  issue_description: string;
  diagnosis?: string;
  work_performed?: string;
  parts_used?: {
    inventory_id?: string;
    name: string;
    cost: number;
    price: number;
    quantity: number;
  }[];
  cost_total: number;
  price_total: number;
  profit: number;
  status: RepairStatus;
  entry_date: string;
  estimated_date?: string;
  completion_date?: string;
  notes_internal?: string;
  notes_public?: string;
  photos?: string[];
  status_history: RepairStatusHistory[];
}

export interface InventoryItem {
  id: string;
  sku: string;
  name: string;
  category: DeviceCategory | 'Componentes' | 'Consumibles' | 'Herramientas';
  device_brand: string;
  device_model: string;
  supplier_id?: string;
  supplier_name?: string;
  cost: number;
  price: number;
  stock: number;
  min_stock: number;
  notes?: string;
}

export interface Supplier {
  id: string;
  name: string;
  contact_person?: string;
  phone?: string;
  email?: string;
  website?: string;
  notes?: string;
}

export interface PricingCatalogItem {
  id: string;
  category: DeviceCategory;
  brand: string;
  model: string;
  repair_type: string;
  part_cost: number;
  labor_cost: number;
  sale_price: number;
  margin: number;
  estimated_time: string;
  supplier_ref?: string;
  notes?: string;
}

export interface CompanySettings {
  company_name: string;
  trade_name: string;
  cif: string;
  phone: string;
  whatsapp: string;
  email: string;
  website: string;
  address: string;
  city: string;
  postal_code: string;
  default_vat: number; // 21
  quote_validity_days: number; // 15
  hourly_labor_rate: number; // 40
  warranty_terms: string;
  legal_notice: string;
  privacy_policy: string;
  notification_template_status: string;
  notification_template_quote: string;
}

export interface DashboardStats {
  pending_quotes_count: number;
  in_progress_repairs_count: number;
  ready_repairs_count: number;
  low_stock_count: number;
  total_customers_count: number;
  total_revenue: number;
  total_profit: number;
}
