import {
  collection,
  getDocs,
  getDoc,
  doc,
  query,
  where,
  orderBy,
  limit,
  updateDoc,
  addDoc,
  setDoc,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore';
import { db } from './config';
import { subDays, format, startOfDay, endOfDay } from 'date-fns';

/* ─────────────────────────────────────────────
   OVERVIEW STATS
───────────────────────────────────────────── */
export async function getStats() {
  const [usersSnap, reportsSnap, pendingSnap, collectedSnap] = await Promise.all([
    getDocs(collection(db, 'users')),
    getDocs(collection(db, 'wasteReports')),
    getDocs(query(collection(db, 'wasteReports'), where('status', '==', 'pending'))),
    getDocs(query(collection(db, 'wasteReports'), where('status', '==', 'collected'))),
  ]);
  return {
    totalUsers:     usersSnap.size,
    totalReports:   reportsSnap.size,
    pendingReports: pendingSnap.size,
    collectedReports: collectedSnap.size,
  };
}

export async function getReportsPerDay(days = 7) {
  const since = Timestamp.fromDate(subDays(new Date(), days - 1));
  const snap = await getDocs(
    query(collection(db, 'wasteReports'), where('createdAt', '>=', since))
  );
  const counts = {};
  for (let i = 0; i < days; i++) {
    const d = format(subDays(new Date(), days - 1 - i), 'MMM d');
    counts[d] = 0;
  }
  snap.forEach(doc => {
    const ts = doc.data().createdAt;
    if (ts) {
      const d = format(ts.toDate(), 'MMM d');
      if (counts[d] !== undefined) counts[d]++;
    }
  });
  return Object.entries(counts).map(([date, count]) => ({ date, count }));
}

export async function getStatusBreakdown() {
  const snap = await getDocs(collection(db, 'wasteReports'));
  const breakdown = { pending: 0, in_progress: 0, collected: 0 };
  snap.forEach(doc => {
    const s = doc.data().status;
    if (s in breakdown) breakdown[s]++;
    else breakdown.pending++;
  });
  return [
    { name: 'Pending',     value: breakdown.pending,     fill: '#f59e0b' },
    { name: 'In Progress', value: breakdown.in_progress, fill: '#3b82f6' },
    { name: 'Collected',   value: breakdown.collected,   fill: '#10b981' },
  ];
}

export async function getTopCategories() {
  const snap = await getDocs(collection(db, 'wasteReports'));
  const counts = {};
  snap.forEach(doc => {
    const wt = doc.data().wasteType || doc.data().classification?.category || 'unknown';
    const key = wt.charAt(0).toUpperCase() + wt.slice(1);
    counts[key] = (counts[key] || 0) + 1;
  });
  return Object.entries(counts)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 8);
}

export async function getTopUsersByPoints(lim = 5) {
  const snap = await getDocs(
    query(collection(db, 'users'), orderBy('totalPoints', 'desc'), limit(lim))
  );
  return snap.docs.map(d => ({ uid: d.id, ...d.data() }));
}

/* ─────────────────────────────────────────────
   USERS
───────────────────────────────────────────── */
export async function getAllUsers() {
  const snap = await getDocs(collection(db, 'users'));
  return snap.docs.map(d => ({ uid: d.id, ...d.data() }));
}

export async function getUserById(uid) {
  const snap = await getDoc(doc(db, 'users', uid));
  return snap.exists() ? { uid: snap.id, ...snap.data() } : null;
}

export async function getUserReports(userId, lim = 5) {
  const snap = await getDocs(
    query(
      collection(db, 'wasteReports'),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc'),
      limit(lim)
    )
  );
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

/* ─────────────────────────────────────────────
   WASTE REPORTS
───────────────────────────────────────────── */
export async function getAllReports(filters = {}) {
  let q = collection(db, 'wasteReports');
  const constraints = [orderBy('createdAt', 'desc')];

  if (filters.status && filters.status !== 'all') {
    constraints.unshift(where('status', '==', filters.status));
  }
  if (filters.wasteType && filters.wasteType !== 'all') {
    constraints.unshift(where('wasteType', '==', filters.wasteType));
  }

  const snap = await getDocs(query(q, ...constraints));
  let docs = snap.docs.map(d => ({ id: d.id, ...d.data() }));

  // Client-side date filter (avoids compound index issues)
  if (filters.dateFrom) {
    const from = startOfDay(new Date(filters.dateFrom));
    docs = docs.filter(r => r.createdAt?.toDate() >= from);
  }
  if (filters.dateTo) {
    const to = endOfDay(new Date(filters.dateTo));
    docs = docs.filter(r => r.createdAt?.toDate() <= to);
  }

  return docs;
}

export async function updateReportStatus(reportId, status) {
  await updateDoc(doc(db, 'wasteReports', reportId), {
    status,
    updatedAt: serverTimestamp(),
  });
}

/* ─────────────────────────────────────────────
   NOTIFICATIONS
───────────────────────────────────────────── */
export async function sendAdminNotification(payload) {
  await addDoc(collection(db, 'adminNotifications'), {
    ...payload,
    sentAt: serverTimestamp(),
  });
}

export async function getNotificationHistory() {
  const snap = await getDocs(
    query(collection(db, 'adminNotifications'), orderBy('sentAt', 'desc'))
  );
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

/* ─────────────────────────────────────────────
   APP CONFIG
───────────────────────────────────────────── */
export async function getAppConfig() {
  const snap = await getDoc(doc(db, 'appConfig', 'settings'));
  return snap.exists() ? snap.data() : {
    pointsPerScan:        20,
    pointsPerBadge:       50,
    enableNewRegistrations: true,
  };
}

export async function updateAppConfig(data) {
  await setDoc(doc(db, 'appConfig', 'settings'), data, { merge: true });
}
