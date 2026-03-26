import * as functionsV1 from "firebase-functions/v1";
import { onCall, HttpsError } from "firebase-functions/v2/https";
import * as admin from "firebase-admin";

const db = admin.firestore();

// ─────────────────────────────────────────────
// onUserCreate — Auto-create Firestore user doc
// Uses firebase-functions v1 syntax (auth triggers not in v2)
// ─────────────────────────────────────────────
export const onUserCreate = functionsV1.auth.user().onCreate(async (user) => {
  const userRef = db.collection("users").doc(user.uid);
  const snap = await userRef.get();

  if (snap.exists) return; // already created

  await userRef.set({
    uid: user.uid,
    email: user.email || "",
    displayName: user.displayName || "",
    avatarUrl: user.photoURL || "",
    city: user.email ? "" : "Guest", // anonymous users default to Guest
    totalPoints: 0,
    totalScans: 0,
    correctQuizAnswers: 0,
    reportsSubmitted: 0,
    badges: [],
    isAnonymous: !user.email,
    fcmToken: "",
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  });

  console.log(`Created user doc for uid=${user.uid}`);
});

// ─────────────────────────────────────────────
// syncUserProfile — callable
// ─────────────────────────────────────────────
export const syncUserProfile = onCall(async (request) => {
  const auth = request.auth;
  if (!auth) throw new HttpsError("unauthenticated", "Login required");

  const { city, fcmToken, displayName } = request.data as {
    city?: string;
    fcmToken?: string;
    displayName?: string;
  };

  const update: Record<string, unknown> = {
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  };
  if (city !== undefined) update.city = city;
  if (fcmToken !== undefined) update.fcmToken = fcmToken;
  if (displayName !== undefined) update.displayName = displayName;

  await db.collection("users").doc(auth.uid).set(update, { merge: true });

  return { success: true, data: {}, message: "Profile synced" };
});
