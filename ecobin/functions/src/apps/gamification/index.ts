import { onCall, HttpsError } from "firebase-functions/v2/https";
import * as admin from "firebase-admin";

const db = admin.firestore();

// ─────────────────────────────────────────────
// Internal: Check & Award Badges
// ─────────────────────────────────────────────
export const checkAndAwardBadges = async (
  uid: string,
  tx: admin.firestore.Transaction
): Promise<string[]> => {
  const userRef = db.collection("users").doc(uid);
  const userSnap = await tx.get(userRef);
  const userData = userSnap.data();

  if (!userData) return [];

  const points = userData.points || 0;
  const totalScans = userData.totalScans || 0;
  const quizAnswers = userData.correctQuizAnswers || 0;
  const reportsSub = userData.reportsSubmitted || 0;
  const earnedBadges = userData.badges || [];

  const newBadges: string[] = [];

  const awardBadge = (badgeId: string) => {
    if (!earnedBadges.includes(badgeId)) {
      newBadges.push(badgeId);
    }
  };

  // Seed badges:
  // - "First Scan" → 1 scan
  // - "Eco Starter" → 100 points
  // - "Green Warrior" → 500 points
  // - "Recycling Champion" → 1000 points
  // - "Quiz Master" → 10 correct quiz answers
  // - "Problem Reporter" → 5 waste reports submitted

  if (totalScans >= 1) awardBadge("first_scan");
  if (points >= 100) awardBadge("eco_starter");
  if (points >= 500) awardBadge("green_warrior");
  if (points >= 1000) awardBadge("recycling_champion");
  if (quizAnswers >= 10) awardBadge("quiz_master");
  if (reportsSub >= 5) awardBadge("problem_reporter");

  return newBadges;
};

// ─────────────────────────────────────────────
// getLeaderboard
// ─────────────────────────────────────────────
export const getLeaderboard = onCall(async (request) => {
  const auth = request.auth;
  if (!auth) throw new HttpsError("unauthenticated", "Login required");

  const { city } = request.data as { city?: string };
  if (!city) throw new HttpsError("invalid-argument", "City is required");

  try {
    const usersRef = db.collection("users");
    const snapshot = await usersRef
      .where("city", "==", city)
      .orderBy("totalPoints", "desc")
      .limit(50)
      .get();

    const leaderboard = snapshot.docs.map((doc, index) => ({
      id: doc.id,
      rank: index + 1,
      displayName:
        doc.data().displayName ||
        doc.data().username ||
        doc.data().name ||
        "EcoBin User",
      totalPoints: doc.data().totalPoints || doc.data().points || 0,
    }));

    let currentUserData: typeof leaderboard[0] | null = null;
    const userRankIndex = leaderboard.findIndex((u) => u.id === auth.uid);

    if (userRankIndex !== -1) {
      currentUserData = leaderboard[userRankIndex];
    } else {
      const userDoc = await db.collection("users").doc(auth.uid).get();
      if (userDoc.exists && userDoc.data()?.city === city) {
        const higherCount = await usersRef
          .where("city", "==", city)
          .where("totalPoints", ">", userDoc.data()?.totalPoints || 0)
          .count()
          .get();
        currentUserData = {
          id: auth.uid,
          rank: higherCount.data().count + 1,
          displayName:
            userDoc.data()?.displayName || userDoc.data()?.username || "EcoBin User",
          totalPoints: userDoc.data()?.totalPoints || userDoc.data()?.points || 0,
        };
      }
    }

    return {
      success: true,
      data: { leaderboard, currentUser: currentUserData },
      message: "Leaderboard fetched",
    };
  } catch (error) {
    console.error("Error fetching leaderboard:", error);
    throw new HttpsError("internal", "Failed to get leaderboard");
  }
});

// ─────────────────────────────────────────────
// getGamificationProfile
// ─────────────────────────────────────────────
export const getGamificationProfile = onCall(async (request) => {
  const auth = request.auth;
  if (!auth) throw new HttpsError("unauthenticated", "Login required");

  const uid = auth.uid;
  const userSnap = await db.collection("users").doc(uid).get();
  if (!userSnap.exists) throw new HttpsError("not-found", "User not found");

  const userData = userSnap.data()!;

  return {
    success: true,
    data: {
      uid,
      totalPoints: userData.totalPoints || userData.points || 0,
      totalScans: userData.totalScans || 0,
      badges: userData.badges || [],
      city: userData.city || "",
      displayName: userData.displayName || userData.username || "",
    },
    message: "Profile fetched",
  };
});

// ─────────────────────────────────────────────
// getAllBadges
// ─────────────────────────────────────────────
export const getAllBadges = onCall(async (request) => {
  if (!request.auth) throw new HttpsError("unauthenticated", "Login required");

  const snap = await db.collection("badges").get();
  const badges = snap.docs.map((d) => ({ id: d.id, ...d.data() }));

  return { success: true, data: badges, message: "Badges fetched" };
});
