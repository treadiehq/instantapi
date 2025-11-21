export default defineNuxtRouteMiddleware((to, from) => {
  // Skip middleware during SSR to prevent issues
  if (process.server) {
    return;
  }
  
  // On client-side, check localStorage directly
  const hasToken = localStorage.getItem('instant_api_token');
  const hasUser = localStorage.getItem('instant_api_user');
  
  // If no token or user in localStorage, redirect to login
  if (!hasToken || !hasUser) {
    return navigateTo('/login');
  }
  
  // Sync state if needed
  const { user, token } = useAuth();
  if (!user.value || !token.value) {
    try {
      user.value = JSON.parse(hasUser);
      token.value = hasToken;
    } catch (e) {
      // Invalid data, clear and redirect
      localStorage.removeItem('instant_api_token');
      localStorage.removeItem('instant_api_user');
      return navigateTo('/login');
    }
  }
});

