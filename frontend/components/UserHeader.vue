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
              @click="openApiKeyModal(); showMenu = false"
              class="w-full text-left px-2 py-2 text-xs text-white hover:bg-gray-500/20 rounded-lg transition-colors"
            >
              Manage API Keys
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
      <div class="bg-black border border-gray-500/20 rounded-lg p-6 max-w-md w-full max-h-[80vh] overflow-y-auto">
        <!-- List View -->
        <div v-if="modalView === 'list'" class="space-y-4">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-lg font-semibold">API Keys</h3>
            <button
              @click="modalView = 'generate'"
              class="btn-primary py-2 px-4 text-xs"
            >
              + New Key
            </button>
          </div>

          <!-- Skeleton Loader -->
          <div v-if="loadingKeys" class="space-y-2">
            <div v-for="i in 2" :key="i" class="border border-gray-500/20 rounded-lg p-4 animate-pulse">
              <div class="h-4 bg-gray-500/20 rounded w-3/4 mb-2"></div>
              <div class="h-3 bg-gray-500/10 rounded w-1/2"></div>
            </div>
          </div>

          <!-- Empty State -->
          <div v-else-if="apiKeys.length === 0" class="text-center py-8">
            <svg class="w-12 h-12 text-gray-600 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M15.75 5.25a3 3 0 013 3m3 0a6 6 0 01-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1121.75 8.25z" />
            </svg>
            <p class="text-gray-400 text-sm mb-4">No API keys yet</p>
            <button
              @click="modalView = 'generate'"
              class="btn-primary py-2 px-4 text-xs"
            >
              Create Your First Key
            </button>
          </div>

          <div v-else class="space-y-2">
            <div
              v-for="key in apiKeys"
              :key="key.id"
              class="border border-gray-500/20 rounded-lg p-4 flex items-start justify-between"
            >
              <div class="flex-1 min-w-0">
                <p class="text-sm font-medium text-white truncate">{{ key.name }}</p>
                <p class="text-xs text-gray-500 mt-1">
                  Created {{ formatDate(key.createdAt) }}
                </p>
                <p v-if="key.lastUsedAt" class="text-xs text-gray-500">
                  Last used {{ formatDate(key.lastUsedAt) }}
                </p>
              </div>
              <button
                @click="deleteApiKey(key.id)"
                :disabled="deletingKeyId === key.id"
                class="ml-3 text-red-400 hover:text-red-300 text-xs disabled:opacity-50"
              >
                {{ deletingKeyId === key.id ? 'Deleting...' : 'Delete' }}
              </button>
            </div>
          </div>

          <button
            @click="closeApiKeyModal"
            class="w-full btn-secondary py-3 mt-4"
          >
            Close
          </button>
        </div>

        <!-- Generate View -->
        <div v-else-if="modalView === 'generate'" class="space-y-4">
          <div class="flex items-center mb-4">
            <button
              @click="backToList"
              class="text-gray-400 hover:text-white mr-3"
            >
              ← Back
            </button>
            <h3 class="text-lg font-semibold">Generate API Key</h3>
          </div>

          <div>
            <label class="block text-sm font-medium text-white mb-2">
              Key Name
            </label>
            <input
              v-model="keyName"
              type="text"
              placeholder="My CLI Key"
              class="w-full px-3 py-2 input-field focus:border-transparent"
              @keydown.enter="generateApiKey"
            />
            <p class="text-xs text-gray-500 mt-1">
              Choose a unique name to identify this key
            </p>
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
              @click="backToList"
              class="btn-secondary py-3"
            >
              Cancel
            </button>
          </div>
        </div>

        <!-- Success View -->
        <div v-else-if="modalView === 'success'" class="space-y-4">
          <h3 class="text-lg font-semibold mb-4">API Key Generated!</h3>

          <div class="bg-green-300/10 border border-green-300/10 rounded-lg p-4">
            <p class="text-sm text-green-300 font-medium">✓ Key created successfully</p>
          </div>
          
          <div>
            <label class="block text-sm font-medium text-white mb-2">
              Your API Key
            </label>
            <div class="flex space-x-2">
              <input
                :value="generatedKey"
                readonly
                @click="copyApiKey"
                class="flex-1 px-3 py-2 input-field focus:border-transparent font-mono text-xs cursor-pointer hover:bg-gray-500/10 transition-colors"
                title="Click to copy"
              />
              <button
                @click="copyApiKey"
                :class="[
                  'py-3 px-4 transition-colors font-medium text-sm',
                  copied
                    ? 'bg-green-500/10 text-green-400 border border-green-500/20'
                    : 'btn-secondary'
                ]"
              >
                <span v-if="copied" class="flex items-center gap-1.5">
                  <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                  Copied
                </span>
                <span v-else>Copy</span>
              </button>
            </div>
            <div class="bg-amber-400/10 border border-amber-400/10 rounded-lg p-3 mt-3">
              <p class="text-xs text-amber-300">
                ⚠️ Store this securely. You won't be able to see it again.
              </p>
            </div>
          </div>
          
          <button
            @click="backToList"
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
const modalView = ref<'list' | 'generate' | 'success'>('list');
const keyName = ref('');
const generatedKey = ref('');
const generatingKey = ref(false);
const apiKeyError = ref('');
const copied = ref(false);
const apiKeys = ref<any[]>([]);
const loadingKeys = ref(false);
const deletingKeyId = ref<string | null>(null);

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

const openApiKeyModal = async () => {
  showApiKeyModal.value = true;
  modalView.value = 'list';
  await loadApiKeys();
};

const loadApiKeys = async () => {
  loadingKeys.value = true;
  try {
    const response: any = await apiCall('/api/auth/api-keys');
    apiKeys.value = response || [];
  } catch (e) {
    console.error('Failed to load API keys:', e);
  } finally {
    loadingKeys.value = false;
  }
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
    modalView.value = 'success';
    keyName.value = '';
  } catch (e: any) {
    apiKeyError.value = e.message || 'Failed to generate API key';
  } finally {
    generatingKey.value = false;
  }
};

const deleteApiKey = async (id: string) => {
  if (!confirm('Are you sure you want to delete this API key? This action cannot be undone.')) {
    return;
  }

  deletingKeyId.value = id;
  try {
    await apiCall(`/api/auth/api-key/${id}`, {
      method: 'DELETE',
    });
    
    // Reload the list
    await loadApiKeys();
  } catch (e: any) {
    alert(e.message || 'Failed to delete API key');
  } finally {
    deletingKeyId.value = null;
  }
};

const copyApiKey = () => {
  navigator.clipboard.writeText(generatedKey.value);
  copied.value = true;
  setTimeout(() => {
    copied.value = false;
  }, 2000);
};

const backToList = async () => {
  modalView.value = 'list';
  keyName.value = '';
  generatedKey.value = '';
  apiKeyError.value = '';
  copied.value = false;
  await loadApiKeys();
};

const closeApiKeyModal = () => {
  showApiKeyModal.value = false;
  modalView.value = 'list';
  keyName.value = '';
  generatedKey.value = '';
  apiKeyError.value = '';
  copied.value = false;
};

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);
  
  if (diffMins < 60) {
    return diffMins <= 1 ? 'just now' : `${diffMins}m ago`;
  } else if (diffHours < 24) {
    return `${diffHours}h ago`;
  } else if (diffDays < 30) {
    return `${diffDays}d ago`;
  } else {
    return date.toLocaleDateString();
  }
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

