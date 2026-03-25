/**
 * SendShhScreen — Step flow to send a shh.
 * 1) Contact picker, 2) Optional selfie, 3) Blur preview,
 * 4) Optional first word, 5) ShhHeartButton hold 3s to send.
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
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import * as Contacts from 'expo-contacts';
import * as ImagePicker from 'expo-image-picker';
import ShhText from '../../components/atoms/ShhText';
import ShhHeartButton from '../../components/organisms/ShhHeartButton';
import ShhSelfiePreview from '../../components/organisms/ShhSelfiePreview';
import { useShhStore } from '../../stores/useShhStore';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import type { RootStackParamList } from '../../types';

type Nav = NativeStackNavigationProp<RootStackParamList, 'SendShh'>;

type Step = 'contact' | 'selfie' | 'blur' | 'word' | 'send';

const STEPS: Step[] = ['contact', 'selfie', 'blur', 'word', 'send'];

export default function SendShhScreen() {
  const { t } = useTranslation();
  const navigation = useNavigation<Nav>();
  const sendShh = useShhStore((s) => s.sendShh);

  const [step, setStep] = useState<Step>('contact');
  const [selectedContact, setSelectedContact] = useState<{
    name: string;
    phone: string;
  } | null>(null);
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [blurLevel, setBlurLevel] = useState(40);
  const [firstWord, setFirstWord] = useState('');
  const [isSending, setIsSending] = useState(false);

  const currentStepIndex = STEPS.indexOf(step);

  const goNext = useCallback(() => {
    const nextIndex = currentStepIndex + 1;
    if (nextIndex < STEPS.length) {
      setStep(STEPS[nextIndex]);
    }
  }, [currentStepIndex]);

  const handlePickContact = async () => {
    const { status } = await Contacts.requestPermissionsAsync();
    if (status !== 'granted') return;

    const { data } = await Contacts.getContactsAsync({
      fields: [Contacts.Fields.PhoneNumbers, Contacts.Fields.Name],
    });

    if (data.length > 0) {
      // In production, show a contact picker modal
      // For now, take first contact with a phone number
      const withPhone = data.find(
        (c: Contacts.Contact) => c.phoneNumbers && c.phoneNumbers.length > 0,
      );
      if (withPhone?.phoneNumbers?.[0]?.number) {
        setSelectedContact({
          name: withPhone.name ?? '',
          phone: withPhone.phoneNumbers[0].number,
        });
        goNext();
      }
    }
  };

  const handleTakeSelfie = async () => {
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
      cameraType: ImagePicker.CameraType.front,
    });

    if (!result.canceled && result.assets[0]) {
      setPhotoUri(result.assets[0].uri);
      goNext();
    }
  };

  const handleSkipSelfie = () => {
    setPhotoUri(null);
    // Skip blur step too if no photo
    setStep('word');
  };

  const handleSend = async () => {
    if (!selectedContact || isSending) return;
    setIsSending(true);

    try {
      await sendShh({
        receiver_phone_hash: selectedContact.phone,
        first_word: firstWord.trim() || undefined,
        photo_uri: photoUri ?? undefined,
        blur_level: blurLevel,
      });

      Alert.alert('', t('shh.send.sent'));
      navigation.goBack();
    } catch {
      Alert.alert('', t('error.generic'));
    } finally {
      setIsSending(false);
    }
  };

  const handleWordChange = (text: string) => {
    // Max 1 word — strip spaces
    const word = text.replace(/\s/g, '');
    setFirstWord(word);
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
    >
      {/* Step indicator */}
      <ShhText variant="body" style={styles.stepText}>
        {t('shh.send.step', {
          current: currentStepIndex + 1,
          total: STEPS.length,
        })}
      </ShhText>

      {/* Step: Contact */}
      {step === 'contact' && (
        <View style={styles.stepContainer}>
          <ShhText variant="display" style={styles.stepTitle}>
            {t('shh.send.pickContact')}
          </ShhText>
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={handlePickContact}
            activeOpacity={0.8}
          >
            <ShhText variant="body" style={styles.primaryButtonText}>
              {'\ud83e\udd2b'}
            </ShhText>
          </TouchableOpacity>

          {selectedContact && (
            <ShhText variant="body" style={styles.selectedName}>
              {selectedContact.name}
            </ShhText>
          )}
        </View>
      )}

      {/* Step: Selfie */}
      {step === 'selfie' && (
        <View style={styles.stepContainer}>
          <ShhText variant="display" style={styles.stepTitle}>
            {t('shh.send.takeSelfie')}
          </ShhText>

          <TouchableOpacity
            style={styles.primaryButton}
            onPress={handleTakeSelfie}
            activeOpacity={0.8}
          >
            <ShhText variant="body" style={styles.primaryButtonText}>
              {'\ud83d\udcf7'}
            </ShhText>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.skipButton}
            onPress={handleSkipSelfie}
            activeOpacity={0.7}
          >
            <ShhText variant="body" style={styles.skipText}>
              {t('shh.send.skipSelfie')}
            </ShhText>
          </TouchableOpacity>
        </View>
      )}

      {/* Step: Blur preview */}
      {step === 'blur' && photoUri && (
        <View style={styles.stepContainer}>
          <ShhSelfiePreview
            photoUri={photoUri}
            selectedLevel={blurLevel}
            onSelectBlurLevel={(level) => setBlurLevel(level)}
          />
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={goNext}
            activeOpacity={0.8}
          >
            <ShhText variant="body" style={styles.primaryButtonText}>
              {'\u2192'}
            </ShhText>
          </TouchableOpacity>
        </View>
      )}

      {/* Step: First word */}
      {step === 'word' && (
        <View style={styles.stepContainer}>
          <ShhText variant="display" style={styles.stepTitle}>
            {t('shh.send.firstWord')}
          </ShhText>

          <TextInput
            style={styles.wordInput}
            value={firstWord}
            onChangeText={handleWordChange}
            placeholder={t('shh.send.firstWordPlaceholder')}
            placeholderTextColor={colors.gray}
            maxLength={20}
            autoCapitalize="none"
          />

          <TouchableOpacity
            style={styles.primaryButton}
            onPress={goNext}
            activeOpacity={0.8}
          >
            <ShhText variant="body" style={styles.primaryButtonText}>
              {'\u2192'}
            </ShhText>
          </TouchableOpacity>
        </View>
      )}

      {/* Step: Send */}
      {step === 'send' && (
        <View style={styles.stepContainer}>
          <ShhHeartButton onComplete={handleSend} />
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.dark,
  },
  content: {
    flexGrow: 1,
    paddingTop: spacing['3xl'],
    paddingHorizontal: spacing.xl,
  },
  stepText: {
    fontSize: 12,
    color: colors.gray,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  stepContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xl,
    paddingVertical: spacing['2xl'],
  },
  stepTitle: {
    fontSize: 24,
    color: colors.textDark,
    textAlign: 'center',
  },
  primaryButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButtonText: {
    fontSize: 32,
  },
  skipButton: {
    paddingVertical: spacing.sm,
  },
  skipText: {
    fontSize: 14,
    color: colors.gray,
  },
  selectedName: {
    fontSize: 16,
    color: colors.primary,
  },
  wordInput: {
    backgroundColor: colors.cardDark,
    borderRadius: 16,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.base,
    color: colors.textDark,
    fontSize: 22,
    textAlign: 'center',
    width: '100%',
  },
});
