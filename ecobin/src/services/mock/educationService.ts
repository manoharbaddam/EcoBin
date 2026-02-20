import { EducationContent } from '../../types';

const educationData: EducationContent[] = [
  {
    id: '1',
    title: 'Recyclable Materials',
    category: 'recyclable',
    description: 'Learn about what can be recycled and how to properly prepare materials for recycling.',
    tips: [
      'Rinse food containers before recycling',
      'Remove caps from plastic bottles',
      'Flatten cardboard boxes to save space',
      'Check local recycling guidelines',
    ],
    didYouKnow: 'Recycling one aluminum can saves enough energy to run a TV for 3 hours!',
    icon: '♻️',
  },
  {
    id: '2',
    title: 'Organic Waste',
    category: 'organic',
    description: 'Composting organic waste reduces methane emissions and creates nutrient-rich soil.',
    tips: [
      'Keep a small compost bin in your kitchen',
      'Include fruit and vegetable scraps',
      'Coffee grounds and tea bags are compostable',
      'Avoid meat, dairy, and oily foods',
    ],
    didYouKnow: 'Composting can reduce your household waste by up to 30%!',
    icon: '🌱',
  },
  {
    id: '3',
    title: 'Hazardous Waste',
    category: 'hazardous',
    description: 'Proper disposal of hazardous materials protects the environment and public health.',
    tips: [
      'Never pour chemicals down drains',
      'Take batteries to special collection points',
      'Store hazardous materials safely',
      'Check local hazardous waste disposal days',
    ],
    didYouKnow: 'A single battery can contaminate up to 600,000 liters of water!',
    icon: '⚠️',
  },
  {
    id: '4',
    title: 'Reducing General Waste',
    category: 'general',
    description: 'Minimize general waste by reducing, reusing, and making conscious choices.',
    tips: [
      'Choose products with minimal packaging',
      'Bring reusable bags when shopping',
      'Repair items instead of throwing them away',
      'Donate items you no longer need',
    ],
    didYouKnow: 'The average person generates 4.5 pounds of trash per day!',
    icon: '🗑️',
  },
];

const getEducationContent = async (): Promise<EducationContent[]> => {
  return educationData;
};

const getContentByCategory = async (category: string): Promise<EducationContent | undefined> => {
  return educationData.find(content => content.category === category);
};

export const educationService = {
  getEducationContent,
  getContentByCategory,
};
