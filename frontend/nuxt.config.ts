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
        { 
          name: 'description', 
          content: 'Turn your JS or Python code into an API instantly' 
        },
      ],
      link: [
        { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' }
      ],
    },
  },

  runtimeConfig: {
    public: {
      apiBase: 'http://localhost:3001',
    },
  },
})

