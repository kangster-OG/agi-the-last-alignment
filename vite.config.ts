import { defineConfig } from "vite";

export default defineConfig({
  base: "./",
  build: {
    rollupOptions: {
      output: {
        inlineDynamicImports: true
      }
    }
  },
  server: {
    host: "127.0.0.1",
    port: 5173,
    hmr: process.env.VITE_PROOF_RUN === "1" ? false : undefined,
    watch: {
      ignored: ["**/docs/**", "**/tmp/**"]
    }
  }
});
