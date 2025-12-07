<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
    <div class="max-w-md w-full space-y-8 p-8">
      <div class="text-center">
        <h2 class="text-3xl font-bold text-gray-900 dark:text-white">
          Gestor Financeiro
        </h2>
        <p class="mt-2 text-sm text-gray-600 dark:text-gray-400">
          Faça login para continuar
        </p>
      </div>

      <div class="mt-8 space-y-4">
        <!-- Google Login -->
        <UButton
          color="neutral"
          variant="solid"
          size="lg"
          block
          @click="loginWithGoogle"
          :loading="loadingProvider === 'google'"
          :disabled="!!loadingProvider"
        >
          <template #leading>
            <svg class="w-5 h-5" viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="currentColor"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="currentColor"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="currentColor"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
          </template>
          Continuar com Google
        </UButton>

        <!-- GitHub Login - Commented out for now -->
        <!--
        <UButton
          color="gray"
          variant="solid"
          size="lg"
          block
          @click="loginWithGitHub"
          :loading="loadingProvider === 'github'"
          :disabled="!!loadingProvider"
        >
          <template #leading>
            <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path
                fill-rule="evenodd"
                d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.17 6.839 9.49.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.463-1.11-1.463-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0112 6.836c.85.004 1.705.114 2.504.336 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.167 22 16.418 22 12c0-5.523-4.477-10-10-10z"
                clip-rule="evenodd"
              />
            </svg>
          </template>
          Continuar com GitHub
        </UButton>
        -->
      </div>

      <div class="mt-6 text-center">
        <p class="text-xs text-gray-500 dark:text-gray-400">
          Ao fazer login, você concorda com nossos termos de serviço e política de privacidade.
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: false
})

const config = useRuntimeConfig()
const loadingProvider = ref<'google' | null>(null)

async function loginWithGoogle() {
  loadingProvider.value = 'google'
  
  // CORREÇÃO: Usar navigateTo (ou window.location.href) diretamente.
  // Isso faz com que o navegador chame o seu endpoint, que por sua vez
  // retorna um 302 que o navegador segue para o Google.
  try {
    // Usamos navigateTo do Nuxt para garantir um redirecionamento limpo
    // e o 'external: true' para garantir que é tratado como uma navegação fora do app SPA,
    // embora para um endpoint de API, o Nuxt geralmente o faz corretamente.
    await navigateTo('/api/auth/login/google', { external: true })
    
    // O código abaixo NÃO será executado porque a página será redirecionada.

  } catch (error) {
    // Este catch só pegará erros de rede ou se o navigateTo falhar.
    console.error('Error during Google login redirection:', error)
    loadingProvider.value = null
  }
}

// GitHub login disabled for now - uncomment to re-enable
// async function loginWithGitHub() {
//   loadingProvider.value = 'github'
//   try {
//     const response = await $fetch('/api/auth/login/github')
//     window.location.href = response.url
//   } catch (error) {
//     console.error('Error during GitHub login:', error)
//     loadingProvider.value = null
//   }
// }
</script>
