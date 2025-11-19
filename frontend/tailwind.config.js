/** @type {import('tailwindcss').Config} */
export default {
  // Tailwind v4 uses CSS-native configuration
  // Most config now lives in the CSS file using @theme
  content: [
    "./components/**/*.{js,vue,ts}",
    "./layouts/**/*.vue",
    "./pages/**/*.vue",
    "./plugins/**/*.{js,ts}",
    "./app.vue",
  ],
}

