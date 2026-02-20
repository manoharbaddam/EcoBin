import {onCall, HttpsError} from "firebase-functions/v2/https";
import * as admin from "firebase-admin";

admin.initializeApp();
const db = admin.firestore();

export const createScan = onCall(async (request) => {
  const auth = request.auth;
  const data = request.data as {
    wasteType: string;
    confidence: number;
  };

  if (!auth) {
    throw new HttpsError("unauthenticated", "User must be logged in");
  }

  const {wasteType, confidence} = data;

  if (!wasteType || typeof confidence !== "number") {
    throw new HttpsError("invalid-argument", "Invalid scan data");
  }

  const uid = auth.uid;
  const POINTS_PER_SCAN = 10;

  const userRef = db.collection("users").doc(uid);
  const scansRef = userRef.collection("scans");

  await db.runTransaction(async (tx) => {
    const userSnap = await tx.get(userRef);
    const userData = userSnap.data();

    if (!userData) {
      throw new HttpsError("not-found", "User profile not found");
    }

    const newPoints = (userData.points || 0) + POINTS_PER_SCAN;
    const newTotalScans = (userData.totalScans || 0) + 1;
    const newStreak = (userData.streak || 0) + 1;

    const scanRef = scansRef.doc();

    tx.set(scanRef, {
      wasteType,
      confidence,
      pointsAwarded: POINTS_PER_SCAN,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    tx.update(userRef, {
      points: newPoints,
      totalScans: newTotalScans,
      streak: newStreak,
    });
  });

  return {
    success: true,
    pointsAwarded: POINTS_PER_SCAN,
  };
});
