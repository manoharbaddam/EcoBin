import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User,
  GoogleAuthProvider,
  // @ts-ignore: React Native Firebase types might omit this even if it exists on web.
  signInWithPopup,
  signInAnonymously
} from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from './firebase';

export const registerUser = async (
  email: string,
  password: string,
  username: string
) => {
  const cred = await createUserWithEmailAndPassword(auth, email, password);

  await setDoc(doc(db, 'users', cred.user.uid), {
    email,
    username,
    points: 0,
    level: 1,
    streak: 0,
    totalScans: 0,
    createdAt: serverTimestamp(),
  });

  return cred.user;
};

export const loginUser = async (email: string, password: string) => {
  const cred = await signInWithEmailAndPassword(auth, email, password);
  return cred.user;
};

export const logoutUser = async () => {
  await signOut(auth);
};

export const loginWithGoogle = async () => {
  const provider = new GoogleAuthProvider();
  const cred = await signInWithPopup(auth, provider);
  
  // Check if they are new, if so set profile
  const userDoc = await getDoc(doc(db, 'users', cred.user.uid));
  if (!userDoc.exists()) {
    await setDoc(doc(db, 'users', cred.user.uid), {
      email: cred.user.email,
      username: cred.user.displayName || "Google User",
      points: 0,
      level: 1,
      streak: 0,
      totalScans: 0,
      createdAt: serverTimestamp(),
    });
  }
  
  return cred.user;
};

export const loginAsGuest = async () => {
  const cred = await signInAnonymously(auth);
  // Guest accounts also need a profile for basic gamification scanning
  const userDoc = await getDoc(doc(db, 'users', cred.user.uid));
  if (!userDoc.exists()) {
    await setDoc(doc(db, 'users', cred.user.uid), {
      username: "Guest User",
      points: 0,
      level: 1,
      streak: 0,
      totalScans: 0,
      isGuest: true,
      createdAt: serverTimestamp(),
    });
  }
  return cred.user;
};

export const listenToAuthChanges = (callback: (user: User | null) => void) => {
  return onAuthStateChanged(auth, callback);
};
