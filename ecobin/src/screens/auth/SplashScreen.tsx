import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  Image,
} from 'react-native';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../../services/firebase';
import { colors } from '../../theme';

export const SplashScreen = ({ navigation }: any) => {
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        navigation.replace('Main');
      } else {
        navigation.replace('AuthStack');
      }
    });
    return unsubscribe;
  }, [navigation]);

  return (
    <View style={styles.container}>
      <Text style={styles.logo}>🌿</Text>
      <Text style={styles.title}>EcoBin</Text>
      <Text style={styles.subtitle}>Smart Garbage Segregation</Text>
      <ActivityIndicator
        size="large"
        color={colors.primary.main}
        style={styles.spinner}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: { fontSize: 80, marginBottom: 16 },
  title: {
    fontSize: 36,
    fontWeight: '800',
    color: colors.primary.main,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: colors.text.secondary,
    marginBottom: 48,
  },
  spinner: { marginTop: 16 },
});
