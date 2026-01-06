import { Hono } from 'hono';
import { db } from '../db/client';
import { boards } from '../db/schema';

const app = new Hono();

// GET /api/boards - List all boards
app.get('/', async (c) => {
  try {
    const allBoards = await db.select().from(boards);
    return c.json(allBoards);
  } catch (error) {
    console.error('Error fetching boards:', error);
    return c.json({ error: 'Failed to fetch boards' }, 500);
  }
});

export default app;
