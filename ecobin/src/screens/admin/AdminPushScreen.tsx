import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, Alert } from 'react-native';
import { colors, spacing, typography } from '../../theme';
import { Button } from '../../components/common/Button/Button';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { getApp } from 'firebase/app';

export const AdminPushScreen = () => {
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [city, setCity] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    if (!title || !body) {
      Alert.alert('Error', 'Title and body are required');
      return;
    }

    setLoading(true);
    try {
      const functions = getFunctions(getApp());
      const sendPushNotification = httpsCallable(functions, 'sendPushNotification');
      const params: any = { title, body };
      if (city) params.city = city;
      
      const result = await sendPushNotification(params);
      Alert.alert('Success', 'Push notification sent! ' + JSON.stringify(result.data));
      setTitle('');
      setBody('');
      setCity('');
    } catch (e: any) {
      console.error(e);
      Alert.alert('Error', e.message);
    }
    setLoading(false);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Send Push Notification</Text>
      
      <TextInput
        style={styles.input}
        placeholder="Notification Title"
        value={title}
        onChangeText={setTitle}
      />
      <TextInput
        style={[styles.input, { height: 100 }]}
        placeholder="Notification Body"
        value={body}
        onChangeText={setBody}
        multiline
      />
      <TextInput
        style={styles.input}
        placeholder="Target City (optional)"
        value={city}
        onChangeText={setCity}
      />
      
      <Button 
        title={loading ? "Sending..." : "Send Notification"} 
        onPress={handleSend} 
        disabled={loading} 
        fullWidth 
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: spacing.md,
    backgroundColor: colors.background.secondary,
  },
  title: {
    ...typography.h2,
    marginTop: spacing.xl,
    marginBottom: spacing.lg,
  },
  input: {
    backgroundColor: colors.background.primary,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: spacing.md,
    marginBottom: spacing.md,
    ...typography.body,
  }
});
