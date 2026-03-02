<script setup lang="ts">
import { useAuthStore } from '../stores/auth'

const authStore = useAuthStore()
</script>

<template>
  <div v-if="authStore.authState.status === 'loading'" class="flex items-center justify-center min-h-screen text-gray-600">
    Loading...
  </div>
  <slot v-else />
</template>
