import { boards } from '../../db/schema';
import { getTestDb } from './db';

/**
 * Sample board data for tests
 */
export const sampleBoards = {
  simple: {
    title: 'Test Board',
  },
  withLongTitle: {
    title: 'This is a board with a longer title for testing purposes',
  },
  emptyTitle: {
    title: '',
  },
  tooLongTitle: {
    title: 'a'.repeat(256), // Exceeds 255 char limit
  },
};

/**
 * Create a test board in the database
 * Returns the created board object
 */
export async function createTestBoard(data: { title: string }) {
  const db = getTestDb();
  const [board] = await db.insert(boards).values(data).returning();
  return board;
}

/**
 * Create multiple test boards at once
 */
export async function createTestBoards(boardsData: Array<{ title: string }>) {
  const db = getTestDb();
  const createdBoards = await db.insert(boards).values(boardsData).returning();
  return createdBoards;
}
