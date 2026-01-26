import { describe, it, expect } from 'vitest';
import { createTestApp, makeRequest } from '../helpers/api';
import { createTestBoards, createTestBoard, sampleBoards } from '../helpers/fixtures';
import { getTestDb } from '../helpers/db';
import { boards } from '../../db/schema';

describe('GET /api/boards', () => {
  const app = createTestApp();

  it('should return empty array when no boards exist', async () => {
    const response = await makeRequest(app, 'GET', '/api/boards');

    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data).toEqual([]);
  });

  it('should return all boards ordered by creation time', async () => {
    // Create test boards
    await createTestBoards([
      { title: 'First Board' },
      { title: 'Second Board' },
      { title: 'Third Board' },
    ]);

    const response = await makeRequest(app, 'GET', '/api/boards');

    expect(response.status).toBe(200);
    const data = (await response.json()) as Array<{
      id: string;
      title: string;
      createdAt: string;
      updatedAt: string;
    }>;

    // Should return all 3 boards
    expect(data).toHaveLength(3);

    // Verify board data structure
    expect(data[0]).toMatchObject({
      id: expect.any(String),
      title: expect.any(String),
      createdAt: expect.any(String),
      updatedAt: expect.any(String),
    });

    // Verify all boards are returned
    const titles = data.map((board) => board.title);
    expect(titles).toContain('First Board');
    expect(titles).toContain('Second Board');
    expect(titles).toContain('Third Board');
  });
});

describe('POST /api/boards', () => {
  const app = createTestApp();

  it('should create board with valid data', async () => {
    const response = await makeRequest(app, 'POST', '/api/boards', {
      body: { title: 'New Test Board' },
    });

    expect(response.status).toBe(201);
    const data = (await response.json()) as {
      id: string;
      title: string;
      createdAt: string;
      updatedAt: string;
    };

    expect(data).toMatchObject({
      id: expect.any(String),
      title: 'New Test Board',
      createdAt: expect.any(String),
      updatedAt: expect.any(String),
    });

    // Verify board was actually created in database
    const db = getTestDb();
    const allBoards = await db.select().from(boards);
    expect(allBoards).toHaveLength(1);
    expect(allBoards[0].title).toBe('New Test Board');
  });

  it('should return 400 when title is missing', async () => {
    const response = await makeRequest(app, 'POST', '/api/boards', {
      body: {},
    });

    expect(response.status).toBe(400);
    const data = (await response.json()) as { error: unknown };
    expect(data.error).toBeDefined();
  });

  it('should return 400 when title is empty string', async () => {
    const response = await makeRequest(app, 'POST', '/api/boards', {
      body: { title: '' },
    });

    expect(response.status).toBe(400);
    const data = (await response.json()) as { error: unknown };
    expect(data.error).toBeDefined();
  });

  it('should return 400 when title exceeds max length', async () => {
    const response = await makeRequest(app, 'POST', '/api/boards', {
      body: { title: sampleBoards.tooLongTitle.title },
    });

    expect(response.status).toBe(400);
    const data = (await response.json()) as { error: unknown };
    expect(data.error).toBeDefined();
  });

  it('should accept title with maximum allowed length', async () => {
    const maxLengthTitle = 'a'.repeat(255); // Exactly 255 characters
    const response = await makeRequest(app, 'POST', '/api/boards', {
      body: { title: maxLengthTitle },
    });

    expect(response.status).toBe(201);
    const data = (await response.json()) as { title: string };
    expect(data.title).toBe(maxLengthTitle);
  });
});

describe('DELETE /api/boards/:id', () => {
  const app = createTestApp();

  it('should delete board by id', async () => {
    // Create a board first
    const board = await createTestBoard({ title: 'Board to Delete' });

    const response = await makeRequest(app, 'DELETE', `/api/boards/${board.id}`);

    expect(response.status).toBe(204);
    expect(await response.text()).toBe('');

    // Verify board was deleted from database
    const db = getTestDb();
    const allBoards = await db.select().from(boards);
    expect(allBoards).toHaveLength(0);
  });

  it('should return 404 when board not found', async () => {
    const nonExistentId = '00000000-0000-0000-0000-000000000000';
    const response = await makeRequest(app, 'DELETE', `/api/boards/${nonExistentId}`);

    expect(response.status).toBe(404);
    const data = (await response.json()) as { error: string };
    expect(data.error).toBe('Board not found');
  });

  it('should return 500 when id is invalid format', async () => {
    const invalidId = 'not-a-valid-uuid';
    const response = await makeRequest(app, 'DELETE', `/api/boards/${invalidId}`);

    // Invalid UUID will cause a database error, which returns 500
    expect(response.status).toBe(500);
    const data = (await response.json()) as { error: unknown };
    expect(data.error).toBeDefined();
  });

  it('should verify board is removed from database', async () => {
    // Create multiple boards
    const [board1, board2, board3] = await createTestBoards([
      { title: 'Board 1' },
      { title: 'Board 2' },
      { title: 'Board 3' },
    ]);

    // Delete the middle board
    await makeRequest(app, 'DELETE', `/api/boards/${board2.id}`);

    // Verify only 2 boards remain
    const db = getTestDb();
    const remainingBoards = await db.select().from(boards);
    expect(remainingBoards).toHaveLength(2);

    // Verify the correct board was deleted
    const remainingIds = remainingBoards.map((b) => b.id);
    expect(remainingIds).toContain(board1.id);
    expect(remainingIds).toContain(board3.id);
    expect(remainingIds).not.toContain(board2.id);
  });
});
