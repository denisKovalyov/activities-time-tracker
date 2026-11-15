import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vitest/config';

const path = (relative: string) =>
  fileURLToPath(new URL(relative, import.meta.url));

// Runs src/lib/db against a real local Postgres, see README.
export default defineConfig({
  resolve: {
    alias: {
      '@vercel/postgres': path('./src/test/integration/vercel-postgres.ts'),
      'server-only': path('./src/test/integration/server-only.ts'),
      '@': path('./src'),
    },
  },
  test: {
    include: ['**/*.integration.test.ts'],
    globalSetup: ['./src/test/integration/global-setup.ts'],
    setupFiles: ['./src/test/integration/setup.ts'],
    // All files share one database
    fileParallelism: false,
  },
});
