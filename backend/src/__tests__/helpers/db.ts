import postgres from 'postgres';
import { drizzle } from 'drizzle-orm/postgres-js';
import { migrate } from 'drizzle-orm/postgres-js/migrator';
import { sql } from 'drizzle-orm';
import * as schema from '../../db/schema';

// Test database connection string
const TEST_DATABASE_URL =
  process.env.TEST_DATABASE_URL || 'postgresql://postgres:password@localhost:5432/kebab_test';

let testClient: postgres.Sql | null = null;
let testDb: ReturnType<typeof drizzle> | null = null;

/**
 * Setup test database connection and run migrations
 * Call this once before all tests
 */
export async function setupTestDb() {
  // Create connection to default 'postgres' database to create test database
  const adminClient = postgres('postgresql://postgres:password@localhost:5432/postgres');

  try {
    // Drop test database if it exists (clean slate)
    await adminClient.unsafe('DROP DATABASE IF EXISTS kebab_test');
    // Create fresh test database
    await adminClient.unsafe('CREATE DATABASE kebab_test');
  } catch (error) {
    console.error('Error creating test database:', error);
    throw error;
  } finally {
    await adminClient.end();
  }

  // Connect to test database
  testClient = postgres(TEST_DATABASE_URL);
  testDb = drizzle(testClient, { schema });

  // Run migrations to create tables
  await migrate(testDb, { migrationsFolder: './drizzle' });

  return testDb;
}

/**
 * Clear all data from test database tables
 * Call this before each test to ensure isolation
 */
export async function clearTestDb() {
  if (!testDb) {
    throw new Error('Test database not initialized. Call setupTestDb() first.');
  }

  // Truncate all tables in reverse order to respect foreign key constraints
  await testDb.execute(sql`TRUNCATE TABLE tasks CASCADE`);
  await testDb.execute(sql`TRUNCATE TABLE columns CASCADE`);
  await testDb.execute(sql`TRUNCATE TABLE boards CASCADE`);
}

/**
 * Close test database connection
 * Call this once after all tests
 */
export async function teardownTestDb() {
  if (testClient) {
    await testClient.end();
    testClient = null;
    testDb = null;
  }
}

/**
 * Get the test database instance
 */
export function getTestDb() {
  if (!testDb) {
    throw new Error('Test database not initialized. Call setupTestDb() first.');
  }
  return testDb;
}
