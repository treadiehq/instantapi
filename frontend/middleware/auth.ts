export default defineNuxtRouteMiddleware((to, from) => {
  const { isAuthenticated, initAuth } = useAuth();
  
  // Initialize auth state
  initAuth();
  
  // If not authenticated and trying to access protected route
  if (!isAuthenticated.value) {
    return navigateTo('/login');
  }
});

