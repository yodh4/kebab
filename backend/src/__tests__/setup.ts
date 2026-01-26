import { beforeAll, afterAll, beforeEach } from 'vitest';
import { setupTestDb, clearTestDb, teardownTestDb } from './helpers/db';

// Setup test database before all tests
beforeAll(async () => {
  const testDb = await setupTestDb();
  // Inject test database into global scope for routes to use
  // @ts-expect-error - Injecting test database into globalThis
  globalThis.__TEST_DB__ = testDb;
});

// Clear database before each test to ensure isolation
beforeEach(async () => {
  await clearTestDb();
});

// Cleanup after all tests
afterAll(async () => {
  await teardownTestDb();
  // @ts-expect-error - Removing test database from globalThis
  delete globalThis.__TEST_DB__;
});
