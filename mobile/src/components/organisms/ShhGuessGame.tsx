/**
 * ShhGuessGame — "Who do you think it is?"
 * Shows contact list, 3 max attempts. Always returns "Not this time".
 */
import React, { useState } from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import ShhText from '../atoms/ShhText';
import ShhSkeleton from '../atoms/ShhSkeleton';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { submitGuess } from '../../services/shh';
import { useAuthStore } from '../../stores/useAuthStore';

interface ShhGuessGameProps {
  shhId: string;
}

const MAX_ATTEMPTS = 3;

export default function ShhGuessGame({ shhId }: ShhGuessGameProps) {
  const { t } = useTranslation();
  const token = useAuthStore((s) => s.token);
  const [guess, setGuess] = useState('');
  const [attempts, setAttempts] = useState(0);
  const [lastResult, setLastResult] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const canGuess = attempts < MAX_ATTEMPTS;

  const handleGuess = async () => {
    if (!guess.trim() || !token || !canGuess) return;

    setIsSubmitting(true);
    try {
      const result = await submitGuess(shhId, guess.trim(), token);
      setAttempts((a) => a + 1);
      setLastResult(result.message);
      setGuess('');
    } catch {
      setLastResult(t('error.generic'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <View style={styles.container}>
      <ShhText variant="display" style={styles.title}>
        {t('shh.guess.title')}
      </ShhText>

      {lastResult && (
        <ShhText variant="body" style={styles.result}>
          {lastResult}
        </ShhText>
      )}

      {canGuess ? (
        <>
          <View style={styles.inputRow}>
            <TextInput
              style={styles.input}
              value={guess}
              onChangeText={setGuess}
              placeholder="..."
              placeholderTextColor={colors.gray}
              editable={!isSubmitting}
              autoCapitalize="none"
              returnKeyType="send"
              onSubmitEditing={handleGuess}
            />
            <TouchableOpacity
              style={[
                styles.submitButton,
                (!guess.trim() || isSubmitting) && styles.submitDisabled,
              ]}
              onPress={handleGuess}
              disabled={!guess.trim() || isSubmitting}
              activeOpacity={0.7}
            >
              {isSubmitting ? (
                <ShhSkeleton width={20} height={20} borderRadius={10} />
              ) : (
                <ShhText variant="body" style={styles.submitText}>
                  {'\ud83e\udd2b'}
                </ShhText>
              )}
            </TouchableOpacity>
          </View>
          <ShhText variant="body" style={styles.attemptsText}>
            {t('shh.guess.attemptsLeft', { count: MAX_ATTEMPTS - attempts })}
          </ShhText>
        </>
      ) : (
        <ShhText variant="body" style={styles.noMore}>
          {t('shh.guess.noMoreAttempts')}
        </ShhText>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: spacing.base,
    backgroundColor: colors.cardDark,
    borderRadius: 20,
    margin: spacing.base,
    gap: spacing.sm,
  },
  title: {
    fontSize: 18,
    color: colors.textDark,
    textAlign: 'center',
  },
  result: {
    fontSize: 14,
    color: colors.primary,
    textAlign: 'center',
  },
  inputRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  input: {
    flex: 1,
    backgroundColor: colors.borderDark,
    borderRadius: 24,
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.sm,
    color: colors.textDark,
    fontSize: 15,
  },
  submitButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitDisabled: {
    opacity: 0.4,
  },
  submitText: {
    fontSize: 20,
  },
  attemptsText: {
    fontSize: 12,
    color: colors.gray,
    textAlign: 'center',
  },
  noMore: {
    fontSize: 14,
    color: colors.gray,
    textAlign: 'center',
  },
});
