import { getFunctions, httpsCallable } from "firebase/functions";
import { getApp } from "firebase/app";

const functions = getFunctions(getApp());

export const submitScan = async (
  wasteType: string,
  confidence: number
) => {
  const createScan = httpsCallable(functions, "createScan");
  const result = await createScan({ wasteType, confidence });
  return result.data;
};
