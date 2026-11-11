import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Nombres de archivo fijos (sin hash) porque la página Visualforce Portal.page
// los referencia con URLFOR($Resource.PortalReact, 'assets/index.js').
export default defineConfig({
  plugins: [react()],
  base: './',
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    cssCodeSplit: false,
    rollupOptions: {
      output: {
        entryFileNames: 'assets/index.js',
        chunkFileNames: 'assets/[name].js',
        assetFileNames: (a) => (a.names?.[0] ?? a.name ?? '').endsWith('.css') ? 'assets/index.css' : 'assets/[name][extname]'
      }
    }
  },
  server: { port: 5173, open: true }
});
