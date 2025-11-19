export const useAuth = () => {
  const config = useRuntimeConfig();
  const router = useRouter();
  
  const user = useState<any>('user', () => null);
  const token = useState<string | null>('token', () => null);
  const loading = useState<boolean>('auth-loading', () => false);
  const initialized = useState<boolean>('auth-initialized', () => false);

  // Initialize auth state from localStorage
  const initAuth = () => {
    if (process.client && !initialized.value) {
      const storedToken = localStorage.getItem('instant_api_token');
      const storedUser = localStorage.getItem('instant_api_user');
      
      if (storedToken && storedUser) {
        token.value = storedToken;
        try {
          user.value = JSON.parse(storedUser);
        } catch (e) {
          // Invalid stored user
          clearAuth();
        }
      }
      initialized.value = true;
    }
  };

  // Clear auth state
  const clearAuth = () => {
    user.value = null;
    token.value = null;
    if (process.client) {
      localStorage.removeItem('instant_api_token');
      localStorage.removeItem('instant_api_user');
    }
  };

  // Sign up
  const signup = async (email: string, organizationName: string) => {
    loading.value = true;
    try {
      const response = await $fetch(`${config.public.apiBase}/api/auth/signup`, {
        method: 'POST',
        body: { email, organizationName },
      });
      return response;
    } catch (error: any) {
      throw new Error(error.data?.message || 'Signup failed');
    } finally {
      loading.value = false;
    }
  };

  // Login
  const login = async (email: string) => {
    loading.value = true;
    try {
      const response = await $fetch(`${config.public.apiBase}/api/auth/login`, {
        method: 'POST',
        body: { email },
      });
      return response;
    } catch (error: any) {
      throw new Error(error.data?.message || 'Login failed');
    } finally {
      loading.value = false;
    }
  };

  // Verify magic link
  const verify = async (magicToken: string) => {
    loading.value = true;
    try {
      const response: any = await $fetch(`${config.public.apiBase}/api/auth/verify`, {
        method: 'POST',
        body: { token: magicToken },
      });
      
      // Store token and user
      token.value = response.token;
      user.value = response.user;
      
      if (process.client) {
        localStorage.setItem('instant_api_token', response.token);
        localStorage.setItem('instant_api_user', JSON.stringify(response.user));
      }
      
      return response;
    } catch (error: any) {
      throw new Error(error.data?.message || 'Verification failed');
    } finally {
      loading.value = false;
    }
  };

  // Fetch current user
  const fetchUser = async () => {
    if (!token.value) {
      return null;
    }
    
    try {
      const response: any = await $fetch(`${config.public.apiBase}/api/auth/me`, {
        headers: {
          Authorization: `Bearer ${token.value}`,
        },
      });
      user.value = response.user;
      if (process.client) {
        localStorage.setItem('instant_api_user', JSON.stringify(response.user));
      }
      return response.user;
    } catch (error) {
      // Token invalid - clear auth
      clearAuth();
      return null;
    }
  };

  // Logout
  const logout = () => {
    clearAuth();
    router.push('/login');
  };

  // Check if authenticated
  const isAuthenticated = computed(() => !!token.value && !!user.value);

  return {
    user,
    token,
    loading,
    initialized,
    isAuthenticated,
    initAuth,
    signup,
    login,
    verify,
    fetchUser,
    logout,
    clearAuth,
  };
};

