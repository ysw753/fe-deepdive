import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import { fileURLToPath, URL } from 'node:url';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: { '@': fileURLToPath(new URL('./apps/demo-dashboard/src', import.meta.url)) },
    dedupe: ['react', 'react-dom'],
  },

  test: {
    environment: 'jsdom',
    setupFiles: ['apps/demo-dashboard/vitest.setup.ts'], // 경로는 루트 기준
    include: ['apps/demo-dashboard/src/**/*.test.ts?(x)'],
    css: true,
    globals: true,
  },
});
