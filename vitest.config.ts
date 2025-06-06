import { defineConfig } from 'vitest/config';
<<<<<<< HEAD
export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
  },
=======
import path from 'path';

export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'client', 'src'),
      '@shared': path.resolve(__dirname, 'shared')
    }
  },
  test: {
    include: [
      'client/src/components/__tests__/*.ts',
      'tests/unit/**/*.test.ts',
      'tests/integration/**/*.test.ts'
    ],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      all: true
    }
  }
>>>>>>> 11d7ecb (Add metrics logging and admin dashboard)
});
