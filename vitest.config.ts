import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    environment: 'happy-dom',
    globals: true,
    setupFiles: ['./tests/setup.ts']
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './'),
      '@shared': path.resolve(__dirname, './shared'),
      '@server': path.resolve(__dirname, './server')
    }
  }
});