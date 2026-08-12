import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react'; // <-- Fix dot to slash here!
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});