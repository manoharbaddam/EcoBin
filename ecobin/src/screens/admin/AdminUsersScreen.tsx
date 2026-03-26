import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import { colors, spacing, typography } from '../../theme';
import { collection, getDocs, limit, query } from 'firebase/firestore';
import { db } from '../../services/firebase';
import { Card } from '../../components/common/Card/Card';

export const AdminUsersScreen = () => {
  const [users, setUsers] = useState<any[]>([]);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      const snap = await getDocs(query(collection(db, 'users'), limit(50)));
      setUsers(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>User Management</Text>
      <FlatList
        data={users}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <Card style={styles.card}>
            <Text style={styles.cardTitle}>{item.username || item.email}</Text>
            <Text>Email: {item.email}</Text>
            <Text>Level: {item.level} | Points: {item.points}</Text>
            <Text style={styles.role}>Role: {item.role || 'user'}</Text>
          </Card>
        )}
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
  role: {
    ...typography.bodySmall,
    color: colors.primary.main,
    marginTop: spacing.sm,
  }
});
