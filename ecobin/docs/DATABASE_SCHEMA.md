# Database Schema (Firestore) 🗄️

## `users` (Collection)
Primary user profiles mirroring Firebase Auth. Auto-created via `onUserCreate` trigger.
- `uid` (string)
- `email` (string)
- `displayName` (string)
- `city` (string) - Critical for leaderboards
- `totalPoints` (number)
- `totalScans` (number)
- `reportsSubmitted` (number)
- `correctQuizAnswers` (number)
- `badges` (string[]) - Array of earned badge IDs
- `fcmToken` (string)
- `isAnonymous` (boolean)
- `createdAt` / `updatedAt` (timestamp)

## `scanRecords` (Collection)
History of all user scans. Created by `classifyWaste` function.
- `userId` (string)
- `imageUrl` (string)
- `classification` (map)
  - `category` (string)
  - `subcategory` (string)
  - `isRecyclable` (boolean)
  - `confidence` (number)
  - `explanation` (string)
  - `disposalTips` (string[])
- `pointsEarned` (number)
- `createdAt` (timestamp)

## `badges` (Collection)
System-defined badge definitions. Seeded via `seedData`.
- `id` (string) - e.g. "first_scan", "eco_starter"
- `name` (string)
- `description` (string)
- `iconUrl` (string)
- `type` (string) - "scans" | "points" | "quiz" | "reports"
- `thresholdValue` (number)

## `wasteReports` (Collection)
User submitted issues (illegal dumping, full bins).
- `userId` (string)
- `description` (string)
- `imageUrl` (string) - Cloud Storage URL
- `locationLat` / `locationLng` (number)
- `city` (string)
- `status` (string) - "pending" | "in_review" | "resolved"
- `adminNotes` (string)
- `createdAt` / `updatedAt` (timestamp)

## `quizQuestions` (Collection)
System-defined educational trivia. Seeded via `seedData`.
- `questionText` (string)
- `options` (string[])
- `correctAnswer` (number) - index
- `category` (string)
- `difficulty` (string) - "easy" | "medium" | "hard"
- `explanation` (string)
- `createdAt` (timestamp)

## `quizAttempts` (Collection)
Record of user quiz results.
- `userId` (string)
- `score` (number)
- `totalQuestions` (number)
- `pointsEarned` (number)
- `attemptedAt` (timestamp)

## `notifications` (Collection)
In-app alerts and badge awards.
- `userId` (string | null) - null for global broadcasts
- `title` (string)
- `body` (string)
- `type` (string) - "alert" | "badge" | "report_update"
- `isRead` (boolean)
- `createdAt` (timestamp)
