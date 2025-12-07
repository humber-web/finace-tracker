export interface User {
  id: number
  email: string
  name: string | null
  avatar: string | null
  emailVerified: boolean
  isAdmin: boolean
  createdAt: string
  lastLoginAt: string | null
}

export const useAuth = () => {
  const user = useState<User | null>('auth:user', () => null)
  const loading = useState<boolean>('auth:loading', () => false)

  const fetchUser = async () => {
    loading.value = true
    try {
      const data = await $fetch<User>('/api/auth/me')
      user.value = data
      return data
    } catch (error) {
      user.value = null
      return null
    } finally {
      loading.value = false
    }
  }

  const logout = async () => {
    try {
      await $fetch('/api/auth/logout', { method: 'POST' })
      user.value = null
      await navigateTo('/login')
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  const isAuthenticated = computed(() => !!user.value)

  return {
    user: readonly(user),
    loading: readonly(loading),
    isAuthenticated,
    fetchUser,
    logout
  }
}
