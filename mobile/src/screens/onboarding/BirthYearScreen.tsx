/**
 * BirthYearScreen — Immersive scroll wheel year picker.
 * Slot-machine style: years roll vertically with snap.
 * If underage, red blocking state appears.
 */
import React, { useCallback, useRef, useState } from 'react';
import {
  View,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  type ViewToken,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  interpolate,
  Extrapolation,
  useAnimatedScrollHandler,
} from 'react-native-reanimated';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import ShhText from '../../components/atoms/ShhText';
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
const ITEM_HEIGHT = 70;
const VISIBLE_ITEMS = 5;
const WHEEL_HEIGHT = ITEM_HEIGHT * VISIBLE_ITEMS;

const years = Array.from(
  { length: MAX_YEAR - MIN_YEAR + 1 },
  (_, i) => MAX_YEAR - i,
);

const AnimatedFlatList = Animated.createAnimatedComponent(
  FlatList<number>,
);

function YearItem({
  year,
  index,
  scrollY,
}: {
  year: number;
  index: number;
  scrollY: { value: number };
}) {
  const isBlocked = CURRENT_YEAR - year < MIN_AGE;

  const animatedStyle = useAnimatedStyle(() => {
    const center = index * ITEM_HEIGHT;
    const diff = scrollY.value - center;
    const scale = interpolate(
      Math.abs(diff),
      [0, ITEM_HEIGHT, ITEM_HEIGHT * 2],
      [1, 0.75, 0.5],
      Extrapolation.CLAMP,
    );
    const opacity = interpolate(
      Math.abs(diff),
      [0, ITEM_HEIGHT, ITEM_HEIGHT * 2],
      [1, 0.4, 0.15],
      Extrapolation.CLAMP,
    );
    const rotateX = interpolate(
      diff,
      [-ITEM_HEIGHT * 2, 0, ITEM_HEIGHT * 2],
      [60, 0, -60],
      Extrapolation.CLAMP,
    );
    return {
      transform: [{ scale }, { rotateX: `${rotateX}deg` }],
      opacity,
    };
  });

  return (
    <Animated.View style={[styles.yearItem, animatedStyle]}>
      <Animated.Text
        style={[
          styles.yearText,
          isBlocked && styles.yearTextBlocked,
        ]}
      >
        {year}
      </Animated.Text>
    </Animated.View>
  );
}

export default function BirthYearScreen() {
  const { t } = useTranslation();
  const navigation = useNavigation<Nav>();
  const token = useAuthStore((s) => s.token);
  const [selectedYear, setSelectedYear] = useState(2000);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const scrollY = useSharedValue(0);
  const flatListRef = useRef<FlatList<number>>(null);
  const lastHapticYear = useRef(selectedYear);

  const age = CURRENT_YEAR - selectedYear;
  const isBlocked = age < MIN_AGE;

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollY.value = event.contentOffset.y;
    },
  });

  const onViewableItemsChanged = useCallback(
    ({ viewableItems }: { viewableItems: ViewToken[] }) => {
      const center = viewableItems.find(
        (item) => item.index !== null,
      );
      if (center?.item) {
        const yr = center.item as number;
        setSelectedYear(yr);
        if (yr !== lastHapticYear.current) {
          lastHapticYear.current = yr;
          Haptics.selectionAsync();
        }
      }
    },
    [],
  );

  const viewabilityConfig = useRef({
    itemVisiblePercentThreshold: 60,
    minimumViewTime: 50,
  }).current;

  // Glow animation for the selection window
  const glowOpacity = useSharedValue(0.15);
  const glowStyle = useAnimatedStyle(() => ({
    borderColor: isBlocked
      ? `rgba(255,69,58,${glowOpacity.value})`
      : `rgba(220,251,78,${glowOpacity.value})`,
  }));

  React.useEffect(() => {
    glowOpacity.value = withTiming(0.4, { duration: 1200 });
  }, [glowOpacity]);

  const initialIndex = years.indexOf(2000);

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
      // Demo mode — continue anyway
    }
    navigation.reset({ index: 0, routes: [{ name: 'Home' }] });
  };

  const renderItem = useCallback(
    ({ item, index }: { item: number; index: number }) => (
      <YearItem year={item} index={index} scrollY={scrollY} />
    ),
    [scrollY],
  );

  const getItemLayout = useCallback(
    (_: unknown, index: number) => ({
      length: ITEM_HEIGHT,
      offset: ITEM_HEIGHT * index,
      index,
    }),
    [],
  );

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

        {/* Title */}
        <View style={styles.titleSection}>
          <ShhText variant="display" style={styles.title}>
            {t('onboarding.birthYear.title')}
          </ShhText>
          <ShhText variant="body" style={styles.subtitle}>
            {t('onboarding.birthYear.subtitle')}
          </ShhText>
        </View>

        {/* Wheel picker */}
        <View style={styles.wheelContainer}>
          {/* Gradient fade top */}
          <View style={styles.fadeTop} pointerEvents="none" />

          {/* Selection window highlight */}
          <Animated.View
            style={[styles.selectionWindow, glowStyle]}
            pointerEvents="none"
          />

          <AnimatedFlatList
            ref={flatListRef}
            data={years}
            keyExtractor={(item) => item.toString()}
            renderItem={renderItem}
            getItemLayout={getItemLayout}
            initialScrollIndex={initialIndex}
            onScroll={scrollHandler}
            scrollEventThrottle={16}
            snapToInterval={ITEM_HEIGHT}
            decelerationRate="fast"
            showsVerticalScrollIndicator={false}
            onViewableItemsChanged={onViewableItemsChanged}
            viewabilityConfig={viewabilityConfig}
            contentContainerStyle={{
              paddingTop: ITEM_HEIGHT * 2,
              paddingBottom: ITEM_HEIGHT * 2,
            }}
          />

          {/* Gradient fade bottom */}
          <View style={styles.fadeBottom} pointerEvents="none" />
        </View>

        {/* Age indicator */}
        <View style={styles.ageRow}>
          <ShhText
            variant="body"
            style={[
              styles.ageText,
              isBlocked && styles.ageTextBlocked,
            ]}
          >
            {age} {t('onboarding.birthYear.yearsOld', { defaultValue: 'ans' })}
          </ShhText>
        </View>

        {/* Block message */}
        {isBlocked && (
          <View style={styles.blockBanner}>
            <ShhText variant="body" style={styles.blockText}>
              {t('onboarding.birthYear.blocked')}
            </ShhText>
          </View>
        )}

        {/* CTA */}
        <TouchableOpacity
          style={[
            styles.ctaButton,
            (isBlocked || isSubmitting) && styles.ctaButtonDisabled,
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
    paddingHorizontal: 28,
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
    fontSize: 22,
    color: '#FFFFFF',
    lineHeight: 26,
  },
  titleSection: {
    alignItems: 'center',
    marginTop: 24,
    marginBottom: 8,
  },
  title: {
    ...typography.displayExtra,
    fontSize: 28,
    color: '#FFFFFF',
    textAlign: 'center',
  },
  subtitle: {
    ...typography.body,
    fontSize: 14,
    color: '#444444',
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 20,
  },
  wheelContainer: {
    height: WHEEL_HEIGHT,
    overflow: 'hidden',
    alignSelf: 'center',
    width: 220,
  },
  selectionWindow: {
    position: 'absolute',
    top: ITEM_HEIGHT * 2,
    left: 0,
    right: 0,
    height: ITEM_HEIGHT,
    borderWidth: 2,
    borderRadius: 16,
    backgroundColor: 'rgba(220,251,78,0.04)',
    zIndex: 10,
  },
  fadeTop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: ITEM_HEIGHT * 1.5,
    zIndex: 20,
    backgroundColor: 'transparent',
  },
  fadeBottom: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: ITEM_HEIGHT * 1.5,
    zIndex: 20,
    backgroundColor: 'transparent',
  },
  yearItem: {
    height: ITEM_HEIGHT,
    alignItems: 'center',
    justifyContent: 'center',
  },
  yearText: {
    ...typography.displayExtra,
    fontSize: 48,
    color: colors.primary,
  },
  yearTextBlocked: {
    color: '#ff453a',
  },
  ageRow: {
    alignItems: 'center',
    marginTop: 12,
    marginBottom: 16,
  },
  ageText: {
    ...typography.bodySemiBold,
    fontSize: 16,
    color: '#555555',
  },
  ageTextBlocked: {
    color: '#ff453a',
  },
  blockBanner: {
    backgroundColor: 'rgba(255,69,58,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255,69,58,0.2)',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  blockText: {
    ...typography.body,
    fontSize: 13,
    color: '#ff453a',
    textAlign: 'center',
    lineHeight: 19,
  },
  ctaButton: {
    backgroundColor: colors.primary,
    borderRadius: 14,
    paddingVertical: 17,
    alignItems: 'center',
  },
  ctaButtonDisabled: {
    opacity: 0.3,
  },
  ctaText: {
    ...typography.bodyBold,
    fontSize: 15,
    color: '#000000',
  },
});
