export type UserProfile = {
  id: string;          // uid (doc id)
  email: string;
  username: string;

  totalPoints: number;
  totalScans: number;
  level: number;
  streakDays: number;

  createdAt: Date;
};
