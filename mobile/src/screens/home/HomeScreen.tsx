/**
 * HomeScreen — Two states: J0 (no shh) or ego dashboard with shh list.
 * Full immersive PULSE design, #DCFB4E background.
 */
import React, { useEffect, useCallback, useState, useRef } from 'react';
import {
  View,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  StyleSheet,
  Animated,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';
import ShhText from '../../components/atoms/ShhText';
import { useShhStore } from '../../stores/useShhStore';
import { apiRequest } from '../../services/api';
import { useAuthStore } from '../../stores/useAuthStore';
import type { Shh, RootStackParamList, CommunityStats } from '../../types';

type Nav = NativeStackNavigationProp<RootStackParamList, 'Home'>;

/* ─── Pulsing dot component ─── */
function PulsingDot() {
  const opacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 0.3,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
      ]),
    );
    pulse.start();
    return () => pulse.stop();
  }, [opacity]);

  return <Animated.View style={[styles.pulsingDot, { opacity }]} />;
}

/* ─── Header (shared between states) ─── */
function Header() {
  const navigation = useNavigation<Nav>();

  return (
    <View style={styles.header}>
      <ShhText variant="display" style={styles.headerTitle}>
        {'\uD83E\uDD2B Shh Me'}
      </ShhText>
      <View style={styles.headerIcons}>
        <TouchableOpacity style={styles.iconPill} activeOpacity={0.7}>
          <ShhText variant="body" style={styles.iconEmoji}>
            {'\uD83D\uDD14'}
          </ShhText>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.iconPill}
          activeOpacity={0.7}
          onPress={() => navigation.navigate('Settings')}
        >
          <ShhText variant="body" style={styles.iconEmoji}>
            {'\uD83D\uDC64'}
          </ShhText>
        </TouchableOpacity>
      </View>
    </View>
  );
}

/* ─── Tab bar (shared between states) ─── */
function TabBar({ activeTab = 'home' }: { activeTab?: 'home' | 'profile' }) {
  const navigation = useNavigation<Nav>();

  return (
    <View style={styles.tabBar}>
      <TouchableOpacity
        style={styles.tabItem}
        activeOpacity={0.7}
      >
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
          Accueil
        </ShhText>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.tabItem}
        activeOpacity={0.7}
        onPress={() => navigation.navigate('Settings')}
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
          Profil
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
  const [communityCount, setCommunityCount] = useState(247); // demo default

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
      {/* Community pill */}
      <View style={styles.communityPill}>
        <PulsingDot />
        <ShhText variant="body" style={styles.communityText}>
          {t('community.counter', { count: communityCount, defaultValue: `${communityCount} personnes pr\u00eates \u00e0 oser` })}
        </ShhText>
      </View>

      {/* Title */}
      <ShhText variant="display" style={styles.emptyTitle}>
        {t('home.empty.title', { defaultValue: 'Ton histoire commence.\nQuelqu\u2019un va oser. \uD83E\uDD2B' })}
      </ShhText>

      {/* Copy */}
      <ShhText variant="body" style={styles.emptyCopy}>
        {t('home.empty.subtitle', { defaultValue: 'Tu connais quelqu\u2019un qui te fait sourire ?\nUn coll\u00e8gue. Un ami d\u2019ami.\nCette personne au caf\u00e9.' })}
      </ShhText>

      {/* CTA */}
      <TouchableOpacity
        style={styles.emptyCta}
        activeOpacity={0.85}
        onPress={() => navigation.navigate('SendShh')}
      >
        <ShhText variant="body" style={styles.emptyCtaIcon}>
          {'\uD83E\uDD2B'}
        </ShhText>
        <ShhText variant="body" style={styles.emptyCtaText}>
          {t('home.empty.cta', { defaultValue: 'Envoie ton premier shh' })}
        </ShhText>
      </TouchableOpacity>
    </View>
  );
}

/* ─── Shh Card ─── */
function ShhListCard({ shh }: { shh: Shh }) {
  const navigation = useNavigation<Nav>();
  const timeDiff = getTimeDiff(shh.created_at);

  return (
    <TouchableOpacity
      style={styles.shhCard}
      activeOpacity={0.7}
      onPress={() => navigation.navigate('ShhDetail', { shhId: shh.id })}
    >
      {/* Thumbnail */}
      <View style={styles.shhThumb}>
        <ShhText variant="display" style={styles.shhThumbEmoji}>
          {'\uD83E\uDD2B'}
        </ShhText>
        <View style={styles.blurBadge}>
          <ShhText variant="display" style={styles.blurBadgeText}>
            {shh.current_blur_level}
          </ShhText>
        </View>
      </View>

      {/* Info */}
      <View style={styles.shhInfo}>
        <ShhText variant="body" style={styles.shhName}>
          {`Quelqu'un \uD83E\uDD2B`}
        </ShhText>
        <ShhText variant="body" style={styles.shhPreview} numberOfLines={1}>
          {shh.last_message_preview || 'Nouveau shh...'}
        </ShhText>
        <ShhText variant="body" style={styles.shhBpm}>
          {`\u2665 ${shh.bpm} bpm \u00B7 Jour ${shh.exchange_count}`}
        </ShhText>
      </View>

      {/* Meta */}
      <View style={styles.shhMeta}>
        <ShhText variant="body" style={styles.shhTime}>
          {timeDiff}
        </ShhText>
        {(shh.unread_count ?? 0) > 0 && (
          <View style={styles.unreadBadge}>
            <ShhText variant="display" style={styles.unreadBadgeText}>
              {shh.unread_count}
            </ShhText>
          </View>
        )}
      </View>
    </TouchableOpacity>
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

  type SectionItem = { type: 'header'; title: string; key: string } | { type: 'shh'; shh: Shh; key: string };

  const sections: SectionItem[] = [];

  if (received.length > 0) {
    sections.push({ type: 'header', title: t('home.received', { defaultValue: 'Re\u00e7us' }), key: 'header-received' });
    received.forEach((s) => sections.push({ type: 'shh', shh: s, key: s.id }));
  }
  if (sent.length > 0) {
    sections.push({ type: 'header', title: t('home.sent', { defaultValue: 'Envoy\u00e9s' }), key: 'header-sent' });
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
    return <ShhListCard shh={item.shh} />;
  };

  return (
    <View style={styles.shhStateBody}>
      {/* Ego section */}
      <View style={styles.egoSection}>
        <ShhText variant="body" style={styles.egoLabel}>
          {t('home.shhReceived', { defaultValue: 'SHH RE\u00c7US' })}
        </ShhText>
        <ShhText variant="display" style={styles.egoNumber}>
          {totalReceived}
        </ShhText>
        <ShhText variant="body" style={styles.egoSubtitle}>
          {`${newMessages} ${t('home.newMessages', { defaultValue: 'nouveaux messages' })} \u00B7 ${latestBpm} bpm \uD83E\uDD2B`}
        </ShhText>
      </View>

      {/* Shh list */}
      <FlatList
        data={sections}
        renderItem={renderItem}
        keyExtractor={(item) => item.key}
        contentContainerStyle={styles.shhListContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor="#000000"
          />
        }
        onEndReached={fetchMore}
        onEndReachedThreshold={0.5}
        showsVerticalScrollIndicator={false}
      />

      {/* FAB */}
      <TouchableOpacity
        style={styles.fab}
        activeOpacity={0.85}
        onPress={() => navigation.navigate('SendShh')}
      >
        <ShhText variant="body" style={styles.fabIcon}>
          {'\uD83E\uDD2B'}
        </ShhText>
        <ShhText variant="body" style={styles.fabText}>
          {t('home.sendShh', { defaultValue: 'Envoyer un shh' })}
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

/* ─── Helpers ─── */
function getTimeDiff(dateStr: string): string {
  const now = Date.now();
  const then = new Date(dateStr).getTime();
  const diffMs = now - then;
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 1) return 'now';
  if (diffMin < 60) return `${diffMin}m`;
  const diffH = Math.floor(diffMin / 60);
  if (diffH < 24) return `${diffH}h`;
  const diffD = Math.floor(diffH / 24);
  return `${diffD}j`;
}

/* ─── Styles ─── */
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#DCFB4E',
  },
  container: {
    flex: 1,
    backgroundColor: '#DCFB4E',
  },

  /* Header */
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
    color: '#000000',
  },
  headerIcons: {
    flexDirection: 'row',
    gap: 8,
  },
  iconPill: {
    width: 40,
    height: 40,
    borderRadius: 14,
    backgroundColor: 'rgba(0,0,0,0.10)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconEmoji: {
    fontSize: 18,
  },

  /* Tab bar */
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#DCFB4E',
    paddingBottom: 8,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.06)',
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
    color: 'rgba(0,0,0,0.35)',
    fontWeight: '600',
  },
  tabLabelActive: {
    color: '#000000',
  },

  /* Loading */
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingEmoji: {
    fontSize: 48,
    opacity: 0.3,
  },

  /* ─── STATE 1: Empty / J0 ─── */
  emptyBody: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 28,
  },
  communityPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.08)',
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
    backgroundColor: '#000000',
  },
  communityText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#000000',
  },
  emptyTitle: {
    fontSize: 30,
    fontWeight: '800',
    color: '#000000',
    textAlign: 'center',
    marginBottom: 16,
  },
  emptyCopy: {
    fontSize: 15,
    color: '#555555',
    textAlign: 'center',
    lineHeight: 25.5, // 15 * 1.7
    marginBottom: 36,
  },
  emptyCta: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#000000',
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
    color: '#DCFB4E',
  },

  /* ─── STATE 2: With shh ─── */
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
    color: '#555555',
    textTransform: 'uppercase',
    letterSpacing: 1.5,
  },
  egoNumber: {
    fontSize: 96,
    fontWeight: '800',
    color: '#000000',
    lineHeight: 106,
  },
  egoSubtitle: {
    fontSize: 13,
    color: '#555555',
  },

  /* Section labels */
  sectionLabel: {
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    color: 'rgba(0,0,0,0.35)',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 8,
  },

  /* Shh list */
  shhListContent: {
    paddingBottom: 100,
  },

  /* Shh card */
  shhCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.09)',
    borderRadius: 14,
    padding: 14,
    marginHorizontal: 16,
    marginBottom: 8,
    gap: 12,
  },
  shhThumb: {
    width: 54,
    height: 54,
    borderRadius: 12,
    backgroundColor: '#111111',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  shhThumbEmoji: {
    fontSize: 24,
    opacity: 0.5,
  },
  blurBadge: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    backgroundColor: '#DCFB4E',
    borderRadius: 6,
    paddingHorizontal: 4,
    paddingVertical: 1,
    minWidth: 16,
    alignItems: 'center',
  },
  blurBadgeText: {
    fontSize: 8,
    fontWeight: '800',
    color: '#000000',
  },
  shhInfo: {
    flex: 1,
    gap: 2,
  },
  shhName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#000000',
  },
  shhPreview: {
    fontSize: 12,
    color: '#555555',
  },
  shhBpm: {
    fontSize: 10,
    color: 'rgba(0,0,0,0.3)',
  },
  shhMeta: {
    alignItems: 'flex-end',
    gap: 6,
  },
  shhTime: {
    fontSize: 10,
    color: 'rgba(0,0,0,0.35)',
  },
  unreadBadge: {
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#000000',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  unreadBadgeText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#DCFB4E',
  },

  /* FAB */
  fab: {
    position: 'absolute',
    bottom: 60,
    left: 16,
    right: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#000000',
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
    color: '#DCFB4E',
  },
});
