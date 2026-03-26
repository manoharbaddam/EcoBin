import * as admin from "firebase-admin";

admin.initializeApp();

export * from "./apps/classification";
export * from "./apps/gamification";
export * from "./apps/education";
export * from "./apps/admin";
export * from "./apps/reports";
export * from "./apps/notifications";
export * from "./auth";
export * from "./seed";
