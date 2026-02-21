import type { ColumnWithTasks } from '@kebab/shared';
import TaskCard from './TaskCard';

interface ColumnProps {
  column: ColumnWithTasks;
}

function Column({ column }: ColumnProps) {
  return (
    <div className="flex-shrink-0 w-72 bg-gray-100 rounded-lg flex flex-col">
      {/* Column header */}
      <div className="px-4 py-3 border-b border-gray-200">
        <h3 className="text-sm font-semibold text-gray-800">{column.title}</h3>
        <span className="text-xs text-gray-500">{column.tasks.length} tasks</span>
      </div>

      {/* Task list */}
      <div className="flex-1 p-3 flex flex-col gap-2 overflow-y-auto max-h-[calc(100vh-240px)]">
        {column.tasks.length === 0 ? (
          <p className="text-xs text-gray-400 text-center py-4">No tasks yet</p>
        ) : (
          column.tasks.map((task) => <TaskCard key={task.id} task={task} />)
        )}
      </div>
    </div>
  );
}

export default Column;
