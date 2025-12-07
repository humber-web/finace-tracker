export default defineNuxtRouteMiddleware((to) => {
  // Only run on client side
  if (process.server) return

  const { isAuthenticated, loading } = useAuth()

  // Public routes that don't require authentication
  const publicRoutes = ['/login']

  // If user is not authenticated and trying to access a protected route
  if (!isAuthenticated.value && !publicRoutes.includes(to.path)) {
    return navigateTo('/login')
  }

  // If user is authenticated and trying to access login page, redirect to dashboard
  if (isAuthenticated.value && to.path === '/login') {
    return navigateTo('/dashboard')
  }
})
