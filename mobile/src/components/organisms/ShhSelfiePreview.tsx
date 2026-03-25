/**
 * ShhSelfiePreview — Camera capture result with 5 blur level previews.
 * Horizontal scroll showing what the receiver sees at each blur stage.
 */
import React, { useState } from 'react';
import { View, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { Image } from 'expo-image';
import ShhText from '../atoms/ShhText';
import { useTranslation } from 'react-i18next';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { BLUR_LEVELS } from '../../hooks/useBlurLevel';

interface ShhSelfiePreviewProps {
  photoUri: string;
  onSelectBlurLevel: (level: number) => void;
  selectedLevel: number;
}

export default function ShhSelfiePreview({
  photoUri,
  onSelectBlurLevel,
  selectedLevel,
}: ShhSelfiePreviewProps) {
  const { t } = useTranslation();
  const [, setScrolled] = useState(false);

  return (
    <View style={styles.container}>
      <ShhText variant="body" style={styles.title}>
        {t('shh.send.previewBlur')}
      </ShhText>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        onScrollBeginDrag={() => setScrolled(true)}
      >
        {BLUR_LEVELS.map((level, index) => (
          <TouchableOpacity
            key={level}
            style={[
              styles.previewCard,
              selectedLevel === level && styles.previewCardSelected,
            ]}
            activeOpacity={0.8}
            onPress={() => onSelectBlurLevel(level)}
          >
            <Image
              source={{ uri: photoUri }}
              style={styles.previewImage}
              blurRadius={level}
              contentFit="cover"
            />
            <ShhText
              variant="body"
              style={[
                styles.levelLabel,
                selectedLevel === level && styles.levelLabelSelected,
              ]}
            >
              {index + 1}
            </ShhText>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.md,
  },
  title: {
    fontSize: 15,
    color: colors.textDark,
    textAlign: 'center',
  },
  scrollContent: {
    paddingHorizontal: spacing.base,
    gap: spacing.md,
  },
  previewCard: {
    alignItems: 'center',
    gap: spacing.xs,
    borderRadius: 16,
    padding: spacing.xs,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  previewCardSelected: {
    borderColor: colors.primary,
  },
  previewImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  levelLabel: {
    fontSize: 12,
    color: colors.gray,
  },
  levelLabelSelected: {
    color: colors.primary,
    fontWeight: '700',
  },
});
