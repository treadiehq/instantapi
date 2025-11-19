<template>
  <div class="min-h-screen bg-black">
    <div class="radial-gradient absolute top-0 md:right-14 right-5"></div>
    
    <!-- Header Skeleton -->
    <div class="border-b border-gray-500/20 bg-black/80 backdrop-blur-sm px-6 py-2 relative z-10">
      <div class="max-w-7xl mx-auto flex items-center justify-between">
        <div class="flex items-center space-x-3">
          <div class="w-6 h-6 bg-gray-500/10 rounded animate-pulse"></div>
          <div class="w-px h-4 bg-gray-500/10"></div>
          <div class="w-32 h-4 bg-gray-500/10 rounded animate-pulse"></div>
        </div>
        <div class="w-6 h-6 bg-gray-500/10 rounded-full animate-pulse"></div>
      </div>
    </div>

    <!-- Main Content -->
    <div class="py-12 px-4 sm:px-6 lg:px-0 jetmono antialiased relative z-10">
      <div class="max-w-5xl mx-auto">
        <!-- Hero Skeleton -->
        <div class="mt-6 md:mt-12 max-w-3xl">
          <div class="mb-6 space-y-3">
            <div class="h-8 bg-gray-500/10 rounded w-3/4 animate-pulse"></div>
            <div class="h-8 bg-gray-500/10 rounded w-2/3 animate-pulse"></div>
          </div>
          <div class="space-y-2 mb-6">
            <div class="h-4 bg-gray-500/10 rounded w-full animate-pulse"></div>
            <div class="h-4 bg-gray-500/10 rounded w-5/6 animate-pulse"></div>
          </div>
        </div>

        <!-- Main Card Skeleton -->
        <div class="border bg-gray-500/5 border-gray-500/15 mt-14 md:mt-16 relative">
          <!-- Tabs -->
          <div class="border-b border-gray-500/10">
            <div class="flex p-4 space-x-4">
              <div class="h-6 bg-gray-500/10 rounded w-20 animate-pulse"></div>
              <div class="h-6 bg-gray-500/10 rounded w-24 animate-pulse"></div>
              <div class="h-6 bg-gray-500/10 rounded w-24 animate-pulse"></div>
              <div class="h-6 bg-gray-500/10 rounded w-20 animate-pulse"></div>
            </div>
          </div>

          <!-- Config Panel -->
          <div class="p-4 border-b border-gray-500/10">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div class="h-10 bg-gray-500/10 rounded animate-pulse"></div>
              <div class="h-10 bg-gray-500/10 rounded animate-pulse"></div>
            </div>
          </div>

          <!-- Editor Area -->
          <div class="bg-black p-6">
            <div class="space-y-3">
              <div class="h-4 bg-gray-500/10 rounded w-3/4 animate-pulse"></div>
              <div class="h-4 bg-gray-500/10 rounded w-full animate-pulse"></div>
              <div class="h-4 bg-gray-500/10 rounded w-5/6 animate-pulse"></div>
              <div class="h-4 bg-gray-500/10 rounded w-4/5 animate-pulse"></div>
              <div class="h-4 bg-gray-500/10 rounded w-full animate-pulse"></div>
              <div class="h-4 bg-gray-500/10 rounded w-2/3 animate-pulse"></div>
            </div>
          </div>

          <!-- Bottom Controls -->
          <div class="flex justify-between items-end p-4 border-t border-gray-500/10">
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 flex-1">
              <div class="h-16 bg-gray-500/10 rounded animate-pulse"></div>
              <div class="h-16 bg-gray-500/10 rounded animate-pulse"></div>
              <div class="h-16 bg-gray-500/10 rounded animate-pulse"></div>
            </div>
            <div class="ml-4 h-10 w-40 bg-gray-500/10 rounded animate-pulse"></div>
          </div>
        </div>

        <!-- Dashboard Skeleton (optional, for authenticated view) -->
        <div v-if="showDashboard" class="mt-12 space-y-6">
          <div class="h-6 bg-gray-500/10 rounded w-48 animate-pulse"></div>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="h-32 bg-gray-500/10 rounded animate-pulse"></div>
            <div class="h-32 bg-gray-500/10 rounded animate-pulse"></div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  showDashboard?: boolean;
}>();
</script>

