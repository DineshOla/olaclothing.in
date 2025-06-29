const CACHE_NAME = 'ola-clothing-cache-v1';
const urlsToCache = [
    '/',
    '/index.html',
    '/styles.css',
    '/scriptaddtcart.js',
    '/img/Main-Banners.jpg',
    '/img/Main-Banners-mobile.jpg',
    '/img/Main-Banners-tablet.jpg',
    '/img/men_shirts.jpeg',
    '/img/men_denim.jpg.webp',
    '/img/men_polos&tees.jpg',
    '/img/men_shoes.jpg',
    '/img/women_bags.jpg',
    '/img/women_dresses.jpg',
    '/img/women_tops.jpg',
    '/img/women_jeans.jpg',
    '/img/icon-192x192.png',
    '/img/icon-512x512.png'
];

self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('Opened cache');
                return cache.addAll(urlsToCache);
            })
    );
});

self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request)
            .then(response => {
                return response || fetch(event.request);
            })
    );
});

self.addEventListener('activate', event => {
    const cacheWhitelist = [CACHE_NAME];
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (!cacheWhitelist.includes(cacheName)) {
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});