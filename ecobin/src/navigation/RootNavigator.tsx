import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuth } from '../context/AuthContext';
import { LoadingSkeleton } from '../components/LoadingSkeleton';
import TabNavigator from './TabNavigator';
import { SplashScreen } from '../screens/auth/SplashScreen';
import { AuthScreen } from '../screens/auth/AuthScreen';
import RegisterScreen from '../screens/auth/RegisterScreen';
import { ResultScreen } from '../screens/Scan/ResultScreen';
import { SubmitReportScreen } from '../screens/Reports/SubmitReportScreen';
import { colors } from '../theme';

const Stack = createNativeStackNavigator();

export const RootNavigator = () => {
  const { user, loading } = useAuth();

  if (loading) return <LoadingSkeleton lines={5} />;

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerStyle: { backgroundColor: colors.primary.main },
          headerTintColor: '#fff',
          headerTitleStyle: { fontWeight: '700' },
        }}
      >
        {user ? (
          // Authenticated
          <>
            <Stack.Screen
              name="Main"
              component={TabNavigator}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="Result"
              component={ResultScreen}
              options={{ headerTitle: 'Classification Result' }}
            />
            <Stack.Screen
              name="SubmitReport"
              component={SubmitReportScreen}
              options={{ headerTitle: 'Report Waste' }}
            />
          </>
        ) : (
          // Not authenticated
          <>
            <Stack.Screen
              name="Splash"
              component={SplashScreen}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="AuthStack"
              component={AuthScreen}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="Register"
              component={RegisterScreen}
              options={{ headerTitle: 'Create Account' }}
            />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};
