import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    allowedHosts: [
      "ba1c-2402-e280-3e38-203-511a-ee6f-4181-8bb7.ngrok-free.app",
    ],
  },
});
