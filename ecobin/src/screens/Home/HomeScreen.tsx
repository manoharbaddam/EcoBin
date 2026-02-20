import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { colors, spacing, typography } from '../../theme';
import { Card } from '../../components/common/Card/Card';
import { Badge } from '../../components/common/Badge/Badge';
import { userService } from '../../services/mock/userService';
import { classificationService } from '../../services/mock/classificationService';
import { User, UserStats, ClassificationSession } from '../../types';
import { scanService } from '../../services/firestore/scan.service';

export const HomeScreen = ({ navigation }: any) => {
  const [user, setUser] = useState<User | null>(null);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [recentScans, setRecentScans] = useState<ClassificationSession[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const userData = await userService.getUser();
    const statsData = await userService.getStats();
    const history = await classificationService.getHistory();
    setUser(userData);
    setStats(statsData);
    setRecentScans(history.slice(0, 3));
  };

  if (!user || !stats) return null;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Hello, {user.name}! 👋</Text>
          <Text style={styles.subtitle}>Let's make the planet greener</Text>
        </View>
        <View style={styles.pointsBadge}>
          <Text style={styles.pointsText}>⭐ {user.points}</Text>
        </View>
      </View>

      <Card style={styles.statsCard}>
        <Text style={styles.cardTitle}>Your Impact</Text>
        <View style={styles.statsGrid}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{stats.totalScans}</Text>
            <Text style={styles.statLabel}>Total Scans</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{stats.streak}</Text>
            <Text style={styles.statLabel}>Day Streak</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{user.level}</Text>
            <Text style={styles.statLabel}>Level</Text>
          </View>
        </View>
      </Card>

      <Card style={styles.categoryCard}>
        <Text style={styles.cardTitle}>Waste Distribution</Text>
        <View style={styles.categoryList}>
          <View style={styles.categoryItem}>
            <Badge label="♻️ Recyclable" color={colors.bins.recyclable} />
            <Text style={styles.categoryCount}>{stats.recyclableCount}</Text>
          </View>
          <View style={styles.categoryItem}>
            <Badge label="🌱 Organic" color={colors.bins.organic} />
            <Text style={styles.categoryCount}>{stats.organicCount}</Text>
          </View>
          <View style={styles.categoryItem}>
            <Badge label="⚠️ Hazardous" color={colors.bins.hazardous} />
            <Text style={styles.categoryCount}>{stats.hazardousCount}</Text>
          </View>
          <View style={styles.categoryItem}>
            <Badge label="🗑️ General" color={colors.bins.general} />
            <Text style={styles.categoryCount}>{stats.generalCount}</Text>
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
                <Text style={styles.scanEmoji}>{session.result.category.icon}</Text>
                <View style={styles.scanDetails}>
                  <Text style={styles.scanCategory}>{session.result.category.name}</Text>
                  <Text style={styles.scanTime}>
                    {new Date(session.createdAt).toLocaleDateString()}
                  </Text>
                </View>
                <Text style={styles.scanPoints}>+{session.result.pointsEarned} pts</Text>
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
