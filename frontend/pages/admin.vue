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

      <!-- Stats Cards -->
      <div v-if="stats" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div class="bg-gray-500/5 border border-gray-500/15 rounded-lg p-4">
          <p class="text-sm text-gray-400 mb-1">Total APIs</p>
          <p class="text-2xl font-bold text-white">{{ stats.totalEndpoints }}</p>
        </div>
        <div class="bg-gray-500/5 border border-gray-500/15 rounded-lg p-4">
          <p class="text-sm text-gray-400 mb-1">Authenticated</p>
          <p class="text-2xl font-bold text-green-400">{{ stats.authenticatedEndpoints }}</p>
        </div>
        <div class="bg-gray-500/5 border border-gray-500/15 rounded-lg p-4">
          <p class="text-sm text-gray-400 mb-1">Unauthenticated</p>
          <p class="text-2xl font-bold text-amber-400">{{ stats.unauthenticatedEndpoints }}</p>
        </div>
        <div class="bg-gray-500/5 border border-gray-500/15 rounded-lg p-4">
          <p class="text-sm text-gray-400 mb-1">Total Users</p>
          <p class="text-2xl font-bold text-blue-400">{{ stats.totalUsers }}</p>
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
          <p class="text-2xl font-bold text-yellow-400">{{ stats.javascriptCount }}</p>
        </div>
        <div class="bg-gray-500/5 border border-gray-500/15 rounded-lg p-4">
          <p class="text-sm text-gray-400 mb-1">Python</p>
          <p class="text-2xl font-bold text-blue-400">{{ stats.pythonCount }}</p>
        </div>
      </div>

      <!-- Filters -->
      <div class="bg-gray-500/5 border border-gray-500/15 rounded-lg p-4 mb-6">
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
          <!-- Auth Type Filter -->
          <select v-model="filters.authType" @change="loadEndpoints" class="bg-gray-500/5 border border-gray-500/10 rounded-lg px-3 py-2 text-sm text-white">
            <option value="all">All Types</option>
            <option value="authenticated">Authenticated Only</option>
            <option value="unauthenticated">Unauthenticated Only</option>
          </select>

          <!-- Language Filter -->
          <select v-model="filters.language" @change="loadEndpoints" class="bg-gray-500/5 border border-gray-500/10 rounded-lg px-3 py-2 text-sm text-white">
            <option value="all">All Languages</option>
            <option value="javascript">JavaScript</option>
            <option value="python">Python</option>
          </select>

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
            @click="bulkDelete"
            :disabled="deleting"
            class="bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg px-4 py-2 text-sm font-medium transition-colors"
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
              <tr
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
                        ? 'bg-green-500/10 text-green-400'
                        : 'bg-amber-500/10 text-amber-400'
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
                      class="text-xs px-3 py-1 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 rounded transition-colors"
                    >
                      View
                    </button>
                    <button
                      v-if="!endpoint.organizationId"
                      @click="deleteEndpoint(endpoint.id)"
                      :disabled="deleting"
                      class="text-xs px-3 py-1 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded transition-colors"
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
              <tr v-if="loading">
                <td colspan="8" class="p-8 text-center text-gray-400">
                  <svg class="animate-spin h-6 w-6 mx-auto mb-2" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Loading...
                </td>
              </tr>
              <tr v-if="!loading && endpoints.length === 0">
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

    <!-- Code View Modal -->
    <Teleport to="body">
      <div v-if="viewingEndpoint" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm" @click.self="viewingEndpoint = null">
        <div class="bg-gray-900 border border-gray-500/30 rounded-lg p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
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

          <pre class="bg-black rounded-lg p-4 text-sm text-gray-300 overflow-x-auto">{{ viewingEndpoint.code }}</pre>
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

const config = useRuntimeConfig()
const API_BASE = config.public.apiBase
const { token } = useAuth()

// State
const stats = ref<any>(null)
const endpoints = ref<any[]>([])
const loading = ref(false)
const deleting = ref(false)
const currentPage = ref(1)
const limit = ref(50)
const total = ref(0)
const totalPages = computed(() => Math.ceil(total.value / limit.value))
const selectedEndpoints = ref<Set<string>>(new Set())
const selectAll = computed(() => selectedEndpoints.value.size === endpoints.value.length && endpoints.value.length > 0)
const viewingEndpoint = ref<any>(null)

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
    console.error('Failed to load stats:', error)
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
    console.error('Failed to load endpoints:', error)
  } finally {
    loading.value = false
  }
}

// Delete endpoint
async function deleteEndpoint(id: string) {
  if (!confirm('Are you sure you want to delete this endpoint? This cannot be undone.')) {
    return
  }

  deleting.value = true
  try {
    const response = await fetch(`${API_BASE}/api/admin/endpoints/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token.value}`,
      },
    })

    if (response.ok) {
      await loadEndpoints()
      await loadStats()
    } else {
      alert('Failed to delete endpoint')
    }
  } catch (error) {
    console.error('Failed to delete endpoint:', error)
    alert('Failed to delete endpoint')
  } finally {
    deleting.value = false
  }
}

// Bulk delete
async function bulkDelete() {
  if (!confirm(`Are you sure you want to delete ${selectedEndpoints.value.size} endpoints? This cannot be undone.`)) {
    return
  }

  deleting.value = true
  try {
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
    } else {
      alert('Failed to delete endpoints')
    }
  } catch (error) {
    console.error('Failed to bulk delete:', error)
    alert('Failed to delete endpoints')
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

