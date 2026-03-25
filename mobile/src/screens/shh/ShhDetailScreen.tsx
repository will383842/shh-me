/**
 * ShhDetailScreen — Immersive 2026 conversation view for a single shh.
 * Yellow bg, blur photo, guess chips, messages FlatList, input bar.
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
  ScrollView,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { useRoute, useNavigation } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';
import ShhText from '../../components/atoms/ShhText';
import ShhSkeleton from '../../components/atoms/ShhSkeleton';
import { useShhStore } from '../../stores/useShhStore';
import { useBlurLevel } from '../../hooks/useBlurLevel';
import { useAuthStore } from '../../stores/useAuthStore';
import type { ShhMessage, RootStackParamList } from '../../types';

type DetailRoute = RouteProp<RootStackParamList, 'ShhDetail'>;
type Nav = NativeStackNavigationProp<RootStackParamList>;

/* ─── Demo messages ─── */
const DEMO_MESSAGES: ShhMessage[] = [
  { id: '1', shh_id: 'demo', sender_id: 'other', content: 'Hey… je pense à toi 🤫', type: 'text', created_at: '2026-03-24T10:00:00Z', reaction: null },
  { id: '2', shh_id: 'demo', sender_id: 'me', content: 'Qui es-tu ?! 😏', type: 'text', created_at: '2026-03-24T10:02:00Z', reaction: '❤️' },
  { id: '3', shh_id: 'demo', sender_id: 'other', content: 'Tu le sauras bientôt…', type: 'text', created_at: '2026-03-24T10:05:00Z', reaction: null },
  { id: '4', shh_id: 'demo', sender_id: 'me', content: 'Donne-moi un indice !', type: 'text', created_at: '2026-03-25T09:00:00Z', reaction: null },
  { id: '5', shh_id: 'demo', sender_id: 'other', content: 'On se voit souvent 👀', type: 'text', created_at: '2026-03-25T09:03:00Z', reaction: '🔥' },
];

/* ─── Demo guess contacts ─── */
const DEMO_GUESSES = [
  { id: '1', name: 'Léa', initials: 'LM' },
  { id: '2', name: 'Hugo', initials: 'HD' },
  { id: '3', name: 'Camille', initials: 'CR' },
  { id: '4', name: 'Nathan', initials: 'NP' },
  { id: '5', name: 'Emma', initials: 'EB' },
];

/* ─── Heartbeat BPM pill ─── */
function BpmPill({ bpm }: { bpm: number }) {
  const scale = useSharedValue(1);

  useEffect(() => {
    const interval = 60000 / bpm; // ms per beat
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
        {`♥ ${bpm} bpm`}
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

  const blurLevel = useBlurLevel(currentShh?.exchange_count ?? 0);
  const isReceiver = currentShh?.receiver_id === token;

  // Use demo messages when store is empty
  const messages = storeMessages.length > 0 ? storeMessages : DEMO_MESSAGES;
  const bpm = currentShh?.bpm ?? 94;
  const dayCount = 2;
  const blurDots = 5;
  const currentBlurDot = 3; // demo: 3 out of 5 done

  useEffect(() => {
    void fetchShhDetail(shhId);
  }, [shhId, fetchShhDetail]);

  const handleSend = useCallback(
    (content: string) => {
      if (!content.trim()) return;
      void sendMessage(shhId, content.trim());
      setInput('');
    },
    [shhId, sendMessage],
  );

  const handleInputSend = useCallback(() => {
    handleSend(input);
  }, [input, handleSend]);

  const renderMessage = useCallback(
    ({ item, index }: { item: ShhMessage; index: number }) => {
      const isSent = item.sender_id === 'me' || item.sender_id !== (currentShh?.receiver_id ?? 'other');
      const time = new Date(item.created_at);
      const timeStr = `${time.getHours().toString().padStart(2, '0')}:${time.getMinutes().toString().padStart(2, '0')}`;

      // Day separator logic
      const prevItem = index > 0 ? messages[index - 1] : null;
      const currentDay = time.toDateString();
      const prevDay = prevItem ? new Date(prevItem.created_at).toDateString() : null;
      const showDaySep = currentDay !== prevDay;

      return (
        <View>
          {showDaySep && (
            <View style={styles.daySeparator}>
              <ShhText variant="body" style={styles.daySeparatorText}>
                {currentDay === new Date().toDateString()
                  ? t('shh.message.today', { defaultValue: "Aujourd'hui" })
                  : time.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' })}
              </ShhText>
            </View>
          )}
          <View style={[styles.bubbleRow, isSent && styles.bubbleRowSent]}>
            <View style={[styles.bubble, isSent ? styles.bubbleSent : styles.bubbleReceived]}>
              <ShhText variant="body" style={[styles.bubbleText, isSent && styles.bubbleTextSent]}>
                {item.content}
              </ShhText>
              <ShhText variant="body" style={[styles.bubbleTime, isSent && styles.bubbleTimeSent]}>
                {timeStr}
              </ShhText>
            </View>
            {item.reaction && (
              <ShhText variant="body" style={[styles.reaction, isSent && styles.reactionSent]}>
                {item.reaction}
              </ShhText>
            )}
          </View>
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
      {/* ─── Nav bar ─── */}
      <View style={styles.navBar}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
        >
          <ShhText variant="body" style={styles.backArrow}>{'‹'}</ShhText>
        </TouchableOpacity>

        <View style={styles.anonPill}>
          <ShhText variant="body" style={styles.anonText}>
            {`🤫 ${t('shh.detail.anonymous', { defaultValue: 'Anonyme' })} · ${t('shh.detail.day', { defaultValue: 'Jour' })} ${dayCount}`}
          </ShhText>
        </View>

        <BpmPill bpm={bpm} />
      </View>

      <KeyboardAvoidingView
        style={styles.flex1}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={0}
      >
        {/* ─── Photo ─── */}
        <View style={styles.photoWrapper}>
          <View style={styles.photoPlaceholder}>
            <ShhText variant="body" style={styles.photoEmoji}>{'🤫'}</ShhText>

            {/* Blur level badge */}
            <View style={styles.blurBadge}>
              <ShhText variant="body" style={styles.blurBadgeText}>
                {t('shh.detail.blurLevel', { defaultValue: 'Flou' })} {blurLevel}%
              </ShhText>
            </View>

            {/* Blur dots */}
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

        {/* ─── Expiry strip ─── */}
        <View style={styles.expiryStrip}>
          <ShhText variant="body" style={styles.expiryText}>
            {'⏳ '}
            <ShhText variant="body" style={styles.expiryItalic}>
              {t('shh.detail.expires', { defaultValue: 'Expire dans' })}
            </ShhText>
            {'  23h 14min'}
          </ShhText>
        </View>

        {/* ─── Guess section ─── */}
        <View style={styles.guessSection}>
          <ShhText variant="body" style={styles.guessTitle}>
            {t('shh.detail.guessTitle', { defaultValue: 'À ton avis, c\'est qui ? 🤫' })}
          </ShhText>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.guessScroll}>
            {DEMO_GUESSES.map((g) => (
              <TouchableOpacity key={g.id} style={styles.guessChip} activeOpacity={0.7}>
                <View style={styles.guessAvatar}>
                  <ShhText variant="body" style={styles.guessInitials}>{g.initials}</ShhText>
                </View>
                <ShhText variant="body" style={styles.guessName}>{g.name}</ShhText>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* ─── Messages ─── */}
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

        {/* ─── Input bar ─── */}
        <View style={styles.inputBar}>
          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.textInput}
              value={input}
              onChangeText={setInput}
              placeholder={t('shh.message.placeholder', { defaultValue: 'Message…' })}
              placeholderTextColor="rgba(0,0,0,0.3)"
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
            <ShhText variant="body" style={styles.sendIcon}>{'↑'}</ShhText>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#DCFB4E',
  },
  flex1: {
    flex: 1,
  },
  loadingSafe: {
    flex: 1,
    backgroundColor: '#DCFB4E',
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 24,
  },

  /* ─── Nav ─── */
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
    backgroundColor: 'rgba(0,0,0,0.1)',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backArrow: {
    fontSize: 22,
    color: '#000000',
    marginTop: -2,
  },
  anonPill: {
    backgroundColor: 'rgba(0,0,0,0.09)',
    borderRadius: 20,
    paddingVertical: 7,
    paddingHorizontal: 14,
  },
  anonText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#000000',
  },
  bpmPill: {
    backgroundColor: 'rgba(0,0,0,0.09)',
    borderRadius: 20,
    paddingVertical: 7,
    paddingHorizontal: 14,
  },
  bpmText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#000000',
  },

  /* ─── Photo ─── */
  photoWrapper: {
    marginHorizontal: 16,
    marginTop: 4,
  },
  photoPlaceholder: {
    width: '100%',
    aspectRatio: 1,
    backgroundColor: '#1A1A1A',
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
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderRadius: 10,
    paddingVertical: 5,
    paddingHorizontal: 10,
  },
  blurBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#DCFB4E',
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
    backgroundColor: '#DCFB4E',
  },
  blurDotTodo: {
    backgroundColor: 'rgba(0,0,0,0.25)',
  },

  /* ─── Expiry ─── */
  expiryStrip: {
    backgroundColor: 'rgba(0,0,0,0.08)',
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 14,
    marginHorizontal: 16,
    marginTop: 10,
  },
  expiryText: {
    fontSize: 12,
    color: '#000000',
  },
  expiryItalic: {
    fontSize: 12,
    fontStyle: 'italic',
    color: 'rgba(0,0,0,0.6)',
  },

  /* ─── Guess ─── */
  guessSection: {
    backgroundColor: 'rgba(0,0,0,0.08)',
    borderRadius: 14,
    padding: 12,
    marginHorizontal: 16,
    marginTop: 10,
    marginBottom: 8,
  },
  guessTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#000000',
    marginBottom: 10,
  },
  guessScroll: {
    flexDirection: 'row',
  },
  guessChip: {
    alignItems: 'center',
    marginRight: 14,
  },
  guessAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0,0,0,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  guessInitials: {
    fontSize: 11,
    fontWeight: '700',
    color: '#000000',
  },
  guessName: {
    fontSize: 9,
    fontWeight: '600',
    color: '#000000',
  },

  /* ─── Messages ─── */
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
    color: 'rgba(0,0,0,0.3)',
  },
  bubbleRow: {
    flexDirection: 'column',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  bubbleRowSent: {
    alignItems: 'flex-end',
  },
  bubble: {
    maxWidth: '78%',
    paddingVertical: 10,
    paddingHorizontal: 14,
  },
  bubbleReceived: {
    backgroundColor: 'rgba(0,0,0,0.09)',
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    borderBottomRightRadius: 18,
    borderBottomLeftRadius: 4,
  },
  bubbleSent: {
    backgroundColor: '#000000',
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    borderBottomLeftRadius: 18,
    borderBottomRightRadius: 4,
  },
  bubbleText: {
    fontSize: 14,
    color: '#000000',
    lineHeight: 20,
  },
  bubbleTextSent: {
    color: '#DCFB4E',
  },
  bubbleTime: {
    fontSize: 10,
    color: 'rgba(0,0,0,0.4)',
    marginTop: 4,
    alignSelf: 'flex-end',
  },
  bubbleTimeSent: {
    color: 'rgba(220,251,78,0.5)',
  },
  reaction: {
    fontSize: 13,
    marginTop: 2,
    marginLeft: 8,
  },
  reactionSent: {
    alignSelf: 'flex-end',
    marginRight: 8,
    marginLeft: 0,
  },

  /* ─── Input bar ─── */
  inputBar: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: '#DCFB4E',
    paddingHorizontal: 14,
    paddingTop: 10,
    paddingBottom: 30,
    gap: 10,
  },
  inputWrapper: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.09)',
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  textInput: {
    fontSize: 14,
    color: '#000000',
    maxHeight: 100,
    padding: 0,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#000000',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendDisabled: {
    opacity: 0.25,
  },
  sendIcon: {
    fontSize: 20,
    color: '#DCFB4E',
    fontWeight: '700',
  },
});
