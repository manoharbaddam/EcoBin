import React from 'react';
import { View, ActivityIndicator } from 'react-native';
import { useAuth } from '../context/AuthContext';
import AuthStack from './AuthStack';
import AppTabs from './TabNavigator';
import AdminTabs from './AdminTabs';

export default function AuthGate() {
  const { user, loading, isAdmin } = useAuth();

  if (loading) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (user) {
    return isAdmin ? <AdminTabs /> : <AppTabs />;
  }

  return <AuthStack />;
}
