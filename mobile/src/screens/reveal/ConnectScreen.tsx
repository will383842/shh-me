/**
 * ConnectScreen — Dark bg #111111 mutual reveal countdown screen.
 * Countdown ring, ECG line, cancel button, auto-transition to confetti state.
 */
import React, { useState, useEffect, useCallback } from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  withDelay,
  Easing,
} from 'react-native-reanimated';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';
import ShhText from '../../components/atoms/ShhText';
import ShhConnectCountdown from '../../components/organisms/ShhConnectCountdown';
import { colors } from '../../theme/colors';
import type { RootStackParamList } from '../../types';

type ConnectRoute = RouteProp<RootStackParamList, 'Connect'>;
type Nav = NativeStackNavigationProp<RootStackParamList>;

const COUNTDOWN_SECONDS = 5;

/* ECG Line animation */
function EcgLine() {
  const translateX = useSharedValue(0);

  useEffect(() => {
    translateX.value = withRepeat(
      withTiming(-200, { duration: 2000, easing: Easing.linear }),
      -1,
      false,
    );
  }, [translateX]);

  const lineStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  return (
    <View style={styles.ecgContainer}>
      <Animated.View style={[styles.ecgLine, lineStyle]}>
        {/* Simple bar segments simulating ECG */}
        <View style={styles.ecgFlat} />
        <View style={styles.ecgPeak} />
        <View style={styles.ecgDip} />
        <View style={styles.ecgPeak} />
        <View style={styles.ecgFlat} />
        <View style={styles.ecgSmallPeak} />
        <View style={styles.ecgFlat} />
        <View style={styles.ecgPeak} />
        <View style={styles.ecgDip} />
        <View style={styles.ecgFlat} />
      </Animated.View>
    </View>
  );
}

/* Confetti bounce animation */
function ConfettiStrip() {
  const bounce = useSharedValue(0);

  useEffect(() => {
    bounce.value = withRepeat(
      withSequence(
        withTiming(-8, { duration: 400, easing: Easing.out(Easing.ease) }),
        withTiming(0, { duration: 400, easing: Easing.inOut(Easing.ease) }),
      ),
      -1,
      true,
    );
  }, [bounce]);

  const bounceStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: bounce.value }],
  }));

  return (
    <Animated.View style={bounceStyle}>
      <ShhText variant="display" style={styles.confettiText}>
        {'🎉✨🤫✨🎉'}
      </ShhText>
    </Animated.View>
  );
}

export default function ConnectScreen() {
  const { t } = useTranslation();
  const navigation = useNavigation<Nav>();
  const route = useRoute<ConnectRoute>();
  const { shhId } = route.params;

  const [countdown, setCountdown] = useState(COUNTDOWN_SECONDS);
  const [isConnected, setIsConnected] = useState(false);
  const [isActive, setIsActive] = useState(true);

  useEffect(() => {
    if (!isActive || isConnected) return;

    if (countdown <= 0) {
      setIsConnected(true);
      return;
    }

    const timer = setTimeout(() => {
      setCountdown((prev) => prev - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [countdown, isActive, isConnected]);

  const handleCancel = useCallback(() => {
    setIsActive(false);
    navigation.goBack();
  }, [navigation]);

  const handleGoToVideo = useCallback(() => {
    navigation.navigate('ConnectVideo', { shhId });
  }, [navigation, shhId]);

  const handleSendAnother = useCallback(() => {
    navigation.navigate('SendShh');
  }, [navigation]);

  if (isConnected) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.connectedContainer}>
          <ConfettiStrip />

          <ShhText variant="display" style={styles.connectedTitle}>
            {'🤫 '}{t('connect.connected', { defaultValue: 'Connected' })}
          </ShhText>

          <ShhText variant="body" style={styles.connectedSubtitle}>
            {t('connect.numbersExchanged', { defaultValue: 'Numéros échangés.' })}
          </ShhText>

          <View style={styles.connectedButtons}>
            <TouchableOpacity
              style={styles.videoButton}
              onPress={handleGoToVideo}
              activeOpacity={0.8}
            >
              <ShhText variant="body" style={styles.videoButtonText}>
                {t('connect.seeVideo', { defaultValue: 'Voir la vidéo souvenir' })} {'🎬'}
              </ShhText>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.sendAnotherButton}
              onPress={handleSendAnother}
              activeOpacity={0.8}
            >
              <ShhText variant="body" style={styles.sendAnotherText}>
                {t('connect.sendAnother', { defaultValue: 'Envoie un shh à quelqu\'un d\'autre' })} {'🤫'}
              </ShhText>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Label */}
        <ShhText variant="body" style={styles.mutualLabel}>
          {t('connect.mutualLabel', { defaultValue: 'RÉVÉLATION MUTUELLE' })}
        </ShhText>

        {/* Title */}
        <ShhText variant="display" style={styles.title}>
          {t('connect.bothWant', { defaultValue: 'Les deux veulent se révéler' })} {'🤫'}
        </ShhText>

        {/* Subtitle */}
        <ShhText variant="body" style={styles.subtitle}>
          {t('connect.countdownInfo', {
            defaultValue: 'Countdown de 5 secondes.\nTu peux annuler à tout moment.',
          })}
        </ShhText>

        {/* Countdown ring */}
        <View style={styles.countdownWrapper}>
          <ShhConnectCountdown
            count={countdown}
            totalSeconds={COUNTDOWN_SECONDS}
            isActive={isActive}
          />
        </View>

        {/* ECG line */}
        <EcgLine />

        {/* Cancel button */}
        <TouchableOpacity
          style={styles.cancelButton}
          onPress={handleCancel}
          activeOpacity={0.7}
        >
          <ShhText variant="body" style={styles.cancelText}>
            {t('connect.cancel', { defaultValue: 'Annuler' })}
          </ShhText>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.dark,
  },
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },

  /* Label */
  mutualLabel: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 2,
    color: colors.primary,
    marginBottom: 12,
  },

  /* Title */
  title: {
    fontSize: 28,
    color: colors.white,
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

  /* Countdown */
  countdownWrapper: {
    marginBottom: 32,
  },

  /* ECG */
  ecgContainer: {
    width: '100%',
    height: 30,
    overflow: 'hidden',
    marginBottom: 40,
  },
  ecgLine: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 30,
    width: 600,
  },
  ecgFlat: {
    width: 60,
    height: 2,
    backgroundColor: 'rgba(220,251,78,0.2)',
  },
  ecgPeak: {
    width: 3,
    height: 20,
    backgroundColor: 'rgba(220,251,78,0.4)',
    borderRadius: 1,
  },
  ecgDip: {
    width: 3,
    height: 12,
    backgroundColor: 'rgba(220,251,78,0.3)',
    borderRadius: 1,
    marginTop: 8,
  },
  ecgSmallPeak: {
    width: 3,
    height: 10,
    backgroundColor: 'rgba(220,251,78,0.25)',
    borderRadius: 1,
  },

  /* Cancel */
  cancelButton: {
    borderWidth: 1,
    borderColor: colors.borderDark,
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 48,
    backgroundColor: 'transparent',
  },
  cancelText: {
    fontSize: 14,
    color: '#444444',
  },

  /* Connected state */
  connectedContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  confettiText: {
    fontSize: 36,
    textAlign: 'center',
    marginBottom: 24,
  },
  connectedTitle: {
    fontSize: 30,
    color: colors.primary,
    textAlign: 'center',
    marginBottom: 8,
  },
  connectedSubtitle: {
    fontSize: 14,
    color: '#444444',
    textAlign: 'center',
    marginBottom: 48,
  },
  connectedButtons: {
    width: '100%',
    gap: 12,
  },
  videoButton: {
    backgroundColor: colors.primary,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
  },
  videoButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.black,
  },
  sendAnotherButton: {
    borderWidth: 1,
    borderColor: colors.borderDark,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  sendAnotherText: {
    fontSize: 14,
    color: '#444444',
  },
});
