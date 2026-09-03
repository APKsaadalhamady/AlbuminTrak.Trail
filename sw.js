// غيّر رقم الإصدار (v4) في كل مرة ترفع فيها تعديلاً جديداً
const CACHE_NAME = 'albumintrak-v4';
const URLS_TO_CACHE = [
    './',
    './index.html',
    './manifest.json',
    './icon.svg',
    'https://cdn.tailwindcss.com',
    'https://cdn.jsdelivr.net/npm/xlsx@0.18.5/dist/xlsx.full.min.js',
    'https://www.gstatic.com/firebasejs/9.23.0/firebase-app-compat.js',
    'https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore-compat.js'
];

// 1. إجبار تفعيل التحديث فوراً وتخطي الانتظار
self.addEventListener('install', (e) => {
    self.skipWaiting();
    e.waitUntil(
        caches.open(CACHE_NAME).then((cache) => cache.addAll(URLS_TO_CACHE))
    );
});

// 2. حذف النسخ القديمة تماماً من ذاكرة الهاتف
self.addEventListener('activate', (e) => {
    e.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cache) => {
                    if (cache !== CACHE_NAME) {
                        return caches.delete(cache);
                    }
                })
            );
        }).then(() => self.clients.claim())
    );
});

// 3. استراتيجية Network First: محاولة جلب الجديد أولاً، والاعتماد على الكاش عند انقطاع النت فقط
self.addEventListener('fetch', (e) => {
    e.respondWith(
        fetch(e.request)
            .then((networkResponse) => {
                // تحديث الكاش بالملف الجديد عند توفر النت
                if (e.request.method === 'GET') {
                    const responseClone = networkResponse.clone();
                    caches.open(CACHE_NAME).then((cache) => {
                        cache.put(e.request, responseClone);
                    });
                }
                return networkResponse;
            })
            .catch(() => {
                // في حال عدم توفر النت (أوفلاين) يتم الفتح من الكاش
                return caches.match(e.request);
            })
    );
});
