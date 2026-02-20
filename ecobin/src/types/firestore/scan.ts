export type Scan = {
  id: string;

  userId: string;
  categoryId: string;
  categoryName: string;
  confidence: number;
  pointsEarned: number;

  createdAt: Date;
};
