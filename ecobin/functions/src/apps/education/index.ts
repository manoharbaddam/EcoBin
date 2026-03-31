import { onCall, HttpsError } from "firebase-functions/v2/https";
import * as admin from "firebase-admin";
import { GoogleGenAI } from "@google/genai";

const db = admin.firestore();
let ai: GoogleGenAI;

// Get API key from environment variable (set via functions/.env file)
function getApiKey(): string {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error("GEMINI_API_KEY not set. Add it to functions/.env file.");
    throw new Error("GEMINI_API_KEY environment variable not configured");
  }
  return apiKey;
}

// 30 Quiz Questions for seeding
const QUIZ_QUESTIONS = [
  { question: "Which of the following is considered e-waste?", options: ["Banana peel", "Old smartphone", "Plastic bottle", "Newspaper"], correctIndex: 1, explanation: "Electronic waste includes discarded electronic appliances like smartphones." },
  { question: "How long does it take for a plastic bottle to decompose?", options: ["10 years", "50 years", "450 years", "1000 years"], correctIndex: 2, explanation: "Most plastics take over 400 years to decompose in landfills." },
  { question: "What is the most recycled item in the world?", options: ["Aluminum cans", "Glass bottles", "Plastic bags", "Batteries"], correctIndex: 0, explanation: "Aluminum cans are 100% recyclable and are the most recycled item globally." },
  { question: "Can pizza boxes be recycled?", options: ["Always", "Never", "Only if clean", "Only the greasy parts"], correctIndex: 2, explanation: "Oil and grease contaminate the cardboard, making it unrecyclable unless you rip off the clean parts." },
  { question: "Which bin should you put coffee grounds in?", options: ["Recycling bin", "Compost/Organic bin", "General waste", "Hazardous waste"], correctIndex: 1, explanation: "Coffee grounds are organic and make excellent compost." },
  { question: "Are plastic grocery bags easily recyclable?", options: ["Yes, in normal bins", "No, they need special drop-offs", "Yes, they are paper", "No, they never recycle"], correctIndex: 1, explanation: "Plastic bags jam recycling sorting machines and need to be dropped off at special collection points." },
  { question: "What happens to most of the world's plastic waste?", options: ["It is recycled", "It is composted", "It ends up in landfills or oceans", "It is sent to space"], correctIndex: 2, explanation: "Only about 9% of all plastic ever made has been recycled." },
  { question: "Which type of bulb contains mercury and is hazardous?", options: ["LED", "Incandescent", "CFL (Compact Fluorescent)", "Halogen"], correctIndex: 2, explanation: "CFL bulbs contain trace amounts of mercury and must be disposed of as hazardous waste." },
  { question: "How much energy is saved by recycling one aluminum can?", options: ["Enough to run a TV for 3 hours", "None", "Enough to run a house for a day", "Very little"], correctIndex: 0, explanation: "Recycling aluminum takes 95% less energy than making it from raw materials." },
  { question: "Can you recycle styrofoam (EPS)?", options: ["Always in curbside", "Never", "Rarely, mostly specialized facilities", "Yes, it dissolves"], correctIndex: 2, explanation: "Expanded Polystyrene is highly difficult to recycle and rarely accepted in curbside bins." },
  { question: "Is glass 100% recyclable?", options: ["Yes, endlessly", "No, only once", "Only clear glass", "Only green glass"], correctIndex: 0, explanation: "Glass can be recycled endlessly without loss in quality or purity." },
  { question: "Which of these is NOT compostable?", options: ["Apple core", "Eggshells", "Plastic wrap", "Coffee filters"], correctIndex: 2, explanation: "Plastic wrap is made from synthetic polymers that do not decompose." },
  { question: "What should you do with used batteries?", options: ["Throw in trash", "Recycle in normal bin", "Take to e-waste/battery drop-off", "Burn them"], correctIndex: 2, explanation: "Batteries contain toxic metals and can cause fires in standard waste facilities." },
  { question: "Can receipts be recycled?", options: ["Yes, always", "No, they contain BPA/BPS", "Yes, if long", "No, they are plastic"], correctIndex: 1, explanation: "Most thermal receipts are coated with BPA or BPS, making them unrecyclable and non-compostable." },
  { question: "What is 'Wish-cycling'?", options: ["Recycling perfectly", "Wishing for more bins", "Putting non-recyclables in the recycle bin hoping they get recycled", "A biking sport"], correctIndex: 2, explanation: "Wish-cycling contaminates batches of good recyclables, causing entire loads to be trashed." },
  { question: "Should you rinse recyclables before binning them?", options: ["No need", "Yes, a light rinse", "Yes, wash them with soap perfectly", "Only plastics"], correctIndex: 1, explanation: "A light rinse removes food residue that can contaminate a recycling batch." },
  { question: "Are paper coffee cups recyclable?", options: ["Yes, always", "Rarely, due to plastic lining", "Only the lid", "Never"], correctIndex: 1, explanation: "Most paper cups are lined with plastic to prevent leaks, making them very difficult to recycle." },
  { question: "What material takes the longest to decompose?", options: ["Paper", "Banana peel", "Glass", "Plastic"], correctIndex: 2, explanation: "Glass can take up to 1 million years to decompose in the environment." },
  { question: "Which of these reduces waste the most?", options: ["Recycling", "Reusing", "Reducing consumption", "Composting"], correctIndex: 2, explanation: "Reducing consumption at the source is the most effective way to eliminate waste." },
  { question: "Can bubble wrap be recycled curbside?", options: ["Yes", "No, take to store drop-off", "Sometimes", "Only if popped"], correctIndex: 1, explanation: "Like grocery bags, bubble wrap jams machinery and needs store drop-off." },
  { question: "Where should you throw away old clothes?", options: ["Trash", "Recycle bin", "Donate or textile recycling", "Compost"], correctIndex: 2, explanation: "Textiles should be donated or taken to specific textile recycling centers to prevent landfill waste." },
  { question: "Are aerosol cans recyclable?", options: ["Never", "Only if completely empty", "Always", "Only the cap"], correctIndex: 1, explanation: "Aerosol cans are highly pressurized and can explode. They must be completely empty to be recycled." },
  { question: "What should you do with paint?", options: ["Pour down drain", "Throw in trash", "Take to hazardous waste facility", "Leave outside"], correctIndex: 2, explanation: "Paint contains chemicals that can contaminate groundwater and must be handled as hazardous waste." },
  { question: "Can you recycle greasy paper plates?", options: ["Yes", "No, they are contaminated", "Only in summer", "Yes, if ripped"], correctIndex: 1, explanation: "Food grease ruins paper fibers and cannot be separated during the recycling process." },
  { question: "Is aluminum foil recyclable?", options: ["No", "Yes, if clean and balled up", "Only if flat", "Never"], correctIndex: 1, explanation: "Clean foil can be recycled, usually best if balled up to 2 inches or more so it gets sorted correctly." },
  { question: "What is single-use plastic?", options: ["Plastic used once and thrown away", "Plastic you can only use alone", "Plastic that only comes in singles", "Biodegradable plastic"], correctIndex: 0, explanation: "Items like straws, bags, and water bottles designed to be used once and discarded." },
  { question: "How much of earthly food is wasted?", options: ["10%", "33% (One-third)", "5%", "50%"], correctIndex: 1, explanation: "About one-third of all food produced globally goes to waste." },
  { question: "Are post-it notes recyclable?", options: ["No, the glue ruins it", "Yes, most paper recycling accepts them", "Only the non-sticky part", "Never"], correctIndex: 1, explanation: "Most modern paper recycling facilities can easily handle the mild adhesive on sticky notes." },
  { question: "Can mirrors be recycled with glass bottles?", options: ["Yes", "No, they have chemical coatings", "Only if shattered", "Only small ones"], correctIndex: 1, explanation: "Mirrors have reflective coatings that make them incompatible with standard glass recycling." },
  { question: "Which symbol means an item is recyclable?", options: ["Chasing arrows (Mobius loop)", "A green dot", "A star", "A square"], correctIndex: 0, explanation: "The Mobius loop (three chasing arrows) is the universal symbol for recycling." }
];

export const seedQuestions = onCall(async (request) => {
  const auth = request.auth;
  // If you want to lock this to an admin, you can check custom claims here
  if (!auth) {
    throw new HttpsError("unauthenticated", "Must be logged in to seed.");
  }

  const batch = db.batch();
  const collectionRef = db.collection("quiz_questions");

  QUIZ_QUESTIONS.forEach((q, idx) => {
    // Generate an ID or let Firestore generate it
    const docRef = collectionRef.doc(`q_${idx}`);
    batch.set(docRef, {
      ...q,
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    });
  });

  await batch.commit();

  return { success: true, seededCount: QUIZ_QUESTIONS.length };
});

export const submitQuiz = onCall(async (request) => {
  const auth = request.auth;
  if (!auth) {
    throw new HttpsError("unauthenticated", "User must be logged in");
  }

  const { answers } = request.data as { answers: Record<string, number> }; // { "q_1": 2, "q_2": 0 }
  
  if (!answers || Object.keys(answers).length === 0) {
    throw new HttpsError("invalid-argument", "No answers provided");
  }

  try {
    let correctCount = 0;
    
    // Fetch all questions answered
    const questionIds = Object.keys(answers);
    const questionsSnapshot = await db.collection("quizQuestions").where("__name__", "in", questionIds).get();
    
    questionsSnapshot.docs.forEach(doc => {
      const q = doc.data();
      const userAnswer = answers[doc.id];
      // Backward compatibility with correctIndex just in case
      const expectedAnswer = q.correctAnswer !== undefined ? q.correctAnswer : q.correctIndex;
      if (userAnswer === expectedAnswer) {
        correctCount++;
      }
    });

    const ptsEarned = correctCount * 5;

    const uid = auth.uid;
    const userRef = db.collection("users").doc(uid);

    // Update user points and quiz answers count
    const { checkAndAwardBadges } = await import("../gamification/index.js");

    let newBadges: string[] = [];

    await db.runTransaction(async (tx) => {
      const userSnap = await tx.get(userRef);
      const userData = userSnap.data() || {};

      const newPoints = (userData.points || 0) + ptsEarned;
      const newCorrectAnswers = (userData.correctQuizAnswers || 0) + correctCount;

      newBadges = await checkAndAwardBadges(uid, tx);

      const updateData: any = {
        points: newPoints,
        correctQuizAnswers: newCorrectAnswers
      };

      if (newBadges.length > 0) {
        updateData.badges = admin.firestore.FieldValue.arrayUnion(...newBadges);
      }

      tx.update(userRef, updateData);
    });

    return {
      success: true,
      correctCount,
      totalQuestions: questionIds.length,
      pointsEarned: ptsEarned,
      newBadges
    };

  } catch (error) {
    console.error("Error submitting quiz:", error);
    throw new HttpsError("internal", "Failed to submit quiz");
  }
});

export const askEcoAssistant = onCall(
  async (request) => {
    const auth = request.auth;
    if (!auth) {
      throw new HttpsError("unauthenticated", "User must be logged in");
    }

    const { query } = request.data as { query: string };
    if (!query) {
      throw new HttpsError("invalid-argument", "Query is required");
    }

    if (!ai) {
      const apiKey = getApiKey();
      ai = new GoogleGenAI({ apiKey });
    }

    try {
      const prompt = `You are a helpful Eco Assistant. The user is asking a question about waste or recycling.
      Answer concisely (under 4 sentences) and clearly. Only answer questions related to the environment, waste, and recycling.
      User query: "${query}"`;

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt
      });

      const outputText = response.text || "I'm sorry, I couldn't understand that.";

      return {
        success: true,
        explanation: outputText
      };
    } catch (error) {
      console.error("Error asking eco assistant:", error);
      throw new HttpsError("internal", "Failed to get explanation");
    }
  });
