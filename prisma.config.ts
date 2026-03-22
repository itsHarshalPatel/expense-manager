// prisma.config.ts
import { defineConfig } from "@prisma/config";
import * as dotenv from "dotenv";

dotenv.config();

export default defineConfig({
  schema: "prisma/schema.prisma",
  datasource: {
    // Port 5432 for Migrations
    url: process.env.DIRECT_URL!,
  },
});
