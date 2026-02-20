export interface User {
  id: string;
  name: string;
  email: string;
  points: number;
  level: number;
  avatar?: string;
}

export interface WasteCategory {
  id: string;
  name: string;
  description: string;
  binType: BinType;
  icon: string;
}

export interface BinType {
  id: string;
  name: string;
  color: string;
  description: string;
  instructions: string[];
}

export interface ClassificationResult {
  category: WasteCategory;
  confidence: number;
  imageUri: string;
  timestamp: Date;
  pointsEarned: number;
  instructions: string[];
}

export interface ClassificationSession {
  id: string;
  userId: string;
  result: ClassificationResult;
  createdAt: Date;
}

export interface Challenge {
  id: string;
  title: string;
  description: string;
  progress: number;
  target: number;
  reward: number;
  status: 'active' | 'completed' | 'locked';
  icon: string;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlockedAt?: Date;
}

export interface EducationContent {
  id: string;
  title: string;
  category: string;
  description: string;
  tips: string[];
  didYouKnow: string;
  icon: string;
}

export interface UserStats {
  totalScans: number;
  totalPoints: number;
  streak: number;
  recyclableCount: number;
  organicCount: number;
  hazardousCount: number;
  generalCount: number;
}
