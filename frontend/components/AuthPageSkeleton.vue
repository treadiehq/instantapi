<template>
  <div class="min-h-screen relative bg-black flex items-center justify-center p-4">
    <div class="radial-gradient absolute top-0 md:right-14 right-5"></div>
    <div class="max-w-md w-full relative z-10">
      <!-- Logo/Header Skeleton -->
      <div class="text-center mb-8">
        <div class="w-14 h-14 bg-gray-500/10 rounded-lg mx-auto mb-3 animate-pulse"></div>
        <div class="h-8 bg-gray-500/10 rounded w-3/4 mx-auto mb-2 animate-pulse"></div>
        <div class="h-4 bg-gray-500/10 rounded w-1/2 mx-auto animate-pulse"></div>
      </div>

      <!-- Card Skeleton -->
      <div class="bg-gray-500/10 border border-gray-500/15 rounded-lg p-8">
        <div class="space-y-6">
          <!-- Input Field 1 -->
          <div class="space-y-2">
            <div class="h-4 bg-gray-500/10 rounded w-1/3 animate-pulse"></div>
            <div class="h-12 bg-gray-500/10 rounded animate-pulse"></div>
          </div>

          <!-- Input Field 2 (optional) -->
          <div v-if="showSecondField" class="space-y-2">
            <div class="h-4 bg-gray-500/10 rounded w-2/5 animate-pulse"></div>
            <div class="h-12 bg-gray-500/10 rounded animate-pulse"></div>
            <div class="h-3 bg-gray-500/10 rounded w-3/4 animate-pulse"></div>
          </div>

          <!-- Button -->
          <div class="h-12 bg-gray-500/10 rounded animate-pulse"></div>
        </div>

        <!-- Bottom Link -->
        <div class="mt-6 text-center">
          <div class="h-4 bg-gray-500/10 rounded w-3/5 mx-auto animate-pulse"></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  showSecondField?: boolean;
}>();
</script>

