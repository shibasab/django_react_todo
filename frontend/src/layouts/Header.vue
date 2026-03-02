<script setup lang="ts">
import { RouterLink } from 'vue-router'

import { useAuthStore } from '../stores/auth'

const authStore = useAuthStore()
</script>

<template>
  <nav class="bg-[#1A535C] text-white">
    <div class="container mx-auto px-4">
      <div class="flex items-center justify-between h-16">
        <RouterLink to="/" class="text-xl font-bold text-white hover:text-gray-200">
          Todo App
        </RouterLink>
        <div v-if="authStore.authState.status === 'authenticated'" class="flex items-center space-x-4">
          <span class="text-white font-semibold">Welcome {{ authStore.authState.user.username }}</span>
          <button
            class="px-3 py-1 bg-cyan-600 text-white rounded-md hover:bg-cyan-700 transition-colors text-sm"
            @click="authStore.logout()"
          >
            Logout
          </button>
        </div>
        <div v-else-if="authStore.authState.status === 'unauthenticated'" class="flex items-center space-x-4">
          <RouterLink to="/register" class="text-white hover:text-gray-200 transition-colors">
            Register
          </RouterLink>
          <RouterLink to="/login" class="text-white hover:text-gray-200 transition-colors">
            Login
          </RouterLink>
        </div>
      </div>
    </div>
  </nav>
</template>
