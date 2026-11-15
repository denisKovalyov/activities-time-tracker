import { configDefaults, defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    // Integration tests need a database: npm run test:integration
    exclude: [...configDefaults.exclude, '**/*.integration.test.ts'],
  },
});
