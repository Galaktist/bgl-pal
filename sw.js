const APP_PREFIX = 'bglpal_';
const VERSION = 'v04';
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
  '/images/Anim_Autumn_Day.gif',
  '/images/Anim_Autumn_Night.gif',
  '/images/Anim_Spring_Day.gif',
  '/images/Anim_Spring_Night.gif',
  '/images/Anim_Summer_Day.gif',
  '/images/Anim_Summer_Night.gif',
  '/images/Anim_Winter_Day.gif',
  '/images/Anim_Winter_Night.gif',
  '/images/Aus_flag.png',
  '/images/bglPal_screenshot_d.png',
  '/images/bglPal_screenshot_m.png',
  '/images/bglPal.png',
  '/images/bglPal16_16.png',
  '/images/bglPal32_32.png',
  '/images/bglPal64_64.png',
  '/images/bglPal96_96.png',
  '/images/bglPal128_128.png',
  '/images/bglPal144_144.png',
  '/images/bglPal160_160.png',
  '/images/bglPal192_192.png',
  '/images/bglPal384_384.png',
  '/images/bglPal512_512.png',
  '/images/bglPalLogo_128_128.png',
  '/images/bin_large.png',
  '/images/bin_small.png',
  '/images/bin.png',
  '/images/calc_yellow.png',
  '/images/calendar.png',
  '/images/Canada_flag.png',
  '/images/cat_awake.png',
  '/images/cat_sleep_64.png',
  '/images/chart_large.png',
  '/images/chart_small_summer_day.png',
  '/images/chart_small_summer_night.png',
  '/images/clock.png',
  '/images/feast_32.png',
  '/images/flowers.png',
  '/images/gizmo.png',
  '/images/hamburger.png',
  '/images/Milli_mole_64.png',
  '/images/mouse_default.png',
  '/images/mouse_pointer.png',
  '/images/mouse_text.png',
  '/images/pencil_large.png',
  '/images/pencil_note.png',
  '/images/pencil_small.png',
  '/images/pencil.png',
  '/images/rocket.png',
  '/images/snowman.png',
  '/images/soccer.png',
  '/images/star_less_128_128.png',
  '/images/star_less_128_512.png',
  '/images/treeFall.png',
  '/images/yacht.png',
  '/js/utils/chart.js',
  '/js/utils/chartHelpers.js',
  '/js/utils/csvService.js',
  '/js/utils/helpers.js',
  '/js/utils/storage.js',
  '/js/views/statistics/calculator.js',
  '/js/views/statistics/exercise.js',
  '/js/views/statistics/foodDatabase.js',
  '/js/views/statistics/insulinSpeed.js',
  '/js/views/statistics/meal.js',
  '/js/views/statistics/sleep.js',
  '/js/views/statistics/timeOfDayRatio.js',
  '/js/views/statistics/weekPattern.js',
  '/js/views/about.js',
  '/js/views/home.js',
  '/js/views/log.js',
  '/js/views/settings.js',
  '/js/app.js',
  '/js/router.js'
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
