import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { colors, spacing, typography } from '../../theme';
import { Card } from '../../components/common/Card/Card';
import { Badge } from '../../components/common/Badge/Badge';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../services/firebase';
import { doc, onSnapshot, collection, query, where, orderBy, limit, getDocs } from 'firebase/firestore';

export const HomeScreen = ({ navigation }: any) => {
  const { user } = useAuth();
  const [userData, setUserData] = useState<any>(null);
  const [recentScans, setRecentScans] = useState<any[]>([]);

  useEffect(() => {
    if (!user) return;

    // Listen to user document
    const unsub = onSnapshot(doc(db, 'users', user.uid), (docSnap) => {
      if (docSnap.exists()) {
        setUserData(docSnap.data());
      }
    });

    // Fetch recent scans independently
    const fetchScans = async () => {
      try {
        // Query the correct subcollection: users/{uid}/scans
        const q = query(
          collection(db, 'users', user.uid, 'scans'),
          orderBy('createdAt', 'desc'),
          limit(3)
        );
        const snap = await getDocs(q);
        const scans = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        setRecentScans(scans);
      } catch (err) {
        // Index might not be ready, ignore for MVP
        console.log('No recent scans found or index building');
      }
    };
    fetchScans();

    return () => unsub();
  }, [user]);

  if (!user) return null;

  const totalPoints = userData?.totalPoints || 0;
  // Calculate level based on points (1 level per 100 points)
  const level = Math.floor(totalPoints / 100) + 1;
  const streak = userData?.streak || 1; // Default to 1 day streak for MVP
  const totalScans = userData?.totalScans || 0;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Hello, {userData?.displayName || 'Eco Warrior'}! 👋</Text>
          <Text style={styles.subtitle}>Let's make the planet greener</Text>
        </View>
        <View style={styles.pointsBadge}>
          <Text style={styles.pointsText}>⭐ {totalPoints}</Text>
        </View>
      </View>

      <Card style={styles.statsCard}>
        <Text style={styles.cardTitle}>Your Impact</Text>
        <View style={styles.statsGrid}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{totalScans}</Text>
            <Text style={styles.statLabel}>Total Scans</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{streak}</Text>
            <Text style={styles.statLabel}>Day Streak</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{level}</Text>
            <Text style={styles.statLabel}>Level</Text>
          </View>
        </View>
      </Card>

      <Card style={styles.categoryCard}>
        <Text style={styles.cardTitle}>Waste Distribution</Text>
        <View style={styles.categoryList}>
          <View style={styles.categoryItem}>
            <Badge label="♻️ Recyclable" color={colors.bins.recyclable} />
            <Text style={styles.categoryCount}>{userData?.recyclableCount || 0}</Text>
          </View>
          <View style={styles.categoryItem}>
            <Badge label="🌱 Organic" color={colors.bins.organic} />
            <Text style={styles.categoryCount}>{userData?.organicCount || 0}</Text>
          </View>
          <View style={styles.categoryItem}>
            <Badge label="⚠️ Hazardous" color={colors.bins.hazardous} />
            <Text style={styles.categoryCount}>{userData?.hazardousCount || 0}</Text>
          </View>
          <View style={styles.categoryItem}>
            <Badge label="🗑️ General" color={colors.bins.general} />
            <Text style={styles.categoryCount}>{userData?.generalCount || 0}</Text>
          </View>
        </View>
      </Card>

      <View style={styles.actionSection}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <TouchableOpacity
          style={styles.scanButton}
          onPress={() => navigation.navigate('Scan')}
        >
          <Text style={styles.scanButtonIcon}>📷</Text>
          <Text style={styles.scanButtonText}>Scan New Waste</Text>
        </TouchableOpacity>
      </View>

      {recentScans.length > 0 && (
        <View style={styles.recentSection}>
          <Text style={styles.sectionTitle}>Recent Scans</Text>
          {recentScans.map((session) => (
            <Card key={session.id} style={styles.scanItem}>
              <View style={styles.scanContent}>
                {session.imageUrl ? (
                  <Image source={{ uri: session.imageUrl }} style={{ width: 44, height: 44, borderRadius: 8, marginRight: 4 }} />
                ) : (
                  <Text style={styles.scanEmoji}>{session.category?.icon || '🗑️'}</Text>
                )}
                <View style={styles.scanDetails}>
                  <Text style={styles.scanCategory}>{session.category?.name || 'Unknown'}</Text>
                  <Text style={styles.scanTime}>
                    {new Date(session.createdAt || Date.now()).toLocaleDateString()}
                  </Text>
                </View>
                <Text style={styles.scanPoints}>+{session.pointsEarned || 0} pts</Text>
              </View>
            </Card>
          ))}
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.secondary,
  },
  content: {
    padding: spacing.md,
    paddingBottom: 100,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.lg,
  },
  greeting: {
    ...typography.h3,
    color: colors.text.primary,
  },
  subtitle: {
    ...typography.body,
    color: colors.text.secondary,
    marginTop: spacing.xs,
  },
  pointsBadge: {
    backgroundColor: colors.primary.main,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 20,
  },
  pointsText: {
    ...typography.h4,
    color: colors.text.inverse,
  },
  statsCard: {
    marginBottom: spacing.md,
  },
  cardTitle: {
    ...typography.h4,
    color: colors.text.primary,
    marginBottom: spacing.md,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    ...typography.h2,
    color: colors.primary.main,
  },
  statLabel: {
    ...typography.bodySmall,
    color: colors.text.secondary,
    marginTop: spacing.xs,
  },
  categoryCard: {
    marginBottom: spacing.md,
  },
  categoryList: {
    gap: spacing.sm,
  },
  categoryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.xs,
  },
  categoryCount: {
    ...typography.h4,
    color: colors.text.primary,
  },
  actionSection: {
    marginBottom: spacing.md,
  },
  sectionTitle: {
    ...typography.h4,
    color: colors.text.primary,
    marginBottom: spacing.md,
  },
  scanButton: {
    backgroundColor: colors.primary.main,
    borderRadius: 16,
    padding: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
  },
  scanButtonIcon: {
    fontSize: 32,
  },
  scanButtonText: {
    ...typography.h4,
    color: colors.text.inverse,
  },
  recentSection: {
    marginBottom: spacing.lg,
  },
  scanItem: {
    marginBottom: spacing.sm,
  },
  scanContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  scanEmoji: {
    fontSize: 32,
  },
  scanDetails: {
    flex: 1,
  },
  scanCategory: {
    ...typography.body,
    fontWeight: '600',
    color: colors.text.primary,
  },
  scanTime: {
    ...typography.caption,
    color: colors.text.secondary,
    marginTop: spacing.xs,
  },
  scanPoints: {
    ...typography.body,
    fontWeight: '600',
    color: colors.success,
  },
});
