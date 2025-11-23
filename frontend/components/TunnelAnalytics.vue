<template>
  <div class="space-y-6">
    <!-- Analytics Overview -->
    <div v-if="analytics" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <!-- Total Requests -->
      <div class="bg-gray-500/5 border border-gray-500/10 rounded-lg p-4">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-xs text-gray-500 uppercase tracking-wide mb-1">Total Requests</p>
            <p class="text-2xl font-bold text-white">{{ analytics.stats.totalRequests.toLocaleString() }}</p>
          </div>
          <div class="w-10 h-10 bg-blue-300/10 rounded-lg flex items-center justify-center">
            <svg class="w-6 h-6 text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
          </div>
        </div>
      </div>

      <!-- Total Bandwidth -->
      <div class="bg-gray-500/5 border border-gray-500/10 rounded-lg p-4">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-xs text-gray-500 uppercase tracking-wide mb-1">Total Bandwidth</p>
            <p class="text-2xl font-bold text-white">{{ formatBytes(analytics.stats.totalBandwidthBytes) }}</p>
          </div>
          <div class="w-10 h-10 bg-purple-300/10 rounded-lg flex items-center justify-center">
            <svg class="w-6 h-6 text-purple-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
          </div>
        </div>
        <div class="mt-2 flex items-center gap-2 text-xs text-gray-400">
          <span>↑ {{ formatBytes(analytics.stats.totalRequestBytes) }}</span>
          <span>↓ {{ formatBytes(analytics.stats.totalResponseBytes) }}</span>
        </div>
      </div>

      <!-- Average Duration -->
      <div class="bg-gray-500/5 border border-gray-500/10 rounded-lg p-4">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-xs text-gray-500 uppercase tracking-wide mb-1">Avg Response Time</p>
            <p class="text-2xl font-bold text-white">{{ analytics.stats.averageDurationMs }}ms</p>
          </div>
          <div class="w-10 h-10 bg-green-300/10 rounded-lg flex items-center justify-center">
            <svg class="w-6 h-6 text-green-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        </div>
      </div>

      <!-- Status Breakdown -->
      <div class="bg-gray-500/5 border border-gray-500/10 rounded-lg p-4">
        <div class="flex items-center justify-between mb-2">
          <p class="text-xs text-gray-500 uppercase tracking-wide">Status</p>
          <div class="w-10 h-10 bg-yellow-300/10 rounded-lg flex items-center justify-center">
            <svg class="w-6 h-6 text-yellow-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        </div>
        <div class="space-y-1">
          <div v-for="status in analytics.statusBreakdown" :key="status.status" class="flex justify-between text-xs">
            <span :class="getStatusColor(status.status)">{{ status.status }}</span>
            <span class="text-gray-400">{{ status.count }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Request Logs -->
    <div class="bg-gray-500/5 border border-gray-500/10 rounded-lg">
      <div class="px-6 py-4 border-b border-gray-500/10 flex items-center justify-between">
        <h3 class="text-lg font-semibold text-white">Request Logs</h3>
        <div class="flex items-center gap-2">
          <button
            @click="refreshLogs"
            :disabled="loadingLogs"
            class="px-3 py-1.5 text-xs bg-gray-500/10 hover:bg-gray-500/20 border border-gray-500/20 rounded-lg text-gray-300 transition-colors disabled:opacity-50"
          >
            <svg v-if="loadingLogs" class="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span v-else>Refresh</span>
          </button>
        </div>
      </div>

      <div class="overflow-x-auto">
        <table class="w-full">
          <thead class="bg-gray-500/5 border-b border-gray-500/10">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Time</th>
              <th class="px-6 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Method</th>
              <th class="px-6 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Path</th>
              <th class="px-6 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Status</th>
              <th class="px-6 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Duration</th>
              <th class="px-6 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Size</th>
              <th class="px-6 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-500/10">
            <tr v-if="loadingLogs" v-for="i in 5" :key="i">
              <td colspan="7" class="px-6 py-4">
                <div class="h-4 bg-gray-500/10 rounded animate-pulse"></div>
              </td>
            </tr>
            <tr v-else-if="!logs || logs.requests.length === 0">
              <td colspan="7" class="px-6 py-8 text-center text-gray-500">
                No requests yet
              </td>
            </tr>
            <tr v-else v-for="log in logs.requests" :key="log.id" class="hover:bg-gray-500/5 transition-colors">
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                {{ formatTime(log.createdAt) }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span :class="getMethodColor(log.method)" class="text-xs font-mono font-semibold px-2 py-1 rounded">
                  {{ log.method }}
                </span>
              </td>
              <td class="px-6 py-4 text-sm text-gray-300 font-mono max-w-xs truncate" :title="log.path">
                {{ log.path || '/' }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span v-if="log.responseStatus" :class="getHttpStatusColor(log.responseStatus)" class="text-xs font-mono font-semibold px-2 py-1 rounded">
                  {{ log.responseStatus }}
                </span>
                <span v-else :class="getStatusColor(log.status)" class="text-xs font-semibold px-2 py-1 rounded">
                  {{ log.status }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                <span v-if="log.durationMs !== null" :class="getDurationColor(log.durationMs)">
                  {{ log.durationMs }}ms
                </span>
                <span v-else class="text-gray-500">-</span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                <div class="flex flex-col text-xs">
                  <span v-if="log.requestSize" class="text-gray-400">↑ {{ formatBytes(log.requestSize) }}</span>
                  <span v-if="log.responseSize" class="text-gray-400">↓ {{ formatBytes(log.responseSize) }}</span>
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm">
                <button
                  @click="viewDetails(log)"
                  class="text-blue-300 hover:text-blue-400 transition-colors"
                >
                  View
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination -->
      <div v-if="logs && logs.pagination.total > 0" class="px-6 py-4 border-t border-gray-500/10 flex items-center justify-between">
        <div class="text-sm text-gray-400">
          Showing {{ logs.pagination.offset + 1 }} to {{ Math.min(logs.pagination.offset + logs.pagination.limit, logs.pagination.total) }} of {{ logs.pagination.total }} requests
        </div>
        <div class="flex gap-2">
          <button
            @click="previousPage"
            :disabled="logs.pagination.offset === 0"
            class="px-3 py-1.5 text-xs bg-gray-500/10 hover:bg-gray-500/20 border border-gray-500/20 rounded-lg text-gray-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>
          <button
            @click="nextPage"
            :disabled="!logs.pagination.hasMore"
            class="px-3 py-1.5 text-xs bg-gray-500/10 hover:bg-gray-500/20 border border-gray-500/20 rounded-lg text-gray-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
          </button>
        </div>
      </div>
    </div>

    <!-- Request Details Modal -->
    <div v-if="selectedLog" @click="selectedLog = null" class="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div @click.stop class="bg-black border border-gray-500/20 rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div class="sticky top-0 bg-black px-6 py-4 border-b border-gray-500/10 flex items-center justify-between">
          <h3 class="text-lg font-semibold text-white">Request Details</h3>
          <button @click="selectedLog = null" class="text-gray-400 hover:text-white transition-colors">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div class="p-6 space-y-6">
          <!-- Summary -->
          <div class="grid grid-cols-2 gap-4">
            <div>
              <p class="text-xs text-gray-500 mb-1">Method & Path</p>
              <p class="text-sm text-white font-mono">{{ selectedLog.method }} {{ selectedLog.path }}</p>
            </div>
            <div>
              <p class="text-xs text-gray-500 mb-1">Status</p>
              <p class="text-sm text-white">{{ selectedLog.responseStatus || selectedLog.status }}</p>
            </div>
            <div>
              <p class="text-xs text-gray-500 mb-1">Duration</p>
              <p class="text-sm text-white">{{ selectedLog.durationMs }}ms</p>
            </div>
            <div>
              <p class="text-xs text-gray-500 mb-1">Time</p>
              <p class="text-sm text-white">{{ formatFullTime(selectedLog.createdAt) }}</p>
            </div>
          </div>

          <!-- Request Headers -->
          <div>
            <p class="text-sm font-semibold text-white mb-2">Request Headers</p>
            <pre class="bg-black/50 border border-gray-500/20 rounded-lg p-4 text-xs text-gray-300 overflow-x-auto">{{ JSON.stringify(selectedLog.headers, null, 2) }}</pre>
          </div>

          <!-- Request Body -->
          <div v-if="selectedLog.body">
            <p class="text-sm font-semibold text-white mb-2">Request Body</p>
            <pre class="bg-black/50 border border-gray-500/20 rounded-lg p-4 text-xs text-gray-300 overflow-x-auto">{{ JSON.stringify(selectedLog.body, null, 2) }}</pre>
          </div>

          <!-- Response Headers -->
          <div v-if="selectedLog.responseHeaders">
            <p class="text-sm font-semibold text-white mb-2">Response Headers</p>
            <pre class="bg-black/50 border border-gray-500/20 rounded-lg p-4 text-xs text-gray-300 overflow-x-auto">{{ JSON.stringify(selectedLog.responseHeaders, null, 2) }}</pre>
          </div>

          <!-- Response Body -->
          <div v-if="selectedLog.responseBody">
            <p class="text-sm font-semibold text-white mb-2">Response Body</p>
            <pre class="bg-black/50 border border-gray-500/20 rounded-lg p-4 text-xs text-gray-300 overflow-x-auto">{{ JSON.stringify(selectedLog.responseBody, null, 2) }}</pre>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';

const props = defineProps<{
  tunnelId: string;
}>();

const analytics = ref<any>(null);
const logs = ref<any>(null);
const loadingLogs = ref(false);
const selectedLog = ref<any>(null);
const currentOffset = ref(0);
const pageSize = 50;

async function loadAnalytics() {
  try {
    const { data } = await useApi().get(`/api/tunnels/${props.tunnelId}/analytics`);
    analytics.value = data;
  } catch (error) {
    console.error('Failed to load analytics:', error);
  }
}

async function loadLogs() {
  loadingLogs.value = true;
  try {
    const { data } = await useApi().get(
      `/api/tunnels/${props.tunnelId}/logs?limit=${pageSize}&offset=${currentOffset.value}`
    );
    logs.value = data;
  } catch (error) {
    console.error('Failed to load logs:', error);
  } finally {
    loadingLogs.value = false;
  }
}

function refreshLogs() {
  loadAnalytics();
  loadLogs();
}

function previousPage() {
  if (currentOffset.value > 0) {
    currentOffset.value = Math.max(0, currentOffset.value - pageSize);
    loadLogs();
  }
}

function nextPage() {
  if (logs.value?.pagination.hasMore) {
    currentOffset.value += pageSize;
    loadLogs();
  }
}

function viewDetails(log: any) {
  selectedLog.value = log;
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
}

function formatTime(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleTimeString();
}

function formatFullTime(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleString();
}

function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    completed: 'text-green-400',
    'in-flight': 'text-yellow-400',
    pending: 'text-blue-400',
    failed: 'text-red-400',
  };
  return colors[status] || 'text-gray-400';
}

function getHttpStatusColor(status: number): string {
  if (status >= 200 && status < 300) return 'text-green-400 bg-green-400/10';
  if (status >= 300 && status < 400) return 'text-blue-400 bg-blue-400/10';
  if (status >= 400 && status < 500) return 'text-yellow-400 bg-yellow-400/10';
  if (status >= 500) return 'text-red-400 bg-red-400/10';
  return 'text-gray-400 bg-gray-400/10';
}

function getMethodColor(method: string): string {
  const colors: Record<string, string> = {
    GET: 'text-blue-400 bg-blue-400/10',
    POST: 'text-green-400 bg-green-400/10',
    PUT: 'text-yellow-400 bg-yellow-400/10',
    PATCH: 'text-orange-400 bg-orange-400/10',
    DELETE: 'text-red-400 bg-red-400/10',
  };
  return colors[method] || 'text-gray-400 bg-gray-400/10';
}

function getDurationColor(duration: number): string {
  if (duration < 100) return 'text-green-400';
  if (duration < 500) return 'text-yellow-400';
  if (duration < 1000) return 'text-orange-400';
  return 'text-red-400';
}

onMounted(() => {
  loadAnalytics();
  loadLogs();
  
  // Auto-refresh every 10 seconds
  const interval = setInterval(refreshLogs, 10000);
  
  // Cleanup on unmount
  return () => clearInterval(interval);
});
</script>

