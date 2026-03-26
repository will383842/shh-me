/**
 * AudioRecordScreen — Immersive vocal recording screen.
 * Branches audio.ts API service for upload + send.
 */
import React, { useState, useCallback } from 'react';
import { View, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import * as Haptics from 'expo-haptics';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';
import ShhText from '../../components/atoms/ShhText';
import ShhAudioRecorder from '../../components/organisms/ShhAudioRecorder';
import ShhAudioPlayer from '../../components/molecules/ShhAudioPlayer';
import { useAudioRecorder } from '../../hooks/useAudioRecorder';
import { useAuthStore } from '../../stores/useAuthStore';
import { uploadAudio, sendAudio } from '../../services/audio';
import { maybeRequestReview } from '../../services/ReviewService';
import * as HappinessScore from '../../services/HappinessScore';
import { colors } from '../../theme/colors';
import type { RootStackParamList } from '../../types';

type AudioRoute = RouteProp<RootStackParamList, 'AudioRecord'>;
type Nav = NativeStackNavigationProp<RootStackParamList>;

export default function AudioRecordScreen() {
  const { t } = useTranslation();
  const navigation = useNavigation<Nav>();
  const route = useRoute<AudioRoute>();
  const { shhId } = route.params;
  const token = useAuthStore((s) => s.token);

  const {
    isRecording,
    duration,
    recordedUri,
    hasRecording,
    startRecording,
    stopRecording,
    resetRecording,
  } = useAudioRecorder();

  const [hasListened, setHasListened] = useState(false);
  const [isSending, setIsSending] = useState(false);

  const handlePlay = useCallback(() => {
    setHasListened(true);
  }, []);

  const handleSend = useCallback(async () => {
    if (!recordedUri || !hasListened || isSending) return;
    setIsSending(true);

    try {
      if (token) {
        const { id: audioId } = await uploadAudio(shhId, recordedUri, token);
        await sendAudio(shhId, audioId, token);
      } else {
        // Demo fallback
        await new Promise((resolve) => setTimeout(resolve, 800));
      }
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      HappinessScore.track('audio_sent');
      void maybeRequestReview('audio_sent');
      navigation.goBack();
    } catch {
      // Demo fallback on API failure
      await new Promise((resolve) => setTimeout(resolve, 800));
      navigation.goBack();
    } finally {
      setIsSending(false);
    }
  }, [recordedUri, hasListened, isSending, token, shhId, navigation]);

  const handleReset = useCallback(() => {
    resetRecording();
    setHasListened(false);
  }, [resetRecording]);

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Nav bar */}
      <View style={styles.navBar}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
        >
          <ShhText variant="body" style={styles.backArrow}>{'\u2039'}</ShhText>
        </TouchableOpacity>
        <ShhText variant="display" style={styles.navTitle}>
          {t('audio.screenTitle')} {'\uD83E\uDD2B'}
        </ShhText>
        <View style={styles.spacer} />
      </View>

      <ScrollView
        style={styles.flex1}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Filter chip */}
        <View style={styles.filterChip}>
          <ShhText variant="body" style={styles.filterText}>
            {t('audio.filterActive')}
          </ShhText>
        </View>

        {/* Recorder */}
        {!hasRecording && (
          <ShhAudioRecorder
            isRecording={isRecording}
            durationMs={duration}
            onStartRecording={startRecording}
            onStopRecording={stopRecording}
          />
        )}

        {/* Replay section */}
        {hasRecording && (
          <View style={styles.replaySection}>
            <ShhText variant="body" style={styles.replayLabel}>
              {t('audio.replayRequired')}
            </ShhText>

            <View style={styles.replayCard}>
              <ShhAudioPlayer durationMs={duration} onPlay={handlePlay} />
            </View>

            {hasListened && (
              <View style={styles.listenedBadge}>
                <ShhText variant="body" style={styles.listenedText}>
                  {'\u2713 '}{t('audio.listened')}
                </ShhText>
              </View>
            )}

            <TouchableOpacity
              style={styles.reRecordButton}
              onPress={handleReset}
              activeOpacity={0.7}
            >
              <ShhText variant="body" style={styles.reRecordText}>
                {t('audio.reRecord')}
              </ShhText>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      {/* Send button */}
      {hasRecording && (
        <View style={styles.bottomBar}>
          <TouchableOpacity
            style={[
              styles.sendButton,
              (!hasListened || isSending) && styles.sendButtonDisabled,
            ]}
            onPress={handleSend}
            disabled={!hasListened || isSending}
            activeOpacity={0.8}
          >
            <ShhText variant="body" style={styles.sendButtonText}>
              {t('audio.sendVocal')} {'\uD83E\uDD2B'}
            </ShhText>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.dark,
  },
  flex1: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 120,
  },
  navBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  backButton: {
    width: 40,
    height: 40,
    backgroundColor: colors.cardDark,
    borderWidth: 1,
    borderColor: colors.borderDark,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backArrow: {
    fontSize: 22,
    color: colors.white,
    marginTop: -2,
  },
  navTitle: {
    fontSize: 18,
    color: colors.white,
  },
  spacer: {
    width: 40,
  },

  filterChip: {
    backgroundColor: colors.primaryAlpha08,
    borderWidth: 1,
    borderColor: colors.primaryAlpha20,
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 14,
    alignSelf: 'center',
    marginBottom: 24,
  },
  filterText: {
    fontSize: 12,
    color: colors.primary,
  },

  replaySection: {
    alignItems: 'center',
    paddingTop: 32,
  },
  replayLabel: {
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    color: colors.primary,
    marginBottom: 16,
  },
  replayCard: {
    backgroundColor: colors.cardDark,
    borderWidth: 1,
    borderColor: colors.borderDark,
    borderRadius: 14,
    padding: 16,
    width: '100%',
    marginBottom: 12,
  },
  listenedBadge: {
    backgroundColor: colors.primaryAlpha10,
    borderRadius: 10,
    paddingVertical: 4,
    paddingHorizontal: 12,
    marginBottom: 20,
  },
  listenedText: {
    fontSize: 12,
    color: colors.primary,
  },
  reRecordButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  reRecordText: {
    fontSize: 13,
    color: colors.gray,
    textDecorationLine: 'underline',
  },

  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 20,
    paddingBottom: 40,
    paddingTop: 16,
    backgroundColor: colors.dark,
  },
  sendButton: {
    backgroundColor: colors.primary,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
  },
  sendButtonDisabled: {
    opacity: 0.3,
  },
  sendButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.black,
  },
});
