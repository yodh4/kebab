// Board types
export interface Board {
  id: string;
  title: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateBoardDTO {
  title: string;
}
