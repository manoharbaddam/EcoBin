# EcoBin - Quick Start Guide

## ⚡ 30-Second Setup

```bash
# Navigate to project
cd "/Users/manohar/Developer/EcoBin copy/ecobin"

# Start development server
npm start

# Press 'w' for web, or scan QR code with Expo Go app
```

---

## 🎬 What to Expect

1. **Landing Screen**: Login or Register
2. **Main App**: Bottom tab navigation with:
    - 🏠 Home (stats & history)
    - 📷 Scan (classify waste)
    - 📚 Education (learn & chat with AI)
    - 👤 Profile (achievements & settings)

---

## ✨ Key Features to Try

### 1️⃣ Test Authentication

- Click "Create New Account"
- Register with any email/password
- Verify you're logged in (see user data on Home screen)

### 2️⃣ Test Waste Classification

- Go to 📷 Scan tab
- Click "Take Photo" or "Choose from Gallery"
- Select any image (works with any image!)
- See AI classification results with disposal tips

### 3️⃣ Test Education & AI Chat

- Go to 📚 Education tab
- Read waste disposal tips
- Click "💬 Ask Eco Assistant" button
- Ask questions about recycling and waste

### 4️⃣ Check Your Profile

- Go to 👤 Profile tab
- View earned points and badges
- See active challenges

---

## 🔧 Common Commands

| Command           | Purpose                                    |
| ----------------- | ------------------------------------------ |
| `npm start`       | Start interactive server (choose platform) |
| `npm run web`     | Start web version                          |
| `npm run ios`     | Start iOS version                          |
| `npm run android` | Start Android version                      |
| `npm audit`       | Check security vulnerabilities             |
| `npm update`      | Update dependencies                        |

---

## 🌍 Access Points

### Web Browser

- **Local**: http://localhost:8081
- **With Tunnel**: Follow Expo CLI instructions

### Mobile (Recommended for Best Experience)

1. Download **Expo Go** app
2. Run `npm start`
3. Scan QR code displayed in terminal
4. Test on your device

---

## 🐛 Quick Troubleshooting

### "Port already in use"

```bash
lsof -i :8081  # Find process
kill -9 <PID>  # Kill it
npm start      # Try again
```

### "Module not found"

```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
```

### "FirebaseError: service unavailable"

- Check internet connection
- Verify Firebase credentials in `.env`
- Ensure `.env` variables are correctly set

### "Gemini API Error"

- Verify API key is correct
- Check image format (JPEG/PNG)
- Ensure API is enabled in Google Cloud

---

## 📱 Test Scenarios

### Scenario 1: New User Journey

1. Start app → See login screen
2. Click "Create New Account"
3. Fill in credentials
4. Register successfully
5. See Home screen with empty stats

### Scenario 2: Classify Waste

1. Go to Scan tab
2. Take/upload a photo
3. Wait for classification (might be slow first time)
4. See category, bin type, and tips
5. Points added to Home screen

### Scenario 3: Learn About Waste

1. Go to Education tab
2. Read about different waste types
3. Click "Ask Eco Assistant"
4. Ask "How do I recycle plastic?"
5. Get AI-powered response

---

## 📊 Data Persistence

All user data is automatically saved to Firebase:

- ✅ User profile
- ✅ All scan history
- ✅ Points and achievements
- ✅ Challenge progress

Data persists across sessions!

---

## 🚀 Ready to Deploy?

### For Testing

```bash
npm start  # Current setup - perfect for development
```

### For Production Web

```bash
# Deploy to Firebase Hosting
npm run web
firebase deploy
```

### For Mobile App Stores

```bash
# Build and submit
eas build --platform ios
eas build --platform android
eas submit --platform ios
eas submit --platform android
```

---

## 💡 Pro Tips

1. **First load might be slow** - Metro bundler needs to build
2. **Network requests may be slow** - Gemini API can take 5-10 seconds
3. **Try different images** - Works with any photo (doesn't need to be waste)
4. **Test with different accounts** - Each Firebase account has separate data
5. **Check console for errors** - Press 'd' in development console

---

## 🎯 What's Working

✅ **Fully Functional**:

- User registration and login
- Real-time database persistence
- Image-based classification
- Points and gamification
- Education content
- AI chatbot assistance
- Cross-platform support

---

## 📞 Support

If something isn't working:

1. **Check the terminal** for error messages
2. **Verify .env** variables are set correctly
3. **Restart the server** (`npm start`)
4. **Clear cache** (`rm -rf .metro-cache`)
5. **Check internet connection** for API calls

---

**Enjoy EcoBin! 🌍♻️**
