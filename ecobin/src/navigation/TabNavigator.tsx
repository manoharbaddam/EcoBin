import React from 'react';
import { Text } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { HomeScreen } from '../screens/Home/HomeScreen';
import { ScanStack } from './ScanStack';
import { EducationScreen } from '../screens/Education/EducationScreen';
import  {ProfileScreen} from '../screens/Profile/ProfileScreen';
import { colors } from '../theme';

const Tab = createBottomTabNavigator();

export default function TabNavigator(){
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
          height: 60,
        },
        headerStyle: {
          backgroundColor: colors.primary.main,
        },
        headerTintColor: colors.text.inverse,
        headerTitleStyle: {
          fontWeight: '600',
        },
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 24 }}>🏠</Text>,
          headerTitle: 'EcoBin',
        }}
      />
       <Tab.Screen
        name="Scan"
        component={ScanStack}
        options={{
          tabBarIcon: () => <Text style={{ fontSize: 24 }}>📷</Text>,
          headerTitle: 'Scan Waste',
        }}
      />
      <Tab.Screen
        name="Education"
        component={EducationScreen}
        options={{
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 24 }}>📚</Text>,
          headerTitle: 'Learn',
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 24 }}>👤</Text>,
          headerTitle: 'Profile',
        }}
      />
    </Tab.Navigator>
  );
};
