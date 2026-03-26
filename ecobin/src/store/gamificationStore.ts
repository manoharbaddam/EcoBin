import { create } from 'zustand';
import { Badge, LeaderboardEntry } from '../types';

interface GamificationState {
  totalPoints: number;
  earnedBadgeIds: string[];
  allBadges: Badge[];
  leaderboard: LeaderboardEntry[];
  currentUserRank: LeaderboardEntry | null;
  loading: boolean;
  setProfile: (points: number, badgeIds: string[]) => void;
  setAllBadges: (badges: Badge[]) => void;
  setLeaderboard: (board: LeaderboardEntry[], current: LeaderboardEntry | null) => void;
  setLoading: (loading: boolean) => void;
}

export const useGamificationStore = create<GamificationState>((set) => ({
  totalPoints: 0,
  earnedBadgeIds: [],
  allBadges: [],
  leaderboard: [],
  currentUserRank: null,
  loading: false,
  setProfile: (totalPoints, earnedBadgeIds) => set({ totalPoints, earnedBadgeIds }),
  setAllBadges: (allBadges) => set({ allBadges }),
  setLeaderboard: (leaderboard, currentUserRank) => set({ leaderboard, currentUserRank }),
  setLoading: (loading) => set({ loading }),
}));
