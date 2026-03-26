import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Badge } from '../types';
import { colors, spacing } from '../theme';

interface BadgeCardProps {
  badge: Badge;
  earned: boolean;
}

export const BadgeCard: React.FC<BadgeCardProps> = ({ badge, earned }) => {
  const BADGE_ICONS: Record<string, string> = {
    first_scan: '🌱',
    eco_starter: '🌿',
    green_warrior: '🌳',
    recycling_champion: '👑',
    quiz_master: '🧠',
    problem_reporter: '🕵️',
  };

  const icon = BADGE_ICONS[badge.id] || '🏅';

  return (
    <View style={[styles.card, !earned && styles.cardLocked]}>
      <View style={[styles.iconCircle, earned ? styles.iconEarned : styles.iconLocked]}>
        <Text style={styles.iconText}>{icon}</Text>
        {!earned && (
          <View style={styles.lockOverlay}>
            <Text style={styles.lockIcon}>🔒</Text>
          </View>
        )}
      </View>
      <Text
        style={[styles.name, !earned && styles.nameLocked]}
        numberOfLines={2}
      >
        {badge.name}
      </Text>
      <Text style={styles.description} numberOfLines={2}>
        {badge.description}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    width: '47%',
    backgroundColor: colors.background.primary,
    borderRadius: 16,
    padding: spacing.md,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
    marginBottom: spacing.sm,
  },
  cardLocked: {
    opacity: 0.5,
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.sm,
    position: 'relative',
  },
  iconEarned: {
    backgroundColor: colors.primary.main + '20',
    borderWidth: 2,
    borderColor: colors.primary.main,
  },
  iconLocked: {
    backgroundColor: colors.background.secondary,
    borderWidth: 2,
    borderColor: colors.border,
  },
  lockOverlay: {
    position: 'absolute',
    bottom: -4,
    right: -4,
    backgroundColor: colors.background.primary,
    borderRadius: 10,
    padding: 2,
  },
  lockIcon: { fontSize: 12 },
  iconText: { fontSize: 28 },
  name: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.text.primary,
    textAlign: 'center',
    marginBottom: 4,
  },
  nameLocked: { color: colors.text.secondary },
  description: {
    fontSize: 11,
    color: colors.text.secondary,
    textAlign: 'center',
    lineHeight: 16,
  },
});
