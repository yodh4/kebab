import type { Board } from '@kebab/shared';

interface BoardCardProps {
  board: Board;
  onDelete: (boardId: string) => Promise<void>;
  isDeleting?: boolean;
}

function BoardCard({ board, onDelete, isDeleting }: BoardCardProps) {
  const handleDelete = async () => {
    const confirmed = window.confirm(`Are you sure you want to delete "${board.title}"?`);

    if (confirmed) {
      await onDelete(board.id);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6 hover:shadow-md transition-shadow relative group">
      <button
        onClick={handleDelete}
        disabled={isDeleting}
        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity p-1 text-gray-400 hover:text-red-600 disabled:opacity-50 disabled:cursor-not-allowed"
        aria-label="Delete board"
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
            d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0"
          />
        </svg>
      </button>

      <h3 className="text-lg font-semibold text-gray-900">{board.title}</h3>
      <p className="text-sm text-gray-500 mt-2">
        Created {new Date(board.createdAt).toLocaleDateString()}
      </p>

      {isDeleting && (
        <div className="absolute inset-0 bg-white bg-opacity-75 rounded-lg flex items-center justify-center">
          <p className="text-sm text-gray-600">Deleting...</p>
        </div>
      )}
    </div>
  );
}

export default BoardCard;
