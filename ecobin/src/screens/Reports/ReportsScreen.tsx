import React, { useState, useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
} from 'react-native';
import { colors, spacing } from '../../theme';
import { GuestBanner } from '../../components/GuestBanner';
import { LoadingSkeleton } from '../../components/LoadingSkeleton';
import { useAuth } from '../../context/AuthContext';
import { useReportStore } from '../../store/reportStore';
import { callGetUserReports } from '../../services/functions';
import { WasteReport } from '../../types';

const STATUS_CONFIG = {
  pending: { color: '#F59E0B', label: 'Pending', icon: '⏳' },
  in_review: { color: '#3B82F6', label: 'In Review', icon: '🔍' },
  resolved: { color: '#22C55E', label: 'Resolved', icon: '✅' },
};

export const ReportsScreen = ({ navigation }: any) => {
  const { user, isAnonymous } = useAuth();
  const { userReports, setReports } = useReportStore();
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      if (!user || isAnonymous) {
        setLoading(false);
        return;
      }
      loadReports();
    }, [user, isAnonymous])
  );

  const loadReports = async () => {
    try {
      const res = await callGetUserReports();
      if (res.success) setReports(res.data);
    } catch (err) {
      console.error('Load reports error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (isAnonymous) {
    return (
      <View style={styles.container}>
        <View style={styles.padding}>
          <GuestBanner onSignUp={() => navigation.navigate('AuthStack')} />
          <View style={styles.emptyBox}>
            <Text style={styles.emptyIcon}>📋</Text>
            <Text style={styles.emptyTitle}>Reports require an account</Text>
            <Text style={styles.emptySubtitle}>
              Sign up to submit and track waste reports in your city.
            </Text>
          </View>
        </View>
      </View>
    );
  }

  if (loading) return <LoadingSkeleton lines={4} />;

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.padding}>
        {userReports.length === 0 ? (
          <View style={styles.emptyBox}>
            <Text style={styles.emptyIcon}>📭</Text>
            <Text style={styles.emptyTitle}>No reports yet</Text>
            <Text style={styles.emptySubtitle}>
              Spot illegal dumping? Tap the button below to report it!
            </Text>
          </View>
        ) : (
          userReports.map((report) => {
            const statusCfg = STATUS_CONFIG[report.status] || STATUS_CONFIG.pending;
            return (
              <View key={report.id} style={styles.card}>
                {report.imageUrl ? (
                  <Image source={{ uri: report.imageUrl }} style={styles.thumb} />
                ) : (
                  <View style={[styles.thumb, styles.thumbPlaceholder]}>
                    <Text style={styles.thumbIcon}>🗑️</Text>
                  </View>
                )}
                <View style={styles.cardContent}>
                  <Text style={styles.description} numberOfLines={2}>
                    {report.description}
                  </Text>
                  <View style={styles.row}>
                    <View
                      style={[
                        styles.statusBadge,
                        { backgroundColor: statusCfg.color + '20', borderColor: statusCfg.color },
                      ]}
                    >
                      <Text style={[styles.statusText, { color: statusCfg.color }]}>
                        {statusCfg.icon} {statusCfg.label}
                      </Text>
                    </View>
                    <Text style={styles.date}>
                      {new Date(report.createdAt).toLocaleDateString()}
                    </Text>
                  </View>
                </View>
              </View>
            );
          })
        )}
      </ScrollView>

      {/* FAB */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('SubmitReport')}
      >
        <Text style={styles.fabText}>+ Report Waste</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background.secondary },
  padding: { padding: spacing.md, paddingBottom: 100 },
  emptyBox: {
    backgroundColor: colors.background.primary,
    borderRadius: 16,
    padding: spacing.xl,
    alignItems: 'center',
    marginTop: spacing.xl,
  },
  emptyIcon: { fontSize: 48, marginBottom: spacing.md },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text.primary,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 14,
    color: colors.text.secondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  card: {
    backgroundColor: colors.background.primary,
    borderRadius: 16,
    marginBottom: spacing.md,
    flexDirection: 'row',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 3,
  },
  thumb: { width: 80, height: 80 },
  thumbPlaceholder: {
    backgroundColor: colors.background.secondary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  thumbIcon: { fontSize: 28 },
  cardContent: { flex: 1, padding: spacing.md, justifyContent: 'space-between' },
  description: { fontSize: 13, color: colors.text.primary, lineHeight: 18, marginBottom: 8 },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  statusBadge: {
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  statusText: { fontSize: 11, fontWeight: '700' },
  date: { fontSize: 11, color: colors.text.secondary },
  fab: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    backgroundColor: colors.primary.main,
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 30,
    shadowColor: colors.primary.main,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 8,
  },
  fabText: { color: '#fff', fontWeight: '700', fontSize: 15 },
});
