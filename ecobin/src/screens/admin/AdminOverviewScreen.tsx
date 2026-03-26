import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { colors, spacing, typography } from '../../theme';
import { collection, getCountFromServer, query, where } from 'firebase/firestore';
import { db } from '../../services/firebase';
import { Card } from '../../components/common/Card/Card';
import { LoadingSpinner } from '../../components/common/Loading/LoadingSpinner';

export const AdminOverviewScreen = () => {
  const [stats, setStats] = useState({ users: 0, scans: 0, openReports: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const usersSnap = await getCountFromServer(collection(db, 'users'));
      const scansSnap = await getCountFromServer(collection(db, 'scans'));
      // Assume reports collection for open reports
      const reportsSnap = await getCountFromServer(query(collection(db, 'reports'), where('status', '==', 'open')));
      
      setStats({
        users: usersSnap.data().count,
        scans: scansSnap.data().count,
        openReports: reportsSnap.data().count,
      });
    } catch (e) {
      console.error("Failed to load admin stats", e);
    }
    setLoading(false);
  };

  if (loading) return <LoadingSpinner message="Loading Dashboard..." />;

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Admin Dashboard</Text>
      
      <View style={styles.statsGrid}>
        <Card style={styles.statCard}>
          <Text style={styles.statNumber}>{stats.users}</Text>
          <Text style={styles.statLabel}>Total Users</Text>
        </Card>
        <Card style={styles.statCard}>
          <Text style={styles.statNumber}>{stats.scans}</Text>
          <Text style={styles.statLabel}>Total Scans</Text>
        </Card>
        <Card style={styles.statCard}>
          <Text style={styles.statNumber}>{stats.openReports}</Text>
          <Text style={styles.statLabel}>Open Reports</Text>
        </Card>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.secondary,
    padding: spacing.md,
  },
  title: {
    ...typography.h2,
    marginTop: spacing.xl,
    marginBottom: spacing.lg,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    padding: spacing.lg,
  },
  statNumber: {
    ...typography.h2,
    color: colors.primary.main,
    marginBottom: spacing.sm,
  },
  statLabel: {
    ...typography.bodySmall,
    color: colors.text.secondary,
  },
});
