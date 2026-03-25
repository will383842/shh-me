/**
 * ShhCard — Card for HomeScreen FlatList.
 * Shows blur photo thumbnail, last message preview, time ago, unread badge.
 */
import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import ShhText from '../atoms/ShhText';
import ShhBlurPhoto from './ShhBlurPhoto';
import ShhBpmDisplay from '../atoms/ShhBpmDisplay';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import type { Shh, RootStackParamList } from '../../types';

interface ShhCardProps {
  shh: Shh;
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return 'now';
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h`;
  const days = Math.floor(hours / 24);
  return `${days}d`;
}

export default function ShhCard({ shh }: ShhCardProps) {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  return (
    <TouchableOpacity
      style={styles.card}
      activeOpacity={0.7}
      onPress={() => navigation.navigate('ShhDetail', { shhId: shh.id })}
    >
      <View style={styles.photoContainer}>
        <ShhBlurPhoto
          url={shh.photo_url ?? ''}
          blurLevel={shh.current_blur_level}
          size={56}
        />
      </View>

      <View style={styles.content}>
        <View style={styles.topRow}>
          <ShhBpmDisplay bpm={shh.bpm} />
          <ShhText
            variant="body"
            style={styles.time}
          >
            {timeAgo(shh.created_at)}
          </ShhText>
        </View>

        <ShhText
          variant="body"
          style={styles.preview}
          numberOfLines={1}
        >
          {shh.last_message_preview ?? shh.first_word ?? '...'}
        </ShhText>
      </View>

      {(shh.unread_count ?? 0) > 0 && (
        <View style={styles.badge}>
          <ShhText variant="body" style={styles.badgeText}>
            {shh.unread_count}
          </ShhText>
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.cardDark,
    borderRadius: 16,
    padding: spacing.md,
    marginHorizontal: spacing.base,
    marginVertical: spacing.xs,
  },
  photoContainer: {
    marginRight: spacing.md,
  },
  content: {
    flex: 1,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  time: {
    fontSize: 12,
    color: colors.gray,
  },
  preview: {
    fontSize: 14,
    color: colors.textDark,
    opacity: 0.7,
  },
  badge: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    minWidth: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
    marginLeft: spacing.sm,
  },
  badgeText: {
    fontSize: 12,
    color: colors.black,
    fontWeight: '700',
  },
});
