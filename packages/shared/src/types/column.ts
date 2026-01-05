// Column types
export interface Column {
  id: string;
  boardId: string;
  title: string;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateColumnDTO {
  boardId: string;
  title: string;
  order: number;
}
