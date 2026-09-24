import { 
  Customer, 
  Quote, 
  Repair, 
  RepairStatus, 
  QuoteStatus, 
  InventoryItem, 
  Supplier, 
  PricingCatalogItem, 
  CompanySettings, 
  DashboardStats 
} from '../types';
import { 
  INITIAL_COMPANY_SETTINGS, 
  INITIAL_SUPPLIERS, 
  INITIAL_INVENTORY, 
  INITIAL_PRICING_CATALOG, 
  INITIAL_CUSTOMERS, 
  INITIAL_QUOTES, 
  INITIAL_REPAIRS 
} from './seedData';
import { supabase, isSupabaseConfigured } from './supabase';
import { notifyNewQuote } from './notificationService';

const STORAGE_KEYS = {
  SETTINGS: 'cmfix_settings',
  SUPPLIERS: 'cmfix_suppliers',
  INVENTORY: 'cmfix_inventory',
  PRICING: 'cmfix_pricing',
  CUSTOMERS: 'cmfix_customers',
  QUOTES: 'cmfix_quotes',
  REPAIRS: 'cmfix_repairs',
  SEQ: 'cmfix_counter'
};

function getLocal<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function setLocal<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (err) {
    console.error(`Error saving ${key} to localStorage:`, err);
  }
}

export function initLocalDatabase(force = false) {
  const existingSettings = getLocal<CompanySettings | null>(STORAGE_KEYS.SETTINGS, null);
  // Auto-upgrade if previous session had old Madrid address or old placeholder phone
  const needsSettingsUpgrade = force || !existingSettings || 
    existingSettings.address?.includes('Madrid') || 
    existingSettings.city?.includes('Madrid') ||
    existingSettings.phone?.includes('624 89 20 41') ||
    existingSettings.phone?.includes('600 000 000');

  if (needsSettingsUpgrade) {
    setLocal(STORAGE_KEYS.SETTINGS, INITIAL_COMPANY_SETTINGS);
  }

  // Check if customers/repairs contain old Madrid demo data ("Alejandro Serrano")
  const existingCustomers = getLocal<Customer[]>(STORAGE_KEYS.CUSTOMERS, []);
  if (existingCustomers.some(c => c.name?.includes('Alejandro Serrano') || c.address?.includes('Madrid'))) {
    setLocal(STORAGE_KEYS.CUSTOMERS, []);
    setLocal(STORAGE_KEYS.QUOTES, []);
    setLocal(STORAGE_KEYS.REPAIRS, []);
  }

  if (!localStorage.getItem(STORAGE_KEYS.SUPPLIERS)) {
    setLocal(STORAGE_KEYS.SUPPLIERS, INITIAL_SUPPLIERS);
  }
  if (!localStorage.getItem(STORAGE_KEYS.INVENTORY)) {
    setLocal(STORAGE_KEYS.INVENTORY, INITIAL_INVENTORY);
  }
  if (!localStorage.getItem(STORAGE_KEYS.PRICING)) {
    setLocal(STORAGE_KEYS.PRICING, INITIAL_PRICING_CATALOG);
  }
  if (!localStorage.getItem(STORAGE_KEYS.SEQ)) {
    setLocal(STORAGE_KEYS.SEQ, 1);
  }
}

// Auto-run initialization check
initLocalDatabase(false);

function getNextCode(prefix = 'CMF'): string {
  const current = getLocal<number>(STORAGE_KEYS.SEQ, 1);
  const next = current + 1;
  setLocal(STORAGE_KEYS.SEQ, next);
  const year = new Date().getFullYear();
  const numStr = String(current).padStart(5, '0');
  return `${prefix}-${year}-${numStr}`;
}

export const dbService = {
  // --- Clean Workshop Helper ---
  resetToCleanWorkshop(): void {
    setLocal(STORAGE_KEYS.SETTINGS, INITIAL_COMPANY_SETTINGS);
    setLocal(STORAGE_KEYS.CUSTOMERS, []);
    setLocal(STORAGE_KEYS.QUOTES, []);
    setLocal(STORAGE_KEYS.REPAIRS, []);
    setLocal(STORAGE_KEYS.SEQ, 1);
  },

  // --- Company Settings ---
  async getCompanySettings(): Promise<CompanySettings> {
    const local = getLocal<CompanySettings>(STORAGE_KEYS.SETTINGS, INITIAL_COMPANY_SETTINGS);
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase.from('company_settings').select('*').single();
        if (!error && data) {
          const merged: CompanySettings = {
            ...INITIAL_COMPANY_SETTINGS,
            ...local,
            company_name: data.company_name || local.company_name || INITIAL_COMPANY_SETTINGS.company_name,
            trade_name: local.trade_name || INITIAL_COMPANY_SETTINGS.trade_name,
            phone: data.phone || local.phone || INITIAL_COMPANY_SETTINGS.phone,
            whatsapp: data.whatsapp || local.whatsapp || INITIAL_COMPANY_SETTINGS.whatsapp,
            email: data.email || local.email || INITIAL_COMPANY_SETTINGS.email,
            address: data.address || local.address || INITIAL_COMPANY_SETTINGS.address,
            city: local.city || INITIAL_COMPANY_SETTINGS.city,
            cif: data.cif || local.cif || INITIAL_COMPANY_SETTINGS.cif,
            default_vat: data.tax_rate ?? local.default_vat ?? 21,
            quote_validity_days: data.default_warranty_months ?? local.quote_validity_days ?? 15
          };
          setLocal(STORAGE_KEYS.SETTINGS, merged);
          return merged;
        }
      } catch (err) {
        console.warn('Error reading company_settings from Supabase:', err);
      }
    }
    return local;
  },

  async updateCompanySettings(settings: Partial<CompanySettings>): Promise<CompanySettings> {
    const current = await this.getCompanySettings();
    const updated = { ...current, ...settings };
    
    // Guardar en Supabase solo las columnas que la base de datos realmente tiene
    if (isSupabaseConfigured && supabase) {
      try {
        const sbPayload: Record<string, any> = {
          updated_at: new Date().toISOString()
        };
        if (settings.company_name !== undefined) sbPayload.company_name = settings.company_name;
        if (settings.cif !== undefined) sbPayload.cif = settings.cif;
        if (settings.phone !== undefined) sbPayload.phone = settings.phone;
        if (settings.whatsapp !== undefined) sbPayload.whatsapp = settings.whatsapp;
        if (settings.email !== undefined) sbPayload.email = settings.email;
        if (settings.address !== undefined) sbPayload.address = settings.address;
        if (settings.default_vat !== undefined) sbPayload.tax_rate = settings.default_vat;
        if (settings.quote_validity_days !== undefined) sbPayload.default_warranty_months = settings.quote_validity_days;

        await supabase.from('company_settings').update(sbPayload).eq('id', 1);
      } catch (err) {
        console.warn('Error updating company_settings in Supabase:', err);
      }
    }
    setLocal(STORAGE_KEYS.SETTINGS, updated);
    return updated;
  },

  // --- Pricing Catalog ---
  async getPricingCatalog(): Promise<PricingCatalogItem[]> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.from('pricing_catalog').select('*').order('brand');
      if (!error && data) return data as PricingCatalogItem[];
    }
    return getLocal<PricingCatalogItem[]>(STORAGE_KEYS.PRICING, INITIAL_PRICING_CATALOG);
  },

  async addPricingItem(item: Omit<PricingCatalogItem, 'id' | 'margin'>): Promise<PricingCatalogItem> {
    const margin = item.sale_price - (item.part_cost + item.labor_cost);
    const newItem: PricingCatalogItem = {
      id: 'pr-' + Date.now(),
      ...item,
      margin
    };
    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('pricing_catalog').insert([{
          category: item.category,
          brand: item.brand,
          model: item.model,
          issue_type: item.repair_type,
          part_cost: item.part_cost,
          labor_cost: item.labor_cost,
          final_price: item.sale_price,
          warranty_months: 6,
          is_active: true
        }]);
      } catch (err) {
        console.warn('Error saving pricing item to Supabase:', err);
      }
    }
    const current = getLocal<PricingCatalogItem[]>(STORAGE_KEYS.PRICING, INITIAL_PRICING_CATALOG);
    const updated = [newItem, ...current];
    setLocal(STORAGE_KEYS.PRICING, updated);
    return newItem;
  },

  async updatePricingItem(id: string, item: Partial<PricingCatalogItem>): Promise<PricingCatalogItem | null> {
    const current = getLocal<PricingCatalogItem[]>(STORAGE_KEYS.PRICING, INITIAL_PRICING_CATALOG);
    const index = current.findIndex(p => p.id === id);
    if (index === -1) return null;
    const updatedItem = { ...current[index], ...item };
    if (item.sale_price !== undefined || item.part_cost !== undefined || item.labor_cost !== undefined) {
      updatedItem.margin = updatedItem.sale_price - (updatedItem.part_cost + updatedItem.labor_cost);
    }
    current[index] = updatedItem;
    setLocal(STORAGE_KEYS.PRICING, current);
    if (isSupabaseConfigured && supabase) {
      try {
        const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
        if (isUuid) {
          const sbPayload: Record<string, any> = {};
          if (item.category !== undefined) sbPayload.category = item.category;
          if (item.brand !== undefined) sbPayload.brand = item.brand;
          if (item.model !== undefined) sbPayload.model = item.model;
          if (item.repair_type !== undefined) sbPayload.issue_type = item.repair_type;
          if (item.part_cost !== undefined) sbPayload.part_cost = item.part_cost;
          if (item.labor_cost !== undefined) sbPayload.labor_cost = item.labor_cost;
          if (item.sale_price !== undefined) sbPayload.final_price = item.sale_price;
          await supabase.from('pricing_catalog').update(sbPayload).eq('id', id);
        }
      } catch (err) {
        console.warn('Error updating pricing item in Supabase:', err);
      }
    }
    return updatedItem;
  },

  async deletePricingItem(id: string): Promise<boolean> {
    const current = getLocal<PricingCatalogItem[]>(STORAGE_KEYS.PRICING, INITIAL_PRICING_CATALOG);
    const filtered = current.filter(p => p.id !== id);
    setLocal(STORAGE_KEYS.PRICING, filtered);
    if (isSupabaseConfigured && supabase) {
      await supabase.from('pricing_catalog').delete().eq('id', id);
    }
    return true;
  },

  // --- Customers ---
  async getCustomers(): Promise<Customer[]> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.from('customers').select('*').order('created_at', { ascending: false });
      if (!error && data) return data as Customer[];
    }
    return getLocal<Customer[]>(STORAGE_KEYS.CUSTOMERS, INITIAL_CUSTOMERS);
  },

  async getCustomerById(id: string): Promise<Customer | null> {
    const customers = await this.getCustomers();
    return customers.find(c => c.id === id) || null;
  },

  async createCustomer(data: Omit<Customer, 'id' | 'created_at'>): Promise<Customer> {
    const existing = (await this.getCustomers()).find(
      c => (data.phone && c.phone && c.phone.trim().replace(/\s+/g, '') === data.phone.trim().replace(/\s+/g, '')) || 
           (data.email && c.email && c.email.toLowerCase().trim() === data.email.toLowerCase().trim())
    );
    if (existing) {
      return existing;
    }

    let customerId = 'cust-' + Date.now();
    if (isSupabaseConfigured && supabase) {
      try {
        const { data: dbCust, error: custErr } = await supabase.from('customers').insert([{
          name: data.name,
          phone: data.phone,
          email: data.email,
          address: data.address || null,
          notes: data.notes || null
        }]).select().single();

        if (!custErr && dbCust?.id) {
          customerId = dbCust.id;
        } else if (custErr) {
          console.warn('Supabase customer insert warning:', custErr);
        }
      } catch (err) {
        console.warn('Error saving customer to Supabase:', err);
      }
    }

    const newCustomer: Customer = {
      id: customerId,
      name: data.name,
      phone: data.phone,
      email: data.email,
      address: data.address,
      notes: data.notes,
      created_at: new Date().toISOString(),
      repairs_count: 0,
      total_spent: 0
    };

    const current = getLocal<Customer[]>(STORAGE_KEYS.CUSTOMERS, INITIAL_CUSTOMERS);
    setLocal(STORAGE_KEYS.CUSTOMERS, [newCustomer, ...current]);
    return newCustomer;
  },

  // --- Quotes ---
  async getQuotes(): Promise<Quote[]> {
    const localQuotes = getLocal<Quote[]>(STORAGE_KEYS.QUOTES, INITIAL_QUOTES);
    const customers = await this.getCustomers();

    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from('quotes')
          .select('*, customer:customers(*)')
          .order('created_at', { ascending: false });

        if (!error && data) {
          const dbMapped: Quote[] = data.map((d: any) => ({
            id: d.id,
            quote_number: d.quote_number,
            customer_id: d.customer_id,
            customer: d.customer || customers.find(c => c.id === d.customer_id),
            device_category: d.device_category,
            device_brand: d.brand || d.device_brand || 'Dispositivo',
            device_model: d.model || d.device_model || '',
            repair_type: d.issue_type || d.repair_type || 'Reparación',
            issue_description: d.description || d.issue_description || '',
            photos: [],
            items: [
              {
                id: 'qi-' + d.id,
                description: `${d.issue_type || 'Reparación'} para ${d.brand || ''} ${d.model || ''}`.trim(),
                type: 'PART',
                cost: (Number(d.subtotal) || 0) * 0.5,
                price: Number(d.subtotal) || 0,
                quantity: 1
              }
            ],
            subtotal: Number(d.subtotal) || 0,
            vat_rate: 21,
            vat_amount: Number(d.tax || d.vat_amount) || 0,
            total: Number(d.total) || 0,
            is_orientative: true,
            status: d.status || 'PENDIENTE',
            estimated_time: '24-48 horas',
            created_at: d.created_at || new Date().toISOString(),
            valid_until: d.expires_at ? d.expires_at.split('T')[0] : new Date(Date.now() + 15 * 86400000).toISOString().split('T')[0]
          }));

          // Merge Supabase quotes with local quotes (never lose local or remote quotes)
          const map = new Map<string, Quote>();
          dbMapped.forEach(q => {
            map.set(q.id, q);
            if (q.quote_number) map.set(q.quote_number.toUpperCase(), q);
          });
          localQuotes.forEach(q => {
            const hasById = map.has(q.id);
            const hasByNum = q.quote_number ? map.has(q.quote_number.toUpperCase()) : false;
            if (!hasById && !hasByNum) {
              map.set(q.id, {
                ...q,
                customer: customers.find(c => c.id === q.customer_id) || q.customer
              });
            }
          });
          const merged = Array.from(new Set(map.values()));
          setLocal(STORAGE_KEYS.QUOTES, merged);
          return merged;
        }
      } catch (err) {
        console.warn('Error fetching quotes from Supabase:', err);
      }
    }

    return localQuotes.map(q => ({
      ...q,
      customer: customers.find(c => c.id === q.customer_id) || q.customer
    }));
  },

  async getQuoteById(id: string): Promise<Quote | null> {
    if (!id) return null;
    const cleanId = id.trim().toLowerCase();
    const quotes = await this.getQuotes();
    const found = quotes.find(q => 
      q.id.toLowerCase() === cleanId || 
      (q.quote_number && q.quote_number.toLowerCase() === cleanId)
    );
    if (found) return found;

    // Direct fallback search in Supabase if not yet synced locally
    if (isSupabaseConfigured && supabase) {
      try {
        const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id.trim());
        let query = supabase.from('quotes').select('*, customer:customers(*)');
        if (isUuid) {
          query = query.or(`id.eq.${id.trim()},quote_number.ilike.${id.trim()}`);
        } else {
          query = query.ilike('quote_number', id.trim());
        }
        const { data } = await query.maybeSingle();
        if (data) {
          const singleQuote: Quote = {
            id: data.id,
            quote_number: data.quote_number,
            customer_id: data.customer_id,
            customer: data.customer,
            device_category: data.device_category,
            device_brand: data.brand || 'Dispositivo',
            device_model: data.model || '',
            repair_type: data.issue_type || 'Reparación',
            issue_description: data.description || '',
            photos: [],
            items: [
              {
                id: 'qi-' + data.id,
                description: `${data.issue_type || 'Reparación'} para ${data.brand || ''} ${data.model || ''}`.trim(),
                type: 'PART',
                cost: (Number(data.subtotal) || 0) * 0.5,
                price: Number(data.subtotal) || 0,
                quantity: 1
              }
            ],
            subtotal: Number(data.subtotal) || 0,
            vat_rate: 21,
            vat_amount: Number(data.tax) || 0,
            total: Number(data.total) || 0,
            is_orientative: true,
            status: data.status || 'PENDIENTE',
            estimated_time: '24-48 horas',
            created_at: data.created_at,
            valid_until: data.expires_at ? data.expires_at.split('T')[0] : ''
          };
          return singleQuote;
        }
      } catch (err) {
        console.warn('Direct quote query error:', err);
      }
    }

    return null;
  },

  async createQuote(data: {
    customerName: string;
    customerPhone: string;
    customerEmail: string;
    customerAddress?: string;
    deviceCategory: any;
    deviceBrand: string;
    deviceModel: string;
    repairType: string;
    issueDescription: string;
    photos?: string[];
    subtotal: number;
    vatRate: number;
    isOrientative: boolean;
    estimatedTime: string;
    items?: any[];
  }): Promise<Quote> {
    const customer = await this.createCustomer({
      name: data.customerName,
      phone: data.customerPhone,
      email: data.customerEmail,
      address: data.customerAddress
    });

    const quoteNumber = getNextCode('CMF');
    const vatAmount = (data.subtotal * data.vatRate) / 100;
    const total = data.subtotal + vatAmount;

    let quoteId = 'quote-' + Date.now();
    let finalQuoteNumber = quoteNumber;

    if (isSupabaseConfigured && supabase) {
      try {
        const isCustUUID = customer.id && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(customer.id);
        const { data: dbQuote, error: qErr } = await supabase.from('quotes').insert([{
          quote_number: quoteNumber,
          customer_id: isCustUUID ? customer.id : null,
          device_category: data.deviceCategory,
          brand: data.deviceBrand,
          model: data.deviceModel,
          issue_type: data.repairType,
          description: data.issueDescription,
          subtotal: data.subtotal,
          tax: vatAmount,
          total: total,
          status: 'PENDIENTE',
          expires_at: new Date(Date.now() + 15 * 86400000).toISOString()
        }]).select().single();

        if (!qErr && dbQuote) {
          quoteId = dbQuote.id;
          if (dbQuote.quote_number) {
            finalQuoteNumber = dbQuote.quote_number;
          }
        } else if (qErr) {
          console.warn('Supabase quote insert error:', qErr);
        }
      } catch (err) {
        console.warn('Error saving quote to Supabase:', err);
      }
    }

    const newQuote: Quote = {
      id: quoteId,
      quote_number: finalQuoteNumber,
      customer_id: customer.id,
      customer,
      device_category: data.deviceCategory,
      device_brand: data.deviceBrand,
      device_model: data.deviceModel,
      repair_type: data.repairType,
      issue_description: data.issueDescription,
      photos: data.photos || [],
      items: data.items || [
        {
          id: 'qi-' + Date.now(),
          description: `${data.repairType} para ${data.deviceModel}`,
          type: 'PART',
          cost: data.subtotal * 0.6,
          price: data.subtotal,
          quantity: 1
        }
      ],
      subtotal: data.subtotal,
      vat_rate: data.vatRate,
      vat_amount: vatAmount,
      total,
      is_orientative: data.isOrientative,
      status: 'PENDIENTE',
      estimated_time: data.estimatedTime,
      created_at: new Date().toISOString(),
      valid_until: new Date(Date.now() + 15 * 86400000).toISOString().split('T')[0]
    };

    const current = getLocal<Quote[]>(STORAGE_KEYS.QUOTES, INITIAL_QUOTES);
    setLocal(STORAGE_KEYS.QUOTES, [newQuote, ...current]);

    // Disparar notificación acústica, visual y de sistema para el taller
    try {
      notifyNewQuote(newQuote);
    } catch (notifErr) {
      console.warn('Could not trigger new quote notification:', notifErr);
    }

    return newQuote;
  },

  async updateQuoteStatus(id: string, status: QuoteStatus): Promise<Quote | null> {
    const quotes = await this.getQuotes();
    const index = quotes.findIndex(q => q.id === id || (q.quote_number && q.quote_number.toLowerCase() === id.toLowerCase()));
    if (index === -1) return null;

    const quote = quotes[index];
    quote.status = status;
    if (status === 'ACEPTADO') {
      quote.accepted_at = new Date().toISOString();
      const repairs = await this.getRepairs();
      const existingRepair = repairs.find(r => r.quote_id === quote.id || r.repair_number === quote.quote_number);
      if (!existingRepair) {
        await this.createRepairFromQuote(quote);
      }
    } else if (status === 'RECHAZADO') {
      quote.rejected_at = new Date().toISOString();
    }

    quotes[index] = quote;
    setLocal(STORAGE_KEYS.QUOTES, quotes);

    if (isSupabaseConfigured && supabase) {
      try {
        const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(quote.id);
        if (isUuid) {
          await supabase.from('quotes').update({
            status,
            is_converted_to_repair: status === 'ACEPTADO'
          }).eq('id', quote.id);
        } else if (quote.quote_number) {
          await supabase.from('quotes').update({
            status,
            is_converted_to_repair: status === 'ACEPTADO'
          }).eq('quote_number', quote.quote_number);
        }
      } catch (err) {
        console.warn('Supabase quote update status error:', err);
      }
    }

    return quote;
  },

  async deleteQuote(id: string): Promise<boolean> {
    if (!id) return false;
    const cleanId = id.trim().toLowerCase();
    
    // 1. Eliminar localmente
    const quotes = await this.getQuotes();
    const targetQuote = quotes.find(q => 
      q.id.toLowerCase() === cleanId || 
      (q.quote_number && q.quote_number.toLowerCase() === cleanId)
    );
    const filtered = quotes.filter(q => 
      q.id.toLowerCase() !== cleanId && 
      (!q.quote_number || q.quote_number.toLowerCase() !== cleanId)
    );
    setLocal(STORAGE_KEYS.QUOTES, filtered);

    // 2. Eliminar de Supabase si está disponible
    if (isSupabaseConfigured && supabase) {
      try {
        const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id.trim());
        if (isUuid) {
          await supabase.from('quotes').delete().eq('id', id.trim());
        }
        if (targetQuote?.quote_number) {
          await supabase.from('quotes').delete().eq('quote_number', targetQuote.quote_number);
        } else if (!isUuid) {
          await supabase.from('quotes').delete().eq('quote_number', id.trim());
        }
      } catch (err) {
        console.warn('Error deleting quote from Supabase:', err);
      }
    }

    return true;
  },

  // --- Repairs ---
  async getRepairs(): Promise<Repair[]> {
    const localRepairs = getLocal<Repair[]>(STORAGE_KEYS.REPAIRS, INITIAL_REPAIRS);
    const customers = await this.getCustomers();

    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from('repairs')
          .select('*, customer:customers(*)')
          .order('created_at', { ascending: false });

        if (!error && data) {
          const dbMapped: Repair[] = data.map((d: any) => ({
            id: d.id,
            repair_number: d.repair_number || d.tracking_code,
            quote_id: d.quote_id,
            customer_id: d.customer_id,
            customer: d.customer || customers.find(c => c.id === d.customer_id),
            device_category: d.device_category,
            device_brand: d.brand || 'Dispositivo',
            device_model: d.model || '',
            serial_imei: d.serial_imei,
            issue_description: d.initial_issue || 'Reparación en taller',
            diagnosis: d.internal_notes || '',
            work_performed: d.public_notes || '',
            cost_total: Number(d.parts_cost || 0) + Number(d.labor_cost || 0),
            price_total: Number(d.total_cost || 0),
            profit: Math.max(0, Number(d.total_cost || 0) - (Number(d.parts_cost || 0) + Number(d.labor_cost || 0))),
            status: d.status || 'RECIBIDO',
            entry_date: d.received_at || d.created_at || new Date().toISOString(),
            estimated_date: d.completed_at,
            completion_date: d.delivered_at || (d.status === 'ENTREGADO' ? d.updated_at : undefined),
            notes_internal: d.internal_notes,
            notes_public: d.public_notes,
            photos: [],
            status_history: [
              {
                id: 'sh-init-' + d.id,
                repair_id: d.id,
                status: d.status || 'RECIBIDO',
                notes: d.public_notes || 'Estado registrado en sistema',
                created_at: d.created_at || new Date().toISOString()
              }
            ]
          }));

          const map = new Map<string, Repair>();
          dbMapped.forEach(r => {
            map.set(r.id, r);
            if (r.repair_number) map.set(r.repair_number.toUpperCase(), r);
          });
          localRepairs.forEach(r => {
            const hasById = map.has(r.id);
            const hasByNum = r.repair_number ? map.has(r.repair_number.toUpperCase()) : false;
            if (!hasById && !hasByNum) {
              map.set(r.id, {
                ...r,
                customer: customers.find(c => c.id === r.customer_id) || r.customer
              });
            }
          });
          const merged = Array.from(new Set(map.values()));
          setLocal(STORAGE_KEYS.REPAIRS, merged);
          return merged;
        }
      } catch (err) {
        console.warn('Error fetching repairs from Supabase:', err);
      }
    }

    return localRepairs.map(r => ({
      ...r,
      customer: customers.find(c => c.id === r.customer_id) || r.customer
    }));
  },

  async getRepairById(id: string): Promise<Repair | null> {
    if (!id) return null;
    const cleanId = id.trim().toLowerCase();
    const repairs = await this.getRepairs();
    const found = repairs.find(r => r.id.toLowerCase() === cleanId || r.repair_number.toLowerCase() === cleanId);
    if (found) return found;

    // Fallback: search in Supabase directly
    if (isSupabaseConfigured && supabase) {
      try {
        const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id.trim());
        let query = supabase.from('repairs').select('*, customer:customers(*)');
        if (isUuid) {
          query = query.or(`id.eq.${id.trim()},repair_number.ilike.${id.trim()},tracking_code.ilike.${id.trim()}`);
        } else {
          query = query.or(`repair_number.ilike.${id.trim()},tracking_code.ilike.${id.trim()}`);
        }
        const { data } = await query.maybeSingle();
        if (data) {
          const mapped: Repair = {
            id: data.id,
            repair_number: data.repair_number || data.tracking_code,
            quote_id: data.quote_id,
            customer_id: data.customer_id,
            customer: data.customer,
            device_category: data.device_category,
            device_brand: data.brand || 'Dispositivo',
            device_model: data.model || '',
            serial_imei: data.serial_imei,
            issue_description: data.initial_issue || 'Reparación en taller',
            diagnosis: data.internal_notes || '',
            work_performed: data.public_notes || '',
            cost_total: Number(data.parts_cost || 0) + Number(data.labor_cost || 0),
            price_total: Number(data.total_cost || 0),
            profit: Math.max(0, Number(data.total_cost || 0) - (Number(data.parts_cost || 0) + Number(data.labor_cost || 0))),
            status: data.status || 'RECIBIDO',
            entry_date: data.received_at || data.created_at || new Date().toISOString(),
            estimated_date: data.completed_at,
            notes_internal: data.internal_notes,
            notes_public: data.public_notes,
            photos: [],
            status_history: [
              {
                id: 'sh-init-' + data.id,
                repair_id: data.id,
                status: data.status || 'RECIBIDO',
                notes: data.public_notes || 'Estado registrado',
                created_at: data.created_at || new Date().toISOString()
              }
            ]
          };
          return mapped;
        }
      } catch (err) {
        console.warn('Direct repair lookup error:', err);
      }
    }

    return null;
  },

  async getRepairByTracking(repairNumber: string, contactQuery: string): Promise<Repair | null> {
    const repairs = await this.getRepairs();
    const cleanNum = repairNumber.trim().toUpperCase();
    const cleanContact = contactQuery.trim().toLowerCase().replace(/\s+/g, '');
    return repairs.find(r => {
      const matchNum = r.repair_number.toUpperCase() === cleanNum;
      if (!matchNum) return false;
      const phoneMatch = r.customer?.phone ? r.customer.phone.replace(/\s+/g, '').includes(cleanContact) : false;
      const emailMatch = r.customer?.email ? r.customer.email.toLowerCase().includes(cleanContact) : false;
      return phoneMatch || emailMatch;
    }) || null;
  },

  async createRepairFromQuote(quote: Quote): Promise<Repair> {
    const existingRepairs = await this.getRepairs();
    const existing = existingRepairs.find(r => 
      (quote.id && r.quote_id === quote.id) || 
      (quote.quote_number && r.repair_number === quote.quote_number)
    );
    if (existing) {
      return existing;
    }

    let repairId = 'rep-' + Date.now();

    if (isSupabaseConfigured && supabase) {
      try {
        const isQuoteUuid = quote.id && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(quote.id);
        const isCustUuid = quote.customer_id && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(quote.customer_id);

        const { data: dbRep, error: repErr } = await supabase.from('repairs').insert([{
          repair_number: quote.quote_number,
          tracking_code: quote.quote_number,
          quote_id: isQuoteUuid ? quote.id : null,
          customer_id: isCustUuid ? quote.customer_id : null,
          device_category: quote.device_category,
          brand: quote.device_brand,
          model: quote.device_model,
          initial_issue: quote.issue_description || quote.repair_type,
          status: 'APROBADO',
          parts_cost: quote.subtotal * 0.5,
          total_cost: quote.subtotal,
          public_notes: 'Presupuesto aprobado por cliente.'
        }]).select().single();

        if (!repErr && dbRep?.id) {
          repairId = dbRep.id;
        } else if (repErr) {
          console.warn('Supabase repair insert warning:', repErr);
        }
      } catch (err) {
        console.warn('Error saving repair to Supabase:', err);
      }
    }

    const newRepair: Repair = {
      id: repairId,
      repair_number: quote.quote_number, // Maintain same recognizable CMF code
      quote_id: quote.id,
      customer_id: quote.customer_id,
      customer: quote.customer,
      device_category: quote.device_category,
      device_brand: quote.device_brand,
      device_model: quote.device_model,
      issue_description: quote.issue_description,
      diagnosis: 'Aceptado por cliente desde presupuesto digital.',
      work_performed: quote.repair_type,
      cost_total: quote.subtotal * 0.5,
      price_total: quote.subtotal,
      profit: quote.subtotal * 0.5,
      status: 'APROBADO',
      entry_date: new Date().toISOString(),
      estimated_date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
      notes_public: 'Presupuesto aprobado. Tu dispositivo ha entrado en la cola técnica de CM FIX.',
      status_history: [
        {
          id: 'sh-1',
          repair_id: repairId,
          status: 'RECIBIDO',
          notes: 'Solicitud iniciada online.',
          created_at: quote.created_at
        },
        {
          id: 'sh-2',
          repair_id: repairId,
          status: 'PRESUPUESTO',
          notes: `Presupuesto ${quote.quote_number} emitido.`,
          created_at: quote.created_at
        },
        {
          id: 'sh-3',
          repair_id: repairId,
          status: 'APROBADO',
          notes: 'Cliente ha aceptado el presupuesto online.',
          created_at: new Date().toISOString()
        }
      ]
    };

    const current = getLocal<Repair[]>(STORAGE_KEYS.REPAIRS, INITIAL_REPAIRS);
    setLocal(STORAGE_KEYS.REPAIRS, [newRepair, ...current]);
    return newRepair;
  },

  async updateRepairStatus(id: string, status: RepairStatus, notes?: string, changedBy = 'CM FIX'): Promise<Repair | null> {
    const repairs = await this.getRepairs();
    const index = repairs.findIndex(r => r.id === id || r.repair_number === id);
    if (index === -1) return null;

    const repair = repairs[index];
    repair.status = status;
    if (notes) {
      repair.notes_public = notes;
    }
    if (status === 'REPARADO' || status === 'LISTO PARA RECOGER' || status === 'ENTREGADO') {
      repair.completion_date = new Date().toISOString();
    }

    const historyItem = {
      id: 'sh-' + Date.now(),
      repair_id: repair.id,
      status,
      notes: notes || `Estado actualizado a ${status}`,
      changed_by: changedBy,
      created_at: new Date().toISOString()
    };
    repair.status_history = [...(repair.status_history || []), historyItem];

    repairs[index] = repair;
    setLocal(STORAGE_KEYS.REPAIRS, repairs);

    if (isSupabaseConfigured && supabase) {
      try {
        const updatePayload: Record<string, any> = {
          status,
          updated_at: new Date().toISOString()
        };
        if (notes) {
          updatePayload.public_notes = notes;
        }
        if (status === 'REPARADO' || status === 'LISTO PARA RECOGER' || status === 'ENTREGADO') {
          updatePayload.completed_at = new Date().toISOString();
        }
        if (status === 'ENTREGADO') {
          updatePayload.delivered_at = new Date().toISOString();
        }

        const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(repair.id);
        if (isUuid) {
          await supabase.from('repairs').update(updatePayload).eq('id', repair.id);
        } else if (repair.repair_number) {
          await supabase.from('repairs').update(updatePayload).eq('repair_number', repair.repair_number);
        }
      } catch (err) {
        console.warn('Error updating repair in Supabase:', err);
      }
    }

    return repair;
  },

  async updateRepair(id: string, data: Partial<Repair>): Promise<Repair | null> {
    const repairs = await this.getRepairs();
    const index = repairs.findIndex(r => r.id === id);
    if (index === -1) return null;
    const updated = { ...repairs[index], ...data };
    if (data.price_total !== undefined || data.cost_total !== undefined) {
      updated.profit = (updated.price_total || 0) - (updated.cost_total || 0);
    }
    repairs[index] = updated;
    setLocal(STORAGE_KEYS.REPAIRS, repairs);

    if (isSupabaseConfigured && supabase) {
      try {
        const sbPayload: Record<string, any> = {
          updated_at: new Date().toISOString()
        };
        if (data.status) sbPayload.status = data.status;
        if (data.notes_public !== undefined) sbPayload.public_notes = data.notes_public;
        if (data.notes_internal !== undefined) sbPayload.internal_notes = data.notes_internal;
        if (data.price_total !== undefined) sbPayload.total_cost = data.price_total;
        if (data.cost_total !== undefined) sbPayload.parts_cost = data.cost_total;
        if (data.serial_imei !== undefined) sbPayload.serial_imei = data.serial_imei;
        if (data.diagnosis !== undefined) sbPayload.internal_notes = data.diagnosis;
        if (data.work_performed !== undefined) sbPayload.public_notes = data.work_performed;
        if (data.device_brand) sbPayload.brand = data.device_brand;
        if (data.device_model) sbPayload.model = data.device_model;
        if (data.completion_date) sbPayload.completed_at = data.completion_date;

        const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
        if (isUuid) {
          await supabase.from('repairs').update(sbPayload).eq('id', id);
        } else if (updated.repair_number) {
          await supabase.from('repairs').update(sbPayload).eq('repair_number', updated.repair_number);
        }
      } catch (err) {
        console.warn('Error updating repair in Supabase:', err);
      }
    }
    return updated;
  },

  // --- Inventory ---
  async getInventory(): Promise<InventoryItem[]> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.from('inventory').select('*').order('name');
      if (!error && data) return data as InventoryItem[];
    }
    return getLocal<InventoryItem[]>(STORAGE_KEYS.INVENTORY, INITIAL_INVENTORY);
  },

  async addInventoryItem(item: Omit<InventoryItem, 'id'>): Promise<InventoryItem> {
    const sanitizedStock = Math.max(0, Number(item.stock || 0));
    const sanitizedMinStock = Math.max(0, Number(item.min_stock ?? 2));
    const newItem: InventoryItem = {
      id: 'inv-' + Date.now(),
      ...item,
      stock: sanitizedStock,
      min_stock: sanitizedMinStock
    };
    const current = getLocal<InventoryItem[]>(STORAGE_KEYS.INVENTORY, INITIAL_INVENTORY);
    setLocal(STORAGE_KEYS.INVENTORY, [newItem, ...current]);
    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('inventory').insert([{
          sku: item.sku,
          name: item.name,
          category: item.category,
          brand: (item as any).device_brand || (item as any).brand || null,
          model_compatibility: (item as any).device_model || (item as any).model_compatibility || null,
          stock: sanitizedStock,
          min_stock: sanitizedMinStock,
          cost_price: (item as any).cost || (item as any).cost_price || 0,
          sale_price: (item as any).price || (item as any).sale_price || 0,
          supplier_id: (item as any).supplier_id && /^[0-9a-f-]{36}$/i.test((item as any).supplier_id) ? (item as any).supplier_id : null,
          location: (item as any).location || 'Taller CM FIX'
        }]);
      } catch (err) {
        console.warn('Error saving inventory item to Supabase:', err);
      }
    }
    return newItem;
  },

  async updateInventoryItem(id: string, data: Partial<InventoryItem>): Promise<InventoryItem | null> {
    const current = getLocal<InventoryItem[]>(STORAGE_KEYS.INVENTORY, INITIAL_INVENTORY);
    const index = current.findIndex(i => i.id === id);
    if (index === -1) return null;
    const sanitizedData = { ...data };
    if (sanitizedData.stock !== undefined) {
      sanitizedData.stock = Math.max(0, Number(sanitizedData.stock));
    }
    if (sanitizedData.min_stock !== undefined) {
      sanitizedData.min_stock = Math.max(0, Number(sanitizedData.min_stock));
    }
    const updated = { ...current[index], ...sanitizedData };
    current[index] = updated;
    setLocal(STORAGE_KEYS.INVENTORY, current);
    if (isSupabaseConfigured && supabase) {
      try {
        const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
        if (isUuid) {
          const sbPayload: Record<string, any> = {
            updated_at: new Date().toISOString()
          };
          if (data.name !== undefined) sbPayload.name = data.name;
          if (data.category !== undefined) sbPayload.category = data.category;
          if (sanitizedData.stock !== undefined) sbPayload.stock = sanitizedData.stock;
          if (sanitizedData.min_stock !== undefined) sbPayload.min_stock = sanitizedData.min_stock;
          if ((data as any).device_brand !== undefined) sbPayload.brand = (data as any).device_brand;
          if ((data as any).device_model !== undefined) sbPayload.model_compatibility = (data as any).device_model;
          if ((data as any).cost !== undefined) sbPayload.cost_price = (data as any).cost;
          if ((data as any).price !== undefined) sbPayload.sale_price = (data as any).price;

          await supabase.from('inventory').update(sbPayload).eq('id', id);
        }
      } catch (err) {
        console.warn('Error updating inventory item in Supabase:', err);
      }
    }
    return updated;
  },

  async deleteInventoryItem(id: string): Promise<boolean> {
    const current = getLocal<InventoryItem[]>(STORAGE_KEYS.INVENTORY, INITIAL_INVENTORY);
    setLocal(STORAGE_KEYS.INVENTORY, current.filter(i => i.id !== id));
    if (isSupabaseConfigured && supabase) {
      await supabase.from('inventory').delete().eq('id', id);
    }
    return true;
  },

  // --- Suppliers ---
  async getSuppliers(): Promise<Supplier[]> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.from('suppliers').select('*').order('name');
      if (!error && data) return data as Supplier[];
    }
    return getLocal<Supplier[]>(STORAGE_KEYS.SUPPLIERS, INITIAL_SUPPLIERS);
  },

  async addSupplier(supplier: Omit<Supplier, 'id'>): Promise<Supplier> {
    const newSupplier: Supplier = {
      id: 'sup-' + Date.now(),
      ...supplier
    };
    const current = getLocal<Supplier[]>(STORAGE_KEYS.SUPPLIERS, INITIAL_SUPPLIERS);
    setLocal(STORAGE_KEYS.SUPPLIERS, [newSupplier, ...current]);
    if (isSupabaseConfigured && supabase) {
      await supabase.from('suppliers').insert([newSupplier]);
    }
    return newSupplier;
  },

  async updateSupplier(id: string, data: Partial<Supplier>): Promise<Supplier | null> {
    const current = getLocal<Supplier[]>(STORAGE_KEYS.SUPPLIERS, INITIAL_SUPPLIERS);
    const index = current.findIndex(s => s.id === id);
    if (index === -1) return null;
    const updated = { ...current[index], ...data };
    current[index] = updated;
    setLocal(STORAGE_KEYS.SUPPLIERS, current);
    if (isSupabaseConfigured && supabase) {
      await supabase.from('suppliers').update(data).eq('id', id);
    }
    return updated;
  },

  async deleteSupplier(id: string): Promise<boolean> {
    const current = getLocal<Supplier[]>(STORAGE_KEYS.SUPPLIERS, INITIAL_SUPPLIERS);
    setLocal(STORAGE_KEYS.SUPPLIERS, current.filter(s => s.id !== id));
    if (isSupabaseConfigured && supabase) {
      await supabase.from('suppliers').delete().eq('id', id);
    }
    return true;
  },

  // --- Dashboard Stats ---
  async getDashboardStats(): Promise<DashboardStats> {
    const [quotes, repairs, inventory, customers] = await Promise.all([
      this.getQuotes(),
      this.getRepairs(),
      this.getInventory(),
      this.getCustomers()
    ]);

    const pending_quotes_count = quotes.filter(q => q.status === 'PENDIENTE').length;
    const in_progress_repairs_count = repairs.filter(r => 
      ['RECIBIDO', 'DIAGNÓSTICO', 'PRESUPUESTO', 'APROBADO', 'EN REPARACIÓN', 'ESPERANDO PIEZA'].includes(r.status)
    ).length;
    const ready_repairs_count = repairs.filter(r => r.status === 'LISTO PARA RECOGER').length;
    const low_stock_count = inventory.filter(i => i.stock <= i.min_stock).length;

    const total_revenue = repairs.reduce((acc, r) => acc + (r.price_total || 0), 0);
    const total_profit = repairs.reduce((acc, r) => acc + (r.profit || 0), 0);

    return {
      pending_quotes_count,
      in_progress_repairs_count,
      ready_repairs_count,
      low_stock_count,
      total_customers_count: customers.length,
      total_revenue,
      total_profit
    };
  },

  // Reset/Seed tool
  resetDemoData() {
    initLocalDatabase(true);
  }
};
