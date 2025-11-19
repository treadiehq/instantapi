export default defineNuxtPlugin(() => {
  const { initAuth } = useAuth();
  
  // Initialize auth state from localStorage before routing
  initAuth();
});

