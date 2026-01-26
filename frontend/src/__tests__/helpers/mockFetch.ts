import { vi } from 'vitest';

/**
 * Mock fetch helper utilities for testing
 */

/**
 * Creates a mock successful fetch response
 */
export function mockFetchSuccess<T>(data: T): Promise<Response> {
  return Promise.resolve({
    ok: true,
    status: 200,
    json: async () => data,
    text: async () => JSON.stringify(data),
    statusText: 'OK',
  } as Response);
}

/**
 * Creates a mock error fetch response
 */
export function mockFetchError(status: number, message: string): Promise<Response> {
  return Promise.resolve({
    ok: false,
    status,
    json: async () => ({ error: message }),
    text: async () => JSON.stringify({ error: message }),
    statusText: message,
  } as Response);
}

/**
 * Creates a mock validation error response (Zod format)
 */
export function mockFetchValidationError(
  errors: Array<{ message: string; path: string[] }>
): Promise<Response> {
  return Promise.resolve({
    ok: false,
    status: 400,
    json: async () => ({ error: errors }),
    text: async () => JSON.stringify({ error: errors }),
    statusText: 'Bad Request',
  } as Response);
}

/**
 * Setup global fetch mock
 */
export function setupFetchMock() {
  globalThis.fetch = vi.fn();
}

/**
 * Reset fetch mock
 */
export function resetFetchMock() {
  if (globalThis.fetch && 'mockReset' in globalThis.fetch) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (globalThis.fetch as any).mockReset();
  }
}
