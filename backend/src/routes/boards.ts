import { Hono } from 'hono';
import { z } from 'zod';
import { eq } from 'drizzle-orm';
import { db as defaultDb } from '../db/client';
import { boards } from '../db/schema';

const app = new Hono();

// Allow database injection for testing
const getDb = () => {
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
