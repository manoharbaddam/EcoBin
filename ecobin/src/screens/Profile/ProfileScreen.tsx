import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { colors, spacing, typography } from '../../theme';
import { Card } from '../../components/common/Card/Card';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../services/firebase';
import { doc, onSnapshot } from 'firebase/firestore';
import { callSyncUserProfile, callGetAllBadges } from '../../services/functions';
import { LoadingSkeleton } from '../../components/LoadingSkeleton';
import { GuestBanner } from '../../components/GuestBanner';
import { BadgeCard } from '../../components/BadgeCard';
import { Badge } from '../../types';

export const ProfileScreen = ({ navigation }: any) => {
  const { signOut, user: authUser, isAnonymous } = useAuth();
  const [userData, setUserData] = useState<any>(null);
  const [allBadges, setAllBadges] = useState<Badge[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingCity, setSavingCity] = useState(false);

  // Predefined cities for the MVP
  const CITIES = ['San Francisco', 'New York', 'London', 'Tokyo', 'Berlin'];

  useEffect(() => {
    // Load badges once
    callGetAllBadges()
      .then(res => { if (res.success) setAllBadges(res.data); })
      .catch(err => console.error('Failed to load badges:', err));

    if (!authUser || isAnonymous) {
      setLoading(false);
      return;
    }

    // Listen to current user document
    const unsub = onSnapshot(doc(db, 'users', authUser.uid), (docSnap) => {
      if (docSnap.exists()) {
        setUserData(docSnap.data());
      }
      setLoading(false);
    });

    return () => unsub();
  }, [authUser, isAnonymous]);

  const handleLogout = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Logout failed', error);
    }
  };

  const handleCitySelect = async (city: string) => {
    if (savingCity) return;
    setSavingCity(true);
    try {
      await callSyncUserProfile({ city });
    } catch (err) {
      console.error('Failed to update city:', err);
    } finally {
      setSavingCity(false);
    }
  };

  if (loading) return <LoadingSkeleton lines={5} />;

  const earnedBadgeIds = userData?.badges || [];

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {isAnonymous && (
        <GuestBanner onSignUp={() => navigation.navigate('AuthStack')} />
      )}

      {/* PROFILE CARD */}
      <Card style={styles.profileCard}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {userData?.displayName ? userData.displayName.charAt(0).toUpperCase() : 'U'}
          </Text>
        </View>
        <Text style={styles.name}>{userData?.displayName || 'Guest User'}</Text>
        <Text style={styles.email}>{userData?.email || 'Anonymous'}</Text>
        
        <View style={styles.statsRow}>
          <View style={styles.statBox}>
            <Text style={styles.pointsText}>{userData?.totalPoints || 0}</Text>
            <Text style={styles.pointsLabel}>Total Points</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.pointsText}>{userData?.totalScans || 0}</Text>
            <Text style={styles.pointsLabel}>Total Scans</Text>
          </View>
        </View>
      </Card>

      {/* CITY SELECTOR */}
      {!isAnonymous && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Your City</Text>
          <Text style={styles.sectionSubtitle}>Select your city to join local leaderboards.</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.cityScroll}>
            {CITIES.map(c => (
              <TouchableOpacity
                key={c}
                style={[styles.cityChip, userData?.city === c && styles.cityChipActive]}
                onPress={() => handleCitySelect(c)}
                disabled={savingCity}
              >
                <Text style={[styles.cityChipText, userData?.city === c && styles.cityChipTextActive]}>
                  {c}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}

      {/* BADGES */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Badges</Text>
        {allBadges.length === 0 ? (
          <Text style={styles.badgeDate}>No badges loaded.</Text>
        ) : (
          <View style={styles.badgesGrid}>
            {allBadges.map((badge) => (
              <BadgeCard
                key={badge.id}
                badge={badge}
                earned={earnedBadgeIds.includes(badge.id)}
              />
            ))}
          </View>
        )}
      </View>

      {/* LOGOUT */}
      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.secondary,
  },
  content: {
    padding: spacing.md,
  },
  profileCard: {
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.primary.main,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  avatarText: {
    ...typography.h1,
    color: colors.text.inverse,
  },
  name: {
    ...typography.h3,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  email: {
    ...typography.body,
    color: colors.text.secondary,
    marginBottom: spacing.md,
  },
  pointsText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.primary.main,
  },
  pointsLabel: {
    ...typography.bodySmall,
    color: colors.text.secondary,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginTop: spacing.sm,
  },
  statBox: { alignItems: 'center' },
  section: {
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    ...typography.h4,
    color: colors.text.primary,
    marginBottom: spacing.md,
  },
  sectionSubtitle: { fontSize: 13, color: colors.text.secondary, marginBottom: spacing.sm },
  cityScroll: { flexDirection: 'row', marginBottom: spacing.md },
  cityChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: colors.background.primary,
    borderWidth: 1,
    borderColor: colors.border,
    marginRight: spacing.sm,
  },
  cityChipActive: { backgroundColor: colors.primary.main, borderColor: colors.primary.main },
  cityChipText: { color: colors.text.primary, fontWeight: '600' },
  cityChipTextActive: { color: '#fff' },
  badgesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  badgeDate: {
    ...typography.caption,
    color: colors.text.secondary,
  },
  logoutButton: {
    marginTop: spacing.xl,
    backgroundColor: '#EF4444',
    padding: spacing.md,
    borderRadius: 12,
    alignItems: 'center',
  },
  logoutText: {
    color: colors.text.inverse,
    fontSize: typography.sizes.md,
    fontWeight: '600',
  },
});
