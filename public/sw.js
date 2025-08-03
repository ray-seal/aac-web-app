self.addEventListener("install", function (event) {
  self.skipWaiting();
});
self.addEventListener("fetch", function (event) {
  // Just pass through for now
});
