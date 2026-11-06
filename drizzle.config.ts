import { defineConfig } from "drizzle-kit";

/** `npm run db:generate` no necesita base; `npm run db:migrate` usa `DATABASE_URL`. */
export default defineConfig({
  dialect: "postgresql",
  schema: "./lib/db/schema.ts",
  out: "./drizzle",
  dbCredentials: { url: process.env.DATABASE_URL ?? "" },
});
