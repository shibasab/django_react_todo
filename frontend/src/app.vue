<template>
  <Header />
  <div class="container mx-auto px-4 bg-[#F7FFF7] min-h-screen">
    <RouterView />
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'

import Header from './layouts/header.vue'
import { useAuthStore } from './stores/auth'

const authStore = useAuthStore()


onMounted(() => {
  void authStore.loadUser()
})
</script>
