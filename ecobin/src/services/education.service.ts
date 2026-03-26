import { httpsCallable } from "firebase/functions";
import { db, functions } from "./firebase";
import { collection, getDocs, query, limit } from "firebase/firestore";

export const fetchQuizQuestions = async () => {
  // Query the correct 'quizQuestions' collection
  const q = query(collection(db, "quizQuestions"), limit(10));
  const snapshot = await getDocs(q);
  
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

export const submitQuizAnswers = async (answers: Record<string, number>) => {
  const submitQuiz = httpsCallable(functions, "submitQuiz");
  const result = await submitQuiz({ answers });
  return result.data as any; // { success, correctCount, totalQuestions, pointsEarned, newBadges }
};

export const askEcoAssistant = async (query: string) => {
  const askEcoAssistantFn = httpsCallable(functions, "askEcoAssistant");
  const result = await askEcoAssistantFn({ query });
  return result.data as any; // { success, explanation }
};
