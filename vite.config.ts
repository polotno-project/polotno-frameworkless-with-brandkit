import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  root: './editor',
  build: {
    outDir: '../dist',
  },
});
