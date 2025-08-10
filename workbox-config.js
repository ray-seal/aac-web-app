module.exports = {
  globDirectory: 'dist/',
  globPatterns: [
    '**/*.{html,js,css,png,jpg,json,svg}'
  ],
  swDest: 'dist/sw.js',
  swSrc: undefined, // omit or comment this line if using generateSW, include if using injectManifest
  runtimeCaching: [{
    urlPattern: /\.(?:png|jpg|jpeg|svg|gif)$/,
    handler: 'CacheFirst',
    options: {
      cacheName: 'images',
      expiration: {
        maxEntries: 50,
        maxAgeSeconds: 30 * 24 * 60 * 60, // 30 Days
      },
    },
  }],
  // Add other Workbox options as needed
};
