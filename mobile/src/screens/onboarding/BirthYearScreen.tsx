/**
 * BirthYearScreen — Immersive year picker for age verification (18+).
 * Arrow-based year selector with huge year display.
 * If underage, shows blocking state with red accent.
 */
import React, { useState } from 'react';
import {
  View,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';
import ShhText from '../../components/atoms/ShhText';
import { apiRequest } from '../../services/api';
import { useAuthStore } from '../../stores/useAuthStore';
import type { RootStackParamList } from '../../types';

type Nav = NativeStackNavigationProp<RootStackParamList, 'BirthYear'>;

const CURRENT_YEAR = new Date().getFullYear();
const MIN_YEAR = 1920;
const MIN_AGE = 18;

export default function BirthYearScreen() {
  const { t } = useTranslation();
  const navigation = useNavigation<Nav>();
  const token = useAuthStore((s) => s.token);
  const [year, setYear] = useState(2000);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const age = CURRENT_YEAR - year;
  const isBlocked = age < MIN_AGE;

  const incrementYear = () => {
    if (year < CURRENT_YEAR) setYear((y) => y + 1);
  };

  const decrementYear = () => {
    if (year > MIN_YEAR) setYear((y) => y - 1);
  };

  const handleConfirm = async () => {
    if (isBlocked || isSubmitting) return;

    setIsSubmitting(true);
    try {
      await apiRequest('/user/birth-year', {
        method: 'PUT',
        body: { birth_year: year },
        token,
      });
      navigation.reset({ index: 0, routes: [{ name: 'Home' }] });
    } catch {
      // Silently retry on next attempt
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Back button */}
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
        >
          <ShhText variant="body" style={styles.backText}>
            {'\u2039'}
          </ShhText>
        </TouchableOpacity>

        {/* Centered body */}
        <View style={styles.body}>
          <ShhText variant="display" style={styles.title}>
            {t('onboarding.birthYear.title')}
          </ShhText>
          <ShhText variant="body" style={styles.subtitle}>
            {t('onboarding.birthYear.subtitle')}
          </ShhText>

          {/* Year display */}
          <ShhText
            variant="display"
            style={[
              styles.yearDisplay,
              isBlocked && styles.yearDisplayBlocked,
            ]}
          >
            {year}
          </ShhText>

          {/* Hint */}
          <ShhText variant="body" style={styles.hint}>
            {'\u2191 \u2193'} {t('onboarding.birthYear.hint', { defaultValue: 'pour changer' })}
          </ShhText>

          {/* Arrow buttons */}
          <View style={styles.arrowRow}>
            <TouchableOpacity
              style={styles.arrowButton}
              onPress={decrementYear}
              activeOpacity={0.7}
            >
              <ShhText variant="display" style={styles.arrowText}>
                {'\u25BC'}
              </ShhText>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.arrowButton}
              onPress={incrementYear}
              activeOpacity={0.7}
            >
              <ShhText variant="display" style={styles.arrowText}>
                {'\u25B2'}
              </ShhText>
            </TouchableOpacity>
          </View>

          {/* Block message */}
          {isBlocked && (
            <View style={styles.blockBanner}>
              <ShhText variant="body" style={styles.blockText}>
                {t('onboarding.birthYear.blocked')}
              </ShhText>
            </View>
          )}
        </View>

        {/* CTA */}
        <TouchableOpacity
          style={[
            styles.ctaButton,
            isBlocked && styles.ctaButtonDisabled,
            isSubmitting && styles.ctaButtonDisabled,
          ]}
          onPress={handleConfirm}
          disabled={isBlocked || isSubmitting}
          activeOpacity={0.8}
        >
          <ShhText variant="body" style={styles.ctaText}>
            {isBlocked
              ? `\u26D4 ${t('onboarding.birthYear.accessDenied', { defaultValue: 'Acc\u00e8s refus\u00e9' })}`
              : `${t('onboarding.birthYear.confirm')} \u2192`}
          </ShhText>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#111111',
  },
  container: {
    flex: 1,
    backgroundColor: '#111111',
    paddingHorizontal: 24,
    paddingBottom: 32,
  },
  backButton: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: '#1A1A1A',
    borderWidth: 1,
    borderColor: '#2A2A2A',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  backText: {
    fontSize: 18,
    color: '#FFFFFF',
    lineHeight: 22,
  },
  body: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: '#444444',
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 44,
    lineHeight: 20,
  },
  yearDisplay: {
    fontSize: 80,
    fontWeight: '800',
    color: '#DCFB4E',
    textAlign: 'center',
  },
  yearDisplayBlocked: {
    color: '#ff453a',
  },
  hint: {
    fontSize: 12,
    color: '#333333',
    textAlign: 'center',
    marginTop: 4,
    marginBottom: 28,
  },
  arrowRow: {
    flexDirection: 'row',
    gap: 28,
  },
  arrowButton: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: '#1A1A1A',
    borderWidth: 1,
    borderColor: '#2A2A2A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  arrowText: {
    fontSize: 22,
    color: '#FFFFFF',
  },
  blockBanner: {
    marginTop: 28,
    backgroundColor: 'rgba(255,69,58,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255,69,58,0.2)',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  blockText: {
    fontSize: 13,
    color: '#ff453a',
    textAlign: 'center',
  },
  ctaButton: {
    backgroundColor: '#DCFB4E',
    borderRadius: 14,
    paddingVertical: 17,
    alignItems: 'center',
  },
  ctaButtonDisabled: {
    opacity: 0.3,
  },
  ctaText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#000000',
  },
});
