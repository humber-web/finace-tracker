import { defineConfig } from "drizzle-kit";

export default defineConfig({
  // The dialect is mandatory for Drizzle-Kit 0.21+
  dialect: "postgresql", 
  schema: "./server/database/schema.ts", // Point this to where your tables are defined
  out: "./drizzle",      // Where your migrations will live
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
});