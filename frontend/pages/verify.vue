<template>
  <div class="min-h-screen bg-black flex items-center justify-center p-4">
    <div class="radial-gradient absolute top-0 md:right-14 right-5"></div>
    <div class="max-w-md w-full">
      <div class="bg-gray-500/10 border border-gray-500/15 rounded-lg p-8 text-center">
        <!-- Loading State -->
        <div v-if="verifying" class="space-y-4">
          <div class="w-16 h-16 border-4 border-blue-300 border-t-blue-300 rounded-full animate-spin mx-auto"></div>
          <h2 class="text-xl font-semibold text-white">Verifying...</h2>
          <p class="text-gray-400">Please wait while we sign you in</p>
        </div>

        <!-- Success State -->
        <div v-else-if="success" class="space-y-4">
          <div class="w-16 h-16 bg-green-300/10 border border-green-300/10 rounded-full flex items-center justify-center mx-auto">
            <svg class="w-8 h-8 text-green-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
            </svg>
          </div>
          <h2 class="text-xl font-semibold text-white">Welcome back!</h2>
          <p class="text-gray-400">Redirecting you now...</p>
        </div>

        <!-- Error State -->
        <div v-else-if="error" class="space-y-4">
          <div class="w-16 h-16 bg-red-400/10 border border-red-400/10 rounded-full flex items-center justify-center mx-auto">
            <svg class="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </div>
          <h2 class="text-xl font-semibold text-white">Verification Failed</h2>
          <p class="text-red-400">{{ error }}</p>
          <div class="pt-4">
            <NuxtLink
              to="/login"
              class="inline-block btn-primary"
            >
              Try Again
            </NuxtLink>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const route = useRoute();
const router = useRouter();
const { verify } = useAuth();

const verifying = ref(true);
const success = ref(false);
const error = ref('');

onMounted(async () => {
  const token = route.query.token as string;

  if (!token) {
    error.value = 'No verification token provided';
    verifying.value = false;
    return;
  }

  try {
    await verify(token);
    success.value = true;
    
    // Redirect to home after 1 second
    setTimeout(() => {
      router.push('/');
    }, 1000);
  } catch (e: any) {
    error.value = e.message || 'Invalid or expired magic link';
  } finally {
    verifying.value = false;
  }
});

// Set page meta
definePageMeta({
  layout: false,
});

// Set page title
useHead({
  title: 'Verifying - Instant API',
});
</script>

