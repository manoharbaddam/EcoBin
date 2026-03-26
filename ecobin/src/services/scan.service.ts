import { httpsCallable } from "firebase/functions";
import { functions } from "./firebase";

export const submitScan = async (
  wasteType: string,
  confidence: number
) => {
  const createScan = httpsCallable(functions, "createScan");
  const result = await createScan({ wasteType, confidence });
  return result.data;
};

export const classifyWasteImage = async (imageBase64: string, imageUrl?: string) => {
  const classifyWaste = httpsCallable(functions, "classifyWaste");
  const result = await classifyWaste({ imageBase64, imageUrl });
  return result.data as any; // { success, data, pointsAwarded, newBadges }
};
