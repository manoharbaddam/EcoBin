import { onRequest } from "firebase-functions/v2/https";
import * as admin from "firebase-admin";

const db = admin.firestore();

// Badge definitions for seeding
const BADGES = [
  {
    id: "first_scan",
    name: "First Scan",
    description: "Complete your first waste scan",
    iconUrl: "",
    type: "scans",
    thresholdValue: 1,
  },
  {
    id: "eco_starter",
    name: "Eco Starter",
    description: "Earn 100 points",
    iconUrl: "",
    type: "points",
    thresholdValue: 100,
  },
  {
    id: "green_warrior",
    name: "Green Warrior",
    description: "Earn 500 points",
    iconUrl: "",
    type: "points",
    thresholdValue: 500,
  },
  {
    id: "recycling_champion",
    name: "Recycling Champion",
    description: "Earn 1000 points",
    iconUrl: "",
    type: "points",
    thresholdValue: 1000,
  },
  {
    id: "quiz_master",
    name: "Quiz Master",
    description: "Answer 10 quiz questions correctly",
    iconUrl: "",
    type: "quiz",
    thresholdValue: 10,
  },
  {
    id: "problem_reporter",
    name: "Problem Reporter",
    description: "Submit 5 waste reports",
    iconUrl: "",
    type: "reports",
    thresholdValue: 5,
  },
];

// 30 quiz questions covering all 5 categories
const QUIZ_QUESTIONS = [
  // RECYCLABLE (easy)
  { questionText: "Which of the following can be recycled at home?", options: ["Cardboard box", "Pizza box with grease", "Styrofoam cup", "Dirty napkin"], correctAnswer: 0, category: "recyclable", difficulty: "easy", explanation: "Clean cardboard boxes are highly recyclable and accepted by most curbside programs." },
  { questionText: "What does the chasing arrows recycling symbol mean?", options: ["Item is compostable", "Item may be recyclable", "Item is biodegradable", "Item must be washed first"], correctAnswer: 1, category: "recyclable", difficulty: "easy", explanation: "The Möbius loop indicates an item may be recyclable, but local rules vary." },
  { questionText: "Glass bottles are recyclable how many times?", options: ["Once", "5 times", "10 times", "Endlessly"], correctAnswer: 3, category: "recyclable", difficulty: "easy", explanation: "Glass can be recycled endlessly without any loss in quality or purity." },
  { questionText: "How much energy is saved by recycling one aluminum can?", options: ["10%", "50%", "75%", "95%"], correctAnswer: 3, category: "recyclable", difficulty: "easy", explanation: "Recycling aluminum saves 95% of the energy needed to make it from raw ore." },
  { questionText: "Which of these must be rinsed before recycling?", options: ["Newspaper", "Plastic bottles", "Cardboard", "Metal cans only"], correctAnswer: 1, category: "recyclable", difficulty: "easy", explanation: "Food residue contaminates recycling batches; a light rinse is sufficient." },
  { questionText: "Aluminum foil can be recycled if it is:", options: ["Dirty and crumpled", "Clean and balled up", "Left flat in the bin", "Wrapped around food"], correctAnswer: 1, category: "recyclable", difficulty: "medium", explanation: "Clean foil balled up to at least 2 inches gets sorted correctly at facilities." },
  // NON-RECYCLABLE (easy-medium)
  { questionText: "Why can't pizza boxes be fully recycled?", options: ["They are too large", "Grease contaminates paper fibers", "They are made of plastic", "They have too many layers"], correctAnswer: 1, category: "non-recyclable", difficulty: "easy", explanation: "Oil separates paper fibers during the recycling process, ruining the batch." },
  { questionText: "Are plastic grocery bags recyclable in normal bins?", options: ["Yes, always", "No, they jam machinery", "Only thin ones", "Yes, if flattened"], correctAnswer: 1, category: "non-recyclable", difficulty: "easy", explanation: "Plastic bags tangle recycling sorting machinery and must go to special drop-offs." },
  { questionText: "Which of these is NOT compostable?", options: ["Apple core", "Eggshells", "Plastic wrap", "Coffee grounds"], correctAnswer: 2, category: "non-recyclable", difficulty: "easy", explanation: "Plastic wrap is synthetic and does not biodegrade in compost." },
  { questionText: "Can you recycle styrofoam curbside?", options: ["Yes, always", "Rarely—needs special facilities", "Only white styrofoam", "Yes, if it is clean"], correctAnswer: 1, category: "non-recyclable", difficulty: "medium", explanation: "EPS foam is rarely accepted curbside due to low market value and processing difficulty." },
  { questionText: "Are paper coffee cups recyclable?", options: ["Yes, always", "Rarely, due to plastic lining", "Only the lid", "Yes, if the lid is removed"], correctAnswer: 1, category: "non-recyclable", difficulty: "medium", explanation: "Most cups have a polyethylene lining that makes them very difficult to recycle." },
  { questionText: "What is 'wish-cycling'?", options: ["Recycling perfectly every time", "Putting non-recyclables in the bin hoping they'll get recycled", "A new recycling technology", "Reducing waste by 50%"], correctAnswer: 1, category: "non-recyclable", difficulty: "medium", explanation: "Wish-cycling contaminates good recyclables and often sends entire loads to landfill." },
  // HAZARDOUS (medium)
  { questionText: "Which type of lightbulb contains mercury?", options: ["LED", "Incandescent", "CFL (Compact Fluorescent)", "Halogen"], correctAnswer: 2, category: "hazardous", difficulty: "easy", explanation: "CFL bulbs contain mercury and must be taken to hazardous waste collection sites." },
  { questionText: "Where should you dispose of used motor oil?", options: ["Down the drain", "In the trash", "At an auto parts store or recycling center", "In the garden"], correctAnswer: 2, category: "hazardous", difficulty: "easy", explanation: "Motor oil can be re-refined and reused when taken to proper collection points." },
  { questionText: "Why are aerosol cans hazardous if not empty?", options: ["They are too heavy", "They can explode and cause fires", "They contain paper fibers", "They are non-recyclable"], correctAnswer: 1, category: "hazardous", difficulty: "medium", explanation: "Residual pressurized contents can ignite or explode in waste trucks and facilities." },
  { questionText: "Expired medications should be:", options: ["Flushed down the toilet", "Thrown in regular trash", "Taken to a pharmacy drop-off", "Buried in the ground"], correctAnswer: 2, category: "hazardous", difficulty: "medium", explanation: "Many pharmacies accept expired medications to prevent water system contamination." },
  { questionText: "Paint should be disposed of by:", options: ["Pouring it down the drain", "Throwing the full can in the trash", "Taking it to a hazardous waste facility", "Leaving it outside to dry"], correctAnswer: 2, category: "hazardous", difficulty: "medium", explanation: "Paint chemicals can leach into groundwater; proper disposal protects ecosystems." },
  { questionText: "Household cleaning chemicals that are no longer needed should be:", options: ["Mixed together and thrown away", "Poured down the sink", "Taken to a hazardous waste event", "Burned"], correctAnswer: 2, category: "hazardous", difficulty: "hard", explanation: "Mixing chemicals can be dangerous; hazardous waste events ensure safe disposal." },
  // ORGANIC (easy-medium)
  { questionText: "Which bin should coffee grounds go in?", options: ["Recycling", "Compost / Organic", "General waste", "Hazardous waste"], correctAnswer: 1, category: "organic", difficulty: "easy", explanation: "Coffee grounds add nitrogen and improve soil structure in compost." },
  { questionText: "Which of these is compostable?", options: ["Plastic bag", "Aluminum foil", "Banana peel", "Glass jar"], correctAnswer: 2, category: "organic", difficulty: "easy", explanation: "Fruit peels break down quickly and add valuable nutrients to compost." },
  { questionText: "How much of the world's food goes to waste?", options: ["5%", "15%", "33%", "50%"], correctAnswer: 2, category: "organic", difficulty: "medium", explanation: "About one-third of all food produced globally is wasted, contributing to GHG emissions." },
  { questionText: "Eggshells in compost:", options: ["Attract pests", "Add calcium to soil", "Make compost acidic", "Should never be added"], correctAnswer: 1, category: "organic", difficulty: "medium", explanation: "Crushed eggshells slowly release calcium carbonate, which balances compost pH." },
  { questionText: "Newspaper in a compost bin acts as a:", options: ["Pest repellent", "Brown (carbon-rich) material", "Green (nitrogen-rich) material", "Chemical disinfectant"], correctAnswer: 1, category: "organic", difficulty: "medium", explanation: "Shredded paper is a carbon source that balances nitrogen-rich green kitchen waste." },
  { questionText: "Food waste sent to landfill produces:", options: ["Oxygen", "Methane (a greenhouse gas)", "Carbon dioxide only", "Harmless water vapor"], correctAnswer: 1, category: "organic", difficulty: "hard", explanation: "Organic matter decomposing without oxygen (anaerobic) in landfill releases methane, 25× more potent than CO₂." },
  // E-WASTE (medium-hard)
  { questionText: "Which of these is considered e-waste?", options: ["Banana peel", "Old smartphone", "Plastic bottle", "Cardboard box"], correctAnswer: 1, category: "e-waste", difficulty: "easy", explanation: "Smartphones contain valuable metals and toxic materials requiring special recycling." },
  { questionText: "Old batteries should be:", options: ["Thrown in the trash", "Buried in soil", "Taken to a battery drop-off or e-waste center", "Left in devices"], correctAnswer: 2, category: "e-waste", difficulty: "easy", explanation: "Batteries contain heavy metals like lead and cadmium that contaminate soil and water." },
  { questionText: "Why is e-waste hazardous?", options: ["It is too heavy to collect", "It contains toxic metals like lead and mercury", "It produces loud noises", "It is only hazardous when wet"], correctAnswer: 1, category: "e-waste", difficulty: "medium", explanation: "E-waste often contains lead, mercury, cadmium and brominated flame retardants." },
  { questionText: "Where can you responsibly recycle old laptops?", options: ["Regular recycling bin", "Manufacturer take-back programs or certified e-recyclers", "Park bins", "Any charity shop"], correctAnswer: 1, category: "e-waste", difficulty: "medium", explanation: "Manufacturer take-back and certified e-recycling ensures proper extraction of valuable materials." },
  { questionText: "Printer cartridges should be:", options: ["Thrown away when empty", "Refilled or returned to manufacturer for recycling", "Composted", "Rinsed and put in recycling"], correctAnswer: 1, category: "e-waste", difficulty: "medium", explanation: "Many manufacturers have take-back programs; cartridges can be refilled multiple times." },
  { questionText: "The most responsible way to dispose of an old TV is:", options: ["Leave it on the curb", "Smash it and put in general waste", "Take it to a certified e-waste recycler", "Donate only if it works"], correctAnswer: 2, category: "e-waste", difficulty: "hard", explanation: "CRT TVs contain lead glass; certified recyclers safely extract hazardous materials." },
];

// ─────────────────────────────────────────────
// seedData — HTTP (one-time setup)
// ─────────────────────────────────────────────
export const seedData = onRequest(async (req, res) => {
  const { secret, adminUid } = req.query as {
    secret?: string;
    adminUid?: string;
  };

  const expectedSecret = process.env.SEED_SECRET;
  if (!expectedSecret || secret !== expectedSecret) {
    res.status(403).json({ success: false, error: "Invalid seed secret" });
    return;
  }

  try {
    const batch = db.batch();

    // 1. Seed badges
    for (const badge of BADGES) {
      const ref = db.collection("badges").doc(badge.id);
      batch.set(ref, badge);
    }

    // 2. Seed quiz questions
    const questionsRef = db.collection("quizQuestions");
    for (let i = 0; i < QUIZ_QUESTIONS.length; i++) {
      const ref = questionsRef.doc(`q_${String(i).padStart(2, "0")}`);
      batch.set(ref, {
        ...QUIZ_QUESTIONS[i],
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      });
    }

    await batch.commit();

    // 3. Optionally set admin custom claim
    if (adminUid) {
      await admin.auth().setCustomUserClaims(adminUid as string, { admin: true });
    }

    res.json({
      success: true,
      data: {
        badgesSeeded: BADGES.length,
        questionsSeeded: QUIZ_QUESTIONS.length,
        adminUidGranted: adminUid || null,
      },
      message: "Seed complete",
    });
  } catch (err: unknown) {
    console.error("Seed error:", err);
    res.status(500).json({ success: false, error: String(err) });
  }
});
