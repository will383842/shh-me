/**
 * SendShhScreen — Step flow to send a shh.
 * Uses ShhHeartButton + ShhSelfiePreview components.
 */
import React, { useState, useCallback } from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import * as ImagePicker from 'expo-image-picker';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';
import ShhText from '../../components/atoms/ShhText';
import ShhHeartButton from '../../components/organisms/ShhHeartButton';
import ShhSelfiePreview from '../../components/organisms/ShhSelfiePreview';
import { useShhStore } from '../../stores/useShhStore';
import { maybeRequestReview } from '../../services/ReviewService';
import * as HappinessScore from '../../services/HappinessScore';
import { colors } from '../../theme/colors';
import type { RootStackParamList } from '../../types';

type Nav = NativeStackNavigationProp<RootStackParamList, 'SendShh'>;

/* ─── Demo contacts ─── */
const DEMO_CONTACTS = [
  { id: '1', name: 'L\u00e9a Martin', subtitle: 'Ajout\u00e9 r\u00e9cemment', initials: 'LM' },
  { id: '2', name: 'Hugo Dupont', subtitle: 'Contact fr\u00e9quent', initials: 'HD' },
  { id: '3', name: 'Camille Roux', subtitle: 'Contact fr\u00e9quent', initials: 'CR' },
  { id: '4', name: 'Nathan Petit', subtitle: 'Nouveau contact', initials: 'NP' },
];

export default function SendShhScreen() {
  const { t } = useTranslation();
  const navigation = useNavigation<Nav>();
  const sendShh = useShhStore((s) => s.sendShh);

  const [selectedContactId, setSelectedContactId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [blurLevel, setBlurLevel] = useState(40);

  const filteredContacts = DEMO_CONTACTS.filter((c) =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const handleTakeSelfie = useCallback(async () => {
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (!result.canceled && result.assets[0]) {
      setPhotoUri(result.assets[0].uri);
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
  }, []);

  const handleSend = useCallback(async () => {
    const contact = DEMO_CONTACTS.find((c) => c.id === selectedContactId);
    if (!contact || isSending) return;
    setIsSending(true);

    try {
      await sendShh({
        receiver_phone_hash: contact.id,
        photo_uri: photoUri ?? undefined,
        blur_level: blurLevel,
      });
      HappinessScore.track('shh_sent');
      void maybeRequestReview('shh_sent');
      Alert.alert('', t('shh.send.sent'));
      navigation.goBack();
    } catch {
      Alert.alert('', t('error.generic'));
    } finally {
      setIsSending(false);
    }
  }, [selectedContactId, isSending, sendShh, photoUri, blurLevel, t, navigation]);

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Nav bar */}
      <View style={styles.navBar}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
        >
          <ShhText variant="body" style={styles.backArrow}>{'\u2039'}</ShhText>
        </TouchableOpacity>
        <ShhText variant="body" style={styles.navTitle}>
          {t('shh.send.title')}
        </ShhText>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Step 1 tag */}
        <ShhText variant="body" style={styles.stepTag}>
          {t('shh.send.step1Tag')}
        </ShhText>

        {/* Title */}
        <ShhText variant="display" style={styles.sectionTitle}>
          {t('shh.send.pickContact')}
        </ShhText>

        {/* Search box */}
        <View style={styles.searchBox}>
          <ShhText variant="body" style={styles.searchIcon}>{'\uD83D\uDD0D'}</ShhText>
          <TextInput
            style={styles.searchInput}
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder={t('shh.send.searchPlaceholder')}
            placeholderTextColor={colors.gray}
            autoCapitalize="none"
          />
        </View>

        {/* Contact cards */}
        {filteredContacts.map((contact) => {
          const isSelected = contact.id === selectedContactId;
          return (
            <TouchableOpacity
              key={contact.id}
              style={[
                styles.contactCard,
                isSelected && styles.contactCardSelected,
              ]}
              onPress={() => {
                void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setSelectedContactId(contact.id);
              }}
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
              <ShhText variant="body" style={styles.contactArrow}>{'\u203A'}</ShhText>
            </TouchableOpacity>
          );
        })}

        {/* Selfie section */}
        {selectedContactId && !photoUri && (
          <TouchableOpacity
            style={styles.selfieButton}
            onPress={handleTakeSelfie}
            activeOpacity={0.8}
          >
            <ShhText variant="body" style={styles.selfieButtonText}>
              {t('shh.send.takeSelfie')} {'\uD83D\uDCF7'}
            </ShhText>
          </TouchableOpacity>
        )}

        {/* Selfie preview with blur levels */}
        {photoUri && (
          <ShhSelfiePreview
            photoUri={photoUri}
            onSelectBlurLevel={setBlurLevel}
            selectedLevel={blurLevel}
          />
        )}

        {/* Photo hint (when no selfie taken) */}
        {selectedContactId && !photoUri && (
          <View style={styles.photoHint}>
            <ShhText variant="body" style={styles.photoHintText}>
              {t('shh.send.photoHintDesc')}
            </ShhText>
          </View>
        )}

        {/* Heart button */}
        {selectedContactId && (
          <View style={styles.gestureSection}>
            <ShhText variant="body" style={styles.gestureLabel}>
              {t('shh.send.readyLabel')}
            </ShhText>

            <ShhHeartButton onComplete={handleSend} />

            <ShhText variant="body" style={styles.gestureHint}>
              {t('shh.send.gestureHint')}
            </ShhText>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.dark,
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
    backgroundColor: colors.cardDark,
    borderWidth: 1,
    borderColor: colors.borderDark,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backArrow: {
    fontSize: 22,
    color: colors.white,
    marginTop: -2,
  },
  navTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.white,
  },
  container: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 60,
  },

  stepTag: {
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    color: colors.primary,
    marginBottom: 6,
  },

  sectionTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: colors.white,
    marginBottom: 20,
  },

  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.cardDark,
    borderWidth: 1,
    borderColor: colors.borderDark,
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
    color: colors.white,
    padding: 0,
  },

  contactCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.cardDark,
    borderWidth: 1,
    borderColor: colors.borderDark,
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
  },
  contactCardSelected: {
    borderColor: colors.primary,
    borderWidth: 1.5,
  },
  avatar: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  avatarSelected: {
    backgroundColor: colors.primary,
  },
  avatarText: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.black,
  },
  contactInfo: {
    flex: 1,
  },
  contactName: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.white,
    marginBottom: 2,
  },
  contactSubtitle: {
    fontSize: 12,
    color: colors.gray,
  },
  contactArrow: {
    fontSize: 18,
    color: colors.gray,
    marginLeft: 8,
  },

  selfieButton: {
    backgroundColor: colors.cardDark,
    borderWidth: 1,
    borderColor: colors.borderDark,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 8,
  },
  selfieButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.white,
  },

  photoHint: {
    backgroundColor: colors.primaryAlpha05,
    borderWidth: 1,
    borderColor: colors.primaryAlpha12,
    borderRadius: 12,
    padding: 14,
    marginTop: 8,
    marginBottom: 32,
  },
  photoHintText: {
    fontSize: 13,
    color: colors.primaryAlpha60,
    lineHeight: 18,
  },

  gestureSection: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  gestureLabel: {
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1,
    color: colors.gray,
    marginBottom: 28,
  },
  gestureHint: {
    fontSize: 13,
    color: colors.gray,
    textAlign: 'center',
    marginTop: 16,
  },
});
