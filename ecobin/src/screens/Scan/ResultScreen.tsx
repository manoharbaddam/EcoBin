// src/screens/Scan/ResultScreen.tsx
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
} from 'react-native';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';

export const ResultScreen = ({ route, navigation }: any) => {
  /**
   * ================================
   * 1️⃣ NORMALIZE INPUT (KEY PART)
   * ================================
   */

  const params = route.params ?? {};

  // Case A: Gemini / MVP flow → { result }
  const classification =
    params.classification ??
    params.result ??
    null;

  // Case B: Backend flow → { scan }
  const scan =
    params.scan ??
    (classification?.imageUri
      ? { image_url: classification.imageUri }
      : null);

  const pointsEarned =
    params.pointsEarned ??
    classification?.pointsEarned ??
    0;

  const newAchievements =
    params.newAchievements ?? [];

  if (!classification) {
    return (
      <View style={styles.fallback}>
        <Text style={styles.fallbackText}>
          Unable to load scan result.
        </Text>
      </View>
    );
  }

  /**
   * ================================
   * 2️⃣ EXTRACT CLASSIFICATION DATA
   * ================================
   */

  const category = classification.category;
  const binType = category.binType;
  const confidence = classification.confidence;
  const instructions = classification.instructions || [];

  /**
   * ================================
   * 3️⃣ ACTIONS
   * ================================
   */

  const handleDone = () => {
    navigation.navigate('Home');
  };

  const handleScanAnother = () => {
    navigation.navigate('Scan');
  };

  /**
   * ================================
   * 4️⃣ UI
   * ================================
   */

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.successIcon}>✅</Text>
        <Text style={styles.title}>Item Classified!</Text>
        <Text style={styles.subtitle}>+{pointsEarned} points earned</Text>
      </View>

      {/* Image */}
      {scan?.image_url && (
        <View style={styles.imageContainer}>
          <Image source={{ uri: scan.image_url }} style={styles.image} />
        </View>
      )}

      {/* Category */}
      <View style={styles.card}>
        <View style={styles.categoryHeader}>
          <Text style={styles.categoryIcon}>{category.icon}</Text>
          <View>
            <Text style={styles.categoryLabel}>Category</Text>
            <Text style={styles.categoryName}>{category.name}</Text>
          </View>
        </View>

        <View style={styles.divider} />

        <Text style={styles.binTypeLabel}>Dispose in:</Text>
        <View
          style={[
            styles.binTypeBadge,
            { backgroundColor: binType.color + '20' },
          ]}
        >
          <View
            style={[styles.binTypeDot, { backgroundColor: binType.color }]}
          />
          <Text style={[styles.binTypeName, { color: binType.color }]}>
            {binType.name}
          </Text>
        </View>

        <Text style={styles.binTypeDescription}>
          {binType.description}
        </Text>
      </View>

      {/* Confidence */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Confidence Score</Text>
        <View style={styles.confidenceBar}>
          <View
            style={[
              styles.confidenceFill,
              {
                width: `${confidence * 100}%`,
                backgroundColor:
                  confidence > 0.8
                    ? colors.primary.main
                    : confidence > 0.6
                    ? '#F59E0B'
                    : '#EF4444',
              },
            ]}
          />
        </View>
        <Text style={styles.confidenceText}>
          {(confidence * 100).toFixed(1)}% confident
        </Text>
      </View>

      {/* Instructions */}
      {instructions.length > 0 && (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>📋 Disposal Instructions</Text>
          {instructions.map((instruction: string, index: number) => (
            <View key={index} style={styles.instructionItem}>
              <Text style={styles.instructionNumber}>{index + 1}</Text>
              <Text style={styles.instructionText}>{instruction}</Text>
            </View>
          ))}
        </View>
      )}

      {/* Achievements */}
      {newAchievements.length > 0 && (
        <View style={styles.achievementsCard}>
          <Text style={styles.achievementsTitle}>🎉 New Achievements!</Text>
          {newAchievements.map((a: any) => (
            <View key={a.id} style={styles.achievementItem}>
              <Text style={styles.achievementIcon}>{a.icon}</Text>
              <View>
                <Text style={styles.achievementName}>{a.name}</Text>
                <Text style={styles.achievementDescription}>
                  {a.description}
                </Text>
              </View>
            </View>
          ))}
        </View>
      )}

      {/* Actions */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={styles.primaryButton}
          onPress={handleScanAnother}
        >
          <Text style={styles.primaryButtonText}>Scan Another Item</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.secondaryButton}
          onPress={handleDone}
        >
          <Text style={styles.secondaryButtonText}>Done</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  header: {
    alignItems: 'center',
    padding: spacing.xl,
    backgroundColor: colors.primary.main,
  },
  successIcon: {
    fontSize: 64,
    marginBottom: spacing.md,
  },
  title: {
    fontSize: typography.sizes['2xl'],
    fontWeight: typography.weights.bold as any,
    color: colors.text.inverse,
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontSize: typography.sizes.md,
    color: colors.text.inverse,
    opacity: 0.9,
  },
  imageContainer: {
    margin: spacing.lg,
    borderRadius: 12,
    overflow: 'hidden',
    aspectRatio: 4 / 3,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  card: {
    margin: spacing.lg,
    marginTop: 0,
    padding: spacing.lg,
    backgroundColor: colors.background.secondary,
    borderRadius: 12,
  },
  categoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  categoryIcon: {
    fontSize: 48,
  },
  categoryInfo: {
    flex: 1,
  },
  categoryLabel: {
    fontSize: typography.sizes.sm,
    color: colors.text.secondary,
    marginBottom: spacing.xs,
  },
  categoryName: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.bold as any,
    color: colors.text.primary,
    textTransform: 'capitalize',
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: spacing.md,
  },
  binTypeContainer: {
    marginBottom: spacing.sm,
  },
  binTypeLabel: {
    fontSize: typography.sizes.sm,
    color: colors.text.secondary,
    marginBottom: spacing.xs,
  },
  binTypeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 20,
    gap: spacing.xs,
  },
  binTypeDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  binTypeName: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semibold as any,
    textTransform: 'capitalize',
  },
  binTypeDescription: {
    fontSize: typography.sizes.sm,
    color: colors.text.secondary,
    marginTop: spacing.sm,
    lineHeight: 20,
  },
  cardTitle: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold as any,
    color: colors.text.primary,
    marginBottom: spacing.md,
  },
  confidenceBar: {
    height: 12,
    backgroundColor: colors.background.primary,
    borderRadius: 6,
    overflow: 'hidden',
    marginBottom: spacing.sm,
  },
  confidenceFill: {
    height: '100%',
    borderRadius: 6,
  },
  confidenceText: {
    fontSize: typography.sizes.sm,
    color: colors.text.secondary,
    textAlign: 'center',
  },
  instructionItem: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.md,
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  instructionNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.primary.main,
    color: colors.text.inverse,
    textAlign: 'center',
    lineHeight: 24,
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.bold as any,
  },
  instructionText: {
    flex: 1,
    fontSize: typography.sizes.sm,
    color: colors.text.primary,
    lineHeight: 20,
  },
  achievementsCard: {
    margin: spacing.lg,
    marginTop: 0,
    padding: spacing.lg,
    backgroundColor: '#FEF3C7',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#F59E0B',
  },
  achievementsTitle: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold as any,
    color: '#92400E',
    marginBottom: spacing.md,
  },
  achievementItem: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.md,
    backgroundColor: 'white',
    padding: spacing.md,
    borderRadius: 8,
  },
  achievementIcon: {
    fontSize: 32,
  },
  achievementInfo: {
    flex: 1,
  },
  achievementName: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semibold as any,
    color: '#92400E',
    marginBottom: spacing.xs,
  },
  achievementDescription: {
    fontSize: typography.sizes.sm,
    color: '#78350F',
  },
  buttonContainer: {
    padding: spacing.lg,
    gap: spacing.md,
  },
  primaryButton: {
    backgroundColor: colors.primary.main,
    borderRadius: 12,
    padding: spacing.md,
    alignItems: 'center',
  },
  primaryButtonText: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semibold as any,
    color: colors.text.inverse,
  },
  secondaryButton: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    padding: spacing.md,
    alignItems: 'center',
  },
  secondaryButtonText: {
    fontSize: typography.sizes.md,
    color: colors.text.secondary,
  },
  fallback: {
  flex: 1,
  justifyContent: 'center',
  alignItems: 'center',
  backgroundColor: colors.background.primary,
  padding: spacing.lg,
},
fallbackText: {
  ...typography.body,
  color: colors.text.secondary,
  textAlign: 'center',
},
});
