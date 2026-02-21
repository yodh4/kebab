// Board types (domain model - in-memory use)
export interface Board {
  id: string;
  title: string;
  createdAt: Date;
  updatedAt: Date;
}

// API response type (what comes over HTTP as JSON)
export interface BoardResponse {
  id: string;
  title: string;
  createdAt: string; // ISO 8601 string
  updatedAt: string; // ISO 8601 string
}

// Board with columns and tasks nested (used in GET /api/boards/:id response)
export interface BoardWithDetails extends BoardResponse {
  columns: import('./column').ColumnWithTasks[];
}

export interface CreateBoardDTO {
  title: string;
}
