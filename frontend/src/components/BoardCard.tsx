import type { Board } from '@kebab/shared';

interface BoardCardProps {
  board: Board;
}

function BoardCard({ board }: BoardCardProps) {
  return (
    <div className="bg-white rounded-lg shadow p-6 hover:shadow-md transition-shadow">
      <h3 className="text-lg font-semibold text-gray-900">{board.title}</h3>
      <p className="text-sm text-gray-500 mt-2">
        Created {new Date(board.createdAt).toLocaleDateString()}
      </p>
    </div>
  );
}

export default BoardCard;
