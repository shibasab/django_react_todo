<script setup lang="ts">
import { onMounted } from 'vue'

import { useAuthStore } from './stores/auth'

const authStore = useAuthStore()

onMounted(() => {
  void authStore.loadUser()
})
</script>

<template>
  <RouterView />
</template>
