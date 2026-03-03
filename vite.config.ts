import { defineConfig } from "vite";
import { resolve } from "path";

export default defineConfig({
  root: "src",
  publicDir: false,

  resolve: {
    alias: {
      // Parcel used absolute paths like '/src/app/...' so remap for Vite for convinience, but we should avoid this in new code
      "/src": resolve(__dirname, "src"),
    },
  },

  css: {
    modules: {
      localsConvention: "camelCaseOnly",
    },
  },

  build: {
    outDir: resolve(__dirname, "dist"),
    emptyOutDir: true,
    target: "esnext",
    sourcemap: false,
    rollupOptions: {
      input: {
        main: resolve(__dirname, "src/index.html"),
      },
    },
  },

  server: {
    port: 1420,
    strictPort: true,
  },
});
