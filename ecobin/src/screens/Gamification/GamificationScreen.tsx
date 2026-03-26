import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Animated,
  FlatList,
} from 'react-native';
import { colors, spacing } from '../../theme';
import { BadgeCard } from '../../components/BadgeCard';
import { GuestBanner } from '../../components/GuestBanner';
import { LoadingSkeleton } from '../../components/LoadingSkeleton';
import { useAuth } from '../../context/AuthContext';
import { callGetGamificationProfile, callGetAllBadges, callGetLeaderboard } from '../../services/functions';
import { Badge, LeaderboardEntry } from '../../types';

export const GamificationScreen = ({ navigation }: any) => {
  const { user, isAnonymous } = useAuth();
  const [totalPoints, setTotalPoints] = useState(0);
  const [earnedBadgeIds, setEarnedBadgeIds] = useState<string[]>([]);
  const [allBadges, setAllBadges] = useState<Badge[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [currentUser, setCurrentUser] = useState<LeaderboardEntry | null>(null);
  const [city, setCity] = useState('');
  const [loading, setLoading] = useState(true);

  const pointsAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!user) return;
    loadData();
  }, [user]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [profileRes, badgesRes] = await Promise.all([
        callGetGamificationProfile(),
        callGetAllBadges(),
      ]);

      if (profileRes.success) {
        const pts = profileRes.data.totalPoints;
        setTotalPoints(pts);
        setEarnedBadgeIds(profileRes.data.badges || []);
        setCity(profileRes.data.city || '');

        // Animate points counter
        Animated.timing(pointsAnim, {
          toValue: pts,
          duration: 1200,
          useNativeDriver: false,
        }).start();

        // Load leaderboard if city set and not anonymous
        if (profileRes.data.city && !isAnonymous) {
          const lbRes = await callGetLeaderboard(profileRes.data.city);
          if (lbRes.success) {
            setLeaderboard(lbRes.data.leaderboard);
            setCurrentUser(lbRes.data.currentUser);
          }
        }
      }

      if (badgesRes.success) {
        setAllBadges(badgesRes.data);
      }
    } catch (err) {
      console.error('GamificationScreen load error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingSkeleton lines={5} />;

  const pointsDisplay = pointsAnim.interpolate({
    inputRange: [0, totalPoints || 1],
    outputRange: [0, totalPoints || 0],
  });

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {isAnonymous && (
        <GuestBanner onSignUp={() => navigation.navigate('AuthStack')} />
      )}

      {/* Points Counter */}
      <View style={styles.pointsCard}>
        <Text style={styles.pointsLabel}>Your Total Points</Text>
        <Animated.Text style={styles.pointsValue}>
          {pointsAnim.interpolate
            ? String(Math.round(totalPoints))
            : totalPoints}
        </Animated.Text>
        <Text style={styles.pointsSubLabel}>⭐ Keep scanning to earn more!</Text>
      </View>

      {/* Badge Grid */}
      <Text style={styles.sectionTitle}>Badges</Text>
      {allBadges.length === 0 ? (
        <Text style={styles.emptyText}>No badges defined yet. Run seedData to populate.</Text>
      ) : (
        <View style={styles.badgeGrid}>
          {allBadges.map((badge) => (
            <BadgeCard
              key={badge.id}
              badge={badge}
              earned={earnedBadgeIds.includes(badge.id)}
            />
          ))}
        </View>
      )}

      {/* Leaderboard */}
      {!isAnonymous && leaderboard.length > 0 && (
        <>
          <Text style={styles.sectionTitle}>
            City Leaderboard{city ? ` — ${city}` : ''}
          </Text>
          {leaderboard.map((entry) => {
            const isSelf = entry.id === user?.uid;
            return (
              <View
                key={entry.id}
                style={[styles.leaderboardRow, isSelf && styles.selfRow]}
              >
                <Text style={styles.rank}>
                  {entry.rank === 1 ? '🥇' : entry.rank === 2 ? '🥈' : entry.rank === 3 ? '🥉' : `#${entry.rank}`}
                </Text>
                <Text style={styles.lbName} numberOfLines={1}>
                  {entry.displayName}
                  {isSelf ? ' (You)' : ''}
                </Text>
                <Text style={styles.lbPoints}>{entry.totalPoints} pts</Text>
              </View>
            );
          })}
          {currentUser && currentUser.rank > leaderboard.length && (
            <>
              <View style={styles.separator} />
              <View style={[styles.leaderboardRow, styles.selfRow]}>
                <Text style={styles.rank}>#{currentUser.rank}</Text>
                <Text style={styles.lbName}>{currentUser.displayName} (You)</Text>
                <Text style={styles.lbPoints}>{currentUser.totalPoints} pts</Text>
              </View>
            </>
          )}
        </>
      )}

      {!isAnonymous && !city && (
        <View style={styles.noCityBox}>
          <Text style={styles.noCityText}>
            Set your city in Profile to join the city leaderboard! 🏙️
          </Text>
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background.secondary },
  content: { padding: spacing.md, paddingBottom: 40 },
  pointsCard: {
    backgroundColor: colors.primary.main,
    borderRadius: 20,
    padding: spacing.xl,
    alignItems: 'center',
    marginBottom: spacing.lg,
    shadowColor: colors.primary.main,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  pointsLabel: { color: 'rgba(255,255,255,0.8)', fontSize: 14, fontWeight: '600', marginBottom: 8 },
  pointsValue: { color: '#fff', fontSize: 56, fontWeight: '900', marginBottom: 4 },
  pointsSubLabel: { color: 'rgba(255,255,255,0.8)', fontSize: 13 },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text.primary,
    marginBottom: spacing.md,
    marginTop: spacing.sm,
  },
  badgeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: spacing.lg,
  },
  leaderboardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background.primary,
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  selfRow: {
    borderWidth: 2,
    borderColor: colors.primary.main,
  },
  rank: { width: 36, fontSize: 18, fontWeight: '700', color: colors.text.secondary },
  lbName: { flex: 1, fontSize: 14, fontWeight: '600', color: colors.text.primary },
  lbPoints: { fontSize: 14, fontWeight: '700', color: colors.primary.main },
  separator: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: 8,
    marginHorizontal: 8,
  },
  noCityBox: {
    backgroundColor: colors.background.primary,
    borderRadius: 12,
    padding: spacing.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    borderStyle: 'dashed',
  },
  noCityText: { color: colors.text.secondary, fontSize: 14, textAlign: 'center' },
  emptyText: { color: colors.text.secondary, fontSize: 14, textAlign: 'center', marginBottom: spacing.lg },
});
