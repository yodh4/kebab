import { Hono } from 'hono';
import { z } from 'zod';
import { asc, eq } from 'drizzle-orm';
import { db as defaultDb } from '../db/client';
import { boards, columns, tasks } from '../db/schema';
import type { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import type * as schema from '../db/schema';

const app = new Hono();

// Allow database injection for testing
const getDb = (): PostgresJsDatabase<typeof schema> => {
  // @ts-expect-error - Allow test environment to override db
  return globalThis.__TEST_DB__ || defaultDb;
};

// Zod schema for creating a board
const createBoardSchema = z.object({
  title: z.string().min(1, 'Title is required').max(255, 'Title too long'),
});

// GET /api/boards - List all boards
app.get('/', async (c) => {
  try {
    const db = getDb();
    const allBoards = await db.select().from(boards);
    return c.json(allBoards);
  } catch (error) {
    console.error('Error fetching boards:', error);
    return c.json({ error: 'Failed to fetch boards' }, 500);
  }
});

// POST /api/boards - Create a new board
app.post('/', async (c) => {
  try {
    const db = getDb();
    const body = await c.req.json();
    const validation = createBoardSchema.safeParse(body);

    if (!validation.success) {
      return c.json({ error: validation.error.issues }, 400);
    }

    const [newBoard] = await db.insert(boards).values({ title: validation.data.title }).returning();

    return c.json(newBoard, 201);
  } catch (error) {
    console.error('Error creating board:', error);
    return c.json({ error: 'Failed to create board' }, 500);
  }
});

// GET /api/boards/:id - Get a single board with its columns and tasks
app.get('/:id', async (c) => {
  try {
    const db = getDb();
    const id = c.req.param('id');

    // Validate UUID format before hitting the DB (avoids a DB-level 500 error)
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(id)) {
      return c.json({ error: 'Invalid board ID format' }, 400);
    }

    // Fetch the board
    const [board] = await db.select().from(boards).where(eq(boards.id, id));

    if (!board) {
      return c.json({ error: 'Board not found' }, 404);
    }

    // Fetch columns ordered by order ASC, created_at ASC (tie-break per ADR-001)
    const boardColumns = await db
      .select()
      .from(columns)
      .where(eq(columns.boardId, id))
      .orderBy(asc(columns.order), asc(columns.createdAt));

    // Fetch tasks per column — intentional N+1 for Phase 1B learning (ADR-003)
    const columnsWithTasks = await Promise.all(
      boardColumns.map(async (col) => {
        const columnTasks = await db
          .select()
          .from(tasks)
          .where(eq(tasks.columnId, col.id))
          .orderBy(asc(tasks.order), asc(tasks.createdAt));

        return { ...col, tasks: columnTasks };
      })
    );

    return c.json({ ...board, columns: columnsWithTasks });
  } catch (error) {
    console.error('Error fetching board:', error);
    return c.json({ error: 'Failed to fetch board' }, 500);
  }
});

// DELETE /api/boards/:id - Delete a board
app.delete('/:id', async (c) => {
  try {
    const db = getDb();
    const id = c.req.param('id');

    // Check if board exists
    const [existingBoard] = await db.select().from(boards).where(eq(boards.id, id));

    if (!existingBoard) {
      return c.json({ error: 'Board not found' }, 404);
    }

    // Delete the board
    await db.delete(boards).where(eq(boards.id, id));

    return c.body(null, 204);
  } catch (error) {
    console.error('Error deleting board:', error);
    return c.json({ error: 'Failed to delete board' }, 500);
  }
});

export default app;
