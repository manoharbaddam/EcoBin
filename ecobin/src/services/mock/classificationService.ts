import { ClassificationResult, ClassificationSession } from '../../types';
import { WASTE_CATEGORIES } from '../../constants/wasteCategories';

const mockClassify = async (imageUri: string): Promise<ClassificationResult> => {
  await new Promise(resolve => setTimeout(resolve, 1500));

  const randomCategory = WASTE_CATEGORIES[Math.floor(Math.random() * WASTE_CATEGORIES.length)];
  const confidence = 0.75 + Math.random() * 0.2;
  const pointsEarned = Math.floor(Math.random() * 20) + 10;

  return {
    category: randomCategory,
    confidence: Math.min(confidence, 0.99),
    imageUri,
    timestamp: new Date(),
    pointsEarned,
    instructions: randomCategory.binType.instructions,
  };
};

let sessions: ClassificationSession[] = [];

const getHistory = async (): Promise<ClassificationSession[]> => {
  return sessions;
};

const addSession = (result: ClassificationResult): ClassificationSession => {
  const session: ClassificationSession = {
    id: Date.now().toString(),
    userId: 'user1',
    result,
    createdAt: new Date(),
  };
  sessions = [session, ...sessions];
  return session;
};

export const classificationService = {
  classify: mockClassify,
  getHistory,
  addSession,
};
