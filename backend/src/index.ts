import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import boardsRouter from './routes/boards';

const app = new Hono();

// Middleware
app.use('*', logger());
app.use('*', cors());

// Health check endpoint
app.get('/health', (c) => {
  return c.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API routes
app.route('/api/boards', boardsRouter);

const PORT = process.env.PORT || 4000;

console.log(`🚀 Server starting on http://localhost:${PORT}`);

export default {
  port: PORT,
  fetch: app.fetch,
};
