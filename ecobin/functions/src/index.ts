import * as dotenv from "dotenv";
import * as admin from "firebase-admin";

// Load .env variables first - this ensures GEMINI_API_KEY is available
try {
  dotenv.config();
} catch (e) {
  // Dotenv might not be available or .env might not exist in production
  console.log("Note: .env file not loaded (this is normal in production)");
}

admin.initializeApp();

export * from "./apps/classification";
export * from "./apps/gamification";
export * from "./apps/education";
export * from "./apps/admin";
export * from "./apps/reports";
export * from "./apps/notifications";
export * from "./auth";
export * from "./seed";
