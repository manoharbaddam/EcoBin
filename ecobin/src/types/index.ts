// ─────────────────────────────────────────────
// Firestore / API shared types
// ─────────────────────────────────────────────

export interface FirebaseUser {
  uid: string;
  email: string;
  displayName: string;
  avatarUrl: string;
  city: string;
  totalPoints: number;
  totalScans: number;
  isAnonymous: boolean;
  fcmToken: string;
  badges: string[];
}

export interface ScanResult {
  category: WasteCategory;
  subcategory: string;
  isRecyclable: boolean;
  confidence: number;
  explanation: string;
  disposalTips: string[];
  funFact: string;
}

export type WasteCategory =
  | "recyclable"
  | "non-recyclable"
  | "hazardous"
  | "organic"
  | "e-waste";

export interface ScanRecord {
  id: string;
  userId: string;
  imageUrl: string;
  classification: ScanResult;
  pointsEarned: number;
  createdAt: string;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  iconUrl: string;
  type: "points" | "scans" | "quiz" | "reports";
  thresholdValue: number;
}

export interface QuizQuestion {
  id: string;
  questionText: string;
  imageUrl?: string;
  options: string[];
  correctAnswer: number;
  category: WasteCategory;
  difficulty: "easy" | "medium" | "hard";
  explanation: string;
}

export interface WasteReport {
  id: string;
  userId: string;
  imageUrl: string;
  description: string;
  locationLat: number;
  locationLng: number;
  city: string;
  status: "pending" | "in_review" | "resolved";
  adminNotes: string;
  createdAt: string;
  updatedAt: string;
}

export interface LeaderboardEntry {
  id: string;
  rank: number;
  displayName: string;
  totalPoints: number;
}

export interface Notification {
  id: string;
  userId: string | null;
  title: string;
  body: string;
  type: "alert" | "reward" | "education" | "report_update";
  isRead: boolean;
  createdAt: string;
}

export interface GamificationProfile {
  uid: string;
  totalPoints: number;
  totalScans: number;
  badges: string[];
  city: string;
  displayName: string;
}

// Legacy types kept for backward compatibility
export interface User {
  id: string;
  name: string;
  email: string;
  points: number;
  level: number;
  avatar?: string;
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

export interface EducationContent {
  id: string;
  title: string;
  category: string;
  description: string;
  tips: string[];
  didYouKnow: string;
  icon: string;
}
