import React, { useEffect } from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { colors, spacing } from '../theme';

interface SkeletonBoxProps {
  width?: number | string;
  height?: number;
  borderRadius?: number;
  style?: object;
}

const SkeletonBox: React.FC<SkeletonBoxProps> = ({
  width = '100%',
  height = 16,
  borderRadius = 8,
  style,
}) => {
  const opacity = React.useRef(new Animated.Value(0.4)).current;

  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 700,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.4,
          duration: 700,
          useNativeDriver: true,
        }),
      ])
    );
    pulse.start();
    return () => pulse.stop();
  }, [opacity]);

  return (
    <Animated.View
      style={[
        styles.skeleton,
        { width: width as any, height, borderRadius, opacity },
        style,
      ]}
    />
  );
};

export const LoadingSkeleton: React.FC<{ lines?: number }> = ({ lines = 4 }) => {
  return (
    <View style={styles.container}>
      <SkeletonBox height={48} borderRadius={12} style={styles.mb} />
      {Array.from({ length: lines }).map((_, i) => (
        <View key={i} style={styles.mb}>
          <SkeletonBox height={20} width="80%" style={styles.mbSm} />
          <SkeletonBox height={12} width="60%" />
        </View>
      ))}
    </View>
  );
};

export const ScanResultSkeleton: React.FC = () => (
  <View style={styles.container}>
    <SkeletonBox height={64} borderRadius={16} style={styles.mb} />
    <SkeletonBox height={24} width="60%" style={styles.mb} />
    <SkeletonBox height={80} borderRadius={12} style={styles.mb} />
    <SkeletonBox height={120} borderRadius={12} style={styles.mb} />
  </View>
);

const styles = StyleSheet.create({
  container: { padding: spacing.md },
  skeleton: { backgroundColor: colors.background.secondary },
  mb: { marginBottom: spacing.md },
  mbSm: { marginBottom: spacing.sm },
});
