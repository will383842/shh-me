/**
 * SplashScreen — Immersive 2026 splash with pulsing rings, breathing emoji,
 * staggered dot animation. Auto-navigates after 2s.
 */
import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Audio } from 'expo-av';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '../stores/useAuthStore';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import type { RootStackParamList } from '../types';

type Nav = NativeStackNavigationProp<RootStackParamList, 'Splash'>;

const RING_OUTER_SIZE = 180;
const RING_INNER_SIZE = 140;

function PulsingRing({
  size,
  borderColor,
  delay,
}: {
  size: number;
  borderColor: string;
  delay: number;
}) {
  const scale = useSharedValue(1);

  useEffect(() => {
    const timeout = setTimeout(() => {
      scale.value = withRepeat(
        withTiming(1.04, { duration: 2000, easing: Easing.inOut(Easing.ease) }),
        -1,
        true,
      );
    }, delay);
    return () => clearTimeout(timeout);
  }, [delay, scale]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Animated.View
      style={[
        {
          position: 'absolute',
          width: size,
          height: size,
          borderRadius: size / 2,
          borderWidth: 1.5,
          borderColor,
        },
        animatedStyle,
      ]}
    />
  );
}

function PulsingDot({ delay }: { delay: number }) {
  const scale = useSharedValue(0.5);
  const opacity = useSharedValue(0.3);

  useEffect(() => {
    const timeout = setTimeout(() => {
      scale.value = withRepeat(
        withTiming(1, { duration: 800, easing: Easing.inOut(Easing.ease) }),
        -1,
        true,
      );
      opacity.value = withRepeat(
        withTiming(1, { duration: 800, easing: Easing.inOut(Easing.ease) }),
        -1,
        true,
      );
    }, delay);
    return () => clearTimeout(timeout);
  }, [delay, scale, opacity]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  return <Animated.View style={[styles.dot, animatedStyle]} />;
}

export default function SplashScreen() {
  const { t } = useTranslation();
  const navigation = useNavigation<Nav>();
  const restoreToken = useAuthStore((s) => s.restoreToken);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const isLoading = useAuthStore((s) => s.isLoading);

  // Breathing emoji animation
  const emojiScale = useSharedValue(1);

  useEffect(() => {
    emojiScale.value = withRepeat(
      withTiming(1.08, { duration: 2000, easing: Easing.inOut(Easing.ease) }),
      -1,
      true,
    );
  }, [emojiScale]);

  const emojiAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: emojiScale.value }],
  }));

  useEffect(() => {
    void restoreToken();
  }, [restoreToken]);

  // Play shh-open sound
  useEffect(() => {
    let sound: Audio.Sound | null = null;

    void (async () => {
      try {
        const { sound: s } = await Audio.Sound.createAsync(
          // eslint-disable-next-line @typescript-eslint/no-require-imports
          require('../../assets/sounds/shh-open.aac'),
          { shouldPlay: true, volume: 0.6 },
        );
        sound = s;
      } catch {
        // Silent mode or missing asset — continue silently
      }
    })();

    return () => {
      void sound?.unloadAsync();
    };
  }, []);

  // Auto-navigate after 2s once auth state is resolved
  useEffect(() => {
    if (isLoading) return;

    const timer = setTimeout(() => {
      if (isAuthenticated) {
        navigation.reset({ index: 0, routes: [{ name: 'Home' }] });
      } else {
        navigation.reset({ index: 0, routes: [{ name: 'Auth' }] });
      }
    }, 2000);

    return () => clearTimeout(timer);
  }, [isLoading, isAuthenticated, navigation]);

  return (
    <View style={styles.container}>
      <View style={styles.centerContent}>
        {/* Concentric pulsing rings */}
        <View style={styles.ringsContainer}>
          <PulsingRing
            size={RING_OUTER_SIZE}
            borderColor="rgba(220,251,78,0.06)"
            delay={200}
          />
          <PulsingRing
            size={RING_INNER_SIZE}
            borderColor="rgba(220,251,78,0.15)"
            delay={0}
          />

          {/* Center emoji */}
          <Animated.Text style={[styles.emoji, emojiAnimatedStyle]}>
            {'\ud83e\udd2b'}
          </Animated.Text>
        </View>

        {/* App name */}
        <Animated.Text style={styles.appName}>SHH ME</Animated.Text>

        {/* Tagline */}
        <Animated.Text style={styles.tagline}>
          {t('splash.tagline')}
        </Animated.Text>

        {/* Staggered pulsing dots */}
        <View style={styles.dotsContainer}>
          <PulsingDot delay={0} />
          <PulsingDot delay={200} />
          <PulsingDot delay={400} />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#111111',
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerContent: {
    alignItems: 'center',
  },
  ringsContainer: {
    width: RING_OUTER_SIZE,
    height: RING_OUTER_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 28,
  },
  emoji: {
    fontSize: 80,
  },
  appName: {
    ...typography.displayExtra,
    fontSize: 30,
    color: colors.white,
    letterSpacing: 5,
    marginBottom: 6,
  },
  tagline: {
    ...typography.body,
    fontSize: 13,
    color: '#333333',
    marginBottom: 28,
  },
  dotsContainer: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.primary,
  },
});
