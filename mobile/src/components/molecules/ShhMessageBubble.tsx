/**
 * ShhMessageBubble — Chat bubble component.
 * Sender: right-aligned, primary bg. Receiver: left-aligned, translucent bg.
 * Double-tap for reactions. Shows ShhMessageReaction if present.
 */
import React, { useCallback } from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import ShhText from '../atoms/ShhText';
import ShhMessageReaction from '../atoms/ShhMessageReaction';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';

interface ShhMessageBubbleProps {
  content: string;
  isSender: boolean;
  reaction?: string | null;
  onDoubleTap?: () => void;
  timestamp: string;
}

export default function ShhMessageBubble({
  content,
  isSender,
  reaction,
  onDoubleTap,
  timestamp,
}: ShhMessageBubbleProps) {
  const lastTapRef = React.useRef<number>(0);

  const handlePress = useCallback(() => {
    const now = Date.now();
    if (now - lastTapRef.current < 300) {
      onDoubleTap?.();
    }
    lastTapRef.current = now;
  }, [onDoubleTap]);

  const formatTime = (ts: string) => {
    const date = new Date(ts);
    return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
  };

  return (
    <View
      style={[
        styles.row,
        isSender ? styles.rowSender : styles.rowReceiver,
      ]}
    >
      <Pressable onPress={handlePress}>
        <View
          style={[
            styles.bubble,
            isSender ? styles.senderBubble : styles.receiverBubble,
          ]}
        >
          <ShhText
            variant="body"
            style={[
              styles.text,
              { color: isSender ? colors.black : colors.textDark },
            ]}
          >
            {content}
          </ShhText>
          <ShhText
            variant="body"
            style={[
              styles.time,
              {
                color: isSender
                  ? colors.blackAlpha50
                  : colors.whiteAlpha40,
              },
            ]}
          >
            {formatTime(timestamp)}
          </ShhText>
          {reaction ? <ShhMessageReaction emoji={reaction} /> : null}
        </View>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    marginVertical: spacing.xs,
    marginHorizontal: spacing.base,
  },
  rowSender: {
    alignItems: 'flex-end',
  },
  rowReceiver: {
    alignItems: 'flex-start',
  },
  bubble: {
    maxWidth: '80%',
    borderRadius: 20,
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.sm,
    position: 'relative',
  },
  senderBubble: {
    backgroundColor: colors.primary,
    borderBottomRightRadius: 4,
  },
  receiverBubble: {
    backgroundColor: colors.cardLight,
    borderBottomLeftRadius: 4,
  },
  text: {
    fontSize: 15,
    lineHeight: 20,
  },
  time: {
    fontSize: 11,
    marginTop: 2,
    alignSelf: 'flex-end',
  },
});
