import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import type { BoardWithDetails } from '@kebab/shared';
import Column from '../components/Column';

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:4000';

function BoardPage() {
  const { id } = useParams<{ id: string }>();

  const [board, setBoard] = useState<BoardWithDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;

    const fetchBoard = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch(`${API_URL}/api/boards/${id}`);

        if (response.status === 404) {
          setError('Board not found.');
          return;
        }

        if (!response.ok) {
          setError('Failed to load board. Please try again.');
          return;
        }

        const data = (await response.json()) as BoardWithDetails;
        setBoard(data);
      } catch {
        setError('Network error. Please check your connection.');
      } finally {
        setIsLoading(false);
      }
    };

    void fetchBoard();
  }, [id]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <p className="text-gray-500">Loading board…</p>
      </div>
    );
  }

  if (error || !board) {
    return (
      <div className="min-h-screen bg-gray-100 p-8">
        <Link to="/" className="text-blue-600 hover:underline text-sm">
          ← Back to workspace
        </Link>
        <div className="mt-6 text-center">
          <p className="text-red-600 font-medium">{error ?? 'Board not found.'}</p>
          <Link to="/" className="mt-4 inline-block text-sm text-blue-600 hover:underline">
            Go back to workspace
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Top bar */}
      <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center gap-4">
        <Link
          to="/"
          className="text-gray-500 hover:text-gray-900 transition-colors"
          aria-label="Back to workspace"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="w-5 h-5"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18"
            />
          </svg>
        </Link>
        <h1 className="text-xl font-semibold text-gray-900">{board.title}</h1>
      </header>

      {/* Columns */}
      <main className="p-6 overflow-x-auto">
        {board.columns.length === 0 ? (
          <div className="flex items-center justify-center h-64">
            <p className="text-gray-400">No columns yet. They'll appear here once added.</p>
          </div>
        ) : (
          <div className="flex gap-4 items-start w-max">
            {board.columns.map((column) => (
              <Column key={column.id} column={column} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

export default BoardPage;
