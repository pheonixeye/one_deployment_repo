'use strict';
const MANIFEST = 'flutter-app-manifest';
const TEMP = 'flutter-temp-cache';
const CACHE_NAME = 'flutter-app-cache';

const RESOURCES = {"canvaskit/canvaskit.js": "8331fe38e66b3a898c4f37648aaf7ee2",
"canvaskit/canvaskit.js.symbols": "a3c9f77715b642d0437d9c275caba91e",
"canvaskit/canvaskit.wasm": "9b6a7830bf26959b200594729d73538e",
"canvaskit/chromium/canvaskit.js": "a80c765aaa8af8645c9fb1aae53f9abf",
"canvaskit/chromium/canvaskit.js.symbols": "e2d09f0e434bc118bf67dae526737d07",
"canvaskit/chromium/canvaskit.wasm": "a726e3f75a84fcdf495a15817c63a35d",
"canvaskit/skwasm.js": "8060d46e9a4901ca9991edd3a26be4f0",
"canvaskit/skwasm.js.symbols": "3a4aadf4e8141f284bd524976b1d6bdc",
"canvaskit/skwasm.wasm": "7e5f3afdd3b0747a1fd4517cea239898",
"canvaskit/skwasm_heavy.js": "740d43a6b8240ef9e23eed8c48840da4",
"canvaskit/skwasm_heavy.js.symbols": "0755b4fb399918388d71b59ad390b055",
"canvaskit/skwasm_heavy.wasm": "b0be7910760d205ea4e011458df6ee01",
"flutter.js": "24bc71911b75b5f8135c949e27a2984e",
"flutter_bootstrap.js": "4005d98dda1c1eba47b98354311805b5",
"index.html": "44347d48c5477cae65564cd02958b537",
"/": "44347d48c5477cae65564cd02958b537",
"main.dart.js": "337c4bc7f7e47b2a5df8dbc0f7c2b903",
"version.json": "f356590ae556dd50d9686a536d10fb9d",
"assets/assets/images/404.svg": "507fd10098538408ba07f7b97551187d",
"assets/assets/images/after_purchase.svg": "ee15577f83f6dd7a8a642c63a49f4673",
"assets/assets/images/bg-svg.svg": "375fd7473b052e726eef6c2fbf9241fe",
"assets/assets/images/bg.webp": "d94ea5c7f9d92af52bc4a78f6d9f624d",
"assets/assets/images/body_back.webp": "2d2dc474f6bd26a491f39ab449d9b640",
"assets/assets/images/body_front.webp": "57bb9d39491d6051c6ae83a1fa06b9d3",
"assets/assets/images/body_side.webp": "10461e9814f34875b3c57bdff88f501a",
"assets/assets/images/const-svg.svg": "2c4e99705d2b46978f756ffacf21601c",
"assets/assets/images/error.png": "1fc784623c7400939b69f406614c3172",
"assets/assets/images/register-avatar.webp": "20fc4e3b8df9054a3b606c2f3aaf3c4b",
"assets/assets/images/exp_ar.png": "5f01d59cdc3d89ae2403d88af0a09b60",
"assets/assets/images/exp_en.png": "920f0e4404bc5b781f15e8e727d5f9db",
"assets/assets/images/profile_setup/drugs.png": "ac37a005a90110d2a0c564af736cabc1",
"assets/assets/images/profile_setup/labs.png": "b50e8b3a74c0a862184e98df6297d611",
"assets/assets/images/profile_setup/procedures.png": "5799d173168902c907284b661fff3885",
"assets/assets/images/profile_setup/radiology.png": "651bb811ae7d7b7984c81a18a267f9db",
"assets/assets/images/profile_setup/supplies.png": "913e9d0eeea1b13f1f890de437c79169",
"assets/assets/images/profile_setup/documents.png": "130d60ffd064c39b99c8910cad45c002",
"assets/assets/images/profile_setup/referrals.png": "ae77b57c55464e4ce85e376e0512a74e",
"assets/assets/images/hero.png": "9fcff8ad8525e97f5cc698175238d755",
"assets/assets/images/icon.png": "bc7e67fd52e4b9f1ae7759719fa9644f",
"assets/assets/images/features/feat_0.png": "721be6ee6db8eb477e9eb4e9120d72a2",
"assets/assets/images/features/feat_1.png": "1afbc57193c4f073ab34ba12ba5c10ea",
"assets/assets/images/features/feat_2.png": "cdbe68b9ca01463e5f26ab0f940a1aa9",
"assets/assets/images/features/feat_3.png": "79b8552dcf8bdfc7a7c9500c99c68289",
"assets/assets/images/features/feat_4.png": "d3bad66e0a62b252e70a7bf3e8481445",
"assets/assets/images/subscription_icons/annual.svg": "93db83cbabf9ca8bcdc19c5114fa6ec2",
"assets/assets/images/subscription_icons/half%2520annual.svg": "b50f3331f70b9c485dddb1e7e0d2ad36",
"assets/assets/images/subscription_icons/monthly.svg": "34e8704bf0af6ef701d88b1a574add1f",
"assets/assets/images/loaders/1.png": "112355ac25ac2abdd8c337340be5c64e",
"assets/assets/images/loaders/2.png": "2999401f7b1ba3bde15107039153ea2a",
"assets/assets/images/loaders/3.png": "affa571e1c0ae43f5c5556beb032f7e1",
"assets/assets/images/loaders/4.png": "a7832bac1959f1cad1caa2b916c967c9",
"assets/assets/images/loaders/5.png": "78474fe65856aaed9e743da7fd3efcf9",
"assets/assets/fonts/IBM/font-Bold-700.ttf": "3b112e6aa65695f31fa1e1a8fb0589a9",
"assets/assets/fonts/IBM/font-ExtraLight-200.ttf": "2ac69265ef57c13e2bf7d71f0d86e30b",
"assets/assets/fonts/IBM/font-Light-300.ttf": "fc8d66d7803c5703326895c99f36aa39",
"assets/assets/fonts/IBM/font-Medium-500.ttf": "5fb42fdbaf9db9218cd8b43c4f53cae1",
"assets/assets/fonts/IBM/font-Regular-400.ttf": "bf7497338196d1ed6c36ea4d010f12a8",
"assets/assets/fonts/IBM/font-SemiBold-600.ttf": "c6da47ef5746d5af5a7bca3f07a444c3",
"assets/assets/fonts/IBM/font-Thin-100.ttf": "454434ea7b20d86b0b52f4c8a9e772d9",
"assets/assets/lang/log.txt": "99914b932bd37a50b983c5e7c90ae93b",
"assets/assets/lang/app_ar.arb": "ee9aa2e6d954ce997cbf261e9cc4b187",
"assets/assets/lang/app_en.arb": "96c344f2210aad358f3b0c2fb4e69081",
"assets/assets/json/specialities.json": "e7dc488fd62eb09092230c8f1b7ebd10",
"assets/assets/json/visit_form_data.json": "dfb928ea9bf1cd5c66934a34887213a9",
"assets/assets/sounds/notification.mp3": "b5932f1d3ea5156bb7858a7fd325422d",
"assets/packages/font_awesome_flutter/lib/fonts/Font-Awesome-7-Free-Solid-900.otf": "aac592bec4418ecd063aa6eee7dfc69b",
"assets/packages/font_awesome_flutter/lib/fonts/Font-Awesome-7-Brands-Regular-400.otf": "d40c67ce9f52d4bf087e61453006393c",
"assets/packages/font_awesome_flutter/lib/fonts/Font-Awesome-7-Free-Regular-400.otf": "559e18b055fff97cd32f1b4160747367",
"assets/packages/cupertino_icons/assets/CupertinoIcons.ttf": "89261c1675d0a81b3f8f53cb9dc7057d",
"assets/fonts/MaterialIcons-Regular.otf": "983dd7b38630d9fe756a1104654e3bf0",
"assets/shaders/ink_sparkle.frag": "ecc85a2e95f5e9f53123dcaf8cb9b6ce",
"assets/shaders/stretch_effect.frag": "40d68efbbf360632f614c731219e95f0",
"assets/AssetManifest.bin": "7b0f1aece6ebc876c15aee7252ea05d3",
"assets/AssetManifest.bin.json": "7294e21147bb422f1a1ef5912cd66aeb",
"assets/FontManifest.json": "9db3b0e606e8c71db228872fac2adb81",
"assets/NOTICES": "73132fa65be672d5b7cd7b1544ec6fdb",
"icons/android-chrome-512x512.png": "bc7e67fd52e4b9f1ae7759719fa9644f",
"icons/android-chrome-192x192.png": "03853939a349aae758e846218666b695",
"icons/apple-touch-icon.png": "15f8292bb67a893f063eaeeea00bf0f9",
"icons/favicon-96x96.png": "1b70627c8027449565151846485217f6",
"icons/favicon-32x32.png": "1b70627c8027449565151846485217f6",
"icons/favicon-16x16.png": "1b70627c8027449565151846485217f6",
"manifest.json": "e4b053d8d0b01bdb0e5ca67ef3d84d4f",
"firebase-messaging-sw.js": "bc39aac1280ee8eb8d51a53f29114abd",
"favicon.ico": "77cafba61ab94407eac37cfccb47eea4",
"main.dart.mjs": "6133897724ef4e8b0b2e0de5300196ae",
"main.dart.wasm": "fce90d6ec086545672bdf70cb78dec6c"};
// The application shell files that are downloaded before a service worker can
// start.
const CORE = ["main.dart.js",
"main.dart.wasm",
"main.dart.mjs",
"index.html",
"flutter_bootstrap.js",
"assets/AssetManifest.bin.json",
"assets/FontManifest.json"];

// During install, the TEMP cache is populated with the application shell files.
self.addEventListener("install", (event) => {
  self.skipWaiting();
  return event.waitUntil(
    caches.open(TEMP).then((cache) => {
      return cache.addAll(
        CORE.map((value) => new Request(value, {'cache': 'reload'})));
    })
  );
});
// During activate, the cache is populated with the temp files downloaded in
// install. If this service worker is upgrading from one with a saved
// MANIFEST, then use this to retain unchanged resource files.
self.addEventListener("activate", function(event) {
  return event.waitUntil(async function() {
    try {
      var contentCache = await caches.open(CACHE_NAME);
      var tempCache = await caches.open(TEMP);
      var manifestCache = await caches.open(MANIFEST);
      var manifest = await manifestCache.match('manifest');
      // When there is no prior manifest, clear the entire cache.
      if (!manifest) {
        await caches.delete(CACHE_NAME);
        contentCache = await caches.open(CACHE_NAME);
        for (var request of await tempCache.keys()) {
          var response = await tempCache.match(request);
          await contentCache.put(request, response);
        }
        await caches.delete(TEMP);
        // Save the manifest to make future upgrades efficient.
        await manifestCache.put('manifest', new Response(JSON.stringify(RESOURCES)));
        // Claim client to enable caching on first launch
        self.clients.claim();
        return;
      }
      var oldManifest = await manifest.json();
      var origin = self.location.origin;
      for (var request of await contentCache.keys()) {
        var key = request.url.substring(origin.length + 1);
        if (key == "") {
          key = "/";
        }
        // If a resource from the old manifest is not in the new cache, or if
        // the MD5 sum has changed, delete it. Otherwise the resource is left
        // in the cache and can be reused by the new service worker.
        if (!RESOURCES[key] || RESOURCES[key] != oldManifest[key]) {
          await contentCache.delete(request);
        }
      }
      // Populate the cache with the app shell TEMP files, potentially overwriting
      // cache files preserved above.
      for (var request of await tempCache.keys()) {
        var response = await tempCache.match(request);
        await contentCache.put(request, response);
      }
      await caches.delete(TEMP);
      // Save the manifest to make future upgrades efficient.
      await manifestCache.put('manifest', new Response(JSON.stringify(RESOURCES)));
      // Claim client to enable caching on first launch
      self.clients.claim();
      return;
    } catch (err) {
      // On an unhandled exception the state of the cache cannot be guaranteed.
      console.error('Failed to upgrade service worker: ' + err);
      await caches.delete(CACHE_NAME);
      await caches.delete(TEMP);
      await caches.delete(MANIFEST);
    }
  }());
});
// The fetch handler redirects requests for RESOURCE files to the service
// worker cache.
self.addEventListener("fetch", (event) => {
  if (event.request.method !== 'GET') {
    return;
  }
  var origin = self.location.origin;
  var key = event.request.url.substring(origin.length + 1);
  // Redirect URLs to the index.html
  if (key.indexOf('?v=') != -1) {
    key = key.split('?v=')[0];
  }
  if (event.request.url == origin || event.request.url.startsWith(origin + '/#') || key == '') {
    key = '/';
  }
  // If the URL is not the RESOURCE list then return to signal that the
  // browser should take over.
  if (!RESOURCES[key]) {
    return;
  }
  // If the URL is the index.html, perform an online-first request.
  if (key == '/') {
    return onlineFirst(event);
  }
  event.respondWith(caches.open(CACHE_NAME)
    .then((cache) =>  {
      return cache.match(event.request).then((response) => {
        // Either respond with the cached resource, or perform a fetch and
        // lazily populate the cache only if the resource was successfully fetched.
        return response || fetch(event.request).then((response) => {
          if (response && Boolean(response.ok)) {
            cache.put(event.request, response.clone());
          }
          return response;
        });
      })
    })
  );
});
self.addEventListener('message', (event) => {
  // SkipWaiting can be used to immediately activate a waiting service worker.
  // This will also require a page refresh triggered by the main worker.
  if (event.data === 'skipWaiting') {
    self.skipWaiting();
    return;
  }
  if (event.data === 'downloadOffline') {
    downloadOffline();
    return;
  }
});
// Download offline will check the RESOURCES for all files not in the cache
// and populate them.
async function downloadOffline() {
  var resources = [];
  var contentCache = await caches.open(CACHE_NAME);
  var currentContent = {};
  for (var request of await contentCache.keys()) {
    var key = request.url.substring(origin.length + 1);
    if (key == "") {
      key = "/";
    }
    currentContent[key] = true;
  }
  for (var resourceKey of Object.keys(RESOURCES)) {
    if (!currentContent[resourceKey]) {
      resources.push(resourceKey);
    }
  }
  return contentCache.addAll(resources);
}
// Attempt to download the resource online before falling back to
// the offline cache.
function onlineFirst(event) {
  return event.respondWith(
    fetch(event.request).then((response) => {
      return caches.open(CACHE_NAME).then((cache) => {
        cache.put(event.request, response.clone());
        return response;
      });
    }).catch((error) => {
      return caches.open(CACHE_NAME).then((cache) => {
        return cache.match(event.request).then((response) => {
          if (response != null) {
            return response;
          }
          throw error;
        });
      });
    })
  );
}
