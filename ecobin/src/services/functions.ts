import { httpsCallable } from 'firebase/functions';
import { functions } from './firebase';
import {
  GamificationProfile,
  LeaderboardEntry,
  Badge,
  QuizQuestion,
  WasteReport,
  ScanResult,
} from '../types';

// ── Classification ───────────────────────────
export const callClassifyWaste = async (imageBase64: string, imageUrl?: string) => {
  const fn = httpsCallable<
    { imageBase64: string; imageUrl?: string },
    { success: boolean; data: ScanResult; pointsAwarded: number; newBadges: string[] }
  >(functions, 'classifyWaste');
  const res = await fn({ imageBase64, imageUrl });
  return res.data;
};

// ── Gamification ─────────────────────────────
export const callGetGamificationProfile = async () => {
  const fn = httpsCallable<void, { success: boolean; data: GamificationProfile }>(
    functions,
    'getGamificationProfile'
  );
  const res = await fn();
  return res.data;
};

export const callGetLeaderboard = async (city: string) => {
  const fn = httpsCallable<
    { city: string },
    { success: boolean; data: { leaderboard: LeaderboardEntry[]; currentUser: LeaderboardEntry | null } }
  >(functions, 'getLeaderboard');
  const res = await fn({ city });
  return res.data;
};

export const callGetAllBadges = async () => {
  const fn = httpsCallable<void, { success: boolean; data: Badge[] }>(
    functions,
    'getAllBadges'
  );
  const res = await fn();
  return res.data;
};

// ── Education ────────────────────────────────
export const callGetQuizQuestions = async () => {
  // Fetch from Firestore via education service
  const { fetchQuizQuestions } = await import('./education.service');
  return fetchQuizQuestions();
};

export const callSubmitQuizAnswers = async (answers: Record<string, number>) => {
  const fn = httpsCallable<
    { answers: Record<string, number> },
    { success: boolean; correctCount: number; totalQuestions: number; pointsEarned: number; newBadges: string[] }
  >(functions, 'submitQuiz');
  const res = await fn({ answers });
  return res.data;
};

export const callAskEcoAssistant = async (query: string) => {
  const fn = httpsCallable<{ query: string }, { success: boolean; explanation: string }>(
    functions,
    'askEcoAssistant'
  );
  const res = await fn({ query });
  return res.data;
};

// ── Reports ──────────────────────────────────
export const callSubmitWasteReport = async (data: {
  imageBase64?: string;
  imageUrl?: string;
  description: string;
  locationLat?: number;
  locationLng?: number;
  city?: string;
}) => {
  const fn = httpsCallable<typeof data, { success: boolean; data: { reportId: string; imageUrl: string } }>(
    functions,
    'submitWasteReport'
  );
  const res = await fn(data);
  return res.data;
};

export const callGetUserReports = async () => {
  const fn = httpsCallable<void, { success: boolean; data: WasteReport[] }>(
    functions,
    'getUserReports'
  );
  const res = await fn();
  return res.data;
};

// ── Auth ─────────────────────────────────────
export const callSyncUserProfile = async (update: {
  city?: string;
  fcmToken?: string;
  displayName?: string;
}) => {
  const fn = httpsCallable<typeof update, { success: boolean }>(
    functions,
    'syncUserProfile'
  );
  const res = await fn(update);
  return res.data;
};
