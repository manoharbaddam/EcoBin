import React from 'react';
import { Text } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { HomeScreen } from '../screens/Home/HomeScreen';
import { ScanStack } from './ScanStack';
import { EducationScreen } from '../screens/Education/EducationScreen';
import { ProfileScreen } from '../screens/Profile/ProfileScreen';
import { GamificationScreen } from '../screens/Gamification/GamificationScreen';
import { ReportsScreen } from '../screens/Reports/ReportsScreen';
import { colors } from '../theme';

const Tab = createBottomTabNavigator();

export default function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: colors.primary.main,
        tabBarInactiveTintColor: colors.text.secondary,
        tabBarStyle: {
          backgroundColor: colors.background.primary,
          borderTopColor: colors.divider,
          paddingTop: 8,
          paddingBottom: 8,
          height: 64,
        },
        headerStyle: { backgroundColor: colors.primary.main },
        headerTintColor: '#fff',
        headerTitleStyle: { fontWeight: '700' },
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarIcon: () => <Text style={{ fontSize: 22 }}>🏠</Text>,
          headerTitle: 'EcoBin',
        }}
      />
      <Tab.Screen
        name="ScanTab"
        component={ScanStack}
        options={{
          tabBarLabel: 'Scan',
          tabBarIcon: () => <Text style={{ fontSize: 22 }}>📷</Text>,
          headerTitle: 'Scan Waste',
        }}
      />
      <Tab.Screen
        name="Gamification"
        component={GamificationScreen}
        options={{
          tabBarLabel: 'Rewards',
          tabBarIcon: () => <Text style={{ fontSize: 22 }}>🏆</Text>,
          headerTitle: 'Rewards',
        }}
      />
      <Tab.Screen
        name="Education"
        component={EducationScreen}
        options={{
          tabBarIcon: () => <Text style={{ fontSize: 22 }}>📚</Text>,
          headerTitle: 'Learn',
        }}
      />
      <Tab.Screen
        name="Reports"
        component={ReportsScreen}
        options={{
          tabBarIcon: () => <Text style={{ fontSize: 22 }}>📋</Text>,
          headerTitle: 'Reports',
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarIcon: () => <Text style={{ fontSize: 22 }}>👤</Text>,
          headerTitle: 'Profile',
        }}
      />
    </Tab.Navigator>
  );
}
