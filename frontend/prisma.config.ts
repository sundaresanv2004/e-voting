import "dotenv/config";
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    // Use process.env directly (not env()) so a missing DATABASE_URL during
    // `prisma generate` at build time doesn't throw. The fallback is never
    // used at runtime — DATABASE_URL is always set in the running container.
    url: process.env.DATABASE_URL ?? "postgresql://build:build@localhost:5432/build?schema=public",
  },
});
