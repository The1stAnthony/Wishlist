import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Proxy API calls to the Express server during development
// so the client doesn't need to hardcode the backend port
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
    },
  },
});
