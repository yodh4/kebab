import { useState, useEffect } from 'react';
import type { Board } from '@kebab/shared';
import BoardCard from '../components/BoardCard';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

function WorkspacePage() {
  const [boards, setBoards] = useState<Board[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const fetchBoards = async () => {
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

    fetchBoards();

    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Loading boards...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600">Error: {error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Your Boards</h1>

        {boards.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">No boards found. Create your first board!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {boards.map((board) => (
              <BoardCard key={board.id} board={board} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default WorkspacePage;
