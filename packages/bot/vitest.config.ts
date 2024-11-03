/// <reference types="vitest" />
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globals: true,
    environment: "vprisma",
    setupFiles: ["vitest-environment-vprisma/setup"],
    coverage: {
      include: ["src/**/*.ts"],
      exclude: ["**/*.test.ts"],
      reporter: ["text", "html"],
      reportsDirectory: "../../public/coverage/bot",
    },
  },
});
