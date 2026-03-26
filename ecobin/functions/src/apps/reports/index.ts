import { onCall, HttpsError } from "firebase-functions/v2/https";
import { onDocumentUpdated } from "firebase-functions/v2/firestore";
import * as admin from "firebase-admin";

const db = admin.firestore();
const storage = admin.storage();

// ─────────────────────────────────────────────
// submitWasteReport
// ─────────────────────────────────────────────
export const submitWasteReport = onCall(async (request) => {
  const auth = request.auth;
  if (!auth) throw new HttpsError("unauthenticated", "Login required");

  const {
    imageBase64,
    imageUrl: providedImageUrl,
    description,
    locationLat,
    locationLng,
    city,
  } = request.data as {
    imageBase64?: string;
    imageUrl?: string;
    description: string;
    locationLat?: number;
    locationLng?: number;
    city?: string;
  };

  if (!description) {
    throw new HttpsError("invalid-argument", "Description is required");
  }

  const uid = auth.uid;
  let imageUrl = providedImageUrl || "";

  // Upload image to Firebase Storage if provided and Cloudinary failed
  if (imageBase64 && !imageUrl) {
    try {
      const buffer = Buffer.from(imageBase64, "base64");
      const fileName = `reports/${uid}/${Date.now()}.jpg`;
      const bucket = storage.bucket();
      const file = bucket.file(fileName);

      await file.save(buffer, {
        metadata: { contentType: "image/jpeg" },
      });

      await file.makePublic();
      imageUrl = `https://storage.googleapis.com/${bucket.name}/${fileName}`;
    } catch (err) {
      console.error("Failed to upload report image:", err);
      // Continue without image rather than failing the whole request
    }
  }

  const reportRef = db.collection("wasteReports").doc();

  await reportRef.set({
    userId: uid,
    imageUrl,
    description,
    locationLat: locationLat || 0,
    locationLng: locationLng || 0,
    city: city || "",
    status: "pending",
    adminNotes: "",
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  });

  // Increment reportsSubmitted counter for badge checking
  const userRef = db.collection("users").doc(uid);
  await userRef.update({
    reportsSubmitted: admin.firestore.FieldValue.increment(1),
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  });

  return {
    success: true,
    data: { reportId: reportRef.id, imageUrl },
    message: "Report submitted successfully",
  };
});

// ─────────────────────────────────────────────
// getUserReports
// ─────────────────────────────────────────────
export const getUserReports = onCall(async (request) => {
  const auth = request.auth;
  if (!auth) throw new HttpsError("unauthenticated", "Login required");

  const snap = await db
    .collection("wasteReports")
    .where("userId", "==", auth.uid)
    .orderBy("createdAt", "desc")
    .limit(50)
    .get();

  const reports = snap.docs.map((d) => ({
    id: d.id,
    ...d.data(),
    createdAt: (d.data().createdAt?.toDate?.() || new Date()).toISOString(),
    updatedAt: (d.data().updatedAt?.toDate?.() || new Date()).toISOString(),
  }));

  return { success: true, data: reports, message: "Reports fetched" };
});

// ─────────────────────────────────────────────
// onReportStatusChanged
// ─────────────────────────────────────────────
export const onReportStatusChanged = onDocumentUpdated("wasteReports/{reportId}", async (event) => {
  const oldData = event.data?.before.data();
  const newData = event.data?.after.data();

  if (!oldData || !newData) return;

  // Only trigger if status changed
  if (oldData.status === newData.status) return;

  const userId = newData.userId;
  if (!userId) return;

  // Get user's tokens
  const userSnap = await db.collection("users").doc(userId).get();
  if (!userSnap.exists) return;

  const userData = userSnap.data();
  if (!userData) return;

  const fcmToken = userData.fcmToken;
  const expoPushToken = userData.expoPushToken;
  
  // Either token can be used, but since we are sending via FCM and relying on Expo API or FCM directly:
  const targetToken = fcmToken || expoPushToken;
  if (!targetToken) return;

  const statusName = newData.status.replace("_", " ").toUpperCase();
  const title = "Waste Report Update";
  const body = `Your report status has been updated to: ${statusName}`;

  try {
    if (targetToken.startsWith("ExponentPushToken") || targetToken.startsWith("ExpoPushToken")) {
      // Send via Expo Push API
      await fetch("https://exp.host/--/api/v2/push/send", {
        method: "POST",
        headers: {
          "Accept": "application/json",
          "Accept-encoding": "gzip, deflate",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          to: targetToken,
          sound: "default",
          title: title,
          body: body,
          data: { reportId: event.params.reportId, newStatus: newData.status },
        }),
      });
    } else {
      // Send via FCM directly
      await admin.messaging().send({
        token: targetToken,
        notification: { title, body },
        data: { reportId: event.params.reportId, newStatus: newData.status },
      });
    }
  } catch (e) {
    console.error("Failed to send status update push notification", e);
  }
});
