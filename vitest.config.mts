import { fileURLToPath } from 'node:url';
import { configDefaults, defineConfig } from 'vitest/config';

export default defineConfig({
  resolve: {
    alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
  },
  test: {
    // Integration tests need a database: npm run test:integration
    exclude: [...configDefaults.exclude, '**/*.integration.test.ts'],
    // Tests of React hooks set `@vitest-environment jsdom` in the file
  },
});
