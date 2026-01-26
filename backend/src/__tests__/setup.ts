import { beforeAll, afterAll, beforeEach } from 'vitest';
import { setupTestDb, clearTestDb, teardownTestDb } from './helpers/db';

// Setup test database before all tests
beforeAll(async () => {
  await setupTestDb();
});

// Clear database before each test to ensure isolation
beforeEach(async () => {
  await clearTestDb();
});

// Cleanup after all tests
afterAll(async () => {
  await teardownTestDb();
});
