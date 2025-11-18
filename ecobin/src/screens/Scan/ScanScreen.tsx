import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, Image } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import { colors, spacing, typography } from '../../theme';
import { Button } from '../../components/common/Button/Button';
import { LoadingSpinner } from '../../components/common/Loading/LoadingSpinner';
//import { classificationService } from '../../services/mock/classificationService';
import { userService } from '../../services/mock/userService';
import { classificationService } from '../../services/gemini/classificationService';


export const ScanScreen = ({ navigation }: any) => {
  const [permission, requestPermission] = useCameraPermissions();
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [isClassifying, setIsClassifying] = useState(false);

  const handleTakePicture = async () => {
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setCapturedImage(result.assets[0].uri);
    }
  };

  const handlePickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setCapturedImage(result.assets[0].uri);
    }
  };

  const handleClassify = async () => {
    if (!capturedImage) return;

    setIsClassifying(true);
    try {
      const result = await classificationService.classify(capturedImage);
      classificationService.addSession(result);
      userService.updatePoints(result.pointsEarned);
      userService.incrementScans(result.category.id);

      navigation.navigate('Result', { result });
    } catch (error) {
      Alert.alert('Error', 'Failed to classify image. Please try again.');
    } finally {
      setIsClassifying(false);
      setCapturedImage(null);
    }
  };

  const handleRetake = () => {
    setCapturedImage(null);
  };

  if (!permission) {
    return <LoadingSpinner message="Loading camera..." />;
  }

  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <View style={styles.permissionContainer}>
          <Text style={styles.title}>Camera Permission Required</Text>
          <Text style={styles.subtitle}>
            We need access to your camera to scan waste items
          </Text>
          <Button title="Grant Permission" onPress={requestPermission} fullWidth />
        </View>
      </View>
    );
  }

  if (isClassifying) {
    return <LoadingSpinner message="Analyzing your waste..." />;
  }

  if (capturedImage) {
    return (
      <View style={styles.container}>
        <Image source={{ uri: capturedImage }} style={styles.preview} />
        <View style={styles.previewActions}>
          <Button title="Retake" onPress={handleRetake} variant="outline" />
          <Button title="Classify" onPress={handleClassify} />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.cameraContainer}>
        <View style={styles.placeholder}>
          <Text style={styles.placeholderText}>📷</Text>
          <Text style={styles.placeholderSubtext}>
            Point your camera at waste to classify
          </Text>
        </View>
      </View>

      <View style={styles.actions}>
        <View style={styles.instructions}>
          <Text style={styles.instructionsTitle}>How to scan:</Text>
          <Text style={styles.instructionsText}>• Place the item on a plain background</Text>
          <Text style={styles.instructionsText}>• Ensure good lighting</Text>
          <Text style={styles.instructionsText}>• Take a clear photo</Text>
        </View>

        <View style={styles.buttonContainer}>
          <Button title="Take Photo" onPress={handleTakePicture} fullWidth />
          <Button title="Choose from Gallery" onPress={handlePickImage} variant="outline" fullWidth />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  permissionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  title: {
    ...typography.h3,
    color: colors.text.primary,
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  subtitle: {
    ...typography.body,
    color: colors.text.secondary,
    textAlign: 'center',
    marginBottom: spacing.xl,
  },
  cameraContainer: {
    flex: 1,
    backgroundColor: colors.background.secondary,
  },
  placeholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  placeholderText: {
    fontSize: 80,
    marginBottom: spacing.md,
  },
  placeholderSubtext: {
    ...typography.body,
    color: colors.text.secondary,
    textAlign: 'center',
  },
  preview: {
    flex: 1,
    resizeMode: 'contain',
  },
  previewActions: {
    flexDirection: 'row',
    gap: spacing.md,
    padding: spacing.md,
  },
  actions: {
    padding: spacing.md,
    backgroundColor: colors.background.primary,
  },
  instructions: {
    backgroundColor: colors.background.secondary,
    padding: spacing.md,
    borderRadius: 12,
    marginBottom: spacing.md,
  },
  instructionsTitle: {
    ...typography.body,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: spacing.sm,
  },
  instructionsText: {
    ...typography.bodySmall,
    color: colors.text.secondary,
    marginBottom: spacing.xs,
  },
  buttonContainer: {
    gap: spacing.sm,
  },
});
