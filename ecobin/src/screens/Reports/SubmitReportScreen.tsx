import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  Image,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import { colors, spacing } from '../../theme';
import { useAuth } from '../../context/AuthContext';
import { useReportStore } from '../../store/reportStore';
import { callSubmitWasteReport } from '../../services/functions';

export const SubmitReportScreen = ({ navigation }: any) => {
  const { user } = useAuth();
  const { addReport, submitting, setSubmitting } = useReportStore();
  const [description, setDescription] = useState('');
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [locationLoading, setLocationLoading] = useState(false);
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [city, setCity] = useState('');

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.7,
      base64: true,
    });
    if (!result.canceled && result.assets[0]) {
      setImageUri(result.assets[0].uri);
      setImageBase64(result.assets[0].base64 || null);
    }
  };

  const takePhoto = async () => {
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.7,
      base64: true,
    });
    if (!result.canceled && result.assets[0]) {
      setImageUri(result.assets[0].uri);
      setImageBase64(result.assets[0].base64 || null);
    }
  };

  const getLocation = async () => {
    setLocationLoading(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission denied', 'Location permission is required');
        return;
      }
      const loc = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Highest,
      });
      setCoords({ lat: loc.coords.latitude, lng: loc.coords.longitude });
      // Reverse geocode for city
      const [place] = await Location.reverseGeocodeAsync({
        latitude: loc.coords.latitude,
        longitude: loc.coords.longitude,
      });
      setCity(place?.city || place?.subregion || '');
      Alert.alert('Location set', `${place?.city || 'Location'} captured`);
    } catch (err) {
      Alert.alert('Error', 'Could not get location');
    } finally {
      setLocationLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!description.trim()) {
      Alert.alert('Missing info', 'Please add a description of the waste');
      return;
    }
    setSubmitting(true);
    try {
      let finalImageUrl = undefined;

      // 1. Upload to Cloudinary if image exists
      if (imageBase64) {
        const cloudName = process.env.EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME;
        const uploadPreset = process.env.EXPO_PUBLIC_CLOUDINARY_UPLOAD_PRESET;
        
        if (!cloudName || !uploadPreset) {
          Alert.alert('Configuration Error', 'Cloudinary variables are missing in .env');
          setSubmitting(false);
          return;
        }

        const dataUri = `data:image/jpeg;base64,${imageBase64}`;
        const formData = new FormData();
        formData.append('file', dataUri);
        formData.append('upload_preset', uploadPreset);
        formData.append('cloud_name', cloudName);

        const uploadRes = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
          method: 'POST',
          body: formData,
        });
        
        const uploadData = await uploadRes.json();
        
        if (!uploadRes.ok) {
          throw new Error(uploadData.error?.message || 'Failed to upload image to Cloudinary');
        }
        
        finalImageUrl = uploadData.secure_url;
      }

      // 2. Submit report with Cloudinary URL
      const res = await callSubmitWasteReport({
        imageUrl: finalImageUrl,
        description: description.trim(),
        locationLat: coords?.lat,
        locationLng: coords?.lng,
        city,
      });
      
      if (res.success) {
        Alert.alert('✅ Report submitted!', 'Thank you for helping keep your city clean.', [
          { text: 'OK', onPress: () => navigation.goBack() },
        ]);
      }
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to submit report');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Text style={styles.sectionTitle}>Photo</Text>
        {imageUri ? (
          <View>
            <Image source={{ uri: imageUri }} style={styles.preview} />
            <TouchableOpacity onPress={() => { setImageUri(null); setImageBase64(null); }}>
              <Text style={styles.removePhoto}>Remove photo</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.photoRow}>
            <TouchableOpacity style={styles.photoBtn} onPress={takePhoto}>
              <Text style={styles.photoIcon}>📷</Text>
              <Text style={styles.photoBtnText}>Camera</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.photoBtn} onPress={pickImage}>
              <Text style={styles.photoIcon}>🖼️</Text>
              <Text style={styles.photoBtnText}>Gallery</Text>
            </TouchableOpacity>
          </View>
        )}

        <Text style={styles.sectionTitle}>Description *</Text>
        <TextInput
          style={styles.textArea}
          value={description}
          onChangeText={setDescription}
          placeholder="Describe the waste situation (type, location details, urgency...)"
          placeholderTextColor={colors.text.secondary}
          multiline
          numberOfLines={4}
          textAlignVertical="top"
        />

        <Text style={styles.sectionTitle}>Location</Text>
        <TouchableOpacity style={styles.locationBtn} onPress={getLocation} disabled={locationLoading}>
          {locationLoading ? (
            <ActivityIndicator color={colors.primary.main} />
          ) : (
            <>
              <Text style={styles.locationIcon}>📍</Text>
              <Text style={styles.locationText}>
                {coords ? `${city || 'Location'} captured ✓` : 'Use my current location'}
              </Text>
            </>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.submitBtn, submitting && styles.submitBtnDisabled]}
          onPress={handleSubmit}
          disabled={submitting}
        >
          {submitting ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.submitText}>Submit Report</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.background.primary },
  content: { padding: spacing.md, paddingBottom: 40 },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.text.primary,
    marginBottom: spacing.sm,
    marginTop: spacing.md,
  },
  photoRow: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.sm,
  },
  photoBtn: {
    flex: 1,
    backgroundColor: colors.background.secondary,
    borderRadius: 12,
    padding: spacing.lg,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    borderStyle: 'dashed',
  },
  photoIcon: { fontSize: 28, marginBottom: 8 },
  photoBtnText: { fontSize: 13, color: colors.text.secondary, fontWeight: '600' },
  preview: {
    width: '100%',
    height: 200,
    borderRadius: 12,
    marginBottom: spacing.sm,
  },
  removePhoto: {
    color: '#EF4444',
    fontSize: 13,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  textArea: {
    backgroundColor: colors.background.secondary,
    borderRadius: 12,
    padding: spacing.md,
    fontSize: 14,
    color: colors.text.primary,
    borderWidth: 1,
    borderColor: colors.border,
    minHeight: 100,
    marginBottom: spacing.sm,
  },
  locationBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background.secondary,
    borderRadius: 12,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  locationIcon: { fontSize: 20 },
  locationText: { fontSize: 14, color: colors.text.primary, fontWeight: '500' },
  submitBtn: {
    backgroundColor: colors.primary.main,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: spacing.md,
  },
  submitBtnDisabled: { opacity: 0.6 },
  submitText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
