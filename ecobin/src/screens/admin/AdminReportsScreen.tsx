import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import { colors, spacing, typography } from '../../theme';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../services/firebase';
import { Card } from '../../components/common/Card/Card';

export const AdminReportsScreen = () => {
  const [reports, setReports] = useState<any[]>([]);

  useEffect(() => {
    loadReports();
  }, []);

  const loadReports = async () => {
    try {
      const snap = await getDocs(collection(db, 'reports'));
      setReports(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Manage Reports</Text>
      <FlatList
        data={reports}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <Card style={styles.card}>
            <Text style={styles.cardTitle}>{item.title || 'Report'}</Text>
            <Text>{item.description || 'No description'}</Text>
            <Text style={styles.status}>Status: {item.status || 'open'}</Text>
          </Card>
        )}
        ListEmptyComponent={<Text>No reports found.</Text>}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: spacing.md,
    backgroundColor: colors.background.secondary,
  },
  title: {
    ...typography.h2,
    marginTop: spacing.xl,
    marginBottom: spacing.lg,
  },
  card: {
    marginBottom: spacing.md,
    padding: spacing.md,
  },
  cardTitle: {
    ...typography.h4,
    marginBottom: spacing.xs,
  },
  status: {
    ...typography.bodySmall,
    color: colors.primary.main,
    marginTop: spacing.sm,
  }
});
