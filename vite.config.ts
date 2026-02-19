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
    target: 'es2020',
    minify: 'esbuild',
    rollupOptions: {
      output: {
        manualChunks(id) {
          // IMPORTANT: Check framer-motion FIRST since it also imports from react
          if (id.includes('framer-motion') || id.includes('motion')) {
            if (!id.includes('node_modules/react/') && !id.includes('node_modules/react-dom/')) {
              return 'vendor-framer';
            }
          }
          // Core React
          if (id.includes('node_modules/react-dom') || id.includes('node_modules/react/') || id.includes('node_modules/scheduler')) {
            return 'vendor-react';
          }
          // Radix UI components
          if (id.includes('@radix-ui')) {
            return 'vendor-radix';
          }
          // Sonner + next-themes
          if (id.includes('sonner') || id.includes('next-themes')) {
            return 'vendor-sonner';
          }
          // Wouter router
          if (id.includes('wouter')) {
            return 'vendor-router';
          }
          // Lucide icons
          if (id.includes('lucide-react')) {
            return 'vendor-icons';
          }
          // Data chunks
          if (id.includes('data/kits')) {
            return 'data-kits';
          }
          if (id.includes('data/alternatives') || id.includes('lovevery_alternatives')) {
            return 'data-alternatives';
          }
          if (id.includes('data/toyImages')) {
            return 'data-images';
          }
          if (id.includes('data/toyCleaningGuide') || id.includes('data/toyReviews')) {
            return 'data-reviews';
          }
          if (id.includes('data/seoData') || id.includes('lib/seoHelpers')) {
            return 'data-seo';
          }
          // Recharts (unused but imported by UI component)
          if (id.includes('recharts') || id.includes('d3-')) {
            return 'vendor-charts';
          }
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
