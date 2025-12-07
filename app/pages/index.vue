<script setup lang="ts">
const { isAuthenticated } = useAuth()

// Redirect root to dashboard if authenticated, otherwise to login
if (isAuthenticated.value) {
  navigateTo('/dashboard', { replace: true })
} else {
  navigateTo('/login', { replace: true })
}
</script>

<template>
  <div></div>
</template>

