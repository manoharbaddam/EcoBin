import { doc, getDoc, setDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';

export const userService = {
  async getUser(uid: string) {
    const snap = await getDoc(doc(db, 'users', uid));
    return snap.exists() ? snap.data() : null;
  },

  async createUserIfNotExists(uid: string, email: string) {
    const ref = doc(db, 'users', uid);
    const snap = await getDoc(ref);

    if (!snap.exists()) {
      await setDoc(ref, {
        email,
        username: email.split('@')[0],
        totalPoints: 0,
        totalScans: 0,
        level: 1,
        streakDays: 0,
        createdAt: serverTimestamp(),
      });
    }
  },

  async updateStats(uid: string, updates: Partial<{
    totalPoints: number;
    totalScans: number;
    streakDays: number;
    level: number;
  }>) {
    await updateDoc(doc(db, 'users', uid), updates);
  },
};
