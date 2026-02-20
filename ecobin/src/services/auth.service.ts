import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User
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

export const listenToAuthChanges = (callback: (user: User | null) => void) => {
  return onAuthStateChanged(auth, callback);
};
