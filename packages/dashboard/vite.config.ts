import { resolve } from "node:path";
import vue from "@vitejs/plugin-vue";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      "@": resolve(__dirname, "src"),
    },
  },
  server: {
    port: 5174,
    // When running beside a Vite app, proxy its analysis output:
    // proxy: { "/analysis": "http://localhost:5173" },
  },
});
