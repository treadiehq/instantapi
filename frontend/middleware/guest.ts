export default defineNuxtRouteMiddleware((to, from) => {
  // Skip middleware during SSR to prevent issues
  if (process.server) {
    return;
  }
  
  // On client-side, check localStorage directly
  const hasToken = localStorage.getItem('instant_api_token');
  const hasUser = localStorage.getItem('instant_api_user');
  
  // If authenticated, redirect to dashboard
  if (hasToken && hasUser) {
    return navigateTo('/dashboard');
  }
});

