/**
 * BirthYearScreen — Year picker for age verification (18+).
 * If underage, shows gentle blocking message.
 */
import React, { useState, useMemo, useRef } from 'react';
import {
  View,
  FlatList,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import ShhText from '../../components/atoms/ShhText';
import { apiRequest } from '../../services/api';
import { useAuthStore } from '../../stores/useAuthStore';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import type { RootStackParamList } from '../../types';

type Nav = NativeStackNavigationProp<RootStackParamList, 'BirthYear'>;

const CURRENT_YEAR = new Date().getFullYear();
const MIN_YEAR = 1920;
const MIN_AGE = 18;

export default function BirthYearScreen() {
  const { t } = useTranslation();
  const navigation = useNavigation<Nav>();
  const token = useAuthStore((s) => s.token);
  const [selectedYear, setSelectedYear] = useState<number | null>(null);
  const [isBlocked, setIsBlocked] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const flatListRef = useRef<FlatList<number>>(null);

  const years = useMemo(() => {
    const list: number[] = [];
    for (let y = CURRENT_YEAR; y >= MIN_YEAR; y--) {
      list.push(y);
    }
    return list;
  }, []);

  const handleSelect = (year: number) => {
    setSelectedYear(year);
    if (CURRENT_YEAR - year < MIN_AGE) {
      setIsBlocked(true);
    } else {
      setIsBlocked(false);
    }
  };

  const handleConfirm = async () => {
    if (!selectedYear || isBlocked || isSubmitting) return;

    setIsSubmitting(true);
    try {
      await apiRequest('/user/birth-year', {
        method: 'PUT',
        body: { birth_year: selectedYear },
        token,
      });
      navigation.reset({ index: 0, routes: [{ name: 'Home' }] });
    } catch {
      // Silently retry on next attempt
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isBlocked) {
    return (
      <View style={styles.container}>
        <View style={styles.blockedContent}>
          <ShhText variant="display" style={styles.blockedEmoji}>
            {'\ud83e\udd2b'}
          </ShhText>
          <ShhText variant="body" style={styles.blockedText}>
            {t('onboarding.birthYear.blocked')}
          </ShhText>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <ShhText variant="display" style={styles.title}>
          {t('onboarding.birthYear.title')}
        </ShhText>
        <ShhText variant="body" style={styles.subtitle}>
          {t('onboarding.birthYear.subtitle')}
        </ShhText>
      </View>

      <FlatList
        ref={flatListRef}
        data={years}
        keyExtractor={(item) => item.toString()}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[
              styles.yearItem,
              selectedYear === item && styles.yearItemSelected,
            ]}
            onPress={() => handleSelect(item)}
            activeOpacity={0.7}
          >
            <ShhText
              variant="display"
              style={[
                styles.yearText,
                selectedYear === item && styles.yearTextSelected,
              ]}
            >
              {item}
            </ShhText>
          </TouchableOpacity>
        )}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />

      {selectedYear && !isBlocked && (
        <TouchableOpacity
          style={[styles.confirmButton, isSubmitting && styles.confirmDisabled]}
          onPress={handleConfirm}
          disabled={isSubmitting}
          activeOpacity={0.8}
        >
          <ShhText variant="body" style={styles.confirmText}>
            {t('onboarding.birthYear.confirm')}
          </ShhText>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.dark,
    paddingTop: spacing['3xl'],
  },
  header: {
    paddingHorizontal: spacing.xl,
    marginBottom: spacing.lg,
  },
  title: {
    fontSize: 28,
    color: colors.textDark,
  },
  subtitle: {
    fontSize: 14,
    color: colors.gray,
    marginTop: spacing.xs,
  },
  listContent: {
    paddingHorizontal: spacing.xl,
    paddingBottom: 100,
  },
  yearItem: {
    paddingVertical: spacing.md,
    borderRadius: 12,
    marginVertical: 2,
    paddingHorizontal: spacing.base,
  },
  yearItemSelected: {
    backgroundColor: colors.primary,
  },
  yearText: {
    fontSize: 22,
    color: colors.textDark,
    textAlign: 'center',
  },
  yearTextSelected: {
    color: colors.black,
  },
  confirmButton: {
    position: 'absolute',
    bottom: spacing['2xl'],
    left: spacing.xl,
    right: spacing.xl,
    backgroundColor: colors.primary,
    borderRadius: 16,
    paddingVertical: spacing.base,
    alignItems: 'center',
  },
  confirmDisabled: {
    opacity: 0.5,
  },
  confirmText: {
    color: colors.black,
    fontSize: 16,
    fontWeight: '700',
  },
  blockedContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
  },
  blockedEmoji: {
    fontSize: 64,
    marginBottom: spacing.lg,
  },
  blockedText: {
    fontSize: 18,
    color: colors.textDark,
    textAlign: 'center',
    lineHeight: 28,
  },
});
