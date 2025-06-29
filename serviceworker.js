self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open('v1').then((cache) => {
            return cache.addAll([
                '/',
                '/index.html',
                '/styles.css',
                '/scriptaddtcart.js',
                '/img/icon-192x192.png',
                '/img/icon-512x512.png'
            ]).catch(err => console.error('Cache addAll failed. Missing files:', err));
        })
    );
});

self.addEventListener('fetch', (event) => {
    event.respondWith(
        caches.match(event.request).then((response) => {
            return response || fetch(event.request).catch(err => console.log('Fetch failed for:', event.request.url, err));
        })
    );
});