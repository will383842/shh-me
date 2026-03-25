/**
 * ShhErrorBoundary — Error boundary class component.
 * Fallback: gentle message. NEVER shows the word "Error".
 * Uses raw RN Text to avoid depending on ShhText in case it caused the crash.
 */
import React, { Component, type ReactNode } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';

interface Props {
  children: ReactNode;
  fallbackMessage?: string;
}

interface State {
  hasError: boolean;
}

export default class ShhErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(): void {
    // Could log to a reporting service
  }

  handleRetry = () => {
    this.setState({ hasError: false });
  };

  render(): ReactNode {
    if (this.state.hasError) {
      const message =
        this.props.fallbackMessage ??
        "Something isn't right \ud83e\udd2b \u2014 Try again";

      return (
        <View style={styles.container}>
          <Text style={styles.message}>{message}</Text>
          <TouchableOpacity
            style={styles.button}
            onPress={this.handleRetry}
            activeOpacity={0.7}
          >
            <Text style={styles.buttonText}>{'\ud83e\udd2b'}</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.dark,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
    gap: spacing.lg,
  },
  message: {
    fontSize: 18,
    color: colors.textDark,
    textAlign: 'center',
    lineHeight: 26,
  },
  button: {
    backgroundColor: colors.primary,
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    fontSize: 28,
  },
});
