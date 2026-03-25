/**
 * SendShhScreen — Immersive 2026 step flow to send a shh.
 * Contact picker with search, optional selfie, blur preview,
 * optional first word, ShhHeartButton hold 3s to send.
 */
import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withDelay,
  withSequence,
  interpolate,
  Easing,
} from 'react-native-reanimated';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';
import ShhText from '../../components/atoms/ShhText';
import { useShhPress } from '../../hooks/useShhPress';
import { useShhStore } from '../../stores/useShhStore';
import { colors } from '../../theme/colors';
import type { RootStackParamList } from '../../types';

type Nav = NativeStackNavigationProp<RootStackParamList, 'SendShh'>;

/* ─── Demo contacts ─── */
const DEMO_CONTACTS = [
  { id: '1', name: 'Léa Martin', subtitle: 'Ajouté récemment', initials: 'LM' },
  { id: '2', name: 'Hugo Dupont', subtitle: 'Contact fréquent', initials: 'HD' },
  { id: '3', name: 'Camille Roux', subtitle: 'Contact fréquent', initials: 'CR' },
  { id: '4', name: 'Nathan Petit', subtitle: 'Nouveau contact', initials: 'NP' },
];

/* ─── Pulsing ring component ─── */
function PulsingRings() {
  const ring1 = useSharedValue(0);
  const ring2 = useSharedValue(0);

  useEffect(() => {
    ring1.value = withRepeat(
      withTiming(1, { duration: 2400, easing: Easing.out(Easing.ease) }),
      -1,
      false,
    );
    ring2.value = withDelay(
      800,
      withRepeat(
        withTiming(1, { duration: 2400, easing: Easing.out(Easing.ease) }),
        -1,
        false,
      ),
    );
  }, [ring1, ring2]);

  const ring1Style = useAnimatedStyle(() => ({
    transform: [{ scale: interpolate(ring1.value, [0, 1], [1, 2.2]) }],
    opacity: interpolate(ring1.value, [0, 0.7, 1], [0.4, 0.15, 0]),
  }));

  const ring2Style = useAnimatedStyle(() => ({
    transform: [{ scale: interpolate(ring2.value, [0, 1], [1, 2.6]) }],
    opacity: interpolate(ring2.value, [0, 0.7, 1], [0.3, 0.1, 0]),
  }));

  return (
    <>
      <Animated.View style={[styles.pulsingRing, ring1Style]} />
      <Animated.View style={[styles.pulsingRing, ring2Style]} />
    </>
  );
}

export default function SendShhScreen() {
  const { t } = useTranslation();
  const navigation = useNavigation<Nav>();
  const sendShh = useShhStore((s) => s.sendShh);

  const [selectedContactId, setSelectedContactId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSending, setIsSending] = useState(false);

  const filteredContacts = DEMO_CONTACTS.filter((c) =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const handleSend = useCallback(async () => {
    const contact = DEMO_CONTACTS.find((c) => c.id === selectedContactId);
    if (!contact || isSending) return;
    setIsSending(true);

    try {
      await sendShh({
        receiver_phone_hash: contact.id,
      });
      Alert.alert('', t('shh.send.sent'));
      navigation.goBack();
    } catch {
      Alert.alert('', t('error.generic'));
    } finally {
      setIsSending(false);
    }
  }, [selectedContactId, isSending, sendShh, t, navigation]);

  const { onPressIn, onPressOut } = useShhPress({
    onComplete: handleSend,
  });

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* ─── Nav bar ─── */}
      <View style={styles.navBar}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
        >
          <ShhText variant="body" style={styles.backArrow}>{'‹'}</ShhText>
        </TouchableOpacity>
        <ShhText variant="body" style={styles.navTitle}>
          {t('shh.send.title', { defaultValue: 'Envoyer un shh' })}
        </ShhText>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* ─── Step 1 tag ─── */}
        <ShhText variant="body" style={styles.stepTag}>
          {t('shh.send.step1Tag', { defaultValue: 'ÉTAPE 1 — CHOISIS UN CONTACT' })}
        </ShhText>

        {/* ─── Title ─── */}
        <ShhText variant="display" style={styles.sectionTitle}>
          {t('shh.send.pickContact', { defaultValue: 'À qui ?' })}
        </ShhText>

        {/* ─── Search box ─── */}
        <View style={styles.searchBox}>
          <ShhText variant="body" style={styles.searchIcon}>{'🔍'}</ShhText>
          <TextInput
            style={styles.searchInput}
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder={t('shh.send.searchPlaceholder', { defaultValue: 'Rechercher…' })}
            placeholderTextColor="#333333"
            autoCapitalize="none"
          />
        </View>

        {/* ─── Contact cards ─── */}
        {filteredContacts.map((contact) => {
          const isSelected = contact.id === selectedContactId;
          return (
            <TouchableOpacity
              key={contact.id}
              style={[
                styles.contactCard,
                isSelected && styles.contactCardSelected,
              ]}
              onPress={() => setSelectedContactId(contact.id)}
              activeOpacity={0.7}
            >
              <View style={[styles.avatar, isSelected && styles.avatarSelected]}>
                <ShhText variant="display" style={styles.avatarText}>
                  {contact.initials.charAt(0)}
                </ShhText>
              </View>
              <View style={styles.contactInfo}>
                <ShhText variant="body" style={styles.contactName}>
                  {contact.name}
                </ShhText>
                <ShhText variant="body" style={styles.contactSubtitle}>
                  {contact.subtitle}
                </ShhText>
              </View>
              <ShhText variant="body" style={styles.contactArrow}>{'›'}</ShhText>
            </TouchableOpacity>
          );
        })}

        {/* ─── Photo hint ─── */}
        <View style={styles.photoHint}>
          <ShhText variant="body" style={styles.photoHintText}>
            {t('shh.send.photoHint', {
              defaultValue: '📸  Tu pourras ajouter un selfie flouté après avoir choisi ton contact',
            })}
          </ShhText>
        </View>

        {/* ─── Gesture section ─── */}
        <View style={styles.gestureSection}>
          <ShhText variant="body" style={styles.gestureLabel}>
            {t('shh.send.readyLabel', { defaultValue: 'PRÊT À ENVOYER ?' })}
          </ShhText>

          <View style={styles.heartContainer}>
            <PulsingRings />
            <TouchableOpacity
              style={[
                styles.heartButton,
                !selectedContactId && styles.heartButtonDisabled,
              ]}
              onPressIn={selectedContactId ? onPressIn : undefined}
              onPressOut={selectedContactId ? onPressOut : undefined}
              activeOpacity={0.9}
              disabled={!selectedContactId}
            >
              <ShhText variant="body" style={styles.heartEmoji}>{'🤫'}</ShhText>
            </TouchableOpacity>
          </View>

          <ShhText variant="body" style={styles.gestureHint}>
            {t('shh.send.gestureHint', {
              defaultValue: 'Maintiens 3s · Haptic progressif · Son « shh… »',
            })}
          </ShhText>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#111111',
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
    backgroundColor: '#1A1A1A',
    borderWidth: 1,
    borderColor: '#2A2A2A',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backArrow: {
    fontSize: 22,
    color: '#FFFFFF',
    marginTop: -2,
  },
  navTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  container: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 60,
  },

  /* Step tag */
  stepTag: {
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    color: '#DCFB4E',
    marginBottom: 6,
  },

  /* Section title */
  sectionTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 20,
  },

  /* Search box */
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1A1A1A',
    borderWidth: 1,
    borderColor: '#2A2A2A',
    borderRadius: 12,
    paddingVertical: 13,
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  searchIcon: {
    fontSize: 14,
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#FFFFFF',
    padding: 0,
  },

  /* Contact cards */
  contactCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1A1A1A',
    borderWidth: 1,
    borderColor: '#2A2A2A',
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
  },
  contactCardSelected: {
    borderColor: '#DCFB4E',
    borderWidth: 1.5,
  },
  avatar: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: '#DCFB4E',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  avatarSelected: {
    backgroundColor: '#DCFB4E',
  },
  avatarText: {
    fontSize: 18,
    fontWeight: '800',
    color: '#000000',
  },
  contactInfo: {
    flex: 1,
  },
  contactName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  contactSubtitle: {
    fontSize: 12,
    color: '#444444',
  },
  contactArrow: {
    fontSize: 18,
    color: '#333333',
    marginLeft: 8,
  },

  /* Photo hint */
  photoHint: {
    backgroundColor: 'rgba(220,251,78,0.05)',
    borderWidth: 1,
    borderColor: 'rgba(220,251,78,0.12)',
    borderRadius: 12,
    padding: 14,
    marginTop: 8,
    marginBottom: 32,
  },
  photoHintText: {
    fontSize: 13,
    color: 'rgba(220,251,78,0.6)',
    lineHeight: 18,
  },

  /* Gesture section */
  gestureSection: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  gestureLabel: {
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1,
    color: '#333333',
    marginBottom: 28,
  },
  heartContainer: {
    width: 200,
    height: 200,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  heartButton: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#DCFB4E',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  heartButtonDisabled: {
    opacity: 0.3,
  },
  heartEmoji: {
    fontSize: 48,
  },
  pulsingRing: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 2,
    borderColor: '#DCFB4E',
  },
  gestureHint: {
    fontSize: 13,
    color: '#333333',
    textAlign: 'center',
  },
});
