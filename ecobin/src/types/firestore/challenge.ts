export type UserChallenge = {
  id: string;
  userId: string;

  title: string;
  description: string;
  progress: number;
  target: number;
  completed: boolean;
  icon: string;
};
