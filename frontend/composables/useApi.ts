export const useApi = () => {
  const config = useRuntimeConfig();
  const { token } = useAuth();

  const apiCall = async (endpoint: string, options: any = {}) => {
    const headers: any = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    // Add auth token if available
    if (token.value) {
      headers.Authorization = `Bearer ${token.value}`;
    }

    return await $fetch(`${config.public.apiBase}${endpoint}`, {
      ...options,
      headers,
    });
  };

  return {
    apiCall,
  };
};

