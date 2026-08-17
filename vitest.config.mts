import path from "node:path";
import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "./src"),
      "@data-provider": path.resolve(import.meta.dirname, "./services/data-provider"),
    },
  },
});
