import { useState, useEffect } from 'react';
import type { Board } from '@kebab/shared';
import BoardCard from '../components/BoardCard';
import CreateBoardDialog from '../components/CreateBoardDialog';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

function WorkspacePage() {
  const [boards, setBoards] = useState<Board[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [deletingBoardId, setDeletingBoardId] = useState<string | null>(null);

  const fetchBoards = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`${API_URL}/api/boards`);

      if (!response.ok) {
        throw new Error(`Failed to fetch boards: ${response.statusText}`);
      }

      const data = await response.json();
      setBoards(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let cancelled = false;

    const loadBoards = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(`${API_URL}/api/boards`);

        if (!response.ok) {
          throw new Error(`Failed to fetch boards: ${response.statusText}`);
        }

        const data = await response.json();

        if (!cancelled) {
          setBoards(data);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'An error occurred');
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    loadBoards();

    return () => {
      cancelled = true;
    };
  }, []);

  const handleCreateBoard = async (title: string) => {
    const response = await fetch(`${API_URL}/api/boards`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ title }),
    });

    if (!response.ok) {
      const errorData = await response.json();

      if (response.status === 400 && errorData.error) {
        // Format Zod validation errors
        const zodErrors = errorData.error;
        if (Array.isArray(zodErrors) && zodErrors.length > 0) {
          throw new Error(zodErrors[0].message);
        }
      }

      throw new Error('Failed to create board');
    }

    // Manual refetch strategy
    await fetchBoards();
  };

  const handleDeleteBoard = async (boardId: string) => {
    setDeletingBoardId(boardId);

    try {
      const response = await fetch(`${API_URL}/api/boards/${boardId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Board not found');
        }
        throw new Error('Failed to delete board');
      }

      // Manual refetch strategy
      await fetchBoards();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete board';
      alert(errorMessage);
    } finally {
      setDeletingBoardId(null);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Your Boards</h1>
          <button
            onClick={() => setIsCreateDialogOpen(true)}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            New Board
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <p className="text-gray-600">Loading boards...</p>
          </div>
        ) : error ? (
          <div className="flex items-center justify-center py-12">
            <p className="text-red-600">Error: {error}</p>
          </div>
        ) : boards.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">No boards found. Create your first board!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {boards.map((board) => (
              <BoardCard
                key={board.id}
                board={board}
                onDelete={handleDeleteBoard}
                isDeleting={deletingBoardId === board.id}
              />
            ))}
          </div>
        )}
      </div>

      <CreateBoardDialog
        isOpen={isCreateDialogOpen}
        onClose={() => setIsCreateDialogOpen(false)}
        onCreate={handleCreateBoard}
      />
    </div>
  );
}

export default WorkspacePage;
