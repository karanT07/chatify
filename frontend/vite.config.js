// frontend/vite.config.js
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // forward /api requests to backend on port 3000
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        secure: false,
        // optional: rewrite if you mount backend routes differently
        // rewrite: (path) => path.replace(/^\/api/, '/api')
      }
    }
  }
});
