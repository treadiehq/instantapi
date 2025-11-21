<template>
  <div>
    <ClientOnly fallback-tag="div" class="min-h-screen bg-black">
      <NuxtPage />
      <template #fallback>
        <SkeletonLoader :show-dashboard="false" />
      </template>
    </ClientOnly>
  </div>
</template>

<script setup lang="ts">
// Ensure auth is initialized before any page renders
if (process.client) {
  const { initAuth } = useAuth();
  initAuth();
}
</script>

