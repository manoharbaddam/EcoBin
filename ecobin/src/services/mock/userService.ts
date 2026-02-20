import { User, UserStats, Challenge, Badge } from '../../types';

let mockUser: User = {
  id: 'user1',
  name: 'Eco Warrior',
  email: 'user@ecobin.com',
  points: 450,
  level: 3,
};

let mockStats: UserStats = {
  totalScans: 27,
  totalPoints: 450,
  streak: 5,
  recyclableCount: 12,
  organicCount: 8,
  hazardousCount: 2,
  generalCount: 5,
};

const mockChallenges: Challenge[] = [
  {
    id: '1',
    title: 'First Steps',
    description: 'Complete your first 5 scans',
    progress: 5,
    target: 5,
    reward: 50,
    status: 'completed',
    icon: '🎯',
  },
  {
    id: '2',
    title: 'Recycling Champion',
    description: 'Scan 20 recyclable items',
    progress: 12,
    target: 20,
    reward: 100,
    status: 'active',
    icon: '♻️',
  },
  {
    id: '3',
    title: 'Week Streak',
    description: 'Scan items for 7 days in a row',
    progress: 5,
    target: 7,
    reward: 75,
    status: 'active',
    icon: '🔥',
  },
];

const mockBadges: Badge[] = [
  {
    id: '1',
    name: 'Eco Starter',
    description: 'Completed your first scan',
    icon: '🌱',
    unlockedAt: new Date('2024-01-15'),
  },
  {
    id: '2',
    name: 'Recycling Pro',
    description: 'Scanned 10 recyclable items',
    icon: '♻️',
    unlockedAt: new Date('2024-01-20'),
  },
  {
    id: '3',
    name: 'Eco Champion',
    description: 'Reached 500 points',
    icon: '🏆',
  },
];

const getUser = async (): Promise<User> => {
  return mockUser;
};

const getStats = async (): Promise<UserStats> => {
  return mockStats;
};

const getChallenges = async (): Promise<Challenge[]> => {
  return mockChallenges;
};

const getBadges = async (): Promise<Badge[]> => {
  return mockBadges;
};

const updatePoints = (points: number) => {
  mockUser.points += points;
  mockStats.totalPoints += points;
};

const incrementScans = (category: string) => {
  mockStats.totalScans += 1;
  if (category === 'recyclable') mockStats.recyclableCount += 1;
  if (category === 'organic') mockStats.organicCount += 1;
  if (category === 'hazardous') mockStats.hazardousCount += 1;
  if (category === 'general') mockStats.generalCount += 1;
};

export const userService = {
  getUser,
  getStats,
  getChallenges,
  getBadges,
  updatePoints,
  incrementScans,
};
