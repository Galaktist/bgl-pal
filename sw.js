var GHPATH = '/bgl-pal';
var APP_PREFIX = 'offline_';
var VERSION = 'version_01';
var URLS = [    
  `${GHPATH}/`,
  `${GHPATH}/index.html`,
  `${GHPATH}/styles/style.css`,
  `${GHPATH}/fonts/Ac437_EpsonMGA_Alt.ttf`,
  `${GHPATH}/fonts/Ac437_IBM_CGAthin.ttf`,
  `${GHPATH}/fonts/Ac437_Phoenix_BIOS-2y.ttf`,
  `${GHPATH}/fonts/Ac437_Phoenix_BIOS.ttf`,
  `${GHPATH}/fonts/AtariClassicChunky-PxXP.ttf`,
  `${GHPATH}/fonts/CasaletwoNbp-Bp4V.ttf`,
  `${GHPATH}/fonts/MegamaxJonathanToo-YqOq2.ttf`,
  `${GHPATH}/fonts/PixelatedEleganceRegular-ovyAA.ttf`,
  `${GHPATH}/fonts/SpaceMono-Regular.ttf`,
  `${GHPATH}/html/a1Home.html`,
  `${GHPATH}/html/a2LogEntry.html`,
  `${GHPATH}/html/a3Settings.html`,
  `${GHPATH}/html/a5About.html`,
  `${GHPATH}/html/b1Meal.html`,
  `${GHPATH}/html/b2Exercise.html`,
  `${GHPATH}/html/b3Calculator.html`,
  `${GHPATH}/html/b4WeekPattern.html`,
  `${GHPATH}/html/b5FoodDatabase.html`,
  `${GHPATH}/html/b6TimeOfDayRatio.html`,
  `${GHPATH}/html/b7InsulinSpeed.html`,
  `${GHPATH}/html/b8Sleep.html`,
  `${GHPATH}/images/Anim_Autumn_Day.gif`,
  `${GHPATH}/images/Anim_Autumn_Night.gif`,
  `${GHPATH}/images/Anim_Spring_Day.gif`,
  `${GHPATH}/images/Anim_Spring_Night.gif`,
  `${GHPATH}/images/Anim_Summer_Day.gif`,
  `${GHPATH}/images/Anim_Summer_Night.gif`,
  `${GHPATH}/images/Anim_Winter_Day.gif`,
  `${GHPATH}/images/Anim_Winter_Night.gif`,
  `${GHPATH}/images/Aus_flag.png`,
  `${GHPATH}/images/bglPal.png`,
  `${GHPATH}/images/bglPal16_16.png`,
  `${GHPATH}/images/bglPal32_32.png`,
  `${GHPATH}/images/bglPal64_64.png`,
  `${GHPATH}/images/bglPal96_96.png`,
  `${GHPATH}/images/bglPal128_128.png`,
  `${GHPATH}/images/bglPal144_144.png`,
  `${GHPATH}/images/bglPal160_160.png`,
  `${GHPATH}/images/bglPal192_192.png`,
  `${GHPATH}/images/bglPal384_384.png`,
  `${GHPATH}/images/bglPal512_512.png`,
  `${GHPATH}/images/bglPalLogo_128_128.png`,
  `${GHPATH}/images/bin_large.png`,
  `${GHPATH}/images/bin_small.png`,
  `${GHPATH}/images/bin.png`,
  `${GHPATH}/images/calc_yellow.png`,
  `${GHPATH}/images/calendar.png`,
  `${GHPATH}/images/Canada_flag.png`,
  `${GHPATH}/images/cat_awake.png`,
  `${GHPATH}/images/cat_sleep_64.png`,
  `${GHPATH}/images/chart_large.png`,
  `${GHPATH}/images/chart_small_summer_day.png`,
  `${GHPATH}/images/chart_small_summer_night.png`,
  `${GHPATH}/images/clock.png`,
  `${GHPATH}/images/feast_32.png`,
  `${GHPATH}/images/flowers.png`,
  `${GHPATH}/images/gizmo.png`,
  `${GHPATH}/images/hamburger.png`,
  `${GHPATH}/images/Milli_mole_64.png`,
  `${GHPATH}/images/mouse_default.png`,
  `${GHPATH}/images/mouse_pointer.png`,
  `${GHPATH}/images/mouse_text.png`,
  `${GHPATH}/images/pencil_large.png`,
  `${GHPATH}/images/pencil_note.png`,
  `${GHPATH}/images/pencil_small.png`,
  `${GHPATH}/images/pencil.png`,
  `${GHPATH}/images/rocket.png`,
  `${GHPATH}/images/snowman.png`,
  `${GHPATH}/images/soccer.png`,
  `${GHPATH}/images/star_less_128_128.png`,
  `${GHPATH}/images/star_less_128_512.png`,
  `${GHPATH}/images/treeFall.png`,
  `${GHPATH}/images/yacht.png`,
  `${GHPATH}/js/utils/chart.js`,
  `${GHPATH}/js/utils/chartHelpers.js`,
  `${GHPATH}/js/utils/csvService.js`,
  `${GHPATH}/js/utils/helpers.js`,
  `${GHPATH}/js/utils/storage.js`,
  `${GHPATH}/js/views/statistics/calculator.js`,
  `${GHPATH}/js/views/statistics/exercise.js`,
  `${GHPATH}/js/views/statistics/foodDatabase.js`,
  `${GHPATH}/js/views/statistics/insulinSpeed.js`,
  `${GHPATH}/js/views/statistics/meal.js`,
  `${GHPATH}/js/views/statistics/sleep.js`,
  `${GHPATH}/js/views/statistics/timeOfDayRatio.js`,
  `${GHPATH}/js/views/statistics/weekPattern.js`,
  `${GHPATH}/js/views/about.js`,
  `${GHPATH}/js/views/home.js`,
  `${GHPATH}/js/views/log.js`,
  `${GHPATH}/js/views/settings.js`,
  `${GHPATH}/js/app.js`,
  `${GHPATH}/js/router.js`,
]

var CACHE_NAME = APP_PREFIX + VERSION
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

self.addEventListener('install', function (e) {
  e.waitUntil(
    caches.open(CACHE_NAME).then(function (cache) {
      console.log('Installing cache : ' + CACHE_NAME);
      return cache.addAll(URLS)
    })
  )
})

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