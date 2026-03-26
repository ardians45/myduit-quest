// Notification utility for MyDuit Quest
// Registers the notification service worker and manages daily reminders

const SW_URL = '/sw-notifications.js';
const NOTIF_SW_SCOPE = '/';
const STORAGE_KEY = 'myduit-notif-enabled';
const STORAGE_HOUR_KEY = 'myduit-notif-hour';
const STORAGE_MIN_KEY = 'myduit-notif-min';

/** Check if notifications are supported */
export function isNotificationSupported(): boolean {
  return typeof window !== 'undefined' &&
    'Notification' in window &&
    'serviceWorker' in navigator;
}

/** Get current permission state */
export function getNotificationPermission(): NotificationPermission | 'unsupported' {
  if (!isNotificationSupported()) return 'unsupported';
  return Notification.permission;
}

/** Register the notification service worker */
async function getNotifSW(): Promise<ServiceWorkerRegistration | null> {
  if (!isNotificationSupported()) return null;
  try {
    const reg = await navigator.serviceWorker.register(SW_URL, { scope: NOTIF_SW_SCOPE });
    await navigator.serviceWorker.ready;
    return reg;
  } catch (e) {
    console.error('[Notif] SW registration failed:', e);
    return null;
  }
}

/** Send a message to the notification service worker */
async function sendToSW(message: Record<string, unknown>): Promise<void> {
  const reg = await getNotifSW();
  if (!reg) return;
  const sw = reg.active || reg.installing || reg.waiting;
  if (sw) {
    sw.postMessage(message);
  }
}

/** Enable daily notifications at the given hour:minute (24h format) */
export async function enableDailyNotification(
  hour = 20,
  minute = 0
): Promise<'granted' | 'denied' | 'unsupported'> {
  if (!isNotificationSupported()) return 'unsupported';

  const permission = await Notification.requestPermission();
  if (permission !== 'granted') return permission as 'denied';

  localStorage.setItem(STORAGE_KEY, 'true');
  localStorage.setItem(STORAGE_HOUR_KEY, String(hour));
  localStorage.setItem(STORAGE_MIN_KEY, String(minute));

  await sendToSW({
    type: 'SCHEDULE_NOTIFICATION',
    hour,
    minute,
    title: 'MyDuit Quest 🏰',
    body: 'Jangan lupa catat transaksi hari ini! Jaga HP bentengmu 💪',
  });

  return 'granted';
}

/** Disable daily notifications */
export async function disableDailyNotification(): Promise<void> {
  localStorage.setItem(STORAGE_KEY, 'false');
  await sendToSW({ type: 'CANCEL_NOTIFICATION' });
}

/** Check if notifications are enabled (from localStorage) */
export function isDailyNotificationEnabled(): boolean {
  if (typeof window === 'undefined') return false;
  return localStorage.getItem(STORAGE_KEY) === 'true' &&
    Notification.permission === 'granted';
}

/** Re-apply notification schedule on page load (call from layout/app mount) */
export async function rehydrateNotifications(): Promise<void> {
  if (!isDailyNotificationEnabled()) return;
  const hour = parseInt(localStorage.getItem(STORAGE_HOUR_KEY) || '20', 10);
  const minute = parseInt(localStorage.getItem(STORAGE_MIN_KEY) || '0', 10);
  await sendToSW({
    type: 'SCHEDULE_NOTIFICATION',
    hour,
    minute,
    title: 'MyDuit Quest 🏰',
    body: 'Jangan lupa catat transaksi hari ini! Jaga HP bentengmu 💪',
  });
}

/** Send an immediate test notification */
export async function sendTestNotification(): Promise<void> {
  await sendToSW({
    type: 'TEST_NOTIFICATION',
    body: 'Notifikasi berhasil diaktifkan! Kamu akan diingatkan setiap hari pukul 20:00.',
  });
}
