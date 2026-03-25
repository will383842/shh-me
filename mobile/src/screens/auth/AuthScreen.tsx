/**
 * AuthScreen — Immersive 2026 auth with breathing emoji,
 * Apple / Google / Email sign-in, legal links.
 */
import React, { useEffect, useState } from 'react';
import {
  View,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Text,
  Linking,
  Platform,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '../../stores/useAuthStore';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import type { RootStackParamList } from '../../types';

type Nav = NativeStackNavigationProp<RootStackParamList, 'Auth'>;

export default function AuthScreen() {
  const { t } = useTranslation();
  const navigation = useNavigation<Nav>();
  const login = useAuthStore((s) => s.login);
  const isNewUser = useAuthStore((s) => s.isNewUser);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Breathing emoji animation (3s cycle)
  const emojiScale = useSharedValue(1);

  useEffect(() => {
    emojiScale.value = withRepeat(
      withTiming(1.08, { duration: 3000, easing: Easing.inOut(Easing.ease) }),
      -1,
      true,
    );
  }, [emojiScale]);

  const emojiAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: emojiScale.value }],
  }));

  const handleLogin = async (provider: 'apple' | 'google') => {
    if (isLoggingIn) return;
    setIsLoggingIn(true);

    try {
      // In production, get the real idToken from Apple/Google SDK
      // For now, this will be replaced with actual auth flow
      const idToken = 'placeholder_token';
      await login(provider, idToken);

      if (isNewUser) {
        navigation.reset({ index: 0, routes: [{ name: 'BirthYear' }] });
      } else {
        navigation.reset({ index: 0, routes: [{ name: 'Home' }] });
      }
    } catch {
      Alert.alert('', t('error.generic'));
    } finally {
      setIsLoggingIn(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        {/* Breathing emoji */}
        <Animated.Text style={[styles.emoji, emojiAnimatedStyle]}>
          {'\ud83e\udd2b'}
        </Animated.Text>

        {/* Title */}
        <Text style={styles.title}>{t('auth.title')}</Text>

        {/* Subtitle */}
        <Text style={styles.subtitle}>{t('auth.subtitle')}</Text>

        {/* Buttons */}
        <View style={styles.buttons}>
          {/* Apple button */}
          <TouchableOpacity
            style={styles.buttonApple}
            activeOpacity={0.8}
            onPress={() => handleLogin('apple')}
            disabled={isLoggingIn}
            accessibilityLabel={t('auth.signInApple')}
            accessibilityRole="button"
          >
            <Text style={styles.buttonAppleIcon}>{'\uD83C\uDF4E'}</Text>
            <Text style={styles.buttonAppleText}>{t('auth.signInApple')}</Text>
          </TouchableOpacity>

          {/* Google button */}
          <TouchableOpacity
            style={styles.buttonGoogle}
            activeOpacity={0.8}
            onPress={() => handleLogin('google')}
            disabled={isLoggingIn}
            accessibilityLabel={t('auth.signInGoogle')}
            accessibilityRole="button"
          >
            <Text style={styles.buttonGoogleIcon}>G</Text>
            <Text style={styles.buttonGoogleText}>{t('auth.signInGoogle')}</Text>
          </TouchableOpacity>

          {/* Email button */}
          <TouchableOpacity
            style={styles.buttonEmail}
            activeOpacity={0.8}
            onPress={() => {
              // TODO: Navigate to email auth screen
            }}
            disabled={isLoggingIn}
            accessibilityLabel={t('auth.signInEmail')}
            accessibilityRole="button"
          >
            <Text style={styles.buttonEmailText}>{t('auth.signInEmail')}</Text>
          </TouchableOpacity>

          {/* Demo mode (__DEV__ only) — full walkthrough */}
          {__DEV__ && (
            <>
              <TouchableOpacity
                style={styles.buttonDemo}
                activeOpacity={0.8}
                onPress={() => {
                  useAuthStore.getState().setToken('demo-token');
                  useAuthStore.getState().setIsNewUser(true);
                  navigation.reset({ index: 0, routes: [{ name: 'BirthYear' }] });
                }}
              >
                <Text style={styles.buttonDemoText}>
                  {'🎭 Demo — Parcours complet (Onboarding → Home)'}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.buttonDemo, { backgroundColor: '#1A1A1A', borderWidth: 1, borderColor: colors.primary }]}
                activeOpacity={0.8}
                onPress={() => {
                  useAuthStore.getState().setToken('demo-token');
                  navigation.reset({ index: 0, routes: [{ name: 'Home' }] });
                }}
              >
                <Text style={[styles.buttonDemoText, { color: colors.primary }]}>
                  {'🏠 Demo — Home directement (avec shh fictifs)'}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.buttonDemo, { backgroundColor: '#1A1A1A', borderWidth: 1, borderColor: colors.primary }]}
                activeOpacity={0.8}
                onPress={() => {
                  useAuthStore.getState().setToken('demo-token');
                  navigation.reset({ index: 0, routes: [{ name: 'SendShh' }] });
                }}
              >
                <Text style={[styles.buttonDemoText, { color: colors.primary }]}>
                  {'🤫 Demo — Envoyer un shh'}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.buttonDemo, { backgroundColor: '#1A1A1A', borderWidth: 1, borderColor: colors.primary }]}
                activeOpacity={0.8}
                onPress={() => {
                  useAuthStore.getState().setToken('demo-token');
                  navigation.reset({ index: 0, routes: [{ name: 'ShhDetail', params: { shhId: 'demo-shh-1' } }] });
                }}
              >
                <Text style={[styles.buttonDemoText, { color: colors.primary }]}>
                  {'💬 Demo — Détail shh (messages + photo blur)'}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.buttonDemo, { backgroundColor: '#1A1A1A', borderWidth: 1, borderColor: colors.primary }]}
                activeOpacity={0.8}
                onPress={() => {
                  useAuthStore.getState().setToken('demo-token');
                  navigation.reset({ index: 0, routes: [{ name: 'Settings' }] });
                }}
              >
                <Text style={[styles.buttonDemoText, { color: colors.primary }]}>
                  {'⚙️ Demo — Paramètres'}
                </Text>
              </TouchableOpacity>
            </>
          )}
        </View>

        {/* Legal text */}
        <Text style={styles.legal}>
          {t('auth.legal')}
          <Text
            style={styles.legalLink}
            onPress={() => Linking.openURL('https://shhme.app/terms')}
          >
            {t('auth.terms')}
          </Text>
          {t('auth.and')}
          <Text
            style={styles.legalLink}
            onPress={() => Linking.openURL('https://shhme.app/privacy')}
          >
            {t('auth.privacy')}
          </Text>
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#111111',
    justifyContent: 'center',
    paddingHorizontal: 28,
  },
  content: {
    alignItems: 'center',
  },
  emoji: {
    fontSize: 56,
    marginBottom: 20,
  },
  title: {
    ...typography.displayExtra,
    fontSize: 34,
    color: colors.white,
    textAlign: 'center',
    marginBottom: 10,
  },
  subtitle: {
    ...typography.body,
    fontSize: 14,
    color: '#444444',
    textAlign: 'center',
    lineHeight: 22.4, // 14 * 1.6
    marginBottom: 36,
  },
  buttons: {
    width: '100%',
    gap: 10,
  },
  // Apple button — white bg, black text
  buttonApple: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.white,
    borderRadius: 14,
    paddingVertical: 17,
    gap: 10,
  },
  buttonAppleIcon: {
    fontSize: 18,
    color: colors.black,
  },
  buttonAppleText: {
    ...typography.bodyBold,
    fontSize: 15,
    color: colors.black,
  },
  // Google button — #DCFB4E bg, black text
  buttonGoogle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    borderRadius: 14,
    paddingVertical: 17,
    gap: 10,
  },
  buttonGoogleIcon: {
    ...typography.bodyBold,
    fontSize: 18,
    color: colors.black,
  },
  buttonGoogleText: {
    ...typography.bodyBold,
    fontSize: 15,
    color: colors.black,
  },
  // Email button — transparent bg, border #222
  buttonEmail: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#222222',
    paddingVertical: 15,
  },
  buttonEmailText: {
    ...typography.body,
    fontSize: 14,
    color: '#444444',
  },
  // Demo button
  buttonDemo: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    borderRadius: 14,
    paddingVertical: 15,
    marginTop: 4,
  },
  buttonDemoText: {
    ...typography.bodyBold,
    fontSize: 14,
    color: colors.black,
  },
  // Legal
  legal: {
    ...typography.body,
    fontSize: 11,
    color: '#2a2a2a',
    textAlign: 'center',
    marginTop: 20,
    lineHeight: 16,
  },
  legalLink: {
    textDecorationLine: 'underline',
    color: '#2a2a2a',
  },
});
