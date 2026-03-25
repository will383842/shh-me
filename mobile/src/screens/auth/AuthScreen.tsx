/**
 * AuthScreen — Apple & Google sign-in buttons.
 * After login, navigates to BirthYearScreen (new user) or HomeScreen.
 */
import React, { useState } from 'react';
import { View, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import ShhText from '../../components/atoms/ShhText';
import { useAuthStore } from '../../stores/useAuthStore';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import type { RootStackParamList } from '../../types';

type Nav = NativeStackNavigationProp<RootStackParamList, 'Auth'>;

export default function AuthScreen() {
  const { t } = useTranslation();
  const navigation = useNavigation<Nav>();
  const login = useAuthStore((s) => s.login);
  const isNewUser = useAuthStore((s) => s.isNewUser);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

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
      <View style={styles.logoSection}>
        <ShhText variant="display" style={styles.logo}>
          {'\ud83e\udd2b'}
        </ShhText>
        <ShhText variant="display" style={styles.appName}>
          Shh Me
        </ShhText>
      </View>

      <View style={styles.buttons}>
        <TouchableOpacity
          style={styles.button}
          activeOpacity={0.8}
          onPress={() => handleLogin('apple')}
          disabled={isLoggingIn}
        >
          <ShhText variant="body" style={styles.buttonText}>
            {t('auth.signInApple')}
          </ShhText>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.button}
          activeOpacity={0.8}
          onPress={() => handleLogin('google')}
          disabled={isLoggingIn}
        >
          <ShhText variant="body" style={styles.buttonText}>
            {t('auth.signInGoogle')}
          </ShhText>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.dark,
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
  },
  logoSection: {
    alignItems: 'center',
    marginBottom: spacing['3xl'],
  },
  logo: {
    fontSize: 64,
    color: colors.primary,
  },
  appName: {
    fontSize: 32,
    color: colors.primary,
    marginTop: spacing.sm,
  },
  buttons: {
    gap: spacing.base,
  },
  button: {
    backgroundColor: colors.black,
    borderRadius: 16,
    paddingVertical: spacing.base,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.borderDark,
  },
  buttonText: {
    color: colors.primary,
    fontSize: 16,
    fontWeight: '600',
  },
});
