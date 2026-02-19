// Task types
export interface Task {
  id: string;
  columnId: string;
  title: string;
  description: string | null;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

// API response type
export interface TaskResponse {
  id: string;
  columnId: string;
  title: string;
  description: string | null;
  order: number;
  createdAt: string; // ISO 8601 string
  updatedAt: string; // ISO 8601 string
}

export interface CreateTaskDTO {
  columnId: string;
  title: string;
  description?: string;
  order: number;
}

export interface UpdateTaskDTO {
  columnId?: string;
  title?: string;
  description?: string;
  order?: number;
}
