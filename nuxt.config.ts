// https://nuxt.com/docs/api/configuration/nuxt-config
import tailwindcss from "@tailwindcss/vite";
export default defineNuxtConfig({
  compatibilityDate: "2025-07-15",
  devtools: { enabled: false },
  modules: ["@nuxt/ui"],
  css: ["~/assets/css/main.css"],
  vite: {
    plugins: [tailwindcss()],
  },
  runtimeConfig: {
    dbUrl: process.env.DATABASE_URL || "postgresql://username:password@localhost:5432/fintech",
    // Auth secrets (private - server only)
    jwtSecret:
      process.env.JWT_SECRET ||
      "change-me-in-production-use-long-random-string",
    jwtExpiresIn: "7d",
    jwtRefreshExpiresIn: "30d",
    // OAuth providers (private - server only)
    googleClientId: process.env.GOOGLE_CLIENT_ID || "",
    googleClientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    githubClientId: process.env.GITHUB_CLIENT_ID || "",
    githubClientSecret: process.env.GITHUB_CLIENT_SECRET || "",
    // Public config (exposed to client)
    public: {
      appUrl: process.env.APP_URL || "https://fintech-fintech-ee1phh-198267-161-97-90-4.traefik.me/",
      enabledOAuthProviders: ["google"], // GitHub disabled for now
    },
  },
});
