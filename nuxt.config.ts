// https://nuxt.com/docs/api/configuration/nuxt-config
import tailwindcss from "@tailwindcss/vite";
export default defineNuxtConfig({
  compatibilityDate: "2025-07-15",
  devtools: { enabled: true },
  modules: ["@nuxt/ui"],
  css: ["~/assets/css/main.css"],
  vite: {
    plugins: [tailwindcss()],
  },
  runtimeConfig: {
    dbPath: 'finance.db',
    // Auth secrets (private - server only)
    jwtSecret: process.env.JWT_SECRET || 'change-me-in-production-use-long-random-string',
    jwtExpiresIn: '7d',
    jwtRefreshExpiresIn: '30d',
    // OAuth providers (private - server only)
    googleClientId: process.env.GOOGLE_CLIENT_ID || '',
    googleClientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
    githubClientId: process.env.GITHUB_CLIENT_ID || '',
    githubClientSecret: process.env.GITHUB_CLIENT_SECRET || '',
    tursoDatabaseUrl: process.env.TURSO_DATABASE_URL,
    tursoAuthToken: process.env.TURSO_AUTH_TOKEN,
    // Public config (exposed to client)
    public: {
      appUrl: process.env.APP_URL || 'http://localhost:3000',
      enabledOAuthProviders: ['google'] // GitHub disabled for now
    }
  }
});
