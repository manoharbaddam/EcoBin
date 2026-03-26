import { onCall, onRequest, HttpsError } from "firebase-functions/v2/https";
import * as admin from "firebase-admin";

const db = admin.firestore();

// ─────────────────────────────────────────────
// getUserNotifications
// ─────────────────────────────────────────────
export const getUserNotifications = onCall(async (request) => {
  const auth = request.auth;
  if (!auth) throw new HttpsError("unauthenticated", "Login required");

  const snap = await db
    .collection("notifications")
    .where("userId", "==", auth.uid)
    .orderBy("createdAt", "desc")
    .limit(30)
    .get();

  const notifications = snap.docs.map((d) => ({
    id: d.id,
    ...d.data(),
    createdAt: (d.data().createdAt?.toDate?.() || new Date()).toISOString(),
  }));

  return { success: true, data: notifications, message: "Notifications fetched" };
});

// ─────────────────────────────────────────────
// markNotificationRead
// ─────────────────────────────────────────────
export const markNotificationRead = onCall(async (request) => {
  const auth = request.auth;
  if (!auth) throw new HttpsError("unauthenticated", "Login required");

  const { notificationId } = request.data as { notificationId: string };
  if (!notificationId) {
    throw new HttpsError("invalid-argument", "notificationId is required");
  }

  const notifRef = db.collection("notifications").doc(notificationId);
  const snap = await notifRef.get();
  if (!snap.exists) throw new HttpsError("not-found", "Notification not found");
  if (snap.data()?.userId !== auth.uid) {
    throw new HttpsError("permission-denied", "Not your notification");
  }

  await notifRef.update({ isRead: true });
  return { success: true, data: {}, message: "Marked as read" };
});

// ─────────────────────────────────────────────
// broadcastNotification — admin only (HTTP)
// ─────────────────────────────────────────────
export const broadcastNotification = onRequest(async (req, res) => {
  // Verify admin custom claim
  const authHeader = req.headers.authorization || "";
  const idToken = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : "";

  if (!idToken) {
    res.status(401).json({ success: false, error: "No token provided" });
    return;
  }

  try {
    const decoded = await admin.auth().verifyIdToken(idToken);
    if (!decoded.admin) {
      res.status(403).json({ success: false, error: "Admin access required" });
      return;
    }
  } catch {
    res.status(401).json({ success: false, error: "Invalid token" });
    return;
  }

  const { title, body, targetCity } = req.body as {
    title: string;
    body: string;
    targetCity?: string;
  };

  if (!title || !body) {
    res.status(400).json({ success: false, error: "title and body are required" });
    return;
  }

  // Save notification doc(s)
  const notifRef = db.collection("notifications").doc();
  await notifRef.set({
    userId: null,
    title,
    body,
    type: "alert",
    isRead: false,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
  });

  // Send FCM to relevant users
  let usersSnap;
  if (targetCity) {
    usersSnap = await db.collection("users").where("city", "==", targetCity).get();
  } else {
    usersSnap = await db.collection("users").get();
  }

  const tokens: string[] = [];
  usersSnap.forEach((d) => {
    if (d.data().fcmToken) tokens.push(d.data().fcmToken);
  });

  let successCount = 0;
  let failureCount = 0;
  if (tokens.length > 0) {
    const result = await admin.messaging().sendEachForMulticast({
      tokens,
      notification: { title, body },
      data: { type: "alert" },
    });
    successCount = result.successCount;
    failureCount = result.failureCount;
  }

  res.json({
    success: true,
    data: { successCount, failureCount, tokensTargeted: tokens.length },
    message: "Notification broadcast complete",
  });
});
