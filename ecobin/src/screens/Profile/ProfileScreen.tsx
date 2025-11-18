import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { colors, spacing, typography } from '../../theme';
import { Card } from '../../components/common/Card/Card';
import { Badge } from '../../components/common/Badge/Badge';
import { userService } from '../../services/mock/userService';
import { User, Challenge, Badge as BadgeType } from '../../types';

export const ProfileScreen = () => {
  const [user, setUser] = useState<User | null>(null);
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [badges, setBadges] = useState<BadgeType[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const userData = await userService.getUser();
    const challengesData = await userService.getChallenges();
    const badgesData = await userService.getBadges();
    setUser(userData);
    setChallenges(challengesData);
    setBadges(badgesData);
  };

  if (!user) return null;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Card style={styles.profileCard}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {user.name.charAt(0).toUpperCase()}
          </Text>
        </View>
        <Text style={styles.name}>{user.name}</Text>
        <Text style={styles.email}>{user.email}</Text>
        <View style={styles.levelBadge}>
          <Text style={styles.levelText}>Level {user.level}</Text>
        </View>
      </Card>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Active Challenges</Text>
        {challenges.map((challenge) => (
          <Card key={challenge.id} style={styles.challengeCard}>
            <View style={styles.challengeHeader}>
              <Text style={styles.challengeIcon}>{challenge.icon}</Text>
              <View style={styles.challengeInfo}>
                <Text style={styles.challengeTitle}>{challenge.title}</Text>
                <Text style={styles.challengeDescription}>
                  {challenge.description}
                </Text>
              </View>
            </View>
            <View style={styles.progressContainer}>
              <View style={styles.progressBar}>
                <View
                  style={[
                    styles.progressFill,
                    { width: `${(challenge.progress / challenge.target) * 100}%` },
                  ]}
                />
              </View>
              <Text style={styles.progressText}>
                {challenge.progress}/{challenge.target}
              </Text>
            </View>
            {challenge.status === 'completed' && (
              <Badge label="✓ Completed" color={colors.success} size="small" />
            )}
          </Card>
        ))}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Badges</Text>
        <View style={styles.badgesGrid}>
          {badges.map((badge) => (
            <Card
              key={badge.id}
              style={[
                styles.badgeCard,
                !badge.unlockedAt && styles.badgeLocked,
              ]}
            >
              <Text style={styles.badgeIcon}>{badge.icon}</Text>
              <Text
                style={[
                  styles.badgeName,
                  !badge.unlockedAt && styles.badgeNameLocked,
                ]}
              >
                {badge.name}
              </Text>
              {badge.unlockedAt && (
                <Text style={styles.badgeDate}>
                  {new Date(badge.unlockedAt).toLocaleDateString()}
                </Text>
              )}
            </Card>
          ))}
        </View>
      </View>
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
  profileCard: {
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.primary.main,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  avatarText: {
    ...typography.h1,
    color: colors.text.inverse,
  },
  name: {
    ...typography.h3,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  email: {
    ...typography.body,
    color: colors.text.secondary,
    marginBottom: spacing.md,
  },
  levelBadge: {
    backgroundColor: colors.primary.light,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 16,
  },
  levelText: {
    ...typography.body,
    fontWeight: '600',
    color: colors.text.inverse,
  },
  section: {
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    ...typography.h4,
    color: colors.text.primary,
    marginBottom: spacing.md,
  },
  challengeCard: {
    marginBottom: spacing.sm,
  },
  challengeHeader: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  challengeIcon: {
    fontSize: 32,
  },
  challengeInfo: {
    flex: 1,
  },
  challengeTitle: {
    ...typography.body,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  challengeDescription: {
    ...typography.bodySmall,
    color: colors.text.secondary,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginBottom: spacing.sm,
  },
  progressBar: {
    flex: 1,
    height: 8,
    backgroundColor: colors.background.tertiary,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.primary.main,
  },
  progressText: {
    ...typography.bodySmall,
    color: colors.text.secondary,
    minWidth: 50,
    textAlign: 'right',
  },
  badgesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  badgeCard: {
    width: '48%',
    alignItems: 'center',
    padding: spacing.md,
  },
  badgeLocked: {
    opacity: 0.4,
  },
  badgeIcon: {
    fontSize: 40,
    marginBottom: spacing.sm,
  },
  badgeName: {
    ...typography.bodySmall,
    fontWeight: '600',
    color: colors.text.primary,
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
  badgeNameLocked: {
    color: colors.text.disabled,
  },
  badgeDate: {
    ...typography.caption,
    color: colors.text.secondary,
  },
});
