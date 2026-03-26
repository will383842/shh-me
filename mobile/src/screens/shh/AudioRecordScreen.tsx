/**
 * AudioRecordScreen — Dark bg #111111 immersive vocal recording screen.
 * Filter chip, waveform, timer, record button, replay section, send button.
 */
import React, { useState, useCallback } from 'react';
import { View, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';
import ShhText from '../../components/atoms/ShhText';
import ShhAudioRecorder from '../../components/organisms/ShhAudioRecorder';
import ShhAudioPlayer from '../../components/molecules/ShhAudioPlayer';
import { useAudioRecorder } from '../../hooks/useAudioRecorder';
import { colors } from '../../theme/colors';
import type { RootStackParamList } from '../../types';

type AudioRoute = RouteProp<RootStackParamList, 'AudioRecord'>;
type Nav = NativeStackNavigationProp<RootStackParamList>;

export default function AudioRecordScreen() {
  const { t } = useTranslation();
  const navigation = useNavigation<Nav>();
  const route = useRoute<AudioRoute>();
  const { shhId } = route.params;

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
    // Demo: simulate send delay
    await new Promise((resolve) => setTimeout(resolve, 800));
    setIsSending(false);
    navigation.goBack();
  }, [recordedUri, hasListened, isSending, navigation]);

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
          <ShhText variant="body" style={styles.backArrow}>{'‹'}</ShhText>
        </TouchableOpacity>
        <ShhText variant="display" style={styles.navTitle}>
          {t('audio.screenTitle', { defaultValue: 'Message vocal' })} {'🤫'}
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
            {t('audio.filterActive', { defaultValue: '🎵 Filtre \'Le Souffle\' actif' })}
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
              {t('audio.replayRequired', { defaultValue: 'RÉÉCOUTE OBLIGATOIRE AVANT ENVOI' })}
            </ShhText>

            <View style={styles.replayCard}>
              <ShhAudioPlayer durationMs={duration} onPlay={handlePlay} />
            </View>

            {hasListened && (
              <View style={styles.listenedBadge}>
                <ShhText variant="body" style={styles.listenedText}>
                  {'✓ '}{t('audio.listened', { defaultValue: 'Écouté' })}
                </ShhText>
              </View>
            )}

            {/* Re-record */}
            <TouchableOpacity
              style={styles.reRecordButton}
              onPress={handleReset}
              activeOpacity={0.7}
            >
              <ShhText variant="body" style={styles.reRecordText}>
                {t('audio.reRecord', { defaultValue: 'Réenregistrer' })}
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
              {t('audio.sendVocal', { defaultValue: 'Envoyer ce vocal' })} {'🤫'}
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

  /* Filter chip */
  filterChip: {
    backgroundColor: 'rgba(220,251,78,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(220,251,78,0.2)',
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

  /* Replay section */
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
    backgroundColor: 'rgba(220,251,78,0.1)',
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
    color: '#444444',
    textDecorationLine: 'underline',
  },

  /* Bottom send bar */
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
