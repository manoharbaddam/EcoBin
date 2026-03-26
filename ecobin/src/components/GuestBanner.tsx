import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { colors, spacing } from '../theme';

interface GuestBannerProps {
  onSignUp: () => void;
}

export const GuestBanner: React.FC<GuestBannerProps> = ({ onSignUp }) => (
  <View style={styles.banner}>
    <Text style={styles.emoji}>👤</Text>
    <View style={styles.textBlock}>
      <Text style={styles.title}>You're browsing as a guest</Text>
      <Text style={styles.subtitle}>Create a free account to save progress & join leaderboards</Text>
    </View>
    <TouchableOpacity style={styles.button} onPress={onSignUp}>
      <Text style={styles.buttonText}>Sign Up</Text>
    </TouchableOpacity>
  </View>
);

const styles = StyleSheet.create({
  banner: {
    backgroundColor: colors.primary.main + '15',
    borderColor: colors.primary.main,
    borderWidth: 1,
    borderRadius: 12,
    padding: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
    gap: spacing.sm,
  },
  emoji: { fontSize: 24 },
  textBlock: { flex: 1 },
  title: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.text.primary,
    marginBottom: 2,
  },
  subtitle: {
    fontSize: 11,
    color: colors.text.secondary,
    lineHeight: 15,
  },
  button: {
    backgroundColor: colors.primary.main,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  buttonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
  },
});
