import {
  collection,
  addDoc,
  query,
  where,
  orderBy,
  limit,
  getDocs,
  Timestamp,
} from 'firebase/firestore';
import { db } from '../firebase';

export const scanService = {
  async addScan(data: {
    userId: string;
    categoryId: string;
    categoryName: string;
    confidence: number;
    pointsEarned: number;
  }) {
    await addDoc(collection(db, 'scans'), {
      ...data,
      createdAt: Timestamp.now(),
    });
  },

  async getRecentScans(uid: string, count = 5) {
    const q = query(
      collection(db, 'scans'),
      where('userId', '==', uid),
      orderBy('createdAt', 'desc'),
      limit(count)
    );

    return (await getDocs(q)).docs.map(d => ({
      id: d.id,
      ...d.data(),
    }));
  },

  async getCategoryDistribution(uid: string) {
    const q = query(
      collection(db, 'scans'),
      where('userId', '==', uid)
    );

    const docs = (await getDocs(q)).docs;

    return docs.reduce((acc: any, d) => {
      const cat = d.data().categoryName;
      acc[cat] = (acc[cat] || 0) + 1;
      return acc;
    }, {});
  },
};
