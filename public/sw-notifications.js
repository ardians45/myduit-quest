// MyDuit Quest - Notification Service Worker
// Handles scheduled daily reminders

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

// Listen for messages from the main app
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SCHEDULE_NOTIFICATION') {
    const { hour, minute, title, body } = event.data;
    scheduleDaily(hour, minute, title, body);
  }
  if (event.data && event.data.type === 'CANCEL_NOTIFICATION') {
    cancelScheduled();
  }
  if (event.data && event.data.type === 'TEST_NOTIFICATION') {
    self.registration.showNotification('MyDuit Quest 🏰', {
      body: event.data.body || 'Notifikasi berhasil! Kamu akan diingatkan setiap hari.',
      icon: '/avatar.png',
      badge: '/avatar.png',
      tag: 'myduit-test',
    });
  }
});

let scheduledTimer = null;

function cancelScheduled() {
  if (scheduledTimer) {
    clearTimeout(scheduledTimer);
    scheduledTimer = null;
  }
}

function scheduleDaily(hour, minute, title, body) {
  cancelScheduled();

  function getNextFireMs() {
    const now = new Date();
    const next = new Date();
    next.setHours(hour, minute, 0, 0);
    // If time already passed today, schedule for tomorrow
    if (next <= now) {
      next.setDate(next.getDate() + 1);
    }
    return next.getTime() - now.getTime();
  }

  function fireThenReschedule() {
    self.registration.showNotification(title || 'MyDuit Quest 🏰', {
      body: body || 'Jangan lupa catat transaksi hari ini! Jaga HP bentengmu 💪',
      icon: '/avatar.png',
      badge: '/avatar.png',
      tag: 'myduit-daily',
      requireInteraction: false,
      actions: [
        { action: 'open', title: 'Catat Sekarang' },
        { action: 'dismiss', title: 'Nanti' },
      ],
    });
    // Reschedule for next day (24h)
    scheduledTimer = setTimeout(fireThenReschedule, 24 * 60 * 60 * 1000);
  }

  const delay = getNextFireMs();
  scheduledTimer = setTimeout(fireThenReschedule, delay);
}

// Handle notification click
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'open' || !event.action) {
    event.waitUntil(
      self.clients.matchAll({ type: 'window' }).then((clients) => {
        const existingClient = clients.find((c) => 'focus' in c);
        if (existingClient) {
          existingClient.focus();
          existingClient.navigate('/add?type=expense');
        } else {
          self.clients.openWindow('/add?type=expense');
        }
      })
    );
  }
});
