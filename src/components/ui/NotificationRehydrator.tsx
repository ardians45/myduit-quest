'use client';

import { useEffect } from 'react';
import { rehydrateNotifications } from '@/lib/notifications';

/**
 * This component rehydrates the notification service worker schedule
 * on every page load so reminders stay active even after browser restart.
 * It renders nothing — used purely for the side effect.
 */
export function NotificationRehydrator() {
  useEffect(() => {
    rehydrateNotifications();
  }, []);

  return null;
}
