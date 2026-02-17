import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import path from "node:path";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  base: "/",
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "client", "src"),
      "@shared": path.resolve(import.meta.dirname, "shared"),
      "@assets": path.resolve(import.meta.dirname, "attached_assets"),
    },
  },
  envDir: path.resolve(import.meta.dirname),
  root: path.resolve(import.meta.dirname, "client"),
  build: {
    outDir: path.resolve(import.meta.dirname, "dist"),
    emptyOutDir: true,
    cssCodeSplit: true,
    rollupOptions: {
      output: {
        manualChunks: {
          // Vendor chunks - split heavy libraries
          'vendor-react': ['react', 'react-dom', 'react-dom/client'],
          'vendor-framer': ['framer-motion'],
          'vendor-radix': [
            '@radix-ui/react-tooltip',
            '@radix-ui/react-accordion',
            '@radix-ui/react-dialog',
          ],
          'vendor-sonner': ['sonner', 'next-themes'],
          // Data chunks - large data files
          'data-kits': ['./client/src/data/kits.ts'],
          'data-alternatives': ['./client/src/data/alternatives.ts'],
          'data-images': ['./client/src/data/toyImages.ts'],
          'data-reviews': [
            './client/src/data/toyCleaningGuide.ts',
            './client/src/data/toyReviews.ts',
          ],
        },
      },
    },
  },
  server: {
    port: 3000,
    strictPort: false,
    host: true,
    allowedHosts: true,
  },
});
