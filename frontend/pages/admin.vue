<template>
  <div class="min-h-screen bg-black text-white">
    <!-- Header -->
    <UserHeader />

    <!-- Main Content -->
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Page Title -->
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-white mb-2">Admin Dashboard</h1>
        <p class="text-gray-400">Manage all API endpoints and view statistics</p>
      </div>

      <!-- Stats Cards - Loading Skeleton -->
      <div v-if="!stats && initialLoading" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div v-for="i in 8" :key="i" class="bg-gray-500/5 border border-gray-500/15 rounded-lg p-4 animate-pulse">
          <div class="h-3 bg-gray-500/20 rounded w-20 mb-2"></div>
          <div class="h-8 bg-gray-500/20 rounded w-16"></div>
        </div>
      </div>

      <!-- Stats Cards -->
      <div v-if="stats" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div class="bg-gray-500/5 border border-gray-500/15 rounded-lg p-4">
          <p class="text-sm text-gray-400 mb-1">Total APIs</p>
          <p class="text-2xl font-bold text-white">{{ stats.totalEndpoints }}</p>
        </div>
        <div class="bg-gray-500/5 border border-gray-500/15 rounded-lg p-4">
          <p class="text-sm text-gray-400 mb-1">Authenticated</p>
          <p class="text-2xl font-bold text-green-300">{{ stats.authenticatedEndpoints }}</p>
        </div>
        <div class="bg-gray-500/5 border border-gray-500/15 rounded-lg p-4">
          <p class="text-sm text-gray-400 mb-1">Unauthenticated</p>
          <p class="text-2xl font-bold text-amber-300">{{ stats.unauthenticatedEndpoints }}</p>
        </div>
        <div class="bg-gray-500/5 border border-gray-500/15 rounded-lg p-4">
          <p class="text-sm text-gray-400 mb-1">Total Users</p>
          <p class="text-2xl font-bold text-blue-300">{{ stats.totalUsers }}</p>
        </div>
        <div class="bg-gray-500/5 border border-gray-500/15 rounded-lg p-4">
          <p class="text-sm text-gray-400 mb-1">Created Today</p>
          <p class="text-2xl font-bold text-white">{{ stats.endpointsCreatedToday }}</p>
        </div>
        <div class="bg-gray-500/5 border border-gray-500/15 rounded-lg p-4">
          <p class="text-sm text-gray-400 mb-1">This Week</p>
          <p class="text-2xl font-bold text-white">{{ stats.endpointsCreatedThisWeek }}</p>
        </div>
        <div class="bg-gray-500/5 border border-gray-500/15 rounded-lg p-4">
          <p class="text-sm text-gray-400 mb-1">JavaScript</p>
          <p class="text-2xl font-bold text-yellow-300">{{ stats.javascriptCount }}</p>
        </div>
        <div class="bg-gray-500/5 border border-gray-500/15 rounded-lg p-4">
          <p class="text-sm text-gray-400 mb-1">Python</p>
          <p class="text-2xl font-bold text-blue-300">{{ stats.pythonCount }}</p>
        </div>
      </div>

      <!-- Filters -->
      <div class="bg-gray-500/5 border border-gray-500/15 rounded-lg p-4 mb-6">
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
          <!-- Auth Type Filter -->
          <div class="relative">
            <select 
              v-model="filters.authType" 
              @change="loadEndpoints" 
              class="block w-full appearance-none rounded-lg bg-gray-500/5 py-2.5 pl-4 pr-10 text-sm font-medium text-white border border-gray-500/10 hover:bg-gray-500/10 focus:outline-none focus:ring-2 focus:ring-gray-500/10 transition-all duration-150"
            >
              <option value="all">All Types</option>
              <option value="authenticated">Authenticated Only</option>
              <option value="unauthenticated">Unauthenticated Only</option>
            </select>
            <div class="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
              <svg class="h-5 w-5 text-gray-500" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M10 3a.75.75 0 01.55.24l3.25 3.5a.75.75 0 11-1.1 1.02L10 4.852 7.3 7.76a.75.75 0 01-1.1-1.02l3.25-3.5A.75.75 0 0110 3zm-3.76 9.2a.75.75 0 011.06.04l2.7 2.908 2.7-2.908a.75.75 0 111.1 1.02l-3.25 3.5a.75.75 0 01-1.1 0l-3.25-3.5a.75.75 0 01.04-1.06z" clip-rule="evenodd" />
              </svg>
            </div>
          </div>

          <!-- Language Filter -->
          <div class="relative">
            <select 
              v-model="filters.language" 
              @change="loadEndpoints" 
              class="block w-full appearance-none rounded-lg bg-gray-500/5 py-2.5 pl-4 pr-10 text-sm font-medium text-white border border-gray-500/10 hover:bg-gray-500/10 focus:outline-none focus:ring-2 focus:ring-gray-500/10 transition-all duration-150"
            >
              <option value="all">All Languages</option>
              <option value="javascript">JavaScript</option>
              <option value="python">Python</option>
            </select>
            <div class="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
              <svg class="h-5 w-5 text-gray-500" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M10 3a.75.75 0 01.55.24l3.25 3.5a.75.75 0 11-1.1 1.02L10 4.852 7.3 7.76a.75.75 0 01-1.1-1.02l3.25-3.5A.75.75 0 0110 3zm-3.76 9.2a.75.75 0 011.06.04l2.7 2.908 2.7-2.908a.75.75 0 111.1 1.02l-3.25 3.5a.75.75 0 01-1.1 0l-3.25-3.5a.75.75 0 01.04-1.06z" clip-rule="evenodd" />
              </svg>
            </div>
          </div>

          <!-- Search -->
          <input
            v-model="filters.search"
            @input="debouncedSearch"
            type="text"
            placeholder="Search code or email..."
            class="bg-gray-500/5 border border-gray-500/10 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500"
          />

          <!-- Bulk Actions -->
          <button
            v-if="selectedEndpoints.size > 0"
            @click="confirmBulkDelete"
            :disabled="deleting"
            class="bg-red-400/10 hover:bg-red-400/20 text-red-400 rounded-lg px-4 py-2 text-sm font-medium transition-colors disabled:opacity-50"
          >
            Delete {{ selectedEndpoints.size }} Selected
          </button>
        </div>
      </div>

      <!-- Endpoints Table -->
      <div class="bg-gray-500/5 border border-gray-500/15 rounded-lg overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full">
            <thead class="border-b border-gray-500/15">
              <tr class="text-left text-sm text-gray-400">
                <th class="p-4 w-12">
                  <input
                    type="checkbox"
                    @change="toggleSelectAll"
                    :checked="selectAll"
                    class="rounded"
                    :disabled="initialLoading"
                  />
                </th>
                <th class="p-4">ID</th>
                <th class="p-4">Type</th>
                <th class="p-4">Language</th>
                <th class="p-4">User</th>
                <th class="p-4">Created</th>
                <th class="p-4">Expires</th>
                <th class="p-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              <!-- Loading Skeleton -->
              <tr v-if="initialLoading" v-for="i in 5" :key="`skeleton-${i}`" class="border-b border-gray-500/10 animate-pulse">
                <td class="p-4">
                  <div class="h-4 w-4 bg-gray-500/20 rounded"></div>
                </td>
                <td class="p-4">
                  <div class="h-5 bg-gray-500/20 rounded w-24"></div>
                </td>
                <td class="p-4">
                  <div class="h-6 bg-gray-500/20 rounded w-16"></div>
                </td>
                <td class="p-4">
                  <div class="h-6 bg-gray-500/20 rounded w-20"></div>
                </td>
                <td class="p-4">
                  <div class="h-5 bg-gray-500/20 rounded w-32"></div>
                </td>
                <td class="p-4">
                  <div class="h-5 bg-gray-500/20 rounded w-28"></div>
                </td>
                <td class="p-4">
                  <div class="h-5 bg-gray-500/20 rounded w-28"></div>
                </td>
                <td class="p-4">
                  <div class="flex gap-2">
                    <div class="h-7 bg-gray-500/20 rounded w-14"></div>
                    <div class="h-7 bg-gray-500/20 rounded w-14"></div>
                  </div>
                </td>
              </tr>
              
              <!-- Actual Data -->
              <tr
                v-if="!initialLoading"
                v-for="endpoint in endpoints"
                :key="endpoint.id"
                class="border-b border-gray-500/10 hover:bg-gray-500/5 transition-colors"
              >
                <td class="p-4">
                  <input
                    type="checkbox"
                    :checked="selectedEndpoints.has(endpoint.id)"
                    @change="toggleSelect(endpoint.id)"
                    class="rounded"
                  />
                </td>
                <td class="p-4">
                  <code class="text-xs text-blue-300">{{ endpoint.id.substring(0, 12) }}...</code>
                </td>
                <td class="p-4">
                  <span
                    :class="[
                      'text-xs px-2 py-1 rounded',
                      endpoint.organizationId
                        ? 'bg-green-300/10 text-green-300'
                        : 'bg-amber-300/10 text-amber-300'
                    ]"
                  >
                    {{ endpoint.organizationId ? 'Auth' : 'Unauth' }}
                  </span>
                </td>
                <td class="p-4">
                  <span class="text-xs px-2 py-1 rounded bg-gray-500/20 text-gray-300">
                    {{ endpoint.language }}
                  </span>
                </td>
                <td class="p-4">
                  <span class="text-sm text-gray-300">
                    {{ endpoint.userEmail || 'Anonymous' }}
                  </span>
                </td>
                <td class="p-4 text-sm text-gray-400">
                  {{ formatDate(endpoint.createdAt) }}
                </td>
                <td class="p-4 text-sm text-gray-400">
                  {{ formatDate(endpoint.expiresAt) }}
                </td>
                <td class="p-4">
                  <div class="flex gap-2">
                    <button
                      @click="viewCode(endpoint)"
                      class="text-xs px-3 py-1 bg-blue-300/10 hover:bg-blue-300/20 text-blue-300 rounded transition-colors"
                    >
                      View
                    </button>
                    <button
                      v-if="!endpoint.organizationId"
                      @click="confirmDelete(endpoint)"
                      :disabled="deleting"
                      class="text-xs px-3 py-1 bg-red-400/10 hover:bg-red-400/20 text-red-400 rounded transition-colors disabled:opacity-50"
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
              <tr v-if="!initialLoading && loading">
                <td colspan="8" class="p-8 text-center text-gray-400">
                  <svg class="animate-spin h-6 w-6 mx-auto mb-2" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Loading...
                </td>
              </tr>
              <tr v-if="!initialLoading && !loading && endpoints.length === 0">
                <td colspan="8" class="p-8 text-center text-gray-400">
                  No endpoints found
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Pagination -->
        <div v-if="totalPages > 1" class="border-t border-gray-500/15 p-4 flex items-center justify-between">
          <div class="text-sm text-gray-400">
            Showing {{ (currentPage - 1) * limit + 1 }} to {{ Math.min(currentPage * limit, total) }} of {{ total }} endpoints
          </div>
          <div class="flex gap-2">
            <button
              @click="prevPage"
              :disabled="currentPage === 1"
              class="px-3 py-1 text-sm bg-gray-500/10 hover:bg-gray-500/20 text-white rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <span class="px-3 py-1 text-sm text-gray-400">
              Page {{ currentPage }} of {{ totalPages }}
            </span>
            <button
              @click="nextPage"
              :disabled="currentPage === totalPages"
              class="px-3 py-1 text-sm bg-gray-500/10 hover:bg-gray-500/20 text-white rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Delete Confirmation Modal -->
    <Teleport to="body">
      <div v-if="deleteConfirmation.show" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm" @click.self="deleteConfirmation.show = false">
        <div class="bg-black border border-gray-500/30 rounded-lg p-6 max-w-md w-full">
          <div class="flex items-start gap-4 mb-4">
            <div class="shrink-0 w-10 h-10 bg-red-400/10 rounded-full flex items-center justify-center">
              <svg class="w-5 h-5 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <div class="flex-1">
              <h3 class="text-lg font-semibold text-white mb-2">
                {{ deleteConfirmation.bulk ? `Delete ${deleteConfirmation.count} Endpoints?` : 'Delete Endpoint?' }}
              </h3>
              <p class="text-sm text-gray-400">
                {{ deleteConfirmation.bulk 
                  ? `You are about to permanently delete ${deleteConfirmation.count} endpoints. This action cannot be undone.`
                  : 'This endpoint will be permanently deleted. This action cannot be undone.'
                }}
              </p>
              <div v-if="!deleteConfirmation.bulk && deleteConfirmation.endpoint" class="mt-3 p-2 bg-black rounded text-xs">
                <p class="text-gray-500">ID: <span class="text-blue-300 font-mono">{{ deleteConfirmation.endpoint.id.substring(0, 12) }}...</span></p>
                <p class="text-gray-500">Language: <span class="text-white">{{ deleteConfirmation.endpoint.language }}</span></p>
              </div>
            </div>
          </div>
          
          <div class="flex gap-3">
            <button
              @click="deleteConfirmation.show = false"
              class="flex-1 px-4 py-2 bg-gray-500/10 hover:bg-gray-500/20 text-white rounded-lg transition-colors text-sm font-medium"
            >
              Cancel
            </button>
            <button
              @click="executeDelete"
              :disabled="deleting"
              class="flex-1 px-4 py-2 bg-red-400 hover:bg-red-500 text-white rounded-lg transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {{ deleting ? 'Deleting...' : 'Delete' }}
            </button>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- Code View Modal -->
    <Teleport to="body">
      <div v-if="viewingEndpoint" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm" @click.self="viewingEndpoint = null">
        <div class="bg-black border border-gray-500/30 rounded-lg p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
          <div class="flex items-start justify-between mb-4">
            <div>
              <h3 class="text-lg font-semibold text-white">Endpoint Code</h3>
              <p class="text-sm text-gray-400 mt-1">ID: {{ viewingEndpoint.id }}</p>
            </div>
            <button @click="viewingEndpoint = null" class="text-gray-400 hover:text-white">
              <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          <div class="mb-4 grid grid-cols-2 gap-4 text-sm">
            <div>
              <span class="text-gray-400">Language:</span>
              <span class="text-white ml-2">{{ viewingEndpoint.language }}</span>
            </div>
            <div>
              <span class="text-gray-400">Type:</span>
              <span class="text-white ml-2">{{ viewingEndpoint.organizationId ? 'Authenticated' : 'Unauthenticated' }}</span>
            </div>
            <div>
              <span class="text-gray-400">Created:</span>
              <span class="text-white ml-2">{{ new Date(viewingEndpoint.createdAt).toLocaleString() }}</span>
            </div>
            <div>
              <span class="text-gray-400">Expires:</span>
              <span class="text-white ml-2">{{ new Date(viewingEndpoint.expiresAt).toLocaleString() }}</span>
            </div>
          </div>

          <pre class="bg-gray-500/5 border border-gray-500/15 rounded-lg p-4 text-sm text-gray-300 overflow-x-auto">{{ viewingEndpoint.code }}</pre>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'

// Auth check - redirect if not admin
definePageMeta({
  middleware: 'auth',
})

useHead({
  title: 'Admin - Instant API',
});

const config = useRuntimeConfig()
const API_BASE = config.public.apiBase
const { token } = useAuth()

// State
const stats = ref<any>(null)
const endpoints = ref<any[]>([])
const loading = ref(false)
const initialLoading = ref(true)
const deleting = ref(false)
const currentPage = ref(1)
const limit = ref(50)
const total = ref(0)
const totalPages = computed(() => Math.ceil(total.value / limit.value))
const selectedEndpoints = ref<Set<string>>(new Set())
const selectAll = computed(() => selectedEndpoints.value.size === endpoints.value.length && endpoints.value.length > 0)
const viewingEndpoint = ref<any>(null)
const deleteConfirmation = ref({
  show: false,
  endpoint: null as any,
  bulk: false,
  count: 0,
})

// Filters
const filters = ref({
  authType: 'all',
  language: 'all',
  search: '',
})

// Load stats
async function loadStats() {
  try {
    const response = await fetch(`${API_BASE}/api/admin/stats`, {
      headers: {
        'Authorization': `Bearer ${token.value}`,
      },
    })
    if (response.ok) {
      stats.value = await response.json()
    } else if (response.status === 403) {
      // Not an admin, redirect
      navigateTo('/')
    }
  } catch (error) {
    // Failed to load stats
  } finally {
    initialLoading.value = false
  }
}

// Load endpoints
async function loadEndpoints() {
  loading.value = true
  try {
    const params = new URLSearchParams({
      page: currentPage.value.toString(),
      limit: limit.value.toString(),
      authType: filters.value.authType,
      language: filters.value.language,
      search: filters.value.search,
    })

    const response = await fetch(`${API_BASE}/api/admin/endpoints?${params}`, {
      headers: {
        'Authorization': `Bearer ${token.value}`,
      },
    })

    if (response.ok) {
      const data = await response.json()
      endpoints.value = data.endpoints
      total.value = data.total
      selectedEndpoints.value.clear()
    }
  } catch (error) {
    // Failed to load endpoints
  } finally {
    loading.value = false
    initialLoading.value = false
  }
}

// Show delete confirmation modal
function confirmDelete(endpoint: any) {
  deleteConfirmation.value = {
    show: true,
    endpoint,
    bulk: false,
    count: 1,
  }
}

// Show bulk delete confirmation modal
function confirmBulkDelete() {
  deleteConfirmation.value = {
    show: true,
    endpoint: null,
    bulk: true,
    count: selectedEndpoints.value.size,
  }
}

// Execute delete after confirmation
async function executeDelete() {
  deleting.value = true
  try {
    if (deleteConfirmation.value.bulk) {
      // Bulk delete
      const response = await fetch(`${API_BASE}/api/admin/endpoints/bulk-delete`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token.value}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          endpointIds: Array.from(selectedEndpoints.value),
        }),
      })

      if (response.ok) {
        await loadEndpoints()
        await loadStats()
        deleteConfirmation.value.show = false
      } else {
        alert('Failed to delete endpoints')
      }
    } else {
      // Single delete
      const response = await fetch(`${API_BASE}/api/admin/endpoints/${deleteConfirmation.value.endpoint.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token.value}`,
        },
      })

      if (response.ok) {
        await loadEndpoints()
        await loadStats()
        deleteConfirmation.value.show = false
      } else {
        alert('Failed to delete endpoint')
      }
    }
  } catch (error) {
    alert('Failed to delete')
  } finally {
    deleting.value = false
  }
}

// Selection
function toggleSelect(id: string) {
  if (selectedEndpoints.value.has(id)) {
    selectedEndpoints.value.delete(id)
  } else {
    selectedEndpoints.value.add(id)
  }
}

function toggleSelectAll() {
  if (selectAll.value) {
    selectedEndpoints.value.clear()
  } else {
    endpoints.value.forEach(e => selectedEndpoints.value.add(e.id))
  }
}

// View code
function viewCode(endpoint: any) {
  viewingEndpoint.value = endpoint
}

// Pagination
function nextPage() {
  if (currentPage.value < totalPages.value) {
    currentPage.value++
    loadEndpoints()
  }
}

function prevPage() {
  if (currentPage.value > 1) {
    currentPage.value--
    loadEndpoints()
  }
}

// Debounced search
let searchTimeout: NodeJS.Timeout
function debouncedSearch() {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    currentPage.value = 1
    loadEndpoints()
  }, 500)
}

// Format date
function formatDate(dateString: string) {
  const date = new Date(dateString)
  return date.toLocaleDateString() + ' ' + date.toLocaleTimeString()
}

// Load data on mount
onMounted(() => {
  loadStats()
  loadEndpoints()
})
</script>

