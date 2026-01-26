import type { Board } from '@kebab/shared';

/**
 * Sample board fixtures for testing
 */
export const mockBoard1: Board = {
  id: '550e8400-e29b-41d4-a716-446655440001',
  title: 'Test Board 1',
  createdAt: new Date('2024-01-01T00:00:00Z'),
  updatedAt: new Date('2024-01-01T00:00:00Z'),
};

export const mockBoard2: Board = {
  id: '550e8400-e29b-41d4-a716-446655440002',
  title: 'Test Board 2',
  createdAt: new Date('2024-01-02T00:00:00Z'),
  updatedAt: new Date('2024-01-02T00:00:00Z'),
};

export const mockBoard3: Board = {
  id: '550e8400-e29b-41d4-a716-446655440003',
  title: 'Test Board 3',
  createdAt: new Date('2024-01-03T00:00:00Z'),
  updatedAt: new Date('2024-01-03T00:00:00Z'),
};

export const mockBoards: Board[] = [mockBoard1, mockBoard2, mockBoard3];

/**
 * Create a mock board with custom properties
 */
export function createMockBoard(overrides: Partial<Board> = {}): Board {
  return {
    id: '550e8400-e29b-41d4-a716-446655440000',
    title: 'Mock Board',
    createdAt: new Date('2024-01-01T00:00:00Z'),
    updatedAt: new Date('2024-01-01T00:00:00Z'),
    ...overrides,
  };
}
