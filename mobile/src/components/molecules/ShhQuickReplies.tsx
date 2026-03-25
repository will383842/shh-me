/**
 * ShhQuickReplies — 3 horizontal quick reply buttons above text input.
 * Tap sends message directly.
 */
import React, { useEffect, useState } from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import ShhText from '../atoms/ShhText';
import ShhSkeleton from '../atoms/ShhSkeleton';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { getQuickReplies } from '../../services/shh';
import { useAuthStore } from '../../stores/useAuthStore';
import type { QuickReply } from '../../types';

interface ShhQuickRepliesProps {
  shhId: string;
  onSend: (content: string) => void;
}

export default function ShhQuickReplies({
  shhId,
  onSend,
}: ShhQuickRepliesProps) {
  const [replies, setReplies] = useState<QuickReply[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const token = useAuthStore((s) => s.token);

  useEffect(() => {
    if (!token) return;
    void getQuickReplies(shhId, token)
      .then(setReplies)
      .catch(() => setReplies([]))
      .finally(() => setIsLoading(false));
  }, [shhId, token]);

  if (isLoading) {
    return (
      <View style={styles.container}>
        {[1, 2, 3].map((i) => (
          <ShhSkeleton key={i} width={90} height={36} borderRadius={18} />
        ))}
      </View>
    );
  }

  if (replies.length === 0) return null;

  return (
    <View style={styles.container}>
      {replies.slice(0, 3).map((reply) => (
        <TouchableOpacity
          key={reply.id}
          style={styles.button}
          activeOpacity={0.7}
          onPress={() => onSend(reply.text)}
        >
          <ShhText variant="body" style={styles.buttonText}>
            {reply.text}
          </ShhText>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: spacing.sm,
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.sm,
  },
  button: {
    backgroundColor: colors.borderDark,
    borderRadius: 18,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  buttonText: {
    fontSize: 13,
    color: colors.textDark,
  },
});
