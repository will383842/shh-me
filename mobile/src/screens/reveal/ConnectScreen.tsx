/**
 * ConnectScreen — Mutual reveal countdown.
 * Branches useConnectPolling hook + connect.ts service.
 */
import React, { useState, useEffect, useCallback } from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';
import ShhText from '../../components/atoms/ShhText';
import ShhConnectCountdown from '../../components/organisms/ShhConnectCountdown';
import { useConnectPolling } from '../../hooks/useConnectPolling';
import { useAuthStore } from '../../stores/useAuthStore';
import { cancelConnect } from '../../services/connect';
import { maybeRequestReview } from '../../services/ReviewService';
import * as HappinessScore from '../../services/HappinessScore';
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

/* Confetti bounce */
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
        {'\uD83C\uDF89\u2728\uD83E\uDD2B\u2728\uD83C\uDF89'}
      </ShhText>
    </Animated.View>
  );
}

export default function ConnectScreen() {
  const { t } = useTranslation();
  const navigation = useNavigation<Nav>();
  const route = useRoute<ConnectRoute>();
  const { shhId } = route.params;
  const token = useAuthStore((s) => s.token);

  const { status, startPolling, stopPolling } = useConnectPolling(shhId);

  const [countdown, setCountdown] = useState(COUNTDOWN_SECONDS);
  const [isConnected, setIsConnected] = useState(false);
  const [isActive, setIsActive] = useState(true);

  // Start polling on mount
  useEffect(() => {
    startPolling();
    return () => stopPolling();
  }, [startPolling, stopPolling]);

  // When polling detects mutual, trigger connected state
  useEffect(() => {
    if (status === 'mutual' && !isConnected) {
      setIsConnected(true);
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      HappinessScore.track('reveal_completed');
      void maybeRequestReview('reveal_completed');
    }
  }, [status, isConnected]);

  // Countdown timer
  useEffect(() => {
    if (!isActive || isConnected) return;

    if (countdown <= 0) {
      setIsConnected(true);
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      HappinessScore.track('reveal_completed');
      void maybeRequestReview('reveal_completed');
      return;
    }

    const timer = setTimeout(() => {
      setCountdown((prev) => prev - 1);
      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }, 1000);

    return () => clearTimeout(timer);
  }, [countdown, isActive, isConnected]);

  const handleCancel = useCallback(async () => {
    setIsActive(false);
    stopPolling();
    if (token) {
      try {
        await cancelConnect(shhId, token);
      } catch {
        // silent
      }
    }
    navigation.goBack();
  }, [navigation, stopPolling, token, shhId]);

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
            {'\uD83E\uDD2B '}{t('connect.connected')}
          </ShhText>

          <ShhText variant="body" style={styles.connectedSubtitle}>
            {t('connect.numbersExchanged')}
          </ShhText>

          <View style={styles.connectedButtons}>
            <TouchableOpacity
              style={styles.videoButton}
              onPress={handleGoToVideo}
              activeOpacity={0.8}
            >
              <ShhText variant="body" style={styles.videoButtonText}>
                {t('connect.seeVideo')} {'\uD83C\uDFAC'}
              </ShhText>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.sendAnotherButton}
              onPress={handleSendAnother}
              activeOpacity={0.8}
            >
              <ShhText variant="body" style={styles.sendAnotherText}>
                {t('connect.sendAnother')} {'\uD83E\uDD2B'}
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
        <ShhText variant="body" style={styles.mutualLabel}>
          {t('connect.mutualLabel')}
        </ShhText>

        <ShhText variant="display" style={styles.title}>
          {t('connect.bothWant')} {'\uD83E\uDD2B'}
        </ShhText>

        <ShhText variant="body" style={styles.subtitle}>
          {t('connect.countdownInfo')}
        </ShhText>

        <View style={styles.countdownWrapper}>
          <ShhConnectCountdown
            count={countdown}
            totalSeconds={COUNTDOWN_SECONDS}
            isActive={isActive}
          />
        </View>

        <EcgLine />

        <TouchableOpacity
          style={styles.cancelButton}
          onPress={handleCancel}
          activeOpacity={0.7}
        >
          <ShhText variant="body" style={styles.cancelText}>
            {t('connect.cancel')}
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

  mutualLabel: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 2,
    color: colors.primary,
    marginBottom: 12,
  },

  title: {
    fontSize: 28,
    color: colors.white,
    textAlign: 'center',
    marginBottom: 10,
  },

  subtitle: {
    fontSize: 14,
    color: colors.gray,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 40,
  },

  countdownWrapper: {
    marginBottom: 32,
  },

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
    backgroundColor: colors.primaryAlpha20,
  },
  ecgPeak: {
    width: 3,
    height: 20,
    backgroundColor: colors.primaryAlpha40,
    borderRadius: 1,
  },
  ecgDip: {
    width: 3,
    height: 12,
    backgroundColor: colors.primaryAlpha30,
    borderRadius: 1,
    marginTop: 8,
  },
  ecgSmallPeak: {
    width: 3,
    height: 10,
    backgroundColor: colors.primaryAlpha25,
    borderRadius: 1,
  },

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
    color: colors.gray,
  },

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
    color: colors.gray,
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
    color: colors.gray,
  },
});
