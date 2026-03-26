/**
 * HomeScreen — Two states: J0 (no shh) or ego dashboard with shh list.
 * Full immersive PULSE design. Reanimated animations, theme colors, i18n.
 */
import React, { useEffect, useCallback, useState } from 'react';
import {
  View,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  StyleSheet,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';
import ShhText from '../../components/atoms/ShhText';
import ShhCard from '../../components/molecules/ShhCard';
import { useShhStore } from '../../stores/useShhStore';
import { apiRequest } from '../../services/api';
import { useAuthStore } from '../../stores/useAuthStore';
import { colors } from '../../theme/colors';
import type { Shh, RootStackParamList, CommunityStats } from '../../types';

type Nav = NativeStackNavigationProp<RootStackParamList, 'Home'>;

/* ─── Pulsing dot (Reanimated) ─── */
function PulsingDot() {
  const opacity = useSharedValue(1);

  useEffect(() => {
    opacity.value = withRepeat(
      withTiming(0.3, { duration: 800 }),
      -1,
      true,
    );
  }, [opacity]);

  const animStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  return <Animated.View style={[styles.pulsingDot, animStyle]} />;
}

/* ─── Header ─── */
function Header() {
  const { t } = useTranslation();
  const navigation = useNavigation<Nav>();

  return (
    <View style={styles.header}>
      <ShhText variant="display" style={styles.headerTitle}>
        {`\uD83E\uDD2B ${t('app.name')}`}
      </ShhText>
      <View style={styles.headerIcons}>
        <TouchableOpacity
          style={styles.iconPill}
          activeOpacity={0.7}
          onPress={() => void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
        >
          <ShhText variant="body" style={styles.iconEmoji}>
            {'\uD83D\uDD14'}
          </ShhText>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.iconPill}
          activeOpacity={0.7}
          onPress={() => {
            void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            navigation.navigate('Settings');
          }}
        >
          <ShhText variant="body" style={styles.iconEmoji}>
            {'\uD83D\uDC64'}
          </ShhText>
        </TouchableOpacity>
      </View>
    </View>
  );
}

/* ─── Tab bar ─── */
function TabBar({ activeTab = 'home' }: { activeTab?: 'home' | 'profile' }) {
  const { t } = useTranslation();
  const navigation = useNavigation<Nav>();

  return (
    <View style={styles.tabBar}>
      <TouchableOpacity style={styles.tabItem} activeOpacity={0.7}>
        <ShhText
          variant="body"
          style={[styles.tabEmoji, activeTab === 'home' && styles.tabActive]}
        >
          {'\uD83C\uDFE0'}
        </ShhText>
        <ShhText
          variant="body"
          style={[styles.tabLabel, activeTab === 'home' && styles.tabLabelActive]}
        >
          {t('home.tab.home')}
        </ShhText>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.tabItem}
        activeOpacity={0.7}
        onPress={() => {
          void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          navigation.navigate('Settings');
        }}
      >
        <ShhText
          variant="body"
          style={[styles.tabEmoji, activeTab === 'profile' && styles.tabActive]}
        >
          {'\uD83D\uDC64'}
        </ShhText>
        <ShhText
          variant="body"
          style={[styles.tabLabel, activeTab === 'profile' && styles.tabLabelActive]}
        >
          {t('home.tab.profile')}
        </ShhText>
      </TouchableOpacity>
    </View>
  );
}

/* ─── STATE 1: J0 — No shh received ─── */
function EmptyState() {
  const { t } = useTranslation();
  const navigation = useNavigation<Nav>();
  const token = useAuthStore((s) => s.token);
  const [communityCount, setCommunityCount] = useState(247);

  useEffect(() => {
    if (!token) return;
    void apiRequest<CommunityStats>('/stats/community', { token })
      .then((data) => setCommunityCount(data.count))
      .catch(() => {
        // keep demo default
      });
  }, [token]);

  return (
    <View style={styles.emptyBody}>
      <View style={styles.communityPill}>
        <PulsingDot />
        <ShhText variant="body" style={styles.communityText}>
          {t('community.counter', { count: communityCount })}
        </ShhText>
      </View>

      <ShhText variant="display" style={styles.emptyTitle}>
        {t('home.empty.title')}
      </ShhText>

      <ShhText variant="body" style={styles.emptyCopy}>
        {t('home.empty.subtitle')}
      </ShhText>

      <TouchableOpacity
        style={styles.emptyCta}
        activeOpacity={0.85}
        onPress={() => {
          void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          navigation.navigate('SendShh');
        }}
      >
        <ShhText variant="body" style={styles.emptyCtaIcon}>
          {'\uD83E\uDD2B'}
        </ShhText>
        <ShhText variant="body" style={styles.emptyCtaText}>
          {t('home.empty.cta')}
        </ShhText>
      </TouchableOpacity>
    </View>
  );
}

/* ─── STATE 2: With shh ─── */
function ShhListState() {
  const { t } = useTranslation();
  const navigation = useNavigation<Nav>();
  const { shhList, fetchShhList, fetchMore } = useShhStore();
  const [refreshing, setRefreshing] = useState(false);

  const totalReceived = shhList.filter((s) => s.receiver_id).length;
  const latestBpm = shhList[0]?.bpm ?? 0;
  const newMessages = shhList.reduce((sum, s) => sum + (s.unread_count ?? 0), 0);

  const received = shhList.filter((s) => s.status === 'active' || s.status === 'revealed');
  const sent = shhList.filter((s) => s.status !== 'active' && s.status !== 'revealed');

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchShhList();
    setRefreshing(false);
  }, [fetchShhList]);

  type SectionItem =
    | { type: 'header'; title: string; key: string }
    | { type: 'shh'; shh: Shh; key: string };

  const sections: SectionItem[] = [];

  if (received.length > 0) {
    sections.push({ type: 'header', title: t('home.received'), key: 'header-received' });
    received.forEach((s) => sections.push({ type: 'shh', shh: s, key: s.id }));
  }
  if (sent.length > 0) {
    sections.push({ type: 'header', title: t('home.sent'), key: 'header-sent' });
    sent.forEach((s) => sections.push({ type: 'shh', shh: s, key: `sent-${s.id}` }));
  }

  const renderItem = ({ item }: { item: SectionItem }) => {
    if (item.type === 'header') {
      return (
        <ShhText variant="body" style={styles.sectionLabel}>
          {item.title}
        </ShhText>
      );
    }
    return <ShhCard shh={item.shh} />;
  };

  return (
    <View style={styles.shhStateBody}>
      <View style={styles.egoSection}>
        <ShhText variant="body" style={styles.egoLabel}>
          {t('home.shhReceived')}
        </ShhText>
        <ShhText variant="display" style={styles.egoNumber}>
          {totalReceived}
        </ShhText>
        <ShhText variant="body" style={styles.egoSubtitle}>
          {`${newMessages} ${t('home.newMessages')} \u00B7 ${latestBpm} bpm \uD83E\uDD2B`}
        </ShhText>
      </View>

      <FlatList
        data={sections}
        renderItem={renderItem}
        keyExtractor={(item) => item.key}
        contentContainerStyle={styles.shhListContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={colors.black}
          />
        }
        onEndReached={fetchMore}
        onEndReachedThreshold={0.5}
        showsVerticalScrollIndicator={false}
      />

      <TouchableOpacity
        style={styles.fab}
        activeOpacity={0.85}
        onPress={() => {
          void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          navigation.navigate('SendShh');
        }}
      >
        <ShhText variant="body" style={styles.fabIcon}>
          {'\uD83E\uDD2B'}
        </ShhText>
        <ShhText variant="body" style={styles.fabText}>
          {t('home.sendShh')}
        </ShhText>
      </TouchableOpacity>
    </View>
  );
}

/* ─── Main HomeScreen ─── */
export default function HomeScreen() {
  const { shhList, isLoading, fetchShhList } = useShhStore();

  useEffect(() => {
    void fetchShhList();
  }, [fetchShhList]);

  const isEmpty = shhList.length === 0;

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.container}>
        <Header />
        {isLoading && isEmpty ? (
          <View style={styles.loadingContainer}>
            <ShhText variant="display" style={styles.loadingEmoji}>
              {'\uD83E\uDD2B'}
            </ShhText>
          </View>
        ) : isEmpty ? (
          <EmptyState />
        ) : (
          <ShhListState />
        )}
        <TabBar activeTab="home" />
      </View>
    </SafeAreaView>
  );
}

/* ─── Styles ─── */
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.primary,
  },
  container: {
    flex: 1,
    backgroundColor: colors.primary,
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: colors.black,
  },
  headerIcons: {
    flexDirection: 'row',
    gap: 8,
  },
  iconPill: {
    width: 40,
    height: 40,
    borderRadius: 14,
    backgroundColor: colors.cardLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconEmoji: {
    fontSize: 18,
  },

  tabBar: {
    flexDirection: 'row',
    backgroundColor: colors.primary,
    paddingBottom: 8,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    gap: 2,
  },
  tabEmoji: {
    fontSize: 20,
    opacity: 0.35,
  },
  tabActive: {
    opacity: 1,
  },
  tabLabel: {
    fontSize: 10,
    color: colors.blackAlpha35,
    fontWeight: '600',
  },
  tabLabelActive: {
    color: colors.black,
  },

  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingEmoji: {
    fontSize: 48,
    opacity: 0.3,
  },

  /* Empty / J0 */
  emptyBody: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 28,
  },
  communityPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.cardLight,
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 18,
    gap: 8,
    marginBottom: 28,
  },
  pulsingDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.black,
  },
  communityText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.black,
  },
  emptyTitle: {
    fontSize: 30,
    fontWeight: '800',
    color: colors.black,
    textAlign: 'center',
    marginBottom: 16,
  },
  emptyCopy: {
    fontSize: 15,
    color: colors.gray,
    textAlign: 'center',
    lineHeight: 25.5,
    marginBottom: 36,
  },
  emptyCta: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.black,
    borderRadius: 14,
    paddingVertical: 18,
    gap: 10,
  },
  emptyCtaIcon: {
    fontSize: 16,
  },
  emptyCtaText: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.primary,
  },

  /* With shh */
  shhStateBody: {
    flex: 1,
  },
  egoSection: {
    alignItems: 'center',
    paddingTop: 8,
    paddingBottom: 20,
  },
  egoLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.gray,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
  },
  egoNumber: {
    fontSize: 96,
    fontWeight: '800',
    color: colors.black,
    lineHeight: 106,
  },
  egoSubtitle: {
    fontSize: 13,
    color: colors.gray,
  },

  sectionLabel: {
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    color: colors.blackAlpha35,
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 8,
  },

  shhListContent: {
    paddingBottom: 100,
  },

  fab: {
    position: 'absolute',
    bottom: 60,
    left: 16,
    right: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.black,
    borderRadius: 20,
    paddingVertical: 18,
    gap: 10,
  },
  fabIcon: {
    fontSize: 16,
  },
  fabText: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.primary,
  },
});
