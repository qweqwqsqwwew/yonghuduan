'use strict';
const MANIFEST = 'flutter-app-manifest';
const TEMP = 'flutter-temp-cache';
const CACHE_NAME = 'flutter-app-cache';
const RESOURCES = {
  "version.json": "c27e4ba8552cd12faded26ef84176ec3",
"index.html": "9ff3e49aded1e57839514472596814f7",
"/": "9ff3e49aded1e57839514472596814f7",
"main.dart.js": "69ce52bfde7d7269f851acf2f01f2638",
"assets/asset/images/home/home_item_detail_note.png": "6ef89ad0d628e4617600b0327cd5cd97",
"assets/asset/images/home/home_item_detail_group.png": "84650905dfb03152be4d3d6ac7e33bbf",
"assets/asset/images/home/home_item_detail_service.png": "6adb52cd19231609d4d438996c1ec934",
"assets/asset/images/home/homeservicepc2.png": "a114ec319a9bb3469ba1e88ddcc15116",
"assets/asset/images/home/homeservicepc3.png": "2e97e5bfc73521100c778a5983ce31a4",
"assets/asset/images/home/homeservicepc1.png": "a1fe1f3c4587f278f8fd8d0446b82f37",
"assets/asset/images/mine/saomiao.png": "72c3f8e509ac4b9cd17e48592ab5e63a",
"assets/asset/images/mine/Order_complete.png": "cbfd153e3501f243756eb1bf6c478acf",
"assets/asset/images/mine/men.png": "5f7b53f3e1273e316ea0740e575bc683",
"assets/asset/images/mine/paygou.png": "d830daaf2872ac6b558365f906a08c49",
"assets/asset/images/mine/Order_evaluate.png": "7d7e2a6305afbbe9d5bfc6a6ab1d5be8",
"assets/asset/images/mine/Order_Payment.png": "038b9c030cf4e5afda4e17f0bb2f2bbb",
"assets/asset/images/mine/Order_served.png": "db30a42281dead7a0c1fab1f02238c75",
"assets/asset/images/mine/Order_all.png": "951c4c0434e89b16fded5f488791c703",
"assets/asset/images/mine/help.png": "571bc10696ecd99ae1f825b88d5473f6",
"assets/asset/images/mine/alipay.png": "4ef5ca5c37711f3779254339067efaa1",
"assets/asset/images/mine/contactServicer.png": "f4ea76aa036b6383e06cbcef15f9911a",
"assets/asset/images/mine/erweima.png": "bd6d9b5218bb87a0169c074f179558a7",
"assets/asset/images/mine/jiantou.png": "48d8a30f8638dfda1866a8b6bf6dd3e2",
"assets/asset/images/updateVersion/header/up_header.png": "e37eda5965f4d9dc189124f60a982805",
"assets/asset/images/updateVersion/header/1.5x/up_header.png": "0d83775571e35af73e61e2d7c9dfb37a",
"assets/asset/images/updateVersion/header/3.0x/up_header.png": "a727f9b980e6240bbff4ec1af669b765",
"assets/asset/images/updateVersion/header/4.0x/up_header.png": "ef954809721096f05f15f2ac1f8e9850",
"assets/asset/images/updateVersion/header/1.0x/up_header.png": "50dc7102f4954e518625c9240b25e8fc",
"assets/asset/images/updateVersion/header/2x/up_header.png": "e37eda5965f4d9dc189124f60a982805",
"assets/asset/images/login/icon_display.png": "e429804ee2fb0307a40a119fd905fb2b",
"assets/asset/images/login/icon_hide.png": "a15c6b3b60e05f5f7ba2580d436b3df9",
"assets/asset/images/login/icon_delete.png": "dc3b2c85713bb317b8673c80067c2a12",
"assets/asset/files/chinese_cities.json": "ee7ff73180653e2b8ad2f888938f97bd",
"assets/AssetManifest.json": "9fc1f56a780085623496075e0bcbc640",
"assets/NOTICES": "1b0847adc7f4ebb9aca02b83a6454fd6",
"assets/FontManifest.json": "7b2a36307916a9721811788013e65289",
"assets/fonts/MaterialIcons-Regular.otf": "a68d2a28c526b3b070aefca4bac93d25"
};

// The application shell files that are downloaded before a service worker can
// start.
const CORE = [
  "/",
"main.dart.js",
"index.html",
"assets/NOTICES",
"assets/AssetManifest.json",
"assets/FontManifest.json"];
// During install, the TEMP cache is populated with the application shell files.
self.addEventListener("install", (event) => {
  return event.waitUntil(
    caches.open(TEMP).then((cache) => {
      return cache.addAll(
        CORE.map((value) => new Request(value + '?revision=' + RESOURCES[value], {'cache': 'reload'})));
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
  var origin = self.location.origin;
  var key = event.request.url.substring(origin.length + 1);
  // Redirect URLs to the index.html
  if (key.indexOf('?v=') != -1) {
    key = key.split('?v=')[0];
  }
  if (event.request.url == origin || event.request.url.startsWith(origin + '/#') || key == '') {
    key = '/';
  }
  // If the URL is not the RESOURCE list, skip the cache.
  if (!RESOURCES[key]) {
    return event.respondWith(fetch(event.request));
  }
  // If the URL is the index.html, perform an online-first request.
  if (key == '/') {
    return onlineFirst(event);
  }
  event.respondWith(caches.open(CACHE_NAME)
    .then((cache) =>  {
      return cache.match(event.request).then((response) => {
        // Either respond with the cached resource, or perform a fetch and
        // lazily populate the cache.
        return response || fetch(event.request).then((response) => {
          cache.put(event.request, response.clone());
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
    return self.skipWaiting();
  }
  if (event.message === 'downloadOffline') {
    downloadOffline();
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
  for (var resourceKey in Object.keys(RESOURCES)) {
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
