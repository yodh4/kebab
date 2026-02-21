import type { TaskResponse } from '@kebab/shared';

interface TaskCardProps {
  task: TaskResponse;
}

function TaskCard({ task }: TaskCardProps) {
  return (
    <div className="bg-white rounded p-3 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
      <p className="text-sm font-medium text-gray-900">{task.title}</p>
      {task.description && (
        <p className="text-xs text-gray-500 mt-1 line-clamp-2">{task.description}</p>
      )}
    </div>
  );
}

export default TaskCard;
