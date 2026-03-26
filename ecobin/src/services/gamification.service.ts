import { getFunctions, httpsCallable } from "firebase/functions";
import { getApp } from "firebase/app";

const functions = getFunctions(getApp());

export const fetchLeaderboard = async (city: string) => {
  const getLeaderboard = httpsCallable(functions, "getLeaderboard");
  const result = await getLeaderboard({ city });
  return result.data as any; // { success, leaderboard, currentUser }
};
