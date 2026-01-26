import { Hono } from 'hono';
import boardsRouter from '../../routes/boards';

/**
 * Create a test Hono app instance with all routes configured
 * This mirrors the production app structure
 */
export function createTestApp() {
  const app = new Hono();

  // Mount boards routes (same as production)
  app.route('/api/boards', boardsRouter);

  return app;
}

/**
 * Helper to make typed requests to the test app
 */
export async function makeRequest(
  app: Hono,
  method: 'GET' | 'POST' | 'DELETE' | 'PUT' | 'PATCH',
  path: string,
  options?: {
    body?: unknown;
    headers?: Record<string, string>;
  }
) {
  const req = new Request(`http://localhost${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
    body: options?.body ? JSON.stringify(options.body) : undefined,
  });

  return app.fetch(req);
}
