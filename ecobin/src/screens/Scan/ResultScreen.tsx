import React from 'react';
import { View, Text, StyleSheet, Image, ScrollView } from 'react-native';
import { colors, spacing, typography } from '../../theme';
import { Card } from '../../components/common/Card/Card';
import { Button } from '../../components/common/Button/Button';
import { Badge } from '../../components/common/Badge/Badge';
import { ClassificationResult } from '../../types';

export const ResultScreen = ({ route, navigation }: any) => {
  const { result } = route.params as { result: ClassificationResult };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Card style={styles.imageCard}>
        <Image source={{ uri: result.imageUri }} style={styles.image} />
      </Card>

      <View style={styles.resultHeader}>
        <Text style={styles.emoji}>{result.category.icon}</Text>
        <Text style={styles.categoryName}>{result.category.name}</Text>
        <Text style={styles.confidence}>
          {Math.round(result.confidence * 100)}% confident
        </Text>
      </View>

      <Card style={styles.pointsCard}>
        <View style={styles.pointsContent}>
          <Text style={styles.pointsLabel}>Points Earned</Text>
          <Text style={styles.pointsValue}>+{result.pointsEarned}</Text>
        </View>
      </Card>

      <Card style={styles.binCard}>
        <View style={styles.binHeader}>
          <Text style={styles.binTitle}>Dispose in:</Text>
          <Badge 
            label={result.category.binType.name} 
            color={result.category.binType.color} 
          />
        </View>
        <Text style={styles.binDescription}>
          {result.category.binType.description}
        </Text>
      </Card>

      <Card style={styles.instructionsCard}>
        <Text style={styles.instructionsTitle}>Disposal Instructions</Text>
        {result.instructions.map((instruction, index) => (
          <View key={index} style={styles.instructionItem}>
            <Text style={styles.bullet}>•</Text>
            <Text style={styles.instructionText}>{instruction}</Text>
          </View>
        ))}
      </Card>

      <View style={styles.actions}>
        <Button
          title="Scan Another"
          onPress={() => navigation.navigate('Main', { screen: 'Scan' })}
          fullWidth
        />
        <Button
          title="Back to Home"
          onPress={() => navigation.navigate('Main', { screen: 'Home' })}
          variant="outline"
          fullWidth
        />
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
  imageCard: {
    marginBottom: spacing.md,
    padding: 0,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: 200,
    resizeMode: 'cover',
  },
  resultHeader: {
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  emoji: {
    fontSize: 64,
    marginBottom: spacing.sm,
  },
  categoryName: {
    ...typography.h2,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  confidence: {
    ...typography.body,
    color: colors.text.secondary,
  },
  pointsCard: {
    backgroundColor: colors.primary.main,
    marginBottom: spacing.md,
  },
  pointsContent: {
    alignItems: 'center',
  },
  pointsLabel: {
    ...typography.body,
    color: colors.text.inverse,
    marginBottom: spacing.xs,
  },
  pointsValue: {
    ...typography.h1,
    color: colors.text.inverse,
  },
  binCard: {
    marginBottom: spacing.md,
  },
  binHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  binTitle: {
    ...typography.h4,
    color: colors.text.primary,
  },
  binDescription: {
    ...typography.body,
    color: colors.text.secondary,
  },
  instructionsCard: {
    marginBottom: spacing.md,
  },
  instructionsTitle: {
    ...typography.h4,
    color: colors.text.primary,
    marginBottom: spacing.md,
  },
  instructionItem: {
    flexDirection: 'row',
    marginBottom: spacing.sm,
  },
  bullet: {
    ...typography.body,
    color: colors.primary.main,
    marginRight: spacing.sm,
  },
  instructionText: {
    ...typography.body,
    color: colors.text.primary,
    flex: 1,
  },
  actions: {
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
});
