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
