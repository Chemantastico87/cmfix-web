-- ==============================================================================
-- CM FIX — ESQUEMA COMPLETO DE BASE DE DATOS POSTGRESQL (SUPABASE)
-- ==============================================================================

-- 1. Extensiones necesarias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Secuencia para códigos human-readable CMF-2026-00001
CREATE SEQUENCE IF NOT EXISTS cmfix_seq START 1;

CREATE OR REPLACE FUNCTION generate_cmfix_code(prefix TEXT) RETURNS TEXT AS $$
DECLARE
  next_val INT;
  year_str TEXT;
BEGIN
  next_val := nextval('cmfix_seq');
  year_str := TO_CHAR(CURRENT_DATE, 'YYYY');
  RETURN prefix || '-' || year_str || '-' || LPAD(next_val::TEXT, 5, '0');
END;
$$ LANGUAGE plpgsql;

-- 3. Tabla de Perfiles de Usuario (Admin y Técnicos)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  full_name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('ADMIN', 'TECNICO')) DEFAULT 'TECNICO',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Tabla de Clientes
CREATE TABLE IF NOT EXISTS customers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT NOT NULL,
  address TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_customers_phone ON customers(phone);
CREATE INDEX IF NOT EXISTS idx_customers_email ON customers(email);

-- 5. Tabla de Proveedores
CREATE TABLE IF NOT EXISTS suppliers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  contact_person TEXT,
  phone TEXT,
  email TEXT,
  website TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Tabla de Inventario / Piezas
CREATE TABLE IF NOT EXISTS inventory (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sku TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  device_brand TEXT,
  device_model TEXT,
  supplier_id UUID REFERENCES suppliers(id) ON DELETE SET NULL,
  cost NUMERIC(10,2) NOT NULL DEFAULT 0.00,
  price NUMERIC(10,2) NOT NULL DEFAULT 0.00,
  stock INT NOT NULL DEFAULT 0,
  min_stock INT NOT NULL DEFAULT 2,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Catálogo de Precios Administrable
CREATE TABLE IF NOT EXISTS pricing_catalog (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  category TEXT NOT NULL,
  brand TEXT NOT NULL,
  model TEXT NOT NULL,
  repair_type TEXT NOT NULL,
  part_cost NUMERIC(10,2) NOT NULL DEFAULT 0.00,
  labor_cost NUMERIC(10,2) NOT NULL DEFAULT 35.00,
  sale_price NUMERIC(10,2) NOT NULL,
  margin NUMERIC(10,2) GENERATED ALWAYS AS (sale_price - (part_cost + labor_cost)) STORED,
  estimated_time TEXT DEFAULT '24-48 horas',
  supplier_ref TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. Tabla de Presupuestos
CREATE TABLE IF NOT EXISTS quotes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  quote_number TEXT UNIQUE NOT NULL DEFAULT generate_cmfix_code('CMF'),
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  device_category TEXT NOT NULL,
  device_brand TEXT NOT NULL,
  device_model TEXT NOT NULL,
  repair_type TEXT NOT NULL,
  issue_description TEXT NOT NULL,
  subtotal NUMERIC(10,2) NOT NULL DEFAULT 0.00,
  vat_rate NUMERIC(5,2) NOT NULL DEFAULT 21.00,
  vat_amount NUMERIC(10,2) NOT NULL DEFAULT 0.00,
  total NUMERIC(10,2) NOT NULL DEFAULT 0.00,
  is_orientative BOOLEAN NOT NULL DEFAULT true,
  status TEXT NOT NULL CHECK (status IN ('PENDIENTE', 'ENVIADO', 'ACEPTADO', 'RECHAZADO', 'CADUCADO')) DEFAULT 'PENDIENTE',
  estimated_time TEXT DEFAULT '24-48h',
  valid_until DATE DEFAULT (CURRENT_DATE + INTERVAL '15 days'),
  accepted_at TIMESTAMPTZ,
  rejected_at TIMESTAMPTZ,
  photos TEXT[] DEFAULT '{}',
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_quotes_number ON quotes(quote_number);
CREATE INDEX IF NOT EXISTS idx_quotes_customer ON quotes(customer_id);

-- 9. Líneas de Presupuesto
CREATE TABLE IF NOT EXISTS quote_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  quote_id UUID NOT NULL REFERENCES quotes(id) ON DELETE CASCADE,
  description TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('PART', 'LABOR', 'OTHER')),
  cost NUMERIC(10,2) NOT NULL DEFAULT 0.00,
  price NUMERIC(10,2) NOT NULL DEFAULT 0.00,
  quantity INT NOT NULL DEFAULT 1
);

-- 10. Tabla de Reparaciones
CREATE TABLE IF NOT EXISTS repairs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  repair_number TEXT UNIQUE NOT NULL DEFAULT generate_cmfix_code('CMF'),
  quote_id UUID REFERENCES quotes(id) ON DELETE SET NULL,
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  device_category TEXT NOT NULL,
  device_brand TEXT NOT NULL,
  device_model TEXT NOT NULL,
  serial_imei TEXT,
  issue_description TEXT NOT NULL,
  diagnosis TEXT,
  work_performed TEXT,
  cost_total NUMERIC(10,2) NOT NULL DEFAULT 0.00,
  price_total NUMERIC(10,2) NOT NULL DEFAULT 0.00,
  profit NUMERIC(10,2) GENERATED ALWAYS AS (price_total - cost_total) STORED,
  status TEXT NOT NULL CHECK (status IN (
    'RECIBIDO', 'DIAGNÓSTICO', 'PRESUPUESTO', 'ESPERANDO APROBACIÓN',
    'APROBADO', 'EN REPARACIÓN', 'ESPERANDO PIEZA', 'REPARADO',
    'LISTO PARA RECOGER', 'ENTREGADO', 'CANCELADO'
  )) DEFAULT 'RECIBIDO',
  entry_date TIMESTAMPTZ DEFAULT NOW(),
  estimated_date TIMESTAMPTZ,
  completion_date TIMESTAMPTZ,
  notes_internal TEXT,
  notes_public TEXT,
  photos TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_repairs_number ON repairs(repair_number);
CREATE INDEX IF NOT EXISTS idx_repairs_customer ON repairs(customer_id);
CREATE INDEX IF NOT EXISTS idx_repairs_status ON repairs(status);

-- 11. Histórico de Estados de Reparación
CREATE TABLE IF NOT EXISTS repair_status_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  repair_id UUID NOT NULL REFERENCES repairs(id) ON DELETE CASCADE,
  status TEXT NOT NULL,
  notes TEXT,
  changed_by TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 12. Configuración de Empresa
CREATE TABLE IF NOT EXISTS company_settings (
  id INT PRIMARY KEY DEFAULT 1,
  company_name TEXT NOT NULL DEFAULT 'CM FIX',
  trade_name TEXT NOT NULL DEFAULT 'CM FIX — Servicios Tecnológicos (Maury)',
  cif TEXT DEFAULT 'B-12345678',
  phone TEXT DEFAULT '+34 661 99 10 60',
  whatsapp TEXT DEFAULT '+34 661 99 10 60',
  email TEXT DEFAULT 'cmfixespana@gmail.com',
  website TEXT DEFAULT 'https://cmfix.es',
  address TEXT DEFAULT 'La Línea de la Concepción y alrededores',
  city TEXT DEFAULT 'La Línea de la Concepción (Cádiz)',
  postal_code TEXT DEFAULT '11300',
  default_vat NUMERIC(5,2) DEFAULT 21.00,
  quote_validity_days INT DEFAULT 15,
  hourly_labor_rate NUMERIC(10,2) DEFAULT 40.00,
  warranty_terms TEXT DEFAULT 'Todas nuestras reparaciones disponen de 6 meses de garantía en piezas y mano de obra conforme a la ley vigente.',
  legal_notice TEXT DEFAULT 'CM FIX garantiza la confidencialidad de los datos personales y el tratamiento seguro conforme al RGPD.',
  privacy_policy TEXT DEFAULT 'Tus datos solo se usarán para gestionar tu presupuesto y reparación.',
  notification_template_status TEXT DEFAULT 'Hola {{cliente}}, tu reparación {{numero}} ha cambiado al estado: {{estado}}.',
  notification_template_quote TEXT DEFAULT 'Hola {{cliente}}, tu presupuesto para {{dispositivo}} está listo: {{total}} €.',
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT single_row CHECK (id = 1)
);

-- Insertar configuración inicial por defecto
INSERT INTO company_settings (id) VALUES (1) ON CONFLICT (id) DO NOTHING;

-- 13. POLÍTICAS DE SEGURIDAD ROW LEVEL SECURITY (RLS)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE pricing_catalog ENABLE ROW LEVEL SECURITY;
ALTER TABLE quotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE quote_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE repairs ENABLE ROW LEVEL SECURITY;
ALTER TABLE repair_status_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE company_settings ENABLE ROW LEVEL SECURITY;

-- Reglas públicas (Clientes)
CREATE POLICY "Permitir crear clientes en solicitud" ON customers FOR INSERT WITH CHECK (true);
CREATE POLICY "Permitir crear presupuestos públicos" ON quotes FOR INSERT WITH CHECK (true);
CREATE POLICY "Permitir ver presupuesto por ID" ON quotes FOR SELECT USING (true);
CREATE POLICY "Permitir actualizar estado de presupuesto" ON quotes FOR UPDATE USING (true);
CREATE POLICY "Permitir ver lineas de presupuesto" ON quote_items FOR SELECT USING (true);
CREATE POLICY "Permitir crear lineas de presupuesto" ON quote_items FOR INSERT WITH CHECK (true);
CREATE POLICY "Permitir consulta publica de reparacion" ON repairs FOR SELECT USING (true);
CREATE POLICY "Permitir ver historico de reparacion" ON repair_status_history FOR SELECT USING (true);
CREATE POLICY "Permitir leer configuracion de empresa publica" ON company_settings FOR SELECT USING (true);
CREATE POLICY "Permitir leer catalogo de precios publico" ON pricing_catalog FOR SELECT USING (true);

-- Reglas autenticadas (Admin y Técnico)
CREATE POLICY "Acceso total a perfiles para usuarios autenticados" ON profiles FOR ALL TO authenticated USING (true);
CREATE POLICY "Acceso total a clientes para usuarios autenticados" ON customers FOR ALL TO authenticated USING (true);
CREATE POLICY "Acceso total a inventario para usuarios autenticados" ON inventory FOR ALL TO authenticated USING (true);
CREATE POLICY "Acceso total a proveedores para usuarios autenticados" ON suppliers FOR ALL TO authenticated USING (true);
CREATE POLICY "Acceso total a presupuestos para usuarios autenticados" ON quotes FOR ALL TO authenticated USING (true);
CREATE POLICY "Acceso total a reparaciones para usuarios autenticados" ON repairs FOR ALL TO authenticated USING (true);
CREATE POLICY "Acceso total a historico para usuarios autenticados" ON repair_status_history FOR ALL TO authenticated USING (true);
CREATE POLICY "Acceso total a catalogo para usuarios autenticados" ON pricing_catalog FOR ALL TO authenticated USING (true);
CREATE POLICY "Acceso total a configuracion para usuarios autenticados" ON company_settings FOR ALL TO authenticated USING (true);
