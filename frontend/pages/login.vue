<template>
  <!-- Show skeleton while checking auth -->
  <AuthPageSkeleton v-if="!authInitialized" :show-second-field="false" />

  <!-- Show login form once auth is checked -->
  <div v-else class="min-h-screen relative bg-black flex items-center justify-center p-4">
    <div class="radial-gradient absolute top-0 md:right-14 right-5"></div>
    <div class="max-w-md w-full relative z-10">
      <!-- Logo/Header -->
      <div class="text-center mb-8">
        <div class="inline-flex items-center gap-2 mb-3">
          <img src="~/assets/img/logo.png" alt="Echos" class="w-14 h-14">
        </div>
        <h1 class="text-2xl font-bold text-white mb-2">Welcome back</h1>
        <p class="text-gray-400 text-sm">Log in to your account</p>
      </div>

      <!-- Login Card -->
      <div class="bg-gray-500/10 border border-gray-500/15 rounded-lg p-8">
        <form @submit.prevent="handleLogin" class="space-y-6">
          <!-- Email -->
          <div>
            <label for="email" class="block text-sm font-medium text-white mb-2">
              Email Address
            </label>
            <input
              id="email"
              v-model="email"
              type="email"
              required
              class="w-full px-4 py-3 input-field focus:border-transparent"
              placeholder="you@example.com"
            />
          </div>

          <!-- Error Message -->
          <div v-if="error" class="bg-red-400/10 border border-red-400/10 rounded-lg p-4">
            <p class="text-sm text-red-400">{{ error }}</p>
          </div>

          <!-- Success Message -->
          <div v-if="success" class="bg-green-300/10 border border-green-300/10 rounded-lg p-4">
            <p class="text-sm text-green-300 font-medium">{{ success }}</p>
            <!-- <p class="text-xs text-green-300 mt-2">
              <strong>Local dev:</strong> Check your terminal for the magic link<br>
              <strong>Production:</strong> Check your email inbox
            </p> -->
          </div>

          <!-- Submit Button -->
          <button
            type="submit"
            :disabled="loading || !email"
            class="w-full btn-primary py-3"
          >
            <span v-if="loading">Sending magic link...</span>
            <!-- <span v-else-if="success">Check your email!</span> -->
            <span v-else>Send magic link</span>
          </button>
        </form>

        <!-- Signup Link -->
        <div class="mt-6 text-center">
          <p class="text-sm text-gray-400">
            Don't have an account?
            <NuxtLink to="/signup" class="text-blue-300 hover:text-blue-400 font-medium">
              Sign up
            </NuxtLink>
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const email = ref('');
const error = ref('');
const success = ref('');
const loading = ref(false);

const { login } = useAuth();

const handleLogin = async () => {
  error.value = '';
  success.value = '';
  loading.value = true;

  try {
    const response: any = await login(email.value);
    success.value = response.message || 'Magic link sent! Check your email.';
  } catch (e: any) {
    error.value = e.message || 'Failed to send magic link. Please try again.';
  } finally {
    loading.value = false;
  }
};

// Redirect if already authenticated
const { isAuthenticated, initialized: authInitialized } = useAuth();
const router = useRouter();

onMounted(() => {
  if (isAuthenticated.value) {
    router.push('/');
  }
});

watch(isAuthenticated, (authenticated) => {
  if (authenticated) {
    router.push('/');
  }
});

// Set page meta
definePageMeta({
  layout: false,
});

// Set page title
useHead({
  title: 'Login - Instant API',
});
</script>

