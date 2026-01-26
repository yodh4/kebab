import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import WorkspacePage from '../../pages/WorkspacePage';
import { mockBoards, mockBoard1 } from '../helpers/fixtures';
import {
  setupFetchMock,
  resetFetchMock,
  mockFetchSuccess,
  mockFetchError,
} from '../helpers/mockFetch';

describe('WorkspacePage', () => {
  beforeEach(() => {
    setupFetchMock();
  });

  afterEach(() => {
    resetFetchMock();
  });

  it('should show loading state initially', () => {
    // Don't resolve the fetch yet
    globalThis.fetch = vi.fn(() => new Promise(() => {})) as unknown as typeof fetch;

    render(<WorkspacePage />);

    expect(screen.getByText(/loading boards/i)).toBeInTheDocument();
  });

  it('should render boards after successful fetch', async () => {
    globalThis.fetch = vi.fn(() => mockFetchSuccess(mockBoards)) as unknown as typeof fetch;

    render(<WorkspacePage />);

    // Wait for loading to complete
    await waitFor(() => {
      expect(screen.queryByText(/loading boards/i)).not.toBeInTheDocument();
    });

    // Check that boards are rendered
    expect(screen.getByText(mockBoards[0].title)).toBeInTheDocument();
    expect(screen.getByText(mockBoards[1].title)).toBeInTheDocument();
    expect(screen.getByText(mockBoards[2].title)).toBeInTheDocument();

    // Check for the main heading
    expect(screen.getByText('Your Boards')).toBeInTheDocument();
  });

  it('should show error message when fetch fails', async () => {
    globalThis.fetch = vi.fn(() =>
      mockFetchError(500, 'Internal Server Error')
    ) as unknown as typeof fetch;

    render(<WorkspacePage />);

    await waitFor(() => {
      expect(screen.getByText(/error:/i)).toBeInTheDocument();
    });

    expect(screen.getByText(/failed to fetch boards/i)).toBeInTheDocument();
  });

  it('should show empty state when no boards exist', async () => {
    globalThis.fetch = vi.fn(() => mockFetchSuccess([])) as unknown as typeof fetch;

    render(<WorkspacePage />);

    await waitFor(() => {
      expect(screen.queryByText(/loading boards/i)).not.toBeInTheDocument();
    });

    expect(screen.getByText(/no boards found/i)).toBeInTheDocument();
    expect(screen.getByText(/create your first board/i)).toBeInTheDocument();
  });

  it('should open CreateBoardDialog when "New Board" is clicked', async () => {
    const user = userEvent.setup();
    globalThis.fetch = vi.fn(() => mockFetchSuccess(mockBoards)) as unknown as typeof fetch;

    render(<WorkspacePage />);

    // Wait for boards to load
    await waitFor(() => {
      expect(screen.getByText('Your Boards')).toBeInTheDocument();
    });

    // Dialog should not be visible initially
    const dialog = screen.getByRole('dialog', { hidden: true });
    expect(dialog).not.toHaveAttribute('open');

    // Click "New Board" button
    const newBoardButton = screen.getByRole('button', { name: /new board/i });
    await user.click(newBoardButton);

    // Dialog should now be visible
    await waitFor(() => {
      expect(screen.getByRole('dialog')).toHaveAttribute('open');
    });

    expect(screen.getByText('Create New Board')).toBeInTheDocument();
  });

  it('should refetch boards after creating a new board', async () => {
    const user = userEvent.setup();
    const fetchMock = vi.fn();

    // First fetch returns existing boards
    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: async () => mockBoards,
    });

    // POST request to create board
    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ ...mockBoard1, id: 'new-board-id', title: 'New Test Board' }),
    });

    // Second GET fetch returns boards with new board
    const newBoard = { ...mockBoard1, id: 'new-board-id', title: 'New Test Board' };
    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: async () => [...mockBoards, newBoard],
    });

    globalThis.fetch = fetchMock;

    render(<WorkspacePage />);

    // Wait for initial load
    await waitFor(() => {
      expect(screen.getByText(mockBoards[0].title)).toBeInTheDocument();
    });

    // Open dialog
    const newBoardButton = screen.getByRole('button', { name: /new board/i });
    await user.click(newBoardButton);

    // Fill form and submit
    await waitFor(() => {
      expect(screen.getByRole('dialog')).toHaveAttribute('open');
    });

    const input = screen.getByLabelText(/board title/i);
    await user.type(input, 'New Test Board');

    const createButton = screen.getByRole('button', { name: /create board/i });
    await user.click(createButton);

    // Wait for new board to appear
    await waitFor(() => {
      expect(screen.getByText('New Test Board')).toBeInTheDocument();
    });

    // Verify fetch was called 3 times: initial load, POST create, refetch
    expect(fetchMock).toHaveBeenCalledTimes(3);
  });

  it('should handle board deletion', async () => {
    const user = userEvent.setup();
    const fetchMock = vi.fn();

    // Initial fetch
    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: async () => mockBoards,
    });

    // DELETE request
    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: async () => ({}),
    });

    // Refetch after delete (returns boards minus the deleted one)
    const remainingBoards = mockBoards.filter((b) => b.id !== mockBoard1.id);
    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: async () => remainingBoards,
    });

    globalThis.fetch = fetchMock;

    // Mock window.confirm to return true
    const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(true);

    render(<WorkspacePage />);

    // Wait for boards to load
    await waitFor(() => {
      expect(screen.getByText(mockBoard1.title)).toBeInTheDocument();
    });

    // Click delete button on first board
    const deleteButtons = screen.getAllByRole('button', { name: /delete board/i });
    await user.click(deleteButtons[0]);

    // Confirm deletion
    expect(confirmSpy).toHaveBeenCalled();

    // Wait for board to be removed from UI
    await waitFor(() => {
      expect(screen.queryByText(mockBoard1.title)).not.toBeInTheDocument();
    });

    // Other boards should still be there
    expect(screen.getByText(mockBoards[1].title)).toBeInTheDocument();

    confirmSpy.mockRestore();
  });

  it('should show deleting state for specific board', async () => {
    const user = userEvent.setup();
    const fetchMock = vi.fn();

    // Initial fetch
    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: async () => mockBoards,
    });

    // DELETE request - make it hang so we can check the deleting state
    fetchMock.mockImplementationOnce(() => new Promise(() => {}));

    globalThis.fetch = fetchMock;

    // Mock window.confirm to return true
    const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(true);

    render(<WorkspacePage />);

    // Wait for boards to load
    await waitFor(() => {
      expect(screen.getByText(mockBoard1.title)).toBeInTheDocument();
    });

    // Click delete button on first board
    const deleteButtons = screen.getAllByRole('button', { name: /delete board/i });
    await user.click(deleteButtons[0]);

    // Check that "Deleting..." overlay appears
    await waitFor(() => {
      expect(screen.getByText('Deleting...')).toBeInTheDocument();
    });

    // Verify delete button is disabled
    expect(deleteButtons[0]).toBeDisabled();

    confirmSpy.mockRestore();
  });
});
