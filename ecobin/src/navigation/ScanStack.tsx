import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ScanScreen } from '../screens/Scan/ScanScreen';
import { ResultScreen } from '../screens/Scan/ResultScreen';

export type ScanStackParamList = {
  Scan: undefined;
  Result: {
    result: any;
  };
};

const Stack = createNativeStackNavigator<ScanStackParamList>();

export const ScanStack = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Scan" component={ScanScreen} />
      <Stack.Screen name="Result" component={ResultScreen} />
    </Stack.Navigator>
  );
};
