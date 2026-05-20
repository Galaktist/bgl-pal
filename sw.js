const APP_PREFIX = 'bglpal_';
const VERSION = 'v03';
const CACHE_NAME = APP_PREFIX + VERSION;

// every file needed for offline
const ASSETS_TO_CACHE = [    
  '/',
  '/index.html',
  '/styles/style.css',
  '/fonts/Ac437_EpsonMGA_Alt.ttf',
  '/fonts/Ac437_IBM_CGAthin.ttf',
  '/fonts/Ac437_Phoenix_BIOS-2y.ttf',
  '/fonts/Ac437_Phoenix_BIOS.ttf',
  '/fonts/AtariClassicChunky-PxXP.ttf',
  '/fonts/CasaletwoNbp-Bp4V.ttf',
  '/fonts/MegamaxJonathanToo-YqOq2.ttf',
  '/fonts/PixelatedEleganceRegular-ovyAA.ttf',
  '/fonts/SpaceMono-Regular.ttf',
  '/html/a1Home.html',
  '/html/a2LogEntry.html',
  '/html/a3Settings.html',
  '/html/a5About.html',
  '/html/b1Meal.html',
  '/html/b2Exercise.html',
  '/html/b3Calculator.html',
  '/html/b4WeekPattern.html',
  '/html/b5FoodDatabase.html',
  '/html/b6TimeOfDayRatio.html',
  '/html/b7InsulinSpeed.html',
  '/html/b8Sleep.html',
]

self.addEventListener('fetch', function (e) {
  console.log('Fetch request : ' + e.request.url);
  e.respondWith(
    caches.match(e.request).then(function (request) {
      if (request) { 
        console.log('Responding with cache : ' + e.request.url);
        return request
      } else {       
        console.log('File is not cached, fetching : ' + e.request.url);
        return fetch(e.request)
      }
    })
  )
})

// install sw and cache all assets
self.addEventListener('install', function (e) {
  e.waitUntil(
    caches.open(CACHE_NAME).then(function (cache) {
      console.log('Installing cache : ' + CACHE_NAME);
      return cache.addAll(ASSETS_TO_CACHE)
    })
  )
})

// clean up old caches if version changes
self.addEventListener('activate', function (e) {
  e.waitUntil(
    caches.keys().then(function (keyList) {
      var cacheWhitelist = keyList.filter(function (key) {
        return key.indexOf(APP_PREFIX)
      })
      cacheWhitelist.push(CACHE_NAME);
      return Promise.all(keyList.map(function (key, i) {
        if (cacheWhitelist.indexOf(key) === -1) {
          console.log('Deleting cache : ' + keyList[i] );
          return caches.delete(keyList[i])
        }
      }))
    })
  )
})
