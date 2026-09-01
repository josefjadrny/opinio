import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate', // new SW activates + reloads on next visit; no stale shell
      injectRegister: 'auto', // injects the registration snippet; no code change in main.tsx
      includeAssets: ['favicon.png', 'favicon.svg', 'apple-touch-icon.png', 'icon.svg'],
      manifest: {
        name: 'Opinio',
        short_name: 'Opinio',
        description:
          'An ad-free social voting platform from Europe. Share and vote on opinions about anything - from the headlines to everyday life - and see how every country feels, country by country, refreshed every 24h.',
        id: '/',
        start_url: '/',
        scope: '/',
        display: 'standalone',
        orientation: 'portrait',
        lang: 'en',
        theme_color: '#10162e',
        background_color: '#1a1a2e',
        categories: ['news', 'social', 'politics'],
        // Declares the Play build (a TWA over this same site) as a related app.
        // prefer_related_applications stays false on purpose: true would make
        // Chrome's install prompt push the Play listing instead of installing
        // the PWA, which would take the web install path away from every
        // non-Android visitor. The Android nudge is the in-page banner instead.
        related_applications: [
          { platform: 'play', id: 'live.opinio.app', url: 'https://play.google.com/store/apps/details?id=live.opinio.app' },
        ],
        prefer_related_applications: false,
        icons: [
          { src: '/pwa-192x192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
          { src: '/pwa-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
          { src: '/maskable-icon-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
        // Long-press the installed launcher icon (Android) / taskbar icon
        // (desktop) to jump straight into a route. Bubblewrap mirrors these
        // into the TWA as static launcher shortcuts - keep them in sync with
        // opinio-android/twa-manifest.json.
        shortcuts: [
          {
            name: 'Drop an opinio',
            short_name: 'Drop',
            url: '/add',
            icons: [{ src: '/shortcut-add.png', sizes: '192x192', type: 'image/png' }],
          },
          {
            // /me is a redirect: it resolves to the signed-in user's /u/:id, or
            // to /sign-in when there is nobody to resolve. A shortcut needs a
            // static URL and /u/:id is only known at runtime.
            name: 'My opinios',
            short_name: 'Opinios',
            url: '/me',
            icons: [{ src: '/shortcut-me.png', sizes: '192x192', type: 'image/png' }],
          },
          {
            name: 'Settings',
            short_name: 'Settings',
            url: '/settings',
            icons: [{ src: '/shortcut-settings.png', sizes: '192x192', type: 'image/png' }],
          },
          {
            name: 'About',
            short_name: 'About',
            url: '/about',
            icons: [{ src: '/shortcut-about.png', sizes: '192x192', type: 'image/png' }],
          },
        ],
      },
      workbox: {
        // Precache the app shell only. The map data and the social OG image are not
        // needed inside the standalone app, so keep them out of the SW cache.
        globPatterns: ['**/*.{js,css,html,svg,png,ico,woff2}'],
        globIgnores: ['**/topojson/**', 'og-image.png', 'og-image.svg'],
        navigateFallback: '/index.html',
        navigateFallbackDenylist: [/^\/api\//, /^\/\.well-known\//, /^\/sitemap\.xml$/, /^\/robots\.txt$/],
        cleanupOutdatedCaches: true,
        clientsClaim: true,
        skipWaiting: true,
        // Offline reads. The shell alone would boot into an empty feed with no
        // network, so the last successful GET of the public content endpoints is
        // kept and replayed when the fetch fails. NetworkFirst, so an online
        // user never sees cached data - the cache is only a fallback. Only
        // public, non-personal GETs are listed: /api/me (vote allowance, tier)
        // and every mutation stay network-only. generateSW can't serialize
        // functions, so these are absolute-URL regexes against the prod hosts.
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/api\.opinio\.live\/api\/(profiles|countries)(\/|\?|$)/,
            handler: 'NetworkFirst',
            method: 'GET',
            options: {
              cacheName: 'opinio-api-v1',
              networkTimeoutSeconds: 6,
              // Votes expire after 24h, so anything older is not worth replaying.
              expiration: { maxEntries: 80, maxAgeSeconds: 60 * 60 * 24 },
              cacheableResponse: { statuses: [200] },
            },
          },
          {
            urlPattern: /^https:\/\/images\.opinio\.live\/(profiles|content|avatars)\//,
            handler: 'CacheFirst',
            method: 'GET',
            options: {
              cacheName: 'opinio-images-v1',
              expiration: { maxEntries: 150, maxAgeSeconds: 60 * 60 * 24 * 7 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
          {
            // Kept out of the precache (too big to ship on install), but once
            // the map has been opened it should keep working offline.
            urlPattern: /\/topojson\/.*\.json$/,
            handler: 'CacheFirst',
            method: 'GET',
            options: {
              cacheName: 'opinio-topojson-v1',
              expiration: { maxEntries: 4, maxAgeSeconds: 60 * 60 * 24 * 30 },
              cacheableResponse: { statuses: [200] },
            },
          },
        ],
      },
      devOptions: { enabled: false }, // SW only in production build/preview, never in `npm run dev`
    }),
  ],
  envPrefix: ['VITE_', 'OPINIO_'],
})
