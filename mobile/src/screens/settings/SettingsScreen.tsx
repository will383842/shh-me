/**
 * SettingsScreen — Immersive 2026 settings with yellow bg.
 * Sections with custom toggles, danger zone, panic exit.
 */
import React, { useState } from 'react';
import {
  View,
  ScrollView,
  TouchableOpacity,
  Alert,
  Linking,
  StyleSheet,
} from 'react-native';
import Animated, {
  useAnimatedStyle,
  withTiming,
  interpolateColor,
} from 'react-native-reanimated';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';
import ShhText from '../../components/atoms/ShhText';
import { useAuthStore } from '../../stores/useAuthStore';
import { useSettingsStore } from '../../stores/useSettingsStore';
import { apiRequest } from '../../services/api';
import type { RootStackParamList } from '../../types';

type Nav = NativeStackNavigationProp<RootStackParamList>;

const PRIVACY_URL = 'https://shh-me.com/privacy';
const TERMS_URL = 'https://shh-me.com/terms';

const SUPPORTED_LOCALES = ['en', 'fr'] as const;
const LOCALE_LABELS: Record<string, string> = { en: 'English', fr: 'Fran\u00e7ais' };

/* ─── Custom Toggle ─── */
function ShhToggle({ value, onValueChange }: { value: boolean; onValueChange: (v: boolean) => void }) {
  const animValue = React.useRef(value ? 1 : 0);

  // Simple approach without shared values for the toggle track
  return (
    <TouchableOpacity
      style={[styles.toggleTrack, value ? styles.toggleTrackOn : styles.toggleTrackOff]}
      onPress={() => onValueChange(!value)}
      activeOpacity={0.8}
      accessibilityRole="switch"
      accessibilityState={{ checked: value }}
    >
      <View style={[styles.toggleThumb, value ? styles.toggleThumbOn : styles.toggleThumbOff]} />
    </TouchableOpacity>
  );
}

/* ─── Section Label ─── */
function SectionLabel({ text }: { text: string }) {
  return (
    <ShhText variant="body" style={styles.sectionLabel}>{text}</ShhText>
  );
}

/* ─── Setting Item ─── */
interface SettingItemProps {
  icon: string;
  label: string;
  subtitle?: string;
  onPress?: () => void;
  right?: React.ReactNode;
  isFirst?: boolean;
  isLast?: boolean;
}

function SettingItem({ icon, label, subtitle, onPress, right, isFirst, isLast }: SettingItemProps) {
  return (
    <TouchableOpacity
      style={[
        styles.item,
        isFirst && styles.itemFirst,
        isLast && styles.itemLast,
        !isFirst && !isLast && styles.itemMiddle,
      ]}
      onPress={onPress}
      activeOpacity={onPress ? 0.7 : 1}
      disabled={!onPress && !right}
      accessibilityLabel={label}
      accessibilityRole="button"
    >
      <View style={styles.itemLeft}>
        <ShhText variant="body" style={styles.itemIcon}>{icon}</ShhText>
        <View style={styles.itemTextContainer}>
          <ShhText variant="body" style={styles.itemLabel}>{label}</ShhText>
          {subtitle && (
            <ShhText variant="body" style={styles.itemSubtitle}>{subtitle}</ShhText>
          )}
        </View>
      </View>
      {right ?? (onPress && <ShhText variant="body" style={styles.itemArrow}>{'›'}</ShhText>)}
    </TouchableOpacity>
  );
}

/* ─── Danger Item ─── */
interface DangerItemProps {
  icon: string;
  label: string;
  subtitle?: string;
  onPress: () => void;
  isFirst?: boolean;
  isLast?: boolean;
}

function DangerItem({ icon, label, subtitle, onPress, isFirst, isLast }: DangerItemProps) {
  return (
    <TouchableOpacity
      style={[
        styles.dangerItem,
        isFirst && styles.itemFirst,
        isLast && styles.itemLast,
        !isFirst && !isLast && styles.itemMiddle,
      ]}
      onPress={onPress}
      activeOpacity={0.7}
      accessibilityLabel={label}
      accessibilityRole="button"
    >
      <View style={styles.itemLeft}>
        <ShhText variant="body" style={styles.dangerIcon}>{icon}</ShhText>
        <View style={styles.itemTextContainer}>
          <ShhText variant="body" style={styles.dangerLabel}>{label}</ShhText>
          {subtitle && (
            <ShhText variant="body" style={styles.dangerSubtitle}>{subtitle}</ShhText>
          )}
        </View>
      </View>
      <ShhText variant="body" style={styles.dangerArrow}>{'›'}</ShhText>
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
  const [newShhNotif, setNewShhNotif] = useState(true);
  const [messageNotif, setMessageNotif] = useState(true);
  const [guessNotif, setGuessNotif] = useState(true);

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
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      {/* ─── Header ─── */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
        >
          <ShhText variant="body" style={styles.backArrow}>{'‹'}</ShhText>
        </TouchableOpacity>
        <ShhText variant="display" style={styles.headerTitle}>
          {t('settings.title')}
        </ShhText>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* ─── Notifications ─── */}
        <SectionLabel text={t('settings.notificationsSection', { defaultValue: 'NOTIFICATIONS' })} />
        <View style={styles.sectionGroup}>
          <SettingItem
            icon="🔔"
            label={t('settings.notifications')}
            isFirst
            right={<ShhToggle value={notificationsEnabled} onValueChange={handleToggleNotifications} />}
          />
          <SettingItem
            icon="🤫"
            label={t('settings.newShhNotif', { defaultValue: 'Nouveau shh reçu' })}
            right={<ShhToggle value={newShhNotif} onValueChange={setNewShhNotif} />}
          />
          <SettingItem
            icon="💬"
            label={t('settings.messageNotif', { defaultValue: 'Messages' })}
            right={<ShhToggle value={messageNotif} onValueChange={setMessageNotif} />}
          />
          <SettingItem
            icon="🎯"
            label={t('settings.guessNotif', { defaultValue: 'Tentatives de devinette' })}
            isLast
            right={<ShhToggle value={guessNotif} onValueChange={setGuessNotif} />}
          />
        </View>

        {/* ─── Confidentialité ─── */}
        <SectionLabel text={t('settings.privacySection', { defaultValue: 'CONFIDENTIALITÉ' })} />
        <View style={styles.sectionGroup}>
          <SettingItem
            icon="👻"
            label={t('settings.ghost')}
            subtitle={t('settings.ghostSubtitle', { defaultValue: 'Masque ta présence en ligne' })}
            isFirst
            right={<ShhToggle value={ghostEnabled} onValueChange={handleToggleGhost} />}
          />
          <SettingItem
            icon="🚫"
            label={t('settings.blocked')}
            onPress={() => { /* Navigate to blocked list */ }}
            isLast
          />
        </View>

        {/* ─── Langue ─── */}
        <SectionLabel text={t('settings.languageSection', { defaultValue: 'LANGUE' })} />
        <View style={styles.sectionGroup}>
          <SettingItem
            icon="🌍"
            label={`${t('settings.language')}: ${LOCALE_LABELS[locale] || locale.toUpperCase()}`}
            onPress={handleToggleLanguage}
            isFirst
            isLast
          />
        </View>

        {/* ─── Support ─── */}
        <SectionLabel text={t('settings.supportSection', { defaultValue: 'SUPPORT' })} />
        <View style={styles.sectionGroup}>
          <SettingItem
            icon="❓"
            label={t('settings.helpFeedback')}
            onPress={() => Linking.openURL('mailto:help@shh-me.com')}
            isFirst
          />
          <SettingItem
            icon="📜"
            label={t('settings.terms')}
            onPress={() => Linking.openURL(TERMS_URL)}
            isLast
          />
        </View>

        {/* ─── Danger Zone ─── */}
        <SectionLabel text={t('settings.dangerSection', { defaultValue: 'ZONE DANGER' })} />
        <View style={styles.sectionGroup}>
          <DangerItem
            icon="🚨"
            label={t('settings.panic')}
            subtitle={t('settings.panicSubtitle', { defaultValue: 'Supprime tout et déconnecte immédiatement' })}
            onPress={handlePanic}
            isFirst
          />
          <DangerItem
            icon="🚪"
            label={t('settings.logout')}
            subtitle={t('settings.logoutSubtitle', { defaultValue: 'Tu pourras te reconnecter plus tard' })}
            onPress={handleLogout}
          />
          <DangerItem
            icon="💀"
            label={t('settings.deleteAccount')}
            subtitle={t('settings.deleteSubtitle', { defaultValue: 'Irréversible — toutes les données seront supprimées' })}
            onPress={handleDeleteAccount}
            isLast
          />
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#DCFB4E',
  },

  /* ─── Header ─── */
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  backButton: {
    width: 40,
    height: 40,
    backgroundColor: 'rgba(0,0,0,0.1)',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backArrow: {
    fontSize: 22,
    color: '#000000',
    marginTop: -2,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#000000',
  },

  /* ─── Scroll ─── */
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 40,
  },

  /* ─── Section labels ─── */
  sectionLabel: {
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    color: 'rgba(0,0,0,0.3)',
    marginBottom: 8,
    marginTop: 24,
    marginLeft: 4,
  },
  sectionGroup: {
    overflow: 'hidden',
  },

  /* ─── Items ─── */
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(0,0,0,0.09)',
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginBottom: 1,
  },
  itemFirst: {
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  itemLast: {
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
    marginBottom: 0,
  },
  itemMiddle: {},
  itemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  itemIcon: {
    fontSize: 18,
    marginRight: 12,
  },
  itemTextContainer: {
    flex: 1,
  },
  itemLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000000',
  },
  itemSubtitle: {
    fontSize: 11,
    color: '#555555',
    marginTop: 2,
  },
  itemArrow: {
    fontSize: 18,
    color: 'rgba(0,0,0,0.25)',
    marginLeft: 8,
  },

  /* ─── Toggle ─── */
  toggleTrack: {
    width: 46,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    paddingHorizontal: 3,
  },
  toggleTrackOn: {
    backgroundColor: '#000000',
    alignItems: 'flex-end',
  },
  toggleTrackOff: {
    backgroundColor: 'rgba(0,0,0,0.15)',
    alignItems: 'flex-start',
  },
  toggleThumb: {
    width: 22,
    height: 22,
    borderRadius: 11,
  },
  toggleThumbOn: {
    backgroundColor: '#DCFB4E',
  },
  toggleThumbOff: {
    backgroundColor: '#999999',
  },

  /* ─── Danger items ─── */
  dangerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(255,69,58,0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255,69,58,0.15)',
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginBottom: 1,
  },
  dangerIcon: {
    fontSize: 18,
    marginRight: 12,
  },
  dangerLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: '#ff453a',
  },
  dangerSubtitle: {
    fontSize: 11,
    color: 'rgba(255,69,58,0.6)',
    marginTop: 2,
  },
  dangerArrow: {
    fontSize: 18,
    color: 'rgba(255,69,58,0.4)',
    marginLeft: 8,
  },
});
