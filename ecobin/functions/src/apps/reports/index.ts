import { onCall, HttpsError } from "firebase-functions/v2/https";
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
