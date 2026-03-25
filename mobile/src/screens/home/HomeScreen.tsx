/**
 * HomeScreen — Empty state narrative or FlatList of ShhCards.
 * FAB button bottom-right to navigate to SendShhScreen.
 * Pull to refresh.
 */
import React, { useEffect, useCallback, useState } from 'react';
import {
  View,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  StyleSheet,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import ShhText from '../../components/atoms/ShhText';
import ShhSkeleton from '../../components/atoms/ShhSkeleton';
import ShhCard from '../../components/molecules/ShhCard';
import { useShhStore } from '../../stores/useShhStore';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { apiRequest } from '../../services/api';
import { useAuthStore } from '../../stores/useAuthStore';
import type { Shh, RootStackParamList, CommunityStats } from '../../types';

type Nav = NativeStackNavigationProp<RootStackParamList, 'Home'>;

function EmptyState() {
  const { t } = useTranslation();
  const navigation = useNavigation<Nav>();
  const token = useAuthStore((s) => s.token);
  const [communityCount, setCommunityCount] = useState(0);

  useEffect(() => {
    if (!token) return;
    void apiRequest<CommunityStats>('/stats/community', { token })
      .then((data) => setCommunityCount(data.count))
      .catch(() => {
        // silent
      });
  }, [token]);

  return (
    <View style={styles.emptyContainer}>
      <ShhText variant="display" style={styles.emptyTitle}>
        {t('home.empty.title')}
      </ShhText>
      <ShhText variant="body" style={styles.emptySubtitle}>
        {t('home.empty.subtitle')}
      </ShhText>

      {communityCount > 0 && (
        <ShhText variant="body" style={styles.communityText}>
          {t('community.counter', { count: communityCount })}
        </ShhText>
      )}

      <TouchableOpacity
        style={styles.ctaButton}
        activeOpacity={0.8}
        onPress={() => navigation.navigate('SendShh')}
      >
        <ShhText variant="body" style={styles.ctaText}>
          {t('home.empty.cta')}
        </ShhText>
      </TouchableOpacity>
    </View>
  );
}

function LoadingSkeleton() {
  return (
    <View style={styles.skeletonContainer}>
      {[1, 2, 3, 4].map((i) => (
        <ShhSkeleton key={i} width="100%" height={80} borderRadius={16} />
      ))}
    </View>
  );
}

export default function HomeScreen() {
  const navigation = useNavigation<Nav>();
  const { shhList, isLoading, fetchShhList, fetchMore } = useShhStore();
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    void fetchShhList();
  }, [fetchShhList]);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchShhList();
    setRefreshing(false);
  }, [fetchShhList]);

  const renderItem = useCallback(
    ({ item }: { item: Shh }) => <ShhCard shh={item} />,
    [],
  );

  const keyExtractor = useCallback((item: Shh) => item.id, []);

  if (isLoading && shhList.length === 0) {
    return (
      <View style={styles.container}>
        <LoadingSkeleton />
      </View>
    );
  }

  const isEmpty = shhList.length === 0;

  return (
    <View style={styles.container}>
      {isEmpty ? (
        <EmptyState />
      ) : (
        <FlatList
          data={shhList}
          renderItem={renderItem}
          keyExtractor={keyExtractor}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor={colors.primary}
            />
          }
          onEndReached={fetchMore}
          onEndReachedThreshold={0.5}
          showsVerticalScrollIndicator={false}
        />
      )}

      {/* FAB — Send new shh */}
      <TouchableOpacity
        style={styles.fab}
        activeOpacity={0.85}
        onPress={() => navigation.navigate('SendShh')}
      >
        <ShhText variant="display" style={styles.fabText}>
          {'\ud83e\udd2b'}
        </ShhText>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.dark,
  },
  listContent: {
    paddingTop: spacing['2xl'],
    paddingBottom: 100,
  },
  skeletonContainer: {
    paddingTop: spacing['2xl'],
    paddingHorizontal: spacing.base,
    gap: spacing.sm,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
  },
  emptyTitle: {
    fontSize: 28,
    color: colors.textDark,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 18,
    color: colors.gray,
    textAlign: 'center',
    marginTop: spacing.sm,
  },
  communityText: {
    fontSize: 13,
    color: colors.gray,
    textAlign: 'center',
    marginTop: spacing.lg,
  },
  ctaButton: {
    backgroundColor: colors.primary,
    borderRadius: 16,
    paddingVertical: spacing.base,
    paddingHorizontal: spacing.xl,
    marginTop: spacing['2xl'],
  },
  ctaText: {
    color: colors.black,
    fontSize: 16,
    fontWeight: '700',
  },
  fab: {
    position: 'absolute',
    bottom: spacing.xl,
    right: spacing.lg,
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  fabText: {
    fontSize: 28,
  },
});
