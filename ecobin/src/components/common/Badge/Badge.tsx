import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, spacing, typography } from '../../../theme';

interface BadgeProps {
  label: string;
  color?: string;
  size?: 'small' | 'medium';
}

export const Badge: React.FC<BadgeProps> = ({ label, color = colors.primary.main, size = 'medium' }) => {
  return (
    <View style={[styles.badge, { backgroundColor: color }, size === 'small' && styles.small]}>
      <Text style={[styles.text, size === 'small' && styles.smallText]}>{label}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  small: {
    paddingHorizontal: spacing.xs,
    paddingVertical: 2,
  },
  text: {
    ...typography.bodySmall,
    color: colors.text.inverse,
    fontWeight: '600',
  },
  smallText: {
    ...typography.caption,
  },
});
