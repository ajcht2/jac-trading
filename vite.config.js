import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      // Update the service worker automatically when a new version is deployed.
      // The user sees the new content on the next reload.
      registerType: 'autoUpdate',
      // Files to precache so the app opens offline.
      includeAssets: ['favicon.png', 'logo.png', 'city-bg.jpg', 'robots.txt'],
      manifest: {
        name: 'JAC — Investment Banking for Students',
        short_name: 'JAC',
        description:
          'Investment banking curriculum for finance students. Valuation, M&A, LBO, modeling, accounting, interview prep, case studies — interactive where it makes sense.',
        theme_color: '#0b0e14',
        background_color: '#0b0e14',
        display: 'standalone',
        orientation: 'portrait-primary',
        scope: '/',
        start_url: '/',
        lang: 'en',
        categories: ['education', 'finance', 'business'],
        icons: [
          // PNGs accepted across iOS & Android. Existing logo file used as
          // a placeholder — replace with proper square 192 & 512 icons in
          // /public when ready.
          { src: '/logo.png',    sizes: '192x192', type: 'image/png', purpose: 'any'     },
          { src: '/logo.png',    sizes: '512x512', type: 'image/png', purpose: 'any'     },
          { src: '/logo.png',    sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
        shortcuts: [
          { name: 'LBO Model',  short_name: 'LBO',  url: '/lbo',       description: 'Interactive leveraged buyout model' },
          { name: 'Valuation',  short_name: 'Val',  url: '/valuation', description: 'Football-field valuation tool' },
          { name: 'Courses',    short_name: 'Learn',url: '/courses',   description: '32 lessons across 8 courses'        },
          { name: 'Interview',  short_name: 'Prep', url: '/interview-prep', description: 'IB interview questions'        },
        ],
      },
      workbox: {
        // Cache strategies. Use NetworkFirst for the API so prices stay fresh,
        // CacheFirst for fonts and images so they don't re-fetch each visit.
        globPatterns: ['**/*.{js,css,html,ico,png,jpg,jpeg,svg,woff,woff2}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-stylesheets',
              expiration: { maxEntries: 10, maxAgeSeconds: 60 * 60 * 24 * 365 },
            },
          },
          {
            urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-webfonts',
              expiration: { maxEntries: 30, maxAgeSeconds: 60 * 60 * 24 * 365 },
            },
          },
          {
            // Yahoo Finance proxy through /api — always go to network so
            // prices are fresh, fall back to cache only if offline.
            urlPattern: /\/api\/.*/i,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'api-cache',
              networkTimeoutSeconds: 5,
              expiration: { maxEntries: 50, maxAgeSeconds: 60 * 5 },
            },
          },
          {
            // YouTube thumbnails (used by the Courses page video embeds)
            urlPattern: /^https:\/\/i\.ytimg\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'youtube-thumbnails',
              expiration: { maxEntries: 60, maxAgeSeconds: 60 * 60 * 24 * 30 },
            },
          },
        ],
        // Don't try to cache the heavy YouTube iframe content.
        navigateFallbackDenylist: [/^\/api/, /^\/sw\.js$/],
      },
      devOptions: {
        // Enable PWA in dev mode for testing.
        enabled: false,
      },
    }),
  ],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
    },
  },
})
