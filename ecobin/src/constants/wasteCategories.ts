import { WasteCategory } from '../types';

export const CATEGORY_CONFIG: Record<
  WasteCategory,
  { color: string; icon: string; label: string; points: number }
> = {
  recyclable: {
    color: '#22C55E',
    icon: '♻️',
    label: 'Recyclable',
    points: 20,
  },
  'non-recyclable': {
    color: '#6B7280',
    icon: '🗑️',
    label: 'Non-Recyclable',
    points: 10,
  },
  hazardous: {
    color: '#EF4444',
    icon: '⚠️',
    label: 'Hazardous',
    points: 30,
  },
  organic: {
    color: '#84CC16',
    icon: '🌱',
    label: 'Organic',
    points: 10,
  },
  'e-waste': {
    color: '#F59E0B',
    icon: '💻',
    label: 'E-Waste',
    points: 25,
  },
};
