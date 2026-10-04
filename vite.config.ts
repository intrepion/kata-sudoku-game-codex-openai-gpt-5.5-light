import { defineConfig } from "vite";

export default defineConfig({
  build: {
    rollupOptions: {
      input: "app.html",
    },
    target: "es2022",
  },
});
