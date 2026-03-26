/**
 * BirthYearScreen — iOS-style momentum wheel picker.
 * Smooth flick with deceleration, like a native iOS date picker.
 */
import React, { useRef, useState, useCallback } from 'react';
import {
  View,
  TouchableOpacity,
  StyleSheet,
  Text,
  ScrollView,
  type NativeSyntheticEvent,
  type NativeScrollEvent,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { apiRequest } from '../../services/api';
import { useAuthStore } from '../../stores/useAuthStore';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import type { RootStackParamList } from '../../types';

type Nav = NativeStackNavigationProp<RootStackParamList, 'BirthYear'>;

const CURRENT_YEAR = new Date().getFullYear();
const MIN_YEAR = 1940;
const MAX_YEAR = CURRENT_YEAR - 5;
const MIN_AGE = 18;
const ITEM_HEIGHT = 60;
const VISIBLE_COUNT = 7;
const PICKER_HEIGHT = ITEM_HEIGHT * VISIBLE_COUNT;

const years = Array.from(
  { length: MAX_YEAR - MIN_YEAR + 1 },
  (_, i) => MIN_YEAR + i,
).reverse();

export default function BirthYearScreen() {
  const { t } = useTranslation();
  const navigation = useNavigation<Nav>();
  const token = useAuthStore((s) => s.token);
  const [selectedYear, setSelectedYear] = useState(2000);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const scrollRef = useRef<ScrollView>(null);
  const lastHapticIndex = useRef(-1);

  const age = CURRENT_YEAR - selectedYear;
  const isBlocked = age < MIN_AGE;
  const initialIndex = years.indexOf(2000);

  const handleScrollEnd = useCallback(
    (e: NativeSyntheticEvent<NativeScrollEvent>) => {
      const y = e.nativeEvent.contentOffset.y;
      const index = Math.round(y / ITEM_HEIGHT);
      const clamped = Math.max(0, Math.min(years.length - 1, index));
      setSelectedYear(years[clamped]);

      if (clamped !== lastHapticIndex.current) {
        lastHapticIndex.current = clamped;
        Haptics.selectionAsync();
      }
    },
    [],
  );

  const handleScroll = useCallback(
    (e: NativeSyntheticEvent<NativeScrollEvent>) => {
      const y = e.nativeEvent.contentOffset.y;
      const index = Math.round(y / ITEM_HEIGHT);
      const clamped = Math.max(0, Math.min(years.length - 1, index));

      if (clamped !== lastHapticIndex.current) {
        lastHapticIndex.current = clamped;
        setSelectedYear(years[clamped]);
        Haptics.selectionAsync();
      }
    },
    [],
  );

  const handleConfirm = async () => {
    if (isBlocked || isSubmitting) return;
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setIsSubmitting(true);
    try {
      await apiRequest('/me', {
        method: 'PATCH',
        body: { birth_year: selectedYear },
        token,
      });
    } catch {
      // Demo mode — continue
    }
    navigation.reset({ index: 0, routes: [{ name: 'Home' }] });
  };

  const padCount = Math.floor(VISIBLE_COUNT / 2);

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        {/* Back */}
        <TouchableOpacity
          style={styles.back}
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
        >
          <Text style={styles.backIcon}>{'\u2039'}</Text>
        </TouchableOpacity>

        {/* Title */}
        <View style={styles.titleWrap}>
          <Text style={styles.title}>
            {t('onboarding.birthYear.title')}
          </Text>
          <Text style={styles.subtitle}>
            {t('onboarding.birthYear.subtitle')}
          </Text>
        </View>

        {/* Wheel picker */}
        <View style={styles.pickerWrap}>
          {/* Selection highlight bar */}
          <View
            style={[
              styles.selectionBar,
              isBlocked && styles.selectionBarBlocked,
            ]}
            pointerEvents="none"
          />

          {/* Top fade */}
          <View style={styles.fadeTop} pointerEvents="none" />
          {/* Bottom fade */}
          <View style={styles.fadeBottom} pointerEvents="none" />

          <ScrollView
            ref={scrollRef}
            showsVerticalScrollIndicator={false}
            snapToInterval={ITEM_HEIGHT}
            decelerationRate={0.92}
            contentOffset={{ x: 0, y: initialIndex * ITEM_HEIGHT }}
            onMomentumScrollEnd={handleScrollEnd}
            onScroll={handleScroll}
            scrollEventThrottle={16}
            style={styles.scroll}
            contentContainerStyle={{
              paddingTop: padCount * ITEM_HEIGHT,
              paddingBottom: padCount * ITEM_HEIGHT,
            }}
          >
            {years.map((yr, i) => {
              const isCenter = yr === selectedYear;
              const blocked = CURRENT_YEAR - yr < MIN_AGE;
              return (
                <View key={yr} style={styles.yearItem}>
                  <Text
                    style={[
                      styles.yearText,
                      isCenter && styles.yearTextCenter,
                      isCenter && blocked && styles.yearTextBlocked,
                      !isCenter && styles.yearTextFaded,
                    ]}
                  >
                    {yr}
                  </Text>
                </View>
              );
            })}
          </ScrollView>
        </View>

        {/* Age pill */}
        <View style={styles.agePill}>
          <Text
            style={[
              styles.ageText,
              isBlocked && styles.ageTextBlocked,
            ]}
          >
            {age} {t('onboarding.birthYear.yearsOld')}
          </Text>
        </View>

        {/* Block warning */}
        {isBlocked && (
          <View style={styles.blockBanner}>
            <Text style={styles.blockText}>
              {t('onboarding.birthYear.blocked')}
            </Text>
          </View>
        )}

        {/* CTA */}
        <TouchableOpacity
          style={[
            styles.cta,
            (isBlocked || isSubmitting) && styles.ctaDisabled,
          ]}
          onPress={handleConfirm}
          disabled={isBlocked || isSubmitting}
          activeOpacity={0.8}
        >
          <Text style={styles.ctaText}>
            {isBlocked
              ? `\u26D4 ${t('onboarding.birthYear.accessDenied')}`
              : `${t('onboarding.birthYear.confirm')} \u2192`}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.dark },
  container: { flex: 1, paddingHorizontal: 28, paddingBottom: 32 },

  back: {
    width: 38, height: 38, borderRadius: 12,
    backgroundColor: colors.cardDark, borderWidth: 1, borderColor: colors.borderDark,
    alignItems: 'center', justifyContent: 'center', marginTop: 8,
  },
  backIcon: { fontSize: 22, color: colors.white, lineHeight: 26 },

  titleWrap: { alignItems: 'center', marginTop: 20, marginBottom: 4 },
  title: {
    ...typography.displayExtra, fontSize: 28,
    color: colors.white, textAlign: 'center',
  },
  subtitle: {
    ...typography.body, fontSize: 14, color: colors.grayDark,
    textAlign: 'center', marginTop: 8, lineHeight: 20,
  },

  pickerWrap: {
    height: PICKER_HEIGHT, alignSelf: 'center',
    width: 200, overflow: 'hidden', marginVertical: 8,
  },
  scroll: { flex: 1 },

  selectionBar: {
    position: 'absolute',
    top: (PICKER_HEIGHT - ITEM_HEIGHT) / 2,
    left: 0, right: 0, height: ITEM_HEIGHT,
    borderTopWidth: 2, borderBottomWidth: 2,
    borderColor: colors.primaryAlpha25,
    backgroundColor: colors.primaryAlpha05,
    zIndex: 10,
  },
  selectionBarBlocked: {
    borderColor: colors.dangerAlpha25,
    backgroundColor: colors.dangerAlpha04,
  },

  fadeTop: {
    position: 'absolute', top: 0, left: 0, right: 0,
    height: ITEM_HEIGHT * 2.5, zIndex: 20,
    // On native this would use LinearGradient; web just transparent
  },
  fadeBottom: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    height: ITEM_HEIGHT * 2.5, zIndex: 20,
  },

  yearItem: {
    height: ITEM_HEIGHT,
    alignItems: 'center', justifyContent: 'center',
  },
  yearText: {
    ...typography.displayExtra, fontSize: 36, color: colors.gray,
  },
  yearTextCenter: {
    fontSize: 48, color: colors.primary,
  },
  yearTextBlocked: {
    color: colors.danger,
  },
  yearTextFaded: {
    opacity: 0.4,
  },

  agePill: {
    alignSelf: 'center',
    backgroundColor: colors.primaryAlpha08,
    borderRadius: 20, paddingHorizontal: 18, paddingVertical: 6,
    marginBottom: 16,
  },
  ageText: {
    ...typography.bodySemiBold, fontSize: 14, color: colors.primary,
  },
  ageTextBlocked: { color: colors.danger },

  blockBanner: {
    backgroundColor: colors.dangerAlpha08,
    borderWidth: 1, borderColor: colors.dangerAlpha20,
    borderRadius: 12, paddingVertical: 12, paddingHorizontal: 16,
    marginBottom: 16,
  },
  blockText: {
    ...typography.body, fontSize: 13, color: colors.danger,
    textAlign: 'center', lineHeight: 19,
  },

  cta: {
    backgroundColor: colors.primary, borderRadius: 14,
    paddingVertical: 17, alignItems: 'center',
  },
  ctaDisabled: { opacity: 0.3 },
  ctaText: {
    ...typography.bodyBold, fontSize: 15, color: colors.black,
  },
});
