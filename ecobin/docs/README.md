# EcoBin — Smart Garbage Segregation System 🌿

An intelligent mobile application built to encourage and simplify proper waste disposal. EcoBin uses Google's Gemini AI to instantly classify waste, educate users on proper recycling techniques, and reward environmentally friendly behavior through a comprehensive gamification system.

## 🌟 Key Features

### 📸 AI Waste Classification
- Snap a photo or choose from your gallery
- Instant classification into 5 categories (Recyclable, Non-Recyclable, Hazardous, Organic, E-Waste) powered by Gemini 1.5 Flash
- Detailed explanation and disposal tips for every item

### 🏆 Gamification & Rewards
- Earn points for every scan, quiz answered, and report submitted
- Unlock visual badges (Eco Starter, Green Warrior, Recycling Champion, etc.)
- Compete on the **City Leaderboard** against your neighbors

### 📚 Education Center
- AI-powered **Eco Assistant** available for any waste-related questions
- Interactive, multi-level quizzes covering all waste categories

### 📋 Community Reporting
- Spot illegal dumping or overflowing bins?
- Snap a photo, add a description, map your location, and submit a report direct to city admins

### 👤 Seamless Authentication
- Email & Password login
- **Guest Mode** for frictionless onboarding (can be upgraded later to save progress)

---

## 🛠 Tech Stack

### Frontend (Mobile App)
- **Framework:** React Native (Expo SDK 51+)
- **Navigation:** Expo Router / React Navigation
- **State Management:** Zustand
- **Camera & Location:** Expo ImagePicker, Expo Location
- **Styling:** React Native StyleSheet (Custom Theme System)

### Backend (Firebase)
- **Cloud Functions:** v2 (Node.js 20) with TypeScript
- **Database:** Cloud Firestore
- **Storage:** Cloud Storage for Firebase
- **Authentication:** Firebase Auth
- **AI Core:** `@google/genai` (Gemini 1.5 Flash)

---

## 🚀 Quick Start
Please see [SETUP.md](./SETUP.md) for detailed instructions on how to configure, run, and deploy both the mobile app and the backend.

## 📖 Architecture & Design
Please see [API.md](./API.md) for Cloud Function endpoints and [DATABASE_SCHEMA.md](./DATABASE_SCHEMA.md) for the Firestore data model.
