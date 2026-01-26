import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import CreateBoardDialog from '../../components/CreateBoardDialog';

describe('CreateBoardDialog', () => {
  const mockOnClose = vi.fn();
  const mockOnCreate = vi.fn();

  beforeEach(() => {
    mockOnClose.mockClear();
    mockOnCreate.mockClear();
  });

  it('should not render dialog content when isOpen is false', () => {
    render(<CreateBoardDialog isOpen={false} onClose={mockOnClose} onCreate={mockOnCreate} />);

    // When closed, dialog element exists but is not open (open attribute is false)
    const dialog = screen.getByRole('dialog', { hidden: true });
    expect(dialog).not.toHaveAttribute('open');
  });

  it('should render dialog when isOpen is true', async () => {
    render(<CreateBoardDialog isOpen={true} onClose={mockOnClose} onCreate={mockOnCreate} />);

    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeVisible();
    });

    expect(screen.getByText('Create New Board')).toBeInTheDocument();
    expect(screen.getByLabelText(/board title/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /create board/i })).toBeInTheDocument();
  });

  it('should call onCreate with title when form is submitted', async () => {
    const user = userEvent.setup();
    mockOnCreate.mockResolvedValue(undefined);

    render(<CreateBoardDialog isOpen={true} onClose={mockOnClose} onCreate={mockOnCreate} />);

    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeVisible();
    });

    const input = screen.getByLabelText(/board title/i);
    await user.type(input, 'My New Board');

    const submitButton = screen.getByRole('button', { name: /create board/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(mockOnCreate).toHaveBeenCalledWith('My New Board');
    });
  });

  it('should call onClose after successful creation', async () => {
    const user = userEvent.setup();
    mockOnCreate.mockResolvedValue(undefined);

    render(<CreateBoardDialog isOpen={true} onClose={mockOnClose} onCreate={mockOnCreate} />);

    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeVisible();
    });

    const input = screen.getByLabelText(/board title/i);
    await user.type(input, 'Test Board');

    const submitButton = screen.getByRole('button', { name: /create board/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(mockOnClose).toHaveBeenCalled();
    });
  });

  it('should display error message when creation fails', async () => {
    const user = userEvent.setup();
    mockOnCreate.mockRejectedValue(new Error('Board title is required'));

    render(<CreateBoardDialog isOpen={true} onClose={mockOnClose} onCreate={mockOnCreate} />);

    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeVisible();
    });

    const input = screen.getByLabelText(/board title/i);
    await user.type(input, 'Test');

    const submitButton = screen.getByRole('button', { name: /create board/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent('Board title is required');
    });

    // Should NOT close dialog on error
    expect(mockOnClose).not.toHaveBeenCalled();
  });

  it('should clear form when dialog is closed', async () => {
    const user = userEvent.setup();

    const { rerender } = render(
      <CreateBoardDialog isOpen={true} onClose={mockOnClose} onCreate={mockOnCreate} />
    );

    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeVisible();
    });

    // Type something in the input
    const input = screen.getByLabelText(/board title/i);
    await user.type(input, 'Some Text');

    expect(input).toHaveValue('Some Text');

    // Close the dialog
    const cancelButton = screen.getByRole('button', { name: /cancel/i });
    await user.click(cancelButton);

    expect(mockOnClose).toHaveBeenCalled();

    // Reopen dialog
    rerender(<CreateBoardDialog isOpen={false} onClose={mockOnClose} onCreate={mockOnCreate} />);
    rerender(<CreateBoardDialog isOpen={true} onClose={mockOnClose} onCreate={mockOnCreate} />);

    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeVisible();
    });

    // Input should be cleared
    const inputAfterReopen = screen.getByLabelText(/board title/i);
    expect(inputAfterReopen).toHaveValue('');
  });

  it('should disable form inputs while loading', async () => {
    const user = userEvent.setup();
    // Make onCreate wait indefinitely so we can check loading state
    mockOnCreate.mockImplementation(() => new Promise(() => {}));

    render(<CreateBoardDialog isOpen={true} onClose={mockOnClose} onCreate={mockOnCreate} />);

    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeVisible();
    });

    const input = screen.getByLabelText(/board title/i);
    await user.type(input, 'Test');

    const submitButton = screen.getByRole('button', { name: /create board/i });
    await user.click(submitButton);

    // Check loading state
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /creating/i })).toBeInTheDocument();
    });

    expect(screen.getByLabelText(/board title/i)).toBeDisabled();
    expect(screen.getByRole('button', { name: /cancel/i })).toBeDisabled();
    expect(screen.getByRole('button', { name: /creating/i })).toBeDisabled();
  });

  it('should clear error when form is resubmitted', async () => {
    const user = userEvent.setup();
    // First submission fails
    mockOnCreate.mockRejectedValueOnce(new Error('Network error'));
    // Second submission succeeds
    mockOnCreate.mockResolvedValueOnce(undefined);

    render(<CreateBoardDialog isOpen={true} onClose={mockOnClose} onCreate={mockOnCreate} />);

    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeVisible();
    });

    const input = screen.getByLabelText(/board title/i);
    await user.type(input, 'Test');

    const submitButton = screen.getByRole('button', { name: /create board/i });
    await user.click(submitButton);

    // Error should appear
    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent('Network error');
    });

    // Submit again
    await user.click(submitButton);

    // Error should be cleared before the second attempt
    await waitFor(() => {
      expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    });
  });
});
