<script setup lang="ts">
import { reactive } from 'vue'
import { RouterLink } from 'vue-router'

import { useAuthStore } from '../stores/auth'

const authStore = useAuthStore()

const formState = reactive({
  username: '',
  password: '',
})

const handleSubmit = async () => {
  await authStore.login(formState.username, formState.password)
}
</script>

<template>
  <div class="max-w-md mx-auto mt-8">
    <div class="bg-white rounded-lg shadow-md p-6">
      <h2 class="text-2xl font-bold text-center mb-6">Login</h2>
      <form @submit.prevent="handleSubmit">
        <div class="mb-4">
          <label for="username" class="block text-sm font-medium text-gray-700 mb-2">
            Username
          </label>
          <input
            id="username"
            v-model="formState.username"
            type="text"
            name="username"
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div class="mb-4">
          <label for="password" class="block text-sm font-medium text-gray-700 mb-2">
            Password
          </label>
          <input
            id="password"
            v-model="formState.password"
            type="password"
            name="password"
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div class="mb-4">
          <button
            type="submit"
            class="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Login
          </button>
        </div>
        <p class="text-center text-sm text-gray-600">
          Don't have an account?
          <RouterLink to="/register" class="text-blue-600 hover:text-blue-700">
            Register
          </RouterLink>
        </p>
      </form>
    </div>
  </div>
</template>
