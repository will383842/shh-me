/**
 * ShhMessageReaction — Small emoji floating below a message bubble.
 * Pop animation (200ms) on appear using Reanimated.
 */
import React, { useEffect } from 'react';
import { StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import { springConfigBouncy } from '../../theme/animations';

interface ShhMessageReactionProps {
  emoji: string;
}

export default function ShhMessageReaction({
  emoji,
}: ShhMessageReactionProps) {
  const scale = useSharedValue(0);

  useEffect(() => {
    scale.value = withSpring(1, springConfigBouncy);
  }, [scale]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Animated.Text style={[styles.reaction, animatedStyle]}>
      {emoji}
    </Animated.Text>
  );
}

const styles = StyleSheet.create({
  reaction: {
    fontSize: 16,
    position: 'absolute',
    bottom: -10,
    right: 4,
  },
});
