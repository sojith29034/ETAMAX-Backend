import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  css: {
    preprocessorOptions: {
      css: {
        additionalData: '@import "bootstrap/dist/css/bootstrap.min.css";'
      }
    }
  }
});
