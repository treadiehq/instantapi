<template>
  <div>
    <ClientOnly>
      <NuxtPage />
      <template #fallback>
        <SkeletonLoader :show-dashboard="false" />
      </template>
    </ClientOnly>
  </div>
</template>

