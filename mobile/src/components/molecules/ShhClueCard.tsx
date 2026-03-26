/**
 * ShhClueCard — Clue card with type label, text, time, and optional NEW badge.
 * Used on the ClueScreen to display received clues.
 */
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import ShhText from '../atoms/ShhText';
import { colors } from '../../theme/colors';

type ClueType = 'text' | 'emoji' | 'location' | 'music' | 'habit';

interface ShhClueCardProps {
  type: ClueType;
  content: string;
  time: string;
  isNew?: boolean;
}

const TYPE_CONFIG: Record<ClueType, { emoji: string; labelKey: string }> = {
  text: { emoji: '💬', labelKey: 'clue.type.text' },
  emoji: { emoji: '😏', labelKey: 'clue.type.emoji' },
  location: { emoji: '📍', labelKey: 'clue.type.location' },
  music: { emoji: '🎵', labelKey: 'clue.type.music' },
  habit: { emoji: '✨', labelKey: 'clue.type.habit' },
};

export default function ShhClueCard({
  type,
  content,
  time,
  isNew = false,
}: ShhClueCardProps) {
  const { t } = useTranslation();
  const config = TYPE_CONFIG[type];

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <ShhText variant="body" style={styles.typeLabel}>
          {`${config.emoji} ${t(config.labelKey)}`}
        </ShhText>
        {isNew && (
          <View style={styles.newBadge}>
            <ShhText variant="body" style={styles.newBadgeText}>
              {t('clue.new')}
            </ShhText>
          </View>
        )}
      </View>

      <ShhText variant="body" style={styles.content}>
        {content}
      </ShhText>

      <ShhText variant="body" style={styles.time}>
        {time}
      </ShhText>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.blackAlpha09,
    borderRadius: 14,
    padding: 16,
    marginBottom: 10,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  typeLabel: {
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
    color: colors.gray,
  },
  newBadge: {
    backgroundColor: colors.black,
    borderRadius: 6,
    paddingVertical: 2,
    paddingHorizontal: 8,
  },
  newBadgeText: {
    fontSize: 9,
    fontWeight: '700',
    color: colors.primary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  content: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.black,
    marginBottom: 6,
  },
  time: {
    fontSize: 11,
    color: colors.gray,
  },
});
