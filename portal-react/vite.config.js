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
      // Dos entradas: portal de donantes (index) y portal de administración (admin).
      input: { index: 'index.html', admin: 'admin.html' },
      output: {
        entryFileNames: 'assets/[name].js',
        chunkFileNames: 'assets/comun-[name].js',
        assetFileNames: (a) => (a.names?.[0] ?? a.name ?? '').endsWith('.css') ? 'assets/index.css' : 'assets/[name][extname]'
      }
    }
  },
  server: { port: 5173, open: true }
});
