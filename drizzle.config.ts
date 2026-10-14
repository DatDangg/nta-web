import { defineConfig } from "drizzle-kit";

// Chỉ dùng `drizzle-kit generate` + `drizzle-kit migrate` (SQL versioned trong drizzle/).
// CẤM `drizzle-kit push` (project-config: migration gate).
export default defineConfig({
  dialect: "postgresql",
  schema: "./src/db/schema.ts",
  out: "./drizzle",
  dbCredentials: {
    // `generate` không cần DB; `migrate` cần DATABASE_URL thật.
    url: process.env.DATABASE_URL ?? "",
  },
  strict: true,
  verbose: true,
});
