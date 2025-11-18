import { WasteCategory } from '../types';

export const WASTE_CATEGORIES: WasteCategory[] = [
  {
    id: 'recyclable',
    name: 'Recyclable',
    description: 'Materials that can be processed and reused',
    icon: '♻️',
    binType: {
      id: 'blue',
      name: 'Blue Bin',
      color: '#3B82F6',
      description: 'For recyclable materials',
      instructions: [
        'Rinse containers before disposing',
        'Remove caps and labels when possible',
        'Flatten cardboard boxes',
        'Keep materials dry',
      ],
    },
  },
  {
    id: 'organic',
    name: 'Organic',
    description: 'Biodegradable waste from plants and food',
    icon: '🌱',
    binType: {
      id: 'green',
      name: 'Green Bin',
      color: '#10B981',
      description: 'For organic and compostable waste',
      instructions: [
        'No plastic bags',
        'Food scraps and plant waste only',
        'No meat or dairy in some areas',
        'Keep bin covered to avoid pests',
      ],
    },
  },
  {
    id: 'hazardous',
    name: 'Hazardous',
    description: 'Toxic or dangerous materials',
    icon: '⚠️',
    binType: {
      id: 'red',
      name: 'Red Bin',
      color: '#EF4444',
      description: 'For hazardous waste',
      instructions: [
        'Never mix with other waste',
        'Keep in original containers when possible',
        'Store in cool, dry place',
        'Contact hazardous waste facility',
      ],
    },
  },
  {
    id: 'general',
    name: 'General',
    description: 'Non-recyclable, non-hazardous waste',
    icon: '🗑️',
    binType: {
      id: 'gray',
      name: 'Gray Bin',
      color: '#6B7280',
      description: 'For general waste',
      instructions: [
        'Use for items that cannot be recycled',
        'Bag waste before disposal',
        'Do not overfill',
        'Double-check if item can be recycled',
      ],
    },
  },
];
