import "dotenv/config";
import { defineConfig } from "prisma/config";

const datasourceUrl = process.env.DATABASE_URL ??
  (process.env.NODE_ENV === "production" ? "" : "postgresql://wamoro:wamoro_dev@localhost:5433/wamoro_farms?schema=public");

if (!datasourceUrl) throw new Error("DATABASE_URL must be configured before running Prisma in production.");

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "tsx prisma/seed.ts",
  },
  datasource: { url: datasourceUrl },
});
