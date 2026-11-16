import nextCoreWebVitals from 'eslint-config-next/core-web-vitals';

const eslintConfig = [
  ...nextCoreWebVitals,
  {
    files: ['**/*.{ts,tsx}'],
    rules: {
      '@typescript-eslint/no-explicit-any': 'error',
    },
  },
  {
    ignores: ['.next/**', 'node_modules/**', 'next-env.d.ts'],
  },
];

export default eslintConfig;
