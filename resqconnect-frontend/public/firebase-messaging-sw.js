// This is a simple service worker for notification handling

// Name of the cache
const CACHE_NAME = 'resqconnect-cache-v1';

// URLs to cache
const urlsToCache = [
  '/',
  '/index.html',
  '/static/js/main.chunk.js',
  '/static/js/0.chunk.js',
  '/static/js/bundle.js',
];

// Install service worker
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
  );
});

// Activate service worker
self.addEventListener('activate', (event) => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// Fetch event to serve cached content when offline
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        if (response) {
          return response;
        }
        return fetch(event.request);
      })
  );
});

// Push notification event
self.addEventListener('push', (event) => {
  const data = event.data.json();
  const title = data.title || 'ResQConnect Alert';
  const options = {
    body: data.body || 'New disaster alert in your area',
    icon: '/logo192.png',
    badge: '/logo192.png',
    data: data.data || {},
    actions: [
      {
        action: 'view',
        title: 'View Details',
      },
      {
        action: 'close',
        title: 'Close',
      },
    ],
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

// Notification click event
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'view') {
    // Open the app and navigate to disaster details
    const urlToOpen = new URL('/', self.location.origin);
    event.waitUntil(
      clients.matchAll({
        type: 'window',
        includeUncontrolled: true
      })
      .then((windowClients) => {
        // Check if there is already a window open
        for (let client of windowClients) {
          if (client.url === urlToOpen.href && 'focus' in client) {
            return client.focus();
          }
        }
        // If no window open, open one
        return clients.openWindow(urlToOpen.href);
      })
    );
  }
});