import { boards, columns, tasks } from '../../db/schema';
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

/**
 * Create a test column in the database
 */
export async function createTestColumn(data: { boardId: string; title: string; order: number }) {
  const db = getTestDb();
  const [column] = await db.insert(columns).values(data).returning();
  return column;
}

/**
 * Create a test task in the database
 */
export async function createTestTask(data: {
  columnId: string;
  title: string;
  order: number;
  description?: string;
}) {
  const db = getTestDb();
  const [task] = await db.insert(tasks).values(data).returning();
  return task;
}
