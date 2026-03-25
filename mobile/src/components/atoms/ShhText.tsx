/**
 * ShhText — Themed text wrapper with design system fonts.
 * variant 'display' uses Baloo2, 'body' uses DM Sans.
 */
import React from 'react';
import { Text, type TextProps, type TextStyle, StyleSheet } from 'react-native';
import { typography } from '../../theme/typography';
import { colors } from '../../theme/colors';

type Variant = 'display' | 'body';

interface ShhTextProps extends TextProps {
  variant?: Variant;
  children: React.ReactNode;
}

const variantStyles: Record<Variant, TextStyle> = {
  display: {
    ...typography.display,
    color: colors.textDark,
  },
  body: {
    ...typography.body,
    color: colors.textDark,
  },
};

export default function ShhText({
  variant = 'body',
  style,
  children,
  ...rest
}: ShhTextProps) {
  return (
    <Text style={[styles.base, variantStyles[variant], style]} {...rest}>
      {children}
    </Text>
  );
}

const styles = StyleSheet.create({
  base: {
    fontSize: 16,
  },
});
