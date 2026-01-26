import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import BoardCard from '../../components/BoardCard';
import { mockBoard1 } from '../helpers/fixtures';

describe('BoardCard', () => {
  it('should render board title and creation date', () => {
    const mockOnDelete = vi.fn();

    render(<BoardCard board={mockBoard1} onDelete={mockOnDelete} />);

    expect(screen.getByText(mockBoard1.title)).toBeInTheDocument();
    expect(screen.getByText(/Created/i)).toBeInTheDocument();
    // Check that the date is formatted (e.g., "1/15/2026" format)
    const formattedDate = new Date(mockBoard1.createdAt).toLocaleDateString();
    expect(screen.getByText(`Created ${formattedDate}`)).toBeInTheDocument();
  });

  it('should show delete button with accessibility label', () => {
    const mockOnDelete = vi.fn();

    render(<BoardCard board={mockBoard1} onDelete={mockOnDelete} />);

    const deleteButton = screen.getByRole('button', { name: /delete board/i });
    expect(deleteButton).toBeInTheDocument();
  });

  it('should call onDelete when delete is confirmed', async () => {
    const user = userEvent.setup();
    const mockOnDelete = vi.fn().mockResolvedValue(undefined);

    // Mock window.confirm to return true
    const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(true);

    render(<BoardCard board={mockBoard1} onDelete={mockOnDelete} />);

    const deleteButton = screen.getByRole('button', { name: /delete board/i });
    await user.click(deleteButton);

    expect(confirmSpy).toHaveBeenCalledWith(
      `Are you sure you want to delete "${mockBoard1.title}"?`
    );
    expect(mockOnDelete).toHaveBeenCalledWith(mockBoard1.id);

    confirmSpy.mockRestore();
  });

  it('should not call onDelete when delete is cancelled', async () => {
    const user = userEvent.setup();
    const mockOnDelete = vi.fn();

    // Mock window.confirm to return false
    const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(false);

    render(<BoardCard board={mockBoard1} onDelete={mockOnDelete} />);

    const deleteButton = screen.getByRole('button', { name: /delete board/i });
    await user.click(deleteButton);

    expect(confirmSpy).toHaveBeenCalledWith(
      `Are you sure you want to delete "${mockBoard1.title}"?`
    );
    expect(mockOnDelete).not.toHaveBeenCalled();

    confirmSpy.mockRestore();
  });

  it('should show "Deleting..." overlay when isDeleting is true', () => {
    const mockOnDelete = vi.fn();

    render(<BoardCard board={mockBoard1} onDelete={mockOnDelete} isDeleting={true} />);

    expect(screen.getByText('Deleting...')).toBeInTheDocument();
  });

  it('should disable delete button when isDeleting is true', () => {
    const mockOnDelete = vi.fn();

    render(<BoardCard board={mockBoard1} onDelete={mockOnDelete} isDeleting={true} />);

    const deleteButton = screen.getByRole('button', { name: /delete board/i });
    expect(deleteButton).toBeDisabled();
  });
});
