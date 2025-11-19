<template>
  <div class="bg-black border-b border-gray-500/20 px-6 py-2">
    <div class="max-w-7xl mx-auto flex items-center justify-between">
      <!-- Logo/Brand -->
      <div class="flex items-center space-x-3">
        <img src="~/assets/img/logo.png" alt="Echos" class="w-6 h-6"></img>
        <span class="text-sm text-gray-500/50">|</span>
        <span class="text-sm text-gray-400">{{ user?.organizationName }}</span>
      </div>

      <!-- User Menu -->
      <div class="flex items-center space-x-4">
        <div class="relative">
          <button
            @click="toggleMenu"
            class="relative"
          >
            <div class="w-6 h-6 bg-amber-300 rounded-full flex items-center justify-center text-black font-semibold text-[10px]">
              {{ userInitials }}
            </div>
          </button>

          <!-- Dropdown Menu -->
          <div
            v-if="showMenu"
            class="absolute right-0 top-full mt-2 w-48 bg-black border border-gray-500/20 rounded-lg shadow-lg p-2 z-50"
          >
            <button
              @click="showApiKeyModal = true; showMenu = false"
              class="w-full text-left px-2 py-2 text-xs text-white hover:bg-gray-500/20 rounded-lg transition-colors"
            >
              Generate API Key
            </button>
            <button
              @click="handleLogout"
              class="w-full text-left px-2 py-2 text-xs text-red-400 hover:bg-gray-500/20 rounded-lg transition-colors"
            >
              Sign Out
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- API Key Modal -->
    <div
      v-if="showApiKeyModal"
      class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      @click.self="showApiKeyModal = false"
    >
      <div class="bg-black border border-gray-500/20 rounded-lg p-6 max-w-md w-full">
        <h3 class="text-lg font-semibold mb-4">Generate API Key</h3>
        
        <div v-if="!generatedKey" class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Key Name
            </label>
            <input
              v-model="keyName"
              type="text"
              placeholder="My CLI Key"
              class="w-full px-3 py-2 input-field focus:border-transparent"
            />
          </div>
          
          <div v-if="apiKeyError" class="bg-red-400/10 border border-red-400/10 rounded-lg p-4">
            <p class="text-sm text-red-400">{{ apiKeyError }}</p>
          </div>
          
          <div class="flex space-x-3">
            <button
              @click="generateApiKey"
              :disabled="!keyName || generatingKey"
              class="flex-1 btn-primary py-3"
            >
              {{ generatingKey ? 'Generating...' : 'Generate' }}
            </button>
            <button
              @click="showApiKeyModal = false"
              class="btn-secondary py-3"
            >
              Cancel
            </button>
          </div>
        </div>

        <div v-else class="space-y-4">
          <div class="bg-green-300/10 border border-green-300/10 rounded-lg p-4">
            <p class="text-sm text-green-300 font-medium">API Key Generated!</p>
          </div>
          
          <div>
            <label class="block text-sm font-medium text-white mb-2">
              Your API Key (save it now!)
            </label>
            <div class="flex space-x-2">
              <input
                :value="generatedKey"
                readonly
                class="flex-1 px-3 py-2 input-field focus:border-transparent"
              />
              <button
                @click="copyApiKey"
                class="btn-secondary py-3"
              >
                {{ copied ? '✓' : 'Copy' }}
              </button>
            </div>
            <p class="text-xs text-gray-500 mt-2">
              Store this securely. You won't be able to see it again.
            </p>
          </div>
          
          <button
            @click="closeApiKeyModal"
            class="w-full btn-primary py-3"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const { user, logout } = useAuth();
const { apiCall } = useApi();

const showMenu = ref(false);
const showApiKeyModal = ref(false);
const keyName = ref('');
const generatedKey = ref('');
const generatingKey = ref(false);
const apiKeyError = ref('');
const copied = ref(false);

const userInitials = computed(() => {
  if (!user.value?.email) return '?';
  return user.value.email.substring(0, 2).toUpperCase();
});

const toggleMenu = () => {
  showMenu.value = !showMenu.value;
};

const handleLogout = () => {
  showMenu.value = false;
  logout();
};

const generateApiKey = async () => {
  apiKeyError.value = '';
  generatingKey.value = true;
  
  try {
    const response: any = await apiCall('/api/auth/api-key', {
      method: 'POST',
      body: { name: keyName.value },
    });
    
    generatedKey.value = response.key;
  } catch (e: any) {
    apiKeyError.value = e.message || 'Failed to generate API key';
  } finally {
    generatingKey.value = false;
  }
};

const copyApiKey = () => {
  navigator.clipboard.writeText(generatedKey.value);
  copied.value = true;
  setTimeout(() => {
    copied.value = false;
  }, 2000);
};

const closeApiKeyModal = () => {
  showApiKeyModal.value = false;
  keyName.value = '';
  generatedKey.value = '';
  apiKeyError.value = '';
  copied.value = false;
};

// Close menu when clicking outside
onMounted(() => {
  if (process.client) {
    document.addEventListener('click', (e) => {
      const target = e.target as HTMLElement;
      if (!target.closest('button')) {
        showMenu.value = false;
      }
    });
  }
});
</script>

