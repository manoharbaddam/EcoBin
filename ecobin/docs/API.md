# Cloud Functions API Reference 🔌

All interactions between the mobile app and Firebase occur via `httpsCallable` Cloud Functions (except for one admin webhook).

## 🌍 Classification

### `classifyWaste`
- **Input:** `{ imageBase64: string }`
- **Output:** `{ success: boolean, data: ScanResult, pointsAwarded: number, newBadges: string[] }`
- **Description:** Sends the base64 image along with a structured prompt to Gemini 1.5 Flash. Returns the category and tips, awards points based on the category, checks for new badges, and saves a `scanRecord`.

## 🏆 Gamification

### `getGamificationProfile`
- **Input:** `void`
- **Output:** `{ success: boolean, data: GamificationProfile }`
- **Description:** Returns the user's total points, scans, selected city, and array of unlocked badge IDs.

### `getLeaderboard`
- **Input:** `{ city: string }`
- **Output:** `{ success: boolean, data: { leaderboard: LeaderboardEntry[], currentUser: LeaderboardEntry | null } }`
- **Description:** Returns the top 50 users in the specified city, plus the current user's explicit rank if they fall outside the top 50.

### `getAllBadges`
- **Input:** `void`
- **Output:** `{ success: boolean, data: Badge[] }`
- **Description:** Returns the definitions of all available badges in the system.

## 📚 Education

### `submitQuiz`
- **Input:** `{ answers: Record<string, number> }` *(map of questionId to selected option index)*
- **Output:** `{ success: boolean, correctCount: number, pointsEarned: number, newBadges: string[] }`
- **Description:** Grades the quiz on the server, awards 5pts per correct answer, checks for the "Quiz Master" badge.

### `askEcoAssistant`
- **Input:** `{ query: string }`
- **Output:** `{ success: boolean, explanation: string }`
- **Description:** Forwards the user's question to Gemini 1.5 Flash with a strict system prompt ensuring it only answers waste-related questions.

## 📋 Reports

### `submitWasteReport`
- **Input:** `{ imageBase64?: string, description: string, locationLat?: number, locationLng?: number, city?: string }`
- **Output:** `{ success: boolean, data: { reportId: string, imageUrl: string } }`
- **Description:** Converts the base64 string to a buffer, uploads it to Firebase Storage (public URL), and creates a `wasteReports` document.

### `getUserReports`
- **Input:** `void`
- **Output:** `{ success: boolean, data: WasteReport[] }`
- **Description:** Fetches all reports submitted by the authenticated user.

## 👤 Auth & System

### `syncUserProfile`
- **Input:** `{ city?: string, fcmToken?: string, displayName?: string }`
- **Output:** `{ success: boolean }`
- **Description:** Updates the user's public profile fields used for leaderboards and notifications.

### `seedData` (HTTP)
- **URL params:** `?secret=YOUR_SECRET&adminUid=OPTIONAL_UID`
- **Output:** JSON summary
- **Description:** Internal endpoint to populate the database with the 6 core badges and 30 predefined quiz questions.
