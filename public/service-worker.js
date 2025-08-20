// POS Service Worker for Offline Functionality
const CACHE_NAME = 'pos-cache-v1';
const STATIC_CACHE = 'pos-static-v1';
const DYNAMIC_CACHE = 'pos-dynamic-v1';

// Assets to cache for offline use
const STATIC_ASSETS = [
  '/',
  '/offline.html',
  '/_next/static/css/app-layout.css',
  '/_next/static/chunks/main.js',
  '/_next/static/chunks/webpack.js',
  '/images/mapos-logo.png',
  '/images/mapos-robot.png'
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  console.log('[ServiceWorker] Installing...');
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => {
      console.log('[ServiceWorker] Pre-caching static assets');
      return cache.addAll(STATIC_ASSETS.filter(asset => !asset.includes('_next')));
    })
  );
  self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('[ServiceWorker] Activating...');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== STATIC_CACHE && name !== DYNAMIC_CACHE)
          .map((name) => caches.delete(name))
      );
    })
  );
  self.clients.claim();
});

// Fetch event - serve from cache when offline
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip chrome extension requests
  if (url.protocol === 'chrome-extension:') {
    return;
  }

  // Handle API requests differently
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(handleApiRequest(request));
    return;
  }

  // Network first, fallback to cache strategy for HTML
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const clonedResponse = response.clone();
          caches.open(DYNAMIC_CACHE).then((cache) => {
            cache.put(request, clonedResponse);
          });
          return response;
        })
        .catch(() => {
          return caches.match(request).then((response) => {
            return response || caches.match('/offline.html');
          });
        })
    );
    return;
  }

  // Cache first strategy for static assets
  event.respondWith(
    caches.match(request).then((response) => {
      if (response) {
        return response;
      }
      return fetch(request).then((response) => {
        if (!response || response.status !== 200 || response.type !== 'basic') {
          return response;
        }
        const responseToCache = response.clone();
        caches.open(DYNAMIC_CACHE).then((cache) => {
          cache.put(request, responseToCache);
        });
        return response;
      });
    })
  );
});

// Handle API requests with offline queue
async function handleApiRequest(request) {
  try {
    const response = await fetch(request.clone());
    return response;
  } catch (error) {
    console.log('[ServiceWorker] API request failed, checking if queueable:', request.url);
    
    // Queue certain API requests when offline
    if (shouldQueueRequest(request)) {
      await queueRequest(request.clone());
      
      // Return a synthetic response
      return new Response(
        JSON.stringify({
          success: true,
          offline: true,
          queued: true,
          message: 'Transaction queued for sync when online'
        }),
        {
          status: 202,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }
    
    // For other API requests, return offline error
    return new Response(
      JSON.stringify({
        success: false,
        offline: true,
        error: 'No internet connection'
      }),
      {
        status: 503,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}

// Determine if request should be queued
function shouldQueueRequest(request) {
  const url = new URL(request.url);
  const queueablePaths = [
    '/api/sales',
    '/api/transactions',
    '/api/receipt',
    '/api/inventory/update'
  ];
  return queueablePaths.some(path => url.pathname.includes(path)) && 
         request.method === 'POST';
}

// Queue request for later sync
async function queueRequest(request) {
  const url = new URL(request.url);
  const body = await request.text();
  
  const queueData = {
    url: url.href,
    method: request.method,
    headers: Object.fromEntries(request.headers.entries()),
    body: body,
    timestamp: Date.now(),
    id: `${Date.now()}-${Math.random()}`
  };
  
  // Store in IndexedDB via client
  const clients = await self.clients.matchAll();
  if (clients.length > 0) {
    clients[0].postMessage({
      type: 'QUEUE_REQUEST',
      data: queueData
    });
  }
}

// Listen for sync events
self.addEventListener('sync', (event) => {
  console.log('[ServiceWorker] Sync event fired:', event.tag);
  if (event.tag === 'sync-queue') {
    event.waitUntil(syncQueue());
  }
});

// Sync queued requests
async function syncQueue() {
  const clients = await self.clients.matchAll();
  if (clients.length > 0) {
    clients[0].postMessage({
      type: 'SYNC_QUEUE'
    });
  }
}

// Listen for messages from clients
self.addEventListener('message', (event) => {
  console.log('[ServiceWorker] Message received:', event.data);
  
  if (event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data.type === 'FORCE_SYNC') {
    syncQueue();
  }
});