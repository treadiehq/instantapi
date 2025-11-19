<template>
  <div class="min-h-screen relative bg-black flex items-center justify-center p-4">
    <div class="radial-gradient absolute top-0 md:right-14 right-5"></div>
    <div class="max-w-md w-full relative z-10">
      <!-- Logo/Header -->
      <div class="text-center mb-8">
        <div class="inline-flex items-center gap-2 mb-3">
          <img src="~/assets/img/logo.png" alt="Echos" class="w-14 h-14">
        </div>
        <h1 class="text-2xl font-bold text-white mb-2">Create your account</h1>
        <p class="text-gray-400 text-sm">Get started with Echos in seconds</p>
      </div>

      <!-- Signup Card -->
      <div class="bg-gray-500/10 border border-gray-500/15 rounded-lg p-8">
        <form @submit.prevent="handleSignup" class="space-y-6">
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

          <!-- Organization Name -->
          <div>
            <label for="orgName" class="block text-sm font-medium text-white mb-2">
              Organization Name
            </label>
            <input
              id="orgName"
              v-model="organizationName"
              type="text"
              required
              class="w-full px-4 py-3 input-field focus:border-transparent"
              placeholder="Acme Inc"
            />
            <p class="text-sm text-gray-500 mt-1">
              Your team or company name
            </p>
          </div>

          <!-- Error Message -->
          <div v-if="error" class="bg-red-400/10 border border-red-400/10 rounded-lg p-4">
            <p class="text-sm text-red-400">{{ error }}</p>
          </div>

          <!-- Success Message -->
          <div v-if="success" class="bg-green-300/10 border border-green-300/10 rounded-lg p-4">
            <p class="text-sm text-green-300 font-medium">{{ success }}</p>
            <!-- <p class="text-xs text-green-300 mt-2">
              Check your terminal (local dev) or email (production) for the magic link.
            </p> -->
          </div>

          <!-- Submit Button -->
          <button
            type="submit"
            :disabled="loading || !email || !organizationName"
            class="w-full btn-primary py-3"
          >
            <span v-if="loading">Creating account...</span>
            <!-- <span v-else-if="success">Check your email!</span> -->
            <span v-else>Create Account</span>
          </button>
        </form>

        <!-- Login Link -->
        <div class="mt-6 text-center">
          <p class="text-sm text-gray-400">
            Already have an account?
            <NuxtLink to="/login" class="text-blue-300 hover:text-blue-400 font-medium">
              Sign in
            </NuxtLink>
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const email = ref('');
const organizationName = ref('');
const error = ref('');
const success = ref('');
const loading = ref(false);

const { signup } = useAuth();

const handleSignup = async () => {
  error.value = '';
  success.value = '';
  loading.value = true;

  try {
    const response: any = await signup(email.value, organizationName.value);
    success.value = response.message || 'Account created! Check your email for a magic link.';
    
    // Clear form
    email.value = '';
    organizationName.value = '';
  } catch (e: any) {
    error.value = e.message || 'Failed to create account. Please try again.';
  } finally {
    loading.value = false;
  }
};

// Set page meta
definePageMeta({
  layout: false,
});

// Set page title
useHead({
  title: 'Sign Up - Instant API',
});
</script>

