// Column types
export interface Column {
  id: string;
  boardId: string;
  title: string;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

// API response type (what comes over HTTP as JSON)
export interface ColumnResponse {
  id: string;
  boardId: string;
  title: string;
  order: number;
  createdAt: string; // ISO 8601 string
  updatedAt: string; // ISO 8601 string
}

// Column with its tasks nested (used in GET /api/boards/:id response)
export interface ColumnWithTasks extends ColumnResponse {
  tasks: import('./task').TaskResponse[];
}

export interface CreateColumnDTO {
  boardId: string;
  title: string;
  order: number;
}
