self.addEventListener('push', function(event) {
  let data = { title: 'PituGym', body: 'Nuova notifica!' };
  try {
    data = event.data.json();
  } catch (e) {
    data = { title: 'PituGym', body: event.data.text() };
  }
  
  const options = {
    body: data.body,
    icon: data.icon || '🦁',
    badge: data.badge || '🦁',
    vibrate: [200, 100, 200],
    data: {
      url: '/'
    }
  };
  event.waitUntil(self.registration.showNotification(data.title, options));
});

self.addEventListener('notificationclick', function(event) {
  event.notification.close();
  event.waitUntil(
    clients.openWindow(event.notification.data.url || '/')
  );
});
