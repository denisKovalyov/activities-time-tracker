import { afterAll } from 'vitest';

import { pool } from './vercel-postgres';

afterAll(() => pool.end());
