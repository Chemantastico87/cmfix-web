import { Quote } from '../types';

export interface NotificationSettings {
  mauryName: string;
  mauryPhone: string;
  mauryEmail: string;
  eliName: string;
  eliPhone: string;
  eliEmail: string;
  soundEnabled: boolean;
  systemNotificationsEnabled: boolean;
  autoOpenWhatsApp: boolean;
}

export interface QuoteNotificationItem {
  id: string;
  quoteId: string;
  quoteNumber: string;
  customerName: string;
  customerPhone: string;
  device: string;
  repairType: string;
  total: number;
  timestamp: string;
  read: boolean;
}

const NOTIFICATION_SETTINGS_KEY = 'cmfix_notification_settings';
const NOTIFICATIONS_HISTORY_KEY = 'cmfix_notification_history';
const BROADCAST_CHANNEL_NAME = 'cmfix_notifications_channel';

export const DEFAULT_NOTIFICATION_SETTINGS: NotificationSettings = {
  mauryName: 'Maury (Administrador)',
  mauryPhone: '+34 661 99 10 60',
  mauryEmail: 'cmfixespana@gmail.com',
  eliName: 'Eli (Técnico Creador)',
  eliPhone: '+34 661 99 10 60', // Puede configurarse por Eli en ajustes
  eliEmail: 'tecnico@cmfix.es',
  soundEnabled: true,
  systemNotificationsEnabled: true,
  autoOpenWhatsApp: false
};

// Obtener ajustes guardados
export function getNotificationSettings(): NotificationSettings {
  try {
    const raw = localStorage.getItem(NOTIFICATION_SETTINGS_KEY);
    if (!raw) return DEFAULT_NOTIFICATION_SETTINGS;
    return { ...DEFAULT_NOTIFICATION_SETTINGS, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_NOTIFICATION_SETTINGS;
  }
}

// Guardar ajustes
export function saveNotificationSettings(settings: Partial<NotificationSettings>): NotificationSettings {
  const current = getNotificationSettings();
  const updated = { ...current, ...settings };
  try {
    localStorage.setItem(NOTIFICATION_SETTINGS_KEY, JSON.stringify(updated));
  } catch (err) {
    console.error('Error saving notification settings:', err);
  }
  return updated;
}

// Historial de alertas de presupuestos
export function getStoredNotifications(): QuoteNotificationItem[] {
  try {
    const raw = localStorage.getItem(NOTIFICATIONS_HISTORY_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveStoredNotifications(items: QuoteNotificationItem[]): void {
  try {
    localStorage.setItem(NOTIFICATIONS_HISTORY_KEY, JSON.stringify(items.slice(0, 50)));
  } catch {}
}

export function markAllNotificationsAsRead(): void {
  const list = getStoredNotifications().map(item => ({ ...item, read: true }));
  saveStoredNotifications(list);
  window.dispatchEvent(new CustomEvent('cmfix:notifications_updated'));
}

export function getUnreadNotificationsCount(): number {
  return getStoredNotifications().filter(n => !n.read).length;
}

// Generador acústico de sonido con Web Audio API (100% nativo, sin dependencias MP3 externas)
export function playNotificationSound(): void {
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();

    if (ctx.state === 'suspended') {
      ctx.resume();
    }

    const now = ctx.currentTime;

    // Primer tono (Agudo brillante - 587.33 Hz / D5)
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(587.33, now);
    gain1.gain.setValueAtTime(0, now);
    gain1.gain.linearRampToValueAtTime(0.25, now + 0.04);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.28);
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(now);
    osc1.stop(now + 0.3);

    // Segundo tono (Armónico de confirmación - 880 Hz / A5)
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = 'triangle';
    osc2.frequency.setValueAtTime(880, now + 0.12);
    gain2.gain.setValueAtTime(0, now + 0.12);
    gain2.gain.linearRampToValueAtTime(0.3, now + 0.16);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.6);
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(now + 0.12);
    osc2.stop(now + 0.65);
  } catch (err) {
    console.warn('Audio chime notification could not play:', err);
  }
}

// Solicitar permisos de notificación nativa del navegador / PWA
export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (!('Notification' in window)) {
    return 'denied';
  }
  try {
    const permission = await Notification.requestPermission();
    return permission;
  } catch {
    return 'default';
  }
}

// Mostrar notificación nativa en el sistema operativo / barra de estado
export function showSystemNotification(title: string, body: string, data?: any): void {
  if (!('Notification' in window)) return;
  if (Notification.permission !== 'granted') return;

  try {
    const notification = new Notification(title, {
      body,
      icon: '/cmfix-badge.png',
      badge: '/favicon.png',
      tag: 'cmfix-quote-alert',
      data
    });

    notification.onclick = () => {
      window.focus();
      if (data?.url) {
        window.location.href = data.url;
      }
      notification.close();
    };
  } catch (err) {
    console.warn('Error showing system notification:', err);
  }
}

// Generador de enlaces directos para avisar por WhatsApp a Maury o a Eli
export function getWhatsAppNotificationUrl(target: 'maury' | 'eli' | string, quote: Quote): string {
  const settings = getNotificationSettings();
  let rawPhone = target === 'maury' 
    ? settings.mauryPhone 
    : target === 'eli' 
    ? settings.eliPhone 
    : target;

  const cleanPhone = (rawPhone || '').replace(/\D+/g, '');
  const phoneToUse = cleanPhone.length === 9 ? `34${cleanPhone}` : cleanPhone;

  const origin = typeof window !== 'undefined' ? window.location.origin : 'https://cmfix.es';
  const quoteUrl = `${origin}/presupuesto/${quote.id || quote.quote_number}`;

  const message = [
    `🔔 *NUEVO PRESUPUESTO CM FIX*`,
    ``,
    `📄 *Código:* ${quote.quote_number}`,
    `👤 *Cliente:* ${quote.customer?.name || 'Cliente particular'}`,
    `📞 *Teléfono:* ${quote.customer?.phone || 'No especificado'}`,
    `✉️ *Email:* ${quote.customer?.email || 'No especificado'}`,
    ``,
    `📱 *Dispositivo:* ${quote.device_brand} ${quote.device_model}`,
    `🔧 *Avería:* ${quote.repair_type}`,
    `💰 *Importe:* ${Number(quote.total || 0).toFixed(2)} €`,
    `⏱️ *Tiempo estimado:* ${quote.estimated_time || '24-48 horas'}`,
    ``,
    `🌐 *Ver presupuesto completo en sistema:*`,
    quoteUrl
  ].join('\n');

  return `https://wa.me/${phoneToUse}?text=${encodeURIComponent(message)}`;
}

// Iniciar un canal de difusión entre pestañas y ventanas de la app instalada
let broadcastChannel: BroadcastChannel | null = null;
try {
  if (typeof BroadcastChannel !== 'undefined') {
    broadcastChannel = new BroadcastChannel(BROADCAST_CHANNEL_NAME);
  }
} catch {}

// Disparador principal de notificación cuando entra un nuevo presupuesto
export function notifyNewQuote(quote: Quote, isRemoteEvent = false): void {
  const settings = getNotificationSettings();

  // 1. Guardar en el historial de notificaciones
  const newItem: QuoteNotificationItem = {
    id: 'notif-' + Date.now(),
    quoteId: quote.id,
    quoteNumber: quote.quote_number,
    customerName: quote.customer?.name || 'Cliente particular',
    customerPhone: quote.customer?.phone || '',
    device: `${quote.device_brand} ${quote.device_model}`.trim(),
    repairType: quote.repair_type,
    total: quote.total,
    timestamp: new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }),
    read: false
  };

  const current = getStoredNotifications();
  // Evitar duplicados por quoteNumber
  if (!current.some(c => c.quoteNumber === quote.quote_number)) {
    saveStoredNotifications([newItem, ...current]);
  }

  // 2. Reproducir sonido si está habilitado
  if (settings.soundEnabled) {
    playNotificationSound();
  }

  // 3. Notificación nativa del sistema
  if (settings.systemNotificationsEnabled) {
    const title = `🔔 ¡Nuevo Presupuesto! ${quote.quote_number}`;
    const body = `${quote.customer?.name || 'Cliente'} · ${quote.device_brand} ${quote.device_model} · ${Number(quote.total || 0).toFixed(2)} €`;
    showSystemNotification(title, body, {
      url: `/admin/presupuestos`
    });
  }

  // 4. Emitir evento en la ventana actual para el toast visual
  window.dispatchEvent(new CustomEvent('cmfix:new_quote', { detail: { quote, item: newItem } }));
  window.dispatchEvent(new CustomEvent('cmfix:notifications_updated'));

  // 5. Difundir a otras pestañas/ventanas abiertas de la app
  if (!isRemoteEvent && broadcastChannel) {
    broadcastChannel.postMessage({ type: 'NEW_QUOTE', quote });
  }
}

// Inicializar listener para recibir eventos de otras pestañas o instancias de la app
if (broadcastChannel) {
  broadcastChannel.onmessage = (event) => {
    if (event.data?.type === 'NEW_QUOTE' && event.data?.quote) {
      notifyNewQuote(event.data.quote, true);
    }
  };
}
