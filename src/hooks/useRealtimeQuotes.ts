import { useEffect, useRef } from 'react';
import { supabase, isSupabaseConfigured } from '../services/supabase';
import { dbService } from '../services/db';
import { notifyNewQuote, getStoredNotifications } from '../services/notificationService';
import { Quote } from '../types';

export function useRealtimeQuotes() {
  const lastKnownQuotesCountRef = useRef<number>(-1);
  const knownQuoteNumbersRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    // 1. Cargar presupuestos conocidos inicialmente
    const initKnownQuotes = async () => {
      try {
        const quotes = await dbService.getQuotes();
        lastKnownQuotesCountRef.current = quotes.length;
        quotes.forEach(q => {
          if (q.quote_number) knownQuoteNumbersRef.current.add(q.quote_number.toUpperCase());
        });
        // Agregar también los ya presentes en el historial de notificaciones
        getStoredNotifications().forEach(n => {
          if (n.quoteNumber) knownQuoteNumbersRef.current.add(n.quoteNumber.toUpperCase());
        });
      } catch (err) {
        console.warn('Error initializing known quotes for realtime:', err);
      }
    };

    initKnownQuotes();

    // 2. Suscripción a Supabase Realtime
    let channel: any = null;
    if (isSupabaseConfigured && supabase) {
      try {
        channel = supabase
          .channel('cmfix_quotes_realtime_channel')
          .on(
            'postgres_changes',
            { event: 'INSERT', schema: 'public', table: 'quotes' },
            async (payload) => {
              const newRow = payload.new as any;
              if (!newRow) return;

              const quoteNumber = (newRow.quote_number || '').toUpperCase();
              if (quoteNumber && knownQuoteNumbersRef.current.has(quoteNumber)) {
                return; // Ya conocido en esta sesión
              }

              if (quoteNumber) {
                knownQuoteNumbersRef.current.add(quoteNumber);
              }

              // Obtener presupuesto completo
              const quote = await dbService.getQuoteById(newRow.id || newRow.quote_number);
              if (quote) {
                notifyNewQuote(quote, true);
              } else {
                // Notificación básica a partir de la fila recibida
                const basicQuote: Quote = {
                  id: newRow.id,
                  quote_number: newRow.quote_number,
                  customer_id: newRow.customer_id,
                  customer: {
                    id: 'cust-rt',
                    name: 'Nuevo Cliente Online',
                    phone: '',
                    email: '',
                    created_at: new Date().toISOString()
                  },
                  device_category: newRow.device_category || 'SMARTPHONE',
                  device_brand: newRow.brand || 'Dispositivo',
                  device_model: newRow.model || '',
                  repair_type: newRow.issue_type || 'Reparación',
                  issue_description: newRow.description || '',
                  photos: [],
                  items: [],
                  subtotal: Number(newRow.subtotal) || 0,
                  vat_rate: 21,
                  vat_amount: Number(newRow.tax) || 0,
                  total: Number(newRow.total) || 0,
                  is_orientative: true,
                  status: newRow.status || 'PENDIENTE',
                  estimated_time: '24-48 horas',
                  created_at: newRow.created_at || new Date().toISOString(),
                  valid_until: new Date(Date.now() + 15 * 86400000).toISOString().split('T')[0]
                };
                notifyNewQuote(basicQuote, true);
              }
            }
          )
          .subscribe();
      } catch (err) {
        console.warn('Realtime channel error:', err);
      }
    }

    // 3. Polling de respaldo inteligente (cada 25 segundos)
    const interval = setInterval(async () => {
      try {
        const freshQuotes = await dbService.getQuotes();
        freshQuotes.forEach(q => {
          const num = (q.quote_number || '').toUpperCase();
          if (num && !knownQuoteNumbersRef.current.has(num)) {
            knownQuoteNumbersRef.current.add(num);
            // Si ya se había inicializado la cuenta, significa que es uno verdaderamente nuevo
            if (lastKnownQuotesCountRef.current > 0) {
              notifyNewQuote(q, true);
            }
          }
        });
        lastKnownQuotesCountRef.current = freshQuotes.length;
      } catch {}
    }, 25000);

    return () => {
      clearInterval(interval);
      if (channel && supabase) {
        supabase.removeChannel(channel);
      }
    };
  }, []);
}
