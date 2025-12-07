export default defineAppConfig({
  ui: {
    // Color theme - primary color for your financial app
   

     
    // Container settings
    container: {
      base: 'w-full max-w-(--ui-container) mx-auto px-4 sm:px-6 lg:px-8'
    },

    // Dashboard layout
    dashboardGroup: {
      base: 'fixed inset-0 flex overflow-hidden'
    },

    // Card component defaults
    card: {
      base: 'overflow-hidden',
      background: 'bg-white dark:bg-gray-900',
      ring: 'ring-1 ring-gray-200 dark:ring-gray-800',
      rounded: 'rounded-xl',
      shadow: 'shadow-sm'
    },

   

    
  }
})

