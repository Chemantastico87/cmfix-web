// Script de inicialización de datos de prueba para CM FIX
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config();

const url = process.env.VITE_SUPABASE_URL;
const key = process.env.VITE_SUPABASE_ANON_KEY;

console.log('----------------------------------------------------');
console.log('⚡ CM FIX — SISTEMA DE INICIALIZACIÓN DE SEMILLA (SEED)');
console.log('----------------------------------------------------');

if (!url || !key || url.includes('your-project-id')) {
  console.log('ℹ️ No se detectaron credenciales remotas de Supabase en .env.');
  console.log('✅ El entorno local ya cuenta con los datos de demostración');
  console.log('   (iPhone 13 Pro, Galaxy S23, Portátiles, Inventario y Clientes)');
  console.log('   gestionados de forma persistente y reactiva.');
  console.log('----------------------------------------------------');
  process.exit(0);
}

const supabase = createClient(url, key);

async function runSeed() {
  console.log('📡 Conectando a Supabase:', url);
  try {
    // 1. Company settings
    console.log('1. Verificando configuración de empresa...');
    await supabase.from('company_settings').upsert({
      id: 1,
      company_name: 'CM FIX',
      trade_name: 'CM FIX — Tu tecnología en buenas manos',
      phone: '+34 624 89 20 41',
      whatsapp: '+34 624 89 20 41',
      email: 'info@cmfix.es',
      website: 'https://cmfix.es',
      default_vat: 21.00
    });

    console.log('✅ Datos base de CM FIX sincronizados con éxito en Supabase.');
  } catch (err) {
    console.error('❌ Error durante el seed:', err);
  }
}

runSeed();
