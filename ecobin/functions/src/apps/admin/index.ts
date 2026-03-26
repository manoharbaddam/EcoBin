import { onCall, HttpsError } from "firebase-functions/v2/https";
import * as admin from "firebase-admin";

const db = admin.firestore();

export const sendPushNotification = onCall(async (request) => {
  const auth = request.auth;
  // In a real app we'd verify custom claims here (e.g., auth.token.admin === true)
  if (!auth) {
    throw new HttpsError("unauthenticated", "User must be logged in as admin");
  }

  const { title, body, targetCity } = request.data as { title: string, body: string, targetCity?: string };
  if (!title || !body) {
    throw new HttpsError("invalid-argument", "Title and Body are required");
  }

  try {
    let usersSnapshot;
    if (targetCity && targetCity.trim() !== "") {
      usersSnapshot = await db.collection("users").where("city", "==", targetCity).get();
    } else {
      usersSnapshot = await db.collection("users").get();
    }

    const tokens: string[] = [];
    usersSnapshot.forEach(doc => {
      const data = doc.data();
      if (data.fcmToken) {
        tokens.push(data.fcmToken);
      }
    });

    if (tokens.length === 0) {
      return { success: true, message: "No users with FCM tokens found", count: 0 };
    }

    const message = {
      notification: {
        title,
        body
      },
      tokens
    };

    const response = await admin.messaging().sendEachForMulticast(message);
    
    return {
      success: true,
      successCount: response.successCount,
      failureCount: response.failureCount,
      count: tokens.length
    };
  } catch (error) {
    console.error("Error sending push notification:", error);
    throw new HttpsError("internal", "Failed to send push notification");
  }
});
