import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { WasteCategory } from '../types';
import { CATEGORY_CONFIG } from '../constants/wasteCategories';

interface CategoryBadgeProps {
  category: WasteCategory;
  size?: 'sm' | 'md' | 'lg';
}

export const CategoryBadge: React.FC<CategoryBadgeProps> = ({ category, size = 'md' }) => {
  const config = CATEGORY_CONFIG[category] ?? CATEGORY_CONFIG['non-recyclable'];
  const isLg = size === 'lg';
  const isSm = size === 'sm';

  return (
    <View
      style={[
        styles.badge,
        { backgroundColor: config.color + '20', borderColor: config.color },
        isLg && styles.badgeLg,
        isSm && styles.badgeSm,
      ]}
    >
      <Text style={[styles.icon, isLg && styles.iconLg, isSm && styles.iconSm]}>
        {config.icon}
      </Text>
      <Text
        style={[
          styles.label,
          { color: config.color },
          isLg && styles.labelLg,
          isSm && styles.labelSm,
        ]}
      >
        {config.label}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    gap: 6,
    alignSelf: 'flex-start',
  },
  badgeLg: {
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  badgeSm: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  icon: { fontSize: 16 },
  iconLg: { fontSize: 22 },
  iconSm: { fontSize: 12 },
  label: { fontSize: 14, fontWeight: '700' },
  labelLg: { fontSize: 18 },
  labelSm: { fontSize: 11 },
});
