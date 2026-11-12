module.exports = {
  globDirectory: 'dist/',
  globPatterns: [
    '**/*.{html,js,css,png,jpg,jpeg,webp,gif,svg,ico,json,woff,woff2,ttf,webmanifest}'
  ],
  swDest: 'dist/sw.js',
  mode: 'no-minify',
  navigateFallback: 'index.html',
  runtimeCaching: [{
    urlPattern: /.(?:png|jpg|jpeg|webp|svg|gif|ico)$/i,
    handler: 'CacheFirst',
    options: {
      cacheName: 'images',
      expiration: {
        maxEntries: 300,
        maxAgeSeconds: 365 * 24 * 60 * 60,
      },
    },
  }],
};
