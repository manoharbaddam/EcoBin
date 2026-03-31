import { onCall, HttpsError } from "firebase-functions/v2/https";
import * as admin from "firebase-admin";
import { GoogleGenAI } from "@google/genai";

const db = admin.firestore();

// Initialize the GoogleGenAI client
let ai: GoogleGenAI;

// Get API key from environment variable (set via functions/.env or firebase functions:config)
function getApiKey(): string {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error("GEMINI_API_KEY not set. Add it to functions/.env file.");
    throw new Error("GEMINI_API_KEY environment variable not configured");
  }
  return apiKey;
}

export const classifyWaste = onCall(
  async (request) => {
    const auth = request.auth;
    if (!auth) {
      throw new HttpsError("unauthenticated", "User must be logged in to classify waste");
    }

    const { imageBase64, imageUrl } = request.data as { imageBase64: string; imageUrl?: string };
    if (!imageBase64) {
      throw new HttpsError("invalid-argument", "Missing imageBase64 in request");
    }

    // Initialize the AI client with proper error handling
    if (!ai) {
      const apiKey = getApiKey();
      ai = new GoogleGenAI({ apiKey });
    }


    try {
      const prompt = `Analyze this waste/garbage image and classify it. Return ONLY valid JSON (no markdown, no code blocks) with this exact format:
    {
      "category": "recyclable" | "non-recyclable" | "hazardous" | "organic" | "e-waste",
      "subcategory": "specific item like 'plastic bottle' or 'food waste'",
      "is_recyclable": true or false,
      "confidence": number between 0 and 100,
      "explanation": "2-3 sentences explaining the classification",
      "disposal_tips": ["tip 1", "tip 2", "tip 3"],
      "fun_fact": "one interesting environmental fact about this waste type"
    }`;

      // Call Gemini 2.5 Flash API with image
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: [
          {
            role: "user",
            parts: [
              { text: prompt },
              { 
                inlineData: {
                  mimeType: "image/jpeg", 
                  data: imageBase64
                }
              }
            ]
          }
        ]
      });

      const outputText = response.text || "{}";
      console.log("Gemini response:", outputText.substring(0, 200)); // Log first 200 chars for debugging

      let classificationData;
      try {
        classificationData = JSON.parse(outputText);
      } catch (e) {
        console.error("Failed to parse Gemini output as JSON:", outputText);
        throw new HttpsError("internal", "AI returned invalid response. Please try again.");
      }

      // Validate response structure
      if (!classificationData.category) {
        throw new HttpsError("internal", "Invalid classification response - missing category");
      }

      const { category, subcategory, is_recyclable, confidence, explanation, disposal_tips, fun_fact } = classificationData;

      // Calculate Points based on correct classification
      let pointsAwarded = 10;
      if (category === "recyclable") pointsAwarded = 20;
      else if (category === "hazardous" || category === "e-waste") pointsAwarded = 30;
      else if (category === "organic") pointsAwarded = 20;

      const uid = auth.uid;
      const userRef = db.collection("users").doc(uid);
      const scansRef = userRef.collection("scans");

      // Dynamic Import of Gamification module
      const { checkAndAwardBadges } = await import("../gamification/index.js");

      let newBadges: string[] = [];

      await db.runTransaction(async (tx) => {
        newBadges = await checkAndAwardBadges(uid, tx);
      
        const userSnap = await tx.get(userRef);
        const userData = userSnap.data() || {};
      
        const newPoints = (userData.points || 0) + pointsAwarded;
        const newTotalScans = (userData.totalScans || 0) + 1;
        const newStreak = (userData.streak || 0) + 1;

        const scanRef = scansRef.doc();

        tx.set(scanRef, {
          wasteType: category,
          subcategory: subcategory || "",
          confidence: Math.min(confidence || 0, 100),
          isRecyclable: is_recyclable || false,
          explanation: explanation || "",
          disposalTips: Array.isArray(disposal_tips) ? disposal_tips : [],
          funFact: fun_fact || "",
          pointsAwarded,
          imageUrl: imageUrl || "",
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
        });

        const updateData: any = {
          points: newPoints,
          totalScans: newTotalScans,
          streak: newStreak,
          lastScanAt: admin.firestore.FieldValue.serverTimestamp(),
        };

        if (newBadges.length > 0) {
          updateData.badges = admin.firestore.FieldValue.arrayUnion(...newBadges);
        }

        tx.update(userRef, updateData);
      });

      // Cleanup older scans to keep only latest 5
      try {
        const oldScansQuery = await scansRef.orderBy("createdAt", "desc").offset(5).get();
        if (!oldScansQuery.empty) {
          const batch = db.batch();
          oldScansQuery.docs.forEach((doc) => {
            batch.delete(doc.ref);
          });
          await batch.commit();
        }
      } catch (cleanupErr) {
        console.error("Failed to cleanup old scans:", cleanupErr);
      }

      return {
        success: true,
        data: classificationData,
        pointsAwarded,
        newBadges
      };

    } catch (error: any) {
      console.error("Error during classifyWaste:", error.message || error);
    
      // Provide specific error messages
      if (error instanceof HttpsError) {
        throw error;
      }
    
      if (error.message?.includes("API key") || error.message?.includes("authentication")) {
        console.error("API Key Error - ensure GEMINI_API_KEY is set via Firebase Secrets");
        throw new HttpsError("internal", "Classification service temporarily unavailable. Please try again later.");
      }
    
      if (error.message?.includes("rate limit")) {
        throw new HttpsError("resource-exhausted", "Too many requests. Please wait a moment and try again.");
      }

      throw new HttpsError("internal", `Failed to classify image: ${error.message || "Unknown error"}`);
    }
  });

