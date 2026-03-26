/**
 * ShhDetailScreen — Immersive conversation view for a single shh.
 * Uses ShhMessageBubble, ShhGuessGame, ShhQuickReplies components.
 * Branches report.ts service for reporting.
 */
import React, { useEffect, useState, useCallback, useRef } from 'react';
import {
  View,
  FlatList,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { useRoute, useNavigation } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';
import ShhText from '../../components/atoms/ShhText';
import ShhSkeleton from '../../components/atoms/ShhSkeleton';
import ShhMessageBubble from '../../components/molecules/ShhMessageBubble';
import ShhQuickReplies from '../../components/molecules/ShhQuickReplies';
import ShhGuessGame from '../../components/organisms/ShhGuessGame';
import { useShhStore } from '../../stores/useShhStore';
import { useBlurLevel } from '../../hooks/useBlurLevel';
import { useAuthStore } from '../../stores/useAuthStore';
import { submitReport } from '../../services/report';
import { maybeRequestReview } from '../../services/ReviewService';
import * as HappinessScore from '../../services/HappinessScore';
import { colors } from '../../theme/colors';
import type { ShhMessage, RootStackParamList } from '../../types';

type DetailRoute = RouteProp<RootStackParamList, 'ShhDetail'>;
type Nav = NativeStackNavigationProp<RootStackParamList>;

/* ─── Demo messages ─── */
const DEMO_MESSAGES: ShhMessage[] = [
  { id: '1', shh_id: 'demo', sender_id: 'other', content: 'Hey\u2026 je pense \u00e0 toi \uD83E\uDD2B', type: 'text', created_at: '2026-03-24T10:00:00Z', reaction: null },
  { id: '2', shh_id: 'demo', sender_id: 'me', content: 'Qui es-tu ?! \uD83D\uDE0F', type: 'text', created_at: '2026-03-24T10:02:00Z', reaction: '\u2764\uFE0F' },
  { id: '3', shh_id: 'demo', sender_id: 'other', content: 'Tu le sauras bient\u00f4t\u2026', type: 'text', created_at: '2026-03-24T10:05:00Z', reaction: null },
  { id: '4', shh_id: 'demo', sender_id: 'me', content: 'Donne-moi un indice !', type: 'text', created_at: '2026-03-25T09:00:00Z', reaction: null },
  { id: '5', shh_id: 'demo', sender_id: 'other', content: 'On se voit souvent \uD83D\uDC40', type: 'text', created_at: '2026-03-25T09:03:00Z', reaction: '\uD83D\uDD25' },
];

/* ─── Heartbeat BPM pill ─── */
function BpmPill({ bpm }: { bpm: number }) {
  const scale = useSharedValue(1);

  useEffect(() => {
    const interval = 60000 / bpm;
    scale.value = withRepeat(
      withSequence(
        withTiming(1.15, { duration: interval * 0.15, easing: Easing.out(Easing.ease) }),
        withTiming(1, { duration: interval * 0.35, easing: Easing.inOut(Easing.ease) }),
        withTiming(1.1, { duration: interval * 0.1, easing: Easing.out(Easing.ease) }),
        withTiming(1, { duration: interval * 0.4, easing: Easing.inOut(Easing.ease) }),
      ),
      -1,
      false,
    );
  }, [bpm, scale]);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Animated.View style={[styles.bpmPill, animStyle]}>
      <ShhText variant="display" style={styles.bpmText}>
        {`\u2665 ${bpm} bpm`}
      </ShhText>
    </Animated.View>
  );
}

export default function ShhDetailScreen() {
  const { t } = useTranslation();
  const route = useRoute<DetailRoute>();
  const navigation = useNavigation<Nav>();
  const { shhId } = route.params;

  const token = useAuthStore((s) => s.token);
  const { currentShh, messages: storeMessages, isLoading, fetchShhDetail, sendMessage } =
    useShhStore();

  const [input, setInput] = useState('');
  const flatListRef = useRef<FlatList<ShhMessage>>(null);
  const unblurCountRef = useRef(0);

  const blurLevel = useBlurLevel(currentShh?.exchange_count ?? 0);
  const prevBlurRef = useRef(blurLevel);

  const messages = storeMessages.length > 0 ? storeMessages : DEMO_MESSAGES;
  const bpm = currentShh?.bpm ?? 94;
  const dayCount = currentShh?.exchange_count ?? 2;
  const blurDots = 5;
  const currentBlurDot = Math.min(5, Math.max(0, 5 - Math.floor(blurLevel / 10)));

  useEffect(() => {
    void fetchShhDetail(shhId);
  }, [shhId, fetchShhDetail]);

  // Track photo unblur events for ReviewService
  useEffect(() => {
    if (prevBlurRef.current !== blurLevel && blurLevel < prevBlurRef.current) {
      unblurCountRef.current += 1;
      HappinessScore.track('photo_unblurred');
      if (unblurCountRef.current >= 3) {
        void maybeRequestReview('shh_sent');
      }
    }
    prevBlurRef.current = blurLevel;
  }, [blurLevel]);

  const handleSend = useCallback(
    (content: string) => {
      if (!content.trim()) return;
      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      void sendMessage(shhId, content.trim());
      setInput('');
      HappinessScore.track('message_sent');
    },
    [shhId, sendMessage],
  );

  const handleInputSend = useCallback(() => {
    handleSend(input);
  }, [input, handleSend]);

  const handleReport = useCallback(async () => {
    if (!token) return;
    void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    try {
      await submitReport('shh', shhId, 'inappropriate', token);
    } catch {
      // silent fail
    }
  }, [shhId, token]);

  const renderMessage = useCallback(
    ({ item, index }: { item: ShhMessage; index: number }) => {
      const isSent = item.sender_id === 'me' || item.sender_id !== (currentShh?.receiver_id ?? 'other');

      // Day separator
      const prevItem = index > 0 ? messages[index - 1] : null;
      const currentDay = new Date(item.created_at).toDateString();
      const prevDay = prevItem ? new Date(prevItem.created_at).toDateString() : null;
      const showDaySep = currentDay !== prevDay;

      return (
        <View>
          {showDaySep && (
            <View style={styles.daySeparator}>
              <ShhText variant="body" style={styles.daySeparatorText}>
                {currentDay === new Date().toDateString()
                  ? t('shh.detail.today')
                  : new Date(item.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' })}
              </ShhText>
            </View>
          )}
          <ShhMessageBubble
            content={item.content}
            isSender={isSent}
            reaction={item.reaction}
            timestamp={item.created_at}
            onDoubleTap={() => void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)}
          />
        </View>
      );
    },
    [currentShh, messages, t],
  );

  const keyExtractor = useCallback((item: ShhMessage) => item.id, []);

  if (isLoading && !currentShh && storeMessages.length === 0) {
    return (
      <SafeAreaView style={styles.loadingSafe}>
        <View style={styles.loadingContainer}>
          <ShhSkeleton width={200} height={200} borderRadius={100} />
          <ShhSkeleton width="80%" height={40} borderRadius={20} />
          <ShhSkeleton width="60%" height={40} borderRadius={20} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      {/* Nav bar */}
      <View style={styles.navBar}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
        >
          <ShhText variant="body" style={styles.backArrow}>{'\u2039'}</ShhText>
        </TouchableOpacity>

        <View style={styles.anonPill}>
          <ShhText variant="body" style={styles.anonText}>
            {`\uD83E\uDD2B ${t('shh.detail.anonymous')} \u00B7 ${t('shh.detail.day')} ${dayCount}`}
          </ShhText>
        </View>

        <BpmPill bpm={bpm} />
      </View>

      <KeyboardAvoidingView
        style={styles.flex1}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={0}
      >
        {/* Photo */}
        <View style={styles.photoWrapper}>
          <View style={styles.photoPlaceholder}>
            <ShhText variant="body" style={styles.photoEmoji}>{'\uD83E\uDD2B'}</ShhText>

            <View style={styles.blurBadge}>
              <ShhText variant="body" style={styles.blurBadgeText}>
                {t('shh.detail.blurLevel')} {blurLevel}%
              </ShhText>
            </View>

            <View style={styles.blurDots}>
              {Array.from({ length: blurDots }).map((_, i) => (
                <View
                  key={i}
                  style={[
                    styles.blurDot,
                    i < currentBlurDot ? styles.blurDotDone : styles.blurDotTodo,
                  ]}
                />
              ))}
            </View>
          </View>
        </View>

        {/* Expiry strip */}
        <View style={styles.expiryStrip}>
          <ShhText variant="body" style={styles.expiryText}>
            {'\u23F3 '}
            <ShhText variant="body" style={styles.expiryItalic}>
              {t('shh.detail.expires')}
            </ShhText>
            {'  23h 14min'}
          </ShhText>
        </View>

        {/* Guess game component */}
        <ShhGuessGame shhId={shhId} />

        {/* Messages */}
        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderMessage}
          keyExtractor={keyExtractor}
          contentContainerStyle={styles.messagesList}
          showsVerticalScrollIndicator={false}
          onContentSizeChange={() =>
            flatListRef.current?.scrollToEnd({ animated: true })
          }
          style={styles.flex1}
        />

        {/* Quick replies */}
        <ShhQuickReplies shhId={shhId} onSend={handleSend} />

        {/* Input bar */}
        <View style={styles.inputBar}>
          {/* Report button */}
          <TouchableOpacity
            style={styles.reportButton}
            onPress={handleReport}
            activeOpacity={0.7}
          >
            <ShhText variant="body" style={styles.reportIcon}>{'\u26A0\uFE0F'}</ShhText>
          </TouchableOpacity>

          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.textInput}
              value={input}
              onChangeText={setInput}
              placeholder={t('shh.message.placeholder')}
              placeholderTextColor={colors.blackAlpha30}
              maxLength={200}
              multiline
            />
          </View>
          <TouchableOpacity
            style={[styles.sendButton, !input.trim() && styles.sendDisabled]}
            onPress={handleInputSend}
            disabled={!input.trim()}
            activeOpacity={0.7}
          >
            <ShhText variant="body" style={styles.sendIcon}>{'\u2191'}</ShhText>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.primary,
  },
  flex1: {
    flex: 1,
  },
  loadingSafe: {
    flex: 1,
    backgroundColor: colors.primary,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 24,
  },

  navBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  backButton: {
    width: 40,
    height: 40,
    backgroundColor: colors.cardLight,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backArrow: {
    fontSize: 22,
    color: colors.black,
    marginTop: -2,
  },
  anonPill: {
    backgroundColor: colors.cardLight,
    borderRadius: 20,
    paddingVertical: 7,
    paddingHorizontal: 14,
  },
  anonText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.black,
  },
  bpmPill: {
    backgroundColor: colors.cardLight,
    borderRadius: 20,
    paddingVertical: 7,
    paddingHorizontal: 14,
  },
  bpmText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.black,
  },

  photoWrapper: {
    marginHorizontal: 16,
    marginTop: 4,
  },
  photoPlaceholder: {
    width: '100%',
    aspectRatio: 1,
    backgroundColor: colors.cardDark,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  photoEmoji: {
    fontSize: 64,
    opacity: 0.3,
  },
  blurBadge: {
    position: 'absolute',
    bottom: 14,
    right: 14,
    backgroundColor: colors.blackAlpha60,
    borderRadius: 10,
    paddingVertical: 5,
    paddingHorizontal: 10,
  },
  blurBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.primary,
  },
  blurDots: {
    position: 'absolute',
    bottom: 16,
    left: 14,
    flexDirection: 'row',
    gap: 5,
  },
  blurDot: {
    width: 9,
    height: 9,
    borderRadius: 5,
  },
  blurDotDone: {
    backgroundColor: colors.primary,
  },
  blurDotTodo: {
    backgroundColor: colors.blackAlpha25,
  },

  expiryStrip: {
    backgroundColor: colors.cardLight,
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 14,
    marginHorizontal: 16,
    marginTop: 10,
  },
  expiryText: {
    fontSize: 12,
    color: colors.black,
  },
  expiryItalic: {
    fontSize: 12,
    fontStyle: 'italic',
    color: colors.blackAlpha60,
  },

  messagesList: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  daySeparator: {
    alignItems: 'center',
    paddingVertical: 10,
  },
  daySeparatorText: {
    fontSize: 11,
    color: colors.blackAlpha30,
  },

  inputBar: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: colors.primary,
    paddingHorizontal: 14,
    paddingTop: 10,
    paddingBottom: 30,
    gap: 10,
  },
  reportButton: {
    width: 36,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  reportIcon: {
    fontSize: 18,
  },
  inputWrapper: {
    flex: 1,
    backgroundColor: colors.cardLight,
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  textInput: {
    fontSize: 14,
    color: colors.black,
    maxHeight: 100,
    padding: 0,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.black,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendDisabled: {
    opacity: 0.25,
  },
  sendIcon: {
    fontSize: 20,
    color: colors.primary,
    fontWeight: '700',
  },
});
