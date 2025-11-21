export default defineNuxtPlugin({
  name: 'auth',
  enforce: 'pre', // Run before other plugins
  setup() {
    // Force auth state initialization by accessing it
    const { isAuthenticated } = useAuth();
  
    // This ensures useState initializers run immediately
    // before any routing or middleware
    const _check = isAuthenticated.value;
  },
});

