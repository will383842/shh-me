/**
 * SettingsScreen — User preferences and account actions.
 * Notifications, Language, Ghost mode, Help, Legal links,
 * Blocked users, Delete account, Logout, Panic button.
 */
import React, { useState } from 'react';
import {
  View,
  ScrollView,
  Switch,
  TouchableOpacity,
  Alert,
  Linking,
  StyleSheet,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import ShhText from '../../components/atoms/ShhText';
import { useAuthStore } from '../../stores/useAuthStore';
import { useSettingsStore } from '../../stores/useSettingsStore';
import { apiRequest } from '../../services/api';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import type { RootStackParamList } from '../../types';

type Nav = NativeStackNavigationProp<RootStackParamList>;

const PRIVACY_URL = 'https://shh-me.com/privacy';
const TERMS_URL = 'https://shh-me.com/terms';
const GUIDELINES_URL = 'https://shh-me.com/guidelines';

const SUPPORTED_LOCALES = ['en', 'fr'] as const;
const LOCALE_LABELS: Record<string, string> = { en: 'English', fr: 'Fran\u00e7ais' };

interface SettingRowProps {
  label: string;
  onPress?: () => void;
  right?: React.ReactNode;
  destructive?: boolean;
  accessibilityLabel?: string;
}

function SettingRow({ label, onPress, right, destructive, accessibilityLabel }: SettingRowProps) {
  return (
    <TouchableOpacity
      style={styles.row}
      onPress={onPress}
      activeOpacity={onPress ? 0.7 : 1}
      disabled={!onPress}
      accessibilityLabel={accessibilityLabel || label}
      accessibilityRole="button"
    >
      <ShhText
        variant="body"
        style={[
          styles.rowLabel,
          destructive && styles.destructiveLabel,
        ]}
      >
        {label}
      </ShhText>
      {right}
    </TouchableOpacity>
  );
}

export default function SettingsScreen() {
  const { t, i18n } = useTranslation();
  const navigation = useNavigation<Nav>();
  const logout = useAuthStore((s) => s.logout);
  const token = useAuthStore((s) => s.token);

  const {
    notificationsEnabled,
    setNotificationsEnabled,
    locale,
    setLocale,
  } = useSettingsStore();

  const [ghostEnabled, setGhostEnabled] = useState(false);

  const handleToggleNotifications = (value: boolean) => {
    setNotificationsEnabled(value);
    if (token) {
      void apiRequest('/user/settings', {
        method: 'PUT',
        body: { notifications_enabled: value },
        token,
      });
    }
  };

  const handleToggleLanguage = () => {
    const currentIndex = SUPPORTED_LOCALES.indexOf(locale as typeof SUPPORTED_LOCALES[number]);
    const nextLocale = SUPPORTED_LOCALES[(currentIndex + 1) % SUPPORTED_LOCALES.length];
    setLocale(nextLocale);
    void i18n.changeLanguage(nextLocale);
    if (token) {
      void apiRequest('/user/settings', {
        method: 'PUT',
        body: { locale: nextLocale },
        token,
      });
    }
  };

  const handleToggleGhost = (value: boolean) => {
    setGhostEnabled(value);
    if (token) {
      void apiRequest('/user/settings', {
        method: 'PUT',
        body: { is_ghost: value },
        token,
      });
    }
  };

  const handleDeleteAccount = () => {
    Alert.alert('', t('settings.deleteConfirm'), [
      { text: t('reveal.cancel'), style: 'cancel' },
      {
        text: t('settings.deleteAccount'),
        style: 'destructive',
        onPress: async () => {
          try {
            if (token) {
              await apiRequest('/user', { method: 'DELETE', token });
            }
            await logout();
            navigation.reset({ index: 0, routes: [{ name: 'Auth' }] });
          } catch {
            Alert.alert('', t('error.generic'));
          }
        },
      },
    ]);
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigation.reset({ index: 0, routes: [{ name: 'Auth' }] });
    } catch {
      Alert.alert('', t('error.generic'));
    }
  };

  const handlePanic = () => {
    Alert.alert('', t('settings.panicConfirm'), [
      { text: t('reveal.cancel'), style: 'cancel' },
      {
        text: t('settings.panic'),
        style: 'destructive',
        onPress: async () => {
          try {
            if (token) {
              await apiRequest('/user/panic', { method: 'POST', token });
            }
            await logout();
            navigation.reset({ index: 0, routes: [{ name: 'Auth' }] });
          } catch {
            Alert.alert('', t('error.generic'));
          }
        },
      },
    ]);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <ShhText variant="display" style={styles.title}>
        {t('settings.title')}
      </ShhText>

      <View style={styles.section}>
        <SettingRow
          label={t('settings.notifications')}
          right={
            <Switch
              value={notificationsEnabled}
              onValueChange={handleToggleNotifications}
              trackColor={{ true: colors.primary, false: colors.borderDark }}
              thumbColor={colors.white}
            />
          }
        />

        <SettingRow
          label={`${t('settings.language')}: ${LOCALE_LABELS[locale] || locale.toUpperCase()}`}
          onPress={handleToggleLanguage}
          accessibilityLabel={`${t('settings.language')}: ${LOCALE_LABELS[locale] || locale.toUpperCase()}`}
        />

        <SettingRow
          label={t('settings.ghost')}
          right={
            <Switch
              value={ghostEnabled}
              onValueChange={handleToggleGhost}
              trackColor={{ true: colors.primary, false: colors.borderDark }}
              thumbColor={colors.white}
            />
          }
        />
      </View>

      <View style={styles.section}>
        <SettingRow
          label={t('settings.helpFeedback')}
          onPress={() => Linking.openURL('mailto:help@shh-me.com')}
        />
        <SettingRow
          label={t('settings.privacyPolicy')}
          onPress={() => Linking.openURL(PRIVACY_URL)}
        />
        <SettingRow
          label={t('settings.terms')}
          onPress={() => Linking.openURL(TERMS_URL)}
        />
        <SettingRow
          label={t('settings.communityGuidelines')}
          onPress={() => Linking.openURL(GUIDELINES_URL)}
        />
      </View>

      <View style={styles.section}>
        <SettingRow
          label={t('settings.blocked')}
          onPress={() => {
            /* Navigate to blocked list */
          }}
        />
      </View>

      <View style={styles.section}>
        <SettingRow
          label={t('settings.deleteAccount')}
          onPress={handleDeleteAccount}
          destructive
        />
        <SettingRow
          label={t('settings.logout')}
          onPress={handleLogout}
        />
      </View>

      <View style={styles.panicSection}>
        <TouchableOpacity
          style={styles.panicButton}
          onPress={handlePanic}
          activeOpacity={0.8}
          accessibilityLabel={t('settings.panic')}
          accessibilityRole="button"
        >
          <ShhText variant="body" style={styles.panicText}>
            {t('settings.panic')}
          </ShhText>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.dark,
  },
  content: {
    paddingTop: spacing['3xl'],
    paddingBottom: spacing['3xl'],
  },
  title: {
    fontSize: 28,
    color: colors.textDark,
    paddingHorizontal: spacing.xl,
    marginBottom: spacing.lg,
  },
  section: {
    marginBottom: spacing.lg,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.borderDark,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.base,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.borderDark,
  },
  rowLabel: {
    fontSize: 16,
    color: colors.textDark,
  },
  destructiveLabel: {
    color: colors.error,
  },
  panicSection: {
    paddingHorizontal: spacing.xl,
    marginTop: spacing.lg,
  },
  panicButton: {
    backgroundColor: colors.error,
    borderRadius: 16,
    paddingVertical: spacing.base,
    alignItems: 'center',
  },
  panicText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '700',
  },
});
