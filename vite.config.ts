import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
});

// Vitest configuration
export const test = {
  environment: "jsdom",
  setupFiles: "./src/tests/setup.ts",
};
