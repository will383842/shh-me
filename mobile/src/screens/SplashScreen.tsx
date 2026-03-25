/**
 * SplashScreen — Full screen logo. Auto-navigates after 1.5s.
 * Plays shh-open sound (0.3s) via expo-av if not silent mode.
 */
import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Audio } from 'expo-av';
import ShhText from '../components/atoms/ShhText';
import { useAuthStore } from '../stores/useAuthStore';
import { colors } from '../theme/colors';
import type { RootStackParamList } from '../types';

type Nav = NativeStackNavigationProp<RootStackParamList, 'Splash'>;

export default function SplashScreen() {
  const navigation = useNavigation<Nav>();
  const restoreToken = useAuthStore((s) => s.restoreToken);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const isLoading = useAuthStore((s) => s.isLoading);

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

  // Auto-navigate after 1.5s once auth state is resolved
  useEffect(() => {
    if (isLoading) return;

    const timer = setTimeout(() => {
      if (isAuthenticated) {
        navigation.reset({ index: 0, routes: [{ name: 'Home' }] });
      } else {
        navigation.reset({ index: 0, routes: [{ name: 'Auth' }] });
      }
    }, 1500);

    return () => clearTimeout(timer);
  }, [isLoading, isAuthenticated, navigation]);

  return (
    <View style={styles.container}>
      <ShhText variant="display" style={styles.logo}>
        {'\ud83e\udd2b'}
      </ShhText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.dark,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    fontSize: 64,
    color: colors.primary,
  },
});
