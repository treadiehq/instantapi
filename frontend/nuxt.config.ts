// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devtools: { enabled: false },
  
  // Import Tailwind CSS directly (no module needed for v4)
  css: ['~/assets/css/main.css'],
  
  // PostCSS configuration for Tailwind v4
  postcss: {
    plugins: {
      '@tailwindcss/postcss': {},
    },
  },
  
  app: {
    head: {
      title: 'Instant API',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'description', content: 'The fastest way to turn your AI agents, functions, code, and scripts into APIs. No servers, no infrastructure, no DevOps.' },
        { property: 'og:image', content: 'https://instantapi.co/img/instantapi.png' },
        { property: 'og:title', content: 'Instant API - Run AI agents with an API' },
        { property: 'og:type', content: 'website' },
        { property: 'og:description', content: 'The fastest way to turn your AI agents, functions, code, and scripts into APIs. No servers, no infrastructure, no DevOps.' },
        { name: 'twitter:card', content: 'summary_large_image' },
        { name: 'twitter:title', content: 'Instant API - Run AI agents with an API' },
        { name: 'twitter:description', content: 'The fastest way to turn your AI agents, functions, code, and scripts into APIs. No servers, no infrastructure, no DevOps.' },
        { name: 'twitter:image', content: 'https://instantapi.co/img/instantapi.png' },
      ],
      link: [
        { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' }
      ],
      script: [
        {
          src: 'https://cdn.seline.com/seline.js',
          async: true,
          'data-token': '81f5c0b9bd3274e'
        }
      ],
    },
  },

  runtimeConfig: {
    public: {
      apiBase: process.env.NUXT_PUBLIC_API_BASE || 'http://localhost:3001',
    },
  },

  nitro: {
    preset: 'node-server',
    serveStatic: true,
    compressPublicAssets: true,
  },
})

