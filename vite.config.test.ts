import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/scales': 'https://space-weather-app-production-48ab.up.railway.app',
      '/alerts': 'https://space-weather-app-production-48ab.up.railway.app',
      '/events': 'https://space-weather-app-production-48ab.up.railway.app',
      '/solar-activity': 'https://space-weather-app-production-48ab.up.railway.app',
    }
  }
});