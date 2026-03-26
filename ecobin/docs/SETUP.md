# Setup & Deployment Guide 🚀

## Prerequisites
- Node.js 20+
- Firebase CLI (`npm i -g firebase-tools`)
- Expo CLI (`npm i -g expo-cli`)

---

## 1. Firebase Backend Setup

1. **Install Dependencies:**
   ```bash
   cd functions
   npm install
   ```

2. **Environment Variables (`functions/.env`):**
   Create a `.env` file in the `functions/` directory:
   ```env
   # Your Gemini API Key for Classification & Education
   GEMINI_API_KEY="your_google_ai_studio_api_key_here"
   
   # Secret used to secure the seedData endpoint
   SEED_SECRET="test123"
   ```

3. **Login & Set Project:**
   ```bash
   firebase login
   firebase use --add  # Select your Firebase project
   ```

4. **Deploy Setup:**
   - Ensure you are on the **Blaze (Pay-as-you-go)** plan (required for Node 20 Cloud Functions).
   - Enable **Firestore**, **Storage**, and **Authentication** in the Firebase Console.

5. **Deploy Rules & Indexes:**
   ```bash
   firebase deploy --only firestore:rules,firestore:indexes,storage
   ```

6. **Deploy Functions:**
   ```bash
   npm run deploy
   ```

7. **Seed Initial Data:**
   After deployment, seed the database with badges and quiz questions by calling the seed HTTP endpoint (replace `<REGION>` and `<PROJECT_ID>`):
   ```bash
   curl "https://<REGION>-<PROJECT_ID>.cloudfunctions.net/seedData?secret=test123"
   ```

---

## 2. Mobile App Setup

1. **Install Dependencies:**
   ```bash
   cd ecobin
   npm install
   ```

2. **Environment Variables (`.env`):**
   Create a `.env` file in the root directory:
   ```env
   # Switch to 'false' in production
   EXPO_PUBLIC_USE_EMULATOR=false
   
   # Your Firebase Project config
   EXPO_PUBLIC_FIREBASE_API_KEY="AIzaSy..."
   EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN="your-project.firebaseapp.com"
   EXPO_PUBLIC_FIREBASE_PROJECT_ID="your-project-id"
   EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET="your-project.appspot.com"
   EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID="123456789"
   EXPO_PUBLIC_FIREBASE_APP_ID="1:123456789:web:abcdef"
   ```

3. **Run the App:**
   ```bash
   npx expo start
   ```

---

## 3. Local Development (Emulators)

To run the entire stack locally without hitting production Firebase:

1. **Start Emulators:**
   ```bash
   firebase emulators:start
   ```

2. **Set App to use Emulators:**
   In your root `.env`, set:
   ```env
   EXPO_PUBLIC_USE_EMULATOR=true
   ```

3. **Start Mobile App:**
   ```bash
   npx expo start -c
   ```
   *(The app `firebase.ts` is configured to connect to `127.0.0.1` locally when `EXPO_PUBLIC_USE_EMULATOR` is true).*
