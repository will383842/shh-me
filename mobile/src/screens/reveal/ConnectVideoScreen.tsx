/**
 * ConnectVideoScreen — Dark bg #111111 post-connection video screen.
 * Confetti strip, BPM, connected title, video box, action buttons.
 */
import React, { useEffect, useCallback } from 'react';
import { View, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';
import ShhText from '../../components/atoms/ShhText';
import { useShareContent } from '../../hooks/useShareContent';
import { colors } from '../../theme/colors';
import type { RootStackParamList } from '../../types';

type ConnectVideoRoute = RouteProp<RootStackParamList, 'ConnectVideo'>;
type Nav = NativeStackNavigationProp<RootStackParamList>;

/* Confetti bounce */
function ConfettiBounce() {
  const bounce = useSharedValue(0);

  useEffect(() => {
    bounce.value = withRepeat(
      withSequence(
        withTiming(-6, { duration: 500, easing: Easing.out(Easing.ease) }),
        withTiming(0, { duration: 500, easing: Easing.inOut(Easing.ease) }),
      ),
      -1,
      true,
    );
  }, [bounce]);

  const style = useAnimatedStyle(() => ({
    transform: [{ translateY: bounce.value }],
  }));

  return (
    <Animated.View style={style}>
      <ShhText variant="display" style={styles.confettiText}>
        {'🎉✨🤫✨🎉'}
      </ShhText>
    </Animated.View>
  );
}

export default function ConnectVideoScreen() {
  const { t } = useTranslation();
  const navigation = useNavigation<Nav>();
  const route = useRoute<ConnectVideoRoute>();
  const { shhId } = route.params;

  const { shareContent, isSharing } = useShareContent();

  const handleSendAnother = useCallback(() => {
    navigation.navigate('SendShh');
  }, [navigation]);

  const handleShareVideo = useCallback(async () => {
    await shareContent({
      caption: t('share.videoCaption', {
        defaultValue: 'On vient de vivre un truc dingue sur Shh Me 🤫✨',
      }),
      uri: `demo://connect_video_${shhId}.mp4`,
    });
  }, [shareContent, shhId, t]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        style={styles.flex1}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Confetti strip */}
        <ConfettiBounce />

        {/* BPM */}
        <ShhText variant="display" style={styles.bpmText}>
          {'♥ 94 bpm → ∞'}
        </ShhText>

        {/* Title */}
        <ShhText variant="display" style={styles.title}>
          {'🤫 '}{t('connect.connected', { defaultValue: 'Connected' })}
        </ShhText>

        {/* Subtitle */}
        <ShhText variant="body" style={styles.subtitle}>
          {t('connect.videoSubtitle', {
            defaultValue: 'Numéros échangés.\nTu viens de vivre quelque chose de rare.',
          })}
        </ShhText>

        {/* Video box */}
        <View style={styles.videoBox}>
          <ShhText variant="body" style={styles.videoIcon}>{'🎬'}</ShhText>
          <ShhText variant="body" style={styles.videoLabel}>
            {t('connect.videoLabel', { defaultValue: 'Vidéo souvenir · 12s' })}
          </ShhText>
        </View>

        {/* Buttons */}
        <View style={styles.buttons}>
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={handleSendAnother}
            activeOpacity={0.8}
          >
            <ShhText variant="body" style={styles.primaryButtonText}>
              {t('connect.sendAnother', { defaultValue: 'Envoie un shh à quelqu\'un d\'autre' })} {'🤫'}
            </ShhText>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={handleShareVideo}
            disabled={isSharing}
            activeOpacity={0.7}
          >
            <ShhText variant="body" style={styles.secondaryButtonText}>
              {'📤 '}{t('connect.shareVideo', { defaultValue: 'Partager la vidéo' })}
            </ShhText>
          </TouchableOpacity>
        </View>
      </ScrollView>
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
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 60,
  },

  /* Confetti */
  confettiText: {
    fontSize: 36,
    textAlign: 'center',
    marginBottom: 20,
  },

  /* BPM */
  bpmText: {
    fontSize: 14,
    color: colors.primary,
    marginBottom: 16,
  },

  /* Title */
  title: {
    fontSize: 30,
    color: colors.primary,
    textAlign: 'center',
    marginBottom: 10,
  },

  /* Subtitle */
  subtitle: {
    fontSize: 14,
    color: '#444444',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 40,
  },

  /* Video box */
  videoBox: {
    width: '100%',
    backgroundColor: colors.cardDark,
    borderWidth: 1,
    borderColor: colors.borderDark,
    borderRadius: 24,
    paddingVertical: 48,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 40,
  },
  videoIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  videoLabel: {
    fontSize: 14,
    color: '#444444',
  },

  /* Buttons */
  buttons: {
    width: '100%',
    gap: 12,
  },
  primaryButton: {
    backgroundColor: colors.primary,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.black,
  },
  secondaryButton: {
    borderWidth: 1,
    borderColor: colors.borderDark,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  secondaryButtonText: {
    fontSize: 14,
    color: '#444444',
  },
});
