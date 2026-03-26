# EcoBin - Testing & Verification Checklist

Complete this checklist to verify all functionality is working correctly.

---

## Pre-Flight Checks ✓

- [ ] Node.js and npm installed
- [ ] Project dependencies installed (`npm install` completed)
- [ ] `.env` file with Firebase & Gemini credentials present
- [ ] Internet connection active
- [ ] No other process using port 8081

---

## Part 1: Server Startup

**Command**: `npm start` (from ecobin directory)

### Verification Points

- [ ] Metro bundler starts without errors
- [ ] QR code is displayed in terminal
- [ ] Server message shows "Starting project..."
- [ ] No critical error messages in console

**Expected Output**:

```
Starting Metro Bundler
[✓] Bundled React Native
[✓] Compiling TypeScript
Ready!
```

---

## Part 2: Authentication (Login/Register)

### Test 2.1: Registration

1. [ ] App loads and shows Login screen
2. [ ] Click "Create New Account" button
3. [ ] Verify Register screen appears
4. [ ] Fill in:
    - [ ] Username: `testuser123`
    - [ ] Email: `test@example.com`
    - [ ] Password: `SecurePass123!`
    - [ ] Confirm Password: matches above
5. [ ] Click "Create Account"
6. [ ] Verify no error messages
7. [ ] Auto-logged in to app
8. [ ] Redirected to Home screen

### Test 2.2: User Profile Creation

After registration:

- [ ] User data saved to Firestore
- [ ] Can verify in Firebase Console:
    - [ ] Database → users collection
    - [ ] Document named with your UID
    - [ ] Contains: email, username, points (0), level (1)

### Test 2.3: Login/Logout

1. [ ] Click Profile tab → Logout button
2. [ ] Verify logged out (back to Login screen)
3. [ ] Login with same credentials
    - [ ] Email: `test@example.com`
    - [ ] Password: `SecurePass123!`
4. [ ] Verify successful login
5. [ ] User data persists (points, stats)

---

## Part 3: Home Dashboard

### Test 3.1: Display Elements

On the Home screen, verify:

- [ ] User greeting displays name
- [ ] Points badge shows in top right
- [ ] "Your Impact" card displays with stats:
    - [ ] Total Scans: 0 (initially)
    - [ ] Day Streak: 0
    - [ ] Level: 1
- [ ] "Waste Distribution" card shows all 4 categories:
    - [ ] ♻️ Recyclable: 0
    - [ ] 🌱 Organic: 0
    - [ ] ⚠️ Hazardous: 0
    - [ ] 🗑️ General: 0
- [ ] "Scan New Waste" button is clickable

### Test 3.2: Recent Scans

- [ ] "Recent Scans" section appears (after first scan)
- [ ] Shows latest scans with timestamp and points

---

## Part 4: Waste Classification (Scan Feature)

### Test 4.1: Image Selection

1. [ ] Click 📷 Scan tab
2. [ ] Two options available:
    - [ ] "Take Photo"
    - [ ] "Choose from Gallery"
3. [ ] Click "Choose from Gallery"
4. [ ] Select ANY image from device
5. [ ] Image preview appears
6. [ ] "Retake" and "Classify" buttons visible

### Test 4.2: Classification Process

1. [ ] Click "Classify" button
2. [ ] Loading spinner appears
3. [ ] Message shows "Analyzing your waste..."
4. [ ] Wait 5-10 seconds for API response
5. [ ] Classification completes without error

### Test 4.3: Results Screen

After classification, verify:

- [ ] ✅ Success checkmark visible
- [ ] [ ] Points earned displayed (e.g., "+10 pts")
- [ ] Category icon and name shown
- [ ] Bin type displayed with:
    - [ ] Color-coded badge
    - [ ] Bin name (Green Bin, Blue Bin, etc.)
    - [ ] Disposal description
- [ ] Confidence score bar shows (0-100%)
- [ ] Disposal instructions listed
- [ ] Two action buttons:
    - [ ] "Scan Another Item"
    - [ ] "Done"

### Test 4.4: Data Updates

After successful scan:

1. [ ] Go to Home tab
2. [ ] Verify stats updated:
    - [ ] Total Scans increased by 1
    - [ ] Points increased
3. [ ] Category count increased if applicable
4. [ ] Scan appears in "Recent Scans" list

---

## Part 5: Education Center

### Test 5.1: Content Display

1. [ ] Click 📚 Education tab
2. [ ] Verify all waste content loaded:
    - [ ] ♻️ Recyclable Materials
    - [ ] 🌱 Organic Waste
    - [ ] ⚠️ Hazardous Waste
    - [ ] 🗑️ Reducing General Waste
3. [ ] Each card displays:
    - [ ] [ ] Icon (emoji)
    - [ ] Title
    - [ ] Description
    - [ ] Tips section with bullet points
    - [ ] "Did you know?" fact

### Test 5.2: Chat Functionality

1. [ ] Scroll down and find "💬 Ask Eco Assistant" button
2. [ ] Click button
3. [ ] Chat window opens in full screen
4. [ ] Can see:
    - [ ] "Eco Assistant 🌍" header
    - [ ] Close button (✕)
    - [ ] Input field "Ask something about waste..."
5. [ ] Type message: "How do I recycle plastic bottles?"
6. [ ] Click "Send" or press Enter
7. [ ] Message appears on right (user message)
8. [ ] Loading indicator appears ("♻️ Thinking...")
9. [ ] AI response appears on left (chatbot message)
10. [ ] Response is relevant to question
11. [ ] Can send multiple messages
12. [ ] Messages scroll naturally
13. [ ] Click ✕ to close chat
14. [ ] Returns to Education content

### Test 5.3: Chat Error Handling

- [ ] Try sending empty message (should be disabled)
- [ ] Send very long message (should work)
- [ ] Multiple rapid messages (should queue)
- [ ] Chat gracefully handles slow API

---

## Part 6: User Profile

### Test 6.1: Profile Information

1. [ ] Click 👤 Profile tab
2. [ ] Verify displays:
    - [ ] User avatar (first letter of name)
    - [ ] Username/name
    - [ ] Email address
    - [ ] Level badge (Level 1)

### Test 6.2: Challenges

- [ ] "Active Challenges" section loaded
- [ ] At least 3 challenges visible:
    - [ ] "First Steps" - with progress bar
    - [ ] "Recycling Champion" - with progress bar
    - [ ] "Week Streak" - with progress bar
- [ ] Progress bars show correct ratio
- [ ] Completed challenges show ✓ badge

### Test 6.3: Badges

- [ ] "Badges" section shows grid of badges
- [ ] Unlocked badges:
    - [ ] Display icon clearly
    - [ ] Show unlock date
    - [ ] Are in color
- [ ] Locked badges:
    - [ ] Are grayed out
    - [ ] Show "🔒" indicator
    - [ ] No unlock date

### Test 6.4: Logout

- [ ] Scroll to bottom
- [ ] Red "Logout" button visible
- [ ] Click "Logout"
- [ ] Redirected to Login screen
- [ ] Data cleared from session

---

## Part 7: Data Persistence

### Test 7.1: Firebase Firestore

Verify data is being stored:

1. [ ] Open Firebase Console
2. [ ] Navigate to Firestore Database
3. [ ] Check "users" collection:
    - [ ] Document with your UID exists
    - [ ] Contains: email, username, totalPoints, totalScans, level, streak, createdAt
4. [ ] (Optional) Check scans subcollection after making scans

### Test 7.2: Session Persistence

1. [ ] Perform scan and earn points
2. [ ] Refresh page/restart app
3. [ ] Verify points still there (from Firestore)
4. [ ] Log out and log back in
5. [ ] Verify all data still intact

---

## Part 8: Error Handling

### Test 8.1: Network Errors

1. [ ] Disable internet connection
2. [ ] Try to perform scan
3. [ ] App shows error message gracefully
4. [ ] Re-enable internet
5. [ ] Try again - should work

### Test 8.2: Invalid Input

- [ ] Try registering with empty email
- [ ] Try registering with mismatched passwords
- [ ] Try registering with short password (<6 chars)
- [ ] Verify error messages appear

### Test 8.3: API Errors

- [ ] Gemini API temporarily down (won't happen during test)
- [ ] If it happens, should show: "Error: Failed to classify image"

---

## Part 9: UI/UX Verification

### Test 9.1: Responsiveness

- [ ] Test on different screen sizes:
    - [ ] Mobile phone (320px width)
    - [ ] Tablet (768px width)
    - [ ] Desktop (1024px+ width)
- [ ] All elements properly scaled
- [ ] Text readable at all sizes
- [ ] Buttons appropriately sized

### Test 9.2: Navigation

- [ ] All 4 main tabs accessible
- [ ] Tab icons visible and change color when active
- [ ] Back button works from nested screens
- [ ] No navigation loops

### Test 9.3: Colors & Styling

- [ ] Primary green consistent across app
- [ ] Waste bin colors correct:
    - [ ] Blue for recyclable
    - [ ] Green for organic
    - [ ] Red for hazardous
    - [ ] Gray for general
- [ ] Text readable on all backgrounds
- [ ] Shadows and spacing consistent

### Test 9.4: Animations

- [ ] Loading spinners animate smoothly
- [ ] Tab transitions smooth
- [ ] No janky animations or freezes

---

## Part 10: Performance

### Test 10.1: Load Times

- [ ] App startup: < 3 seconds
- [ ] Screen transitions: < 1 second
- [ ] Navigation: instant
- [ ] Database queries: < 1-2 seconds

### Test 10.2: Memory Usage

- [ ] App doesn't crash with low memory
- [ ] Smooth scrolling in lists
- [ ] No lag during classification

---

## Part 11: Mobile Testing (Optional via Expo Go)

1. [ ] Download Expo Go app on phone
2. [ ] Run `npm start` on computer
3. [ ] Scan QR code with phone
4. [ ] App loads on phone successfully
5. [ ] All features work on mobile:
    - [ ] Can take photo with camera
    - [ ] Can access gallery
    - [ ] Chat works
    - [ ] Navigation works
    - [ ] Typing smooth

---

## Final Verification Checklist

- [ ] No console errors
- [ ] No TypeScript errors
- [ ] All features tested and working
- [ ] No crashes or freezes
- [ ] Data persistence verified
- [ ] User-friendly error messages
- [ ] Responsive on multiple devices
- [ ] Performance acceptable
- [ ] All 4 tabs functional
- [ ] Authentication secure
- [ ] Firebase integration working
- [ ] Gemini API integration working

---

## Success Criteria

**App is PRODUCTION READY when:**

- ✅ All 50+ tests pass
- ✅ No critical errors in console
- ✅ No TypeScript compilation errors
- ✅ All features respond within expected time
- ✅ Data persists across sessions
- ✅ Responsive on all screen sizes
- ✅ No outstanding bugs

---

## Report Results

**Date Tested**: ****\_\_\_\_****

**Tested By**: ****\_\_\_\_****

**Result**:

- [ ] ✅ PASS - All tests completed successfully
- [ ] ⚠️ PARTIAL - Some features need fixes
- [ ] ❌ FAIL - Critical issues found

**Issues Found**:

```
1. ___________________________________
2. ___________________________________
3. ___________________________________
```

**Notes**:

```
_________________________________________
```

---

## Test Environment

- **Device**: ******\_\_\_\_******
- **Browser/Platform**: ******\_\_\_\_******
- **OS**: ******\_\_\_\_******
- **Network**: ******\_\_\_\_******
- **Time Tested**: ******\_\_\_\_******

---

**Happy Testing! 🎉**

For support or issues, refer to DEPLOYMENT_GUIDE.md or QUICK_START.md
