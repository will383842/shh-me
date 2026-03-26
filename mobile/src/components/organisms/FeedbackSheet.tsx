/**
 * FeedbackSheet — Bottom sheet for user feedback.
 * Categories: Bug, Idea, Unhappy. Optional message. POST /api/v1/feedback.
 */
import React, { useState, useCallback } from 'react';
import {
  View,
  Modal,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Pressable,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  runOnJS,
  SlideInDown,
  SlideOutDown,
} from 'react-native-reanimated';
import { useTranslation } from 'react-i18next';
import ShhText from '../atoms/ShhText';
import { colors } from '../../theme/colors';
import { apiRequest } from '../../services/api';
import { useAuthStore } from '../../stores/useAuthStore';
import { usePostHog } from '../../hooks/usePostHog';

/* ─── Types ─── */
type FeedbackCategory = 'bug' | 'idea' | 'unhappy';

interface FeedbackSheetProps {
  visible: boolean;
  onClose: () => void;
}

/* ─── Constants ─── */
const MAX_MESSAGE_LENGTH = 500;

const CATEGORIES: { key: FeedbackCategory; emoji: string; labelKey: string }[] = [
  { key: 'bug', emoji: '\uD83D\uDC1B', labelKey: 'feedback.bug' },
  { key: 'idea', emoji: '\uD83D\uDCA1', labelKey: 'feedback.idea' },
  { key: 'unhappy', emoji: '\uD83D\uDE14', labelKey: 'feedback.unhappy' },
];

/* ─── Component ─── */
export default function FeedbackSheet({ visible, onClose }: FeedbackSheetProps) {
  const { t } = useTranslation();
  const token = useAuthStore((s) => s.token);
  const { capture } = usePostHog();

  const [selectedCategory, setSelectedCategory] = useState<FeedbackCategory | null>(null);
  const [message, setMessage] = useState('');
  const [isSending, setIsSending] = useState(false);

  const resetState = useCallback(() => {
    setSelectedCategory(null);
    setMessage('');
    setIsSending(false);
  }, []);

  const handleClose = useCallback(() => {
    resetState();
    onClose();
  }, [onClose, resetState]);

  const handleSend = useCallback(async () => {
    if (!selectedCategory) return;

    setIsSending(true);
    try {
      await apiRequest('/feedback', {
        method: 'POST',
        body: {
          category: selectedCategory,
          message: message.trim() || null,
        },
        token,
      });

      capture('feedback_submitted', { category: selectedCategory });
      Alert.alert('', t('feedback.thanks'));
      handleClose();
    } catch {
      Alert.alert('', t('error.generic'));
    } finally {
      setIsSending(false);
    }
  }, [selectedCategory, message, token, capture, t, handleClose]);

  const handleSelectCategory = useCallback((category: FeedbackCategory) => {
    setSelectedCategory((prev) => (prev === category ? null : category));
  }, []);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={handleClose}
      statusBarTranslucent
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.overlay}
      >
        {/* Backdrop */}
        <Pressable style={styles.backdrop} onPress={handleClose} />

        {/* Sheet */}
        <Animated.View
          entering={SlideInDown.springify().damping(20).stiffness(150)}
          exiting={SlideOutDown.duration(200)}
          style={styles.sheet}
        >
          {/* Handle */}
          <View style={styles.handleContainer}>
            <View style={styles.handle} />
          </View>

          {/* Title */}
          <ShhText variant="display" style={styles.title}>
            {t('feedback.title')}
          </ShhText>

          {/* Category buttons */}
          <View style={styles.categoriesRow}>
            {CATEGORIES.map((cat) => {
              const isSelected = selectedCategory === cat.key;
              return (
                <TouchableOpacity
                  key={cat.key}
                  style={[
                    styles.categoryButton,
                    isSelected && styles.categoryButtonSelected,
                  ]}
                  onPress={() => handleSelectCategory(cat.key)}
                  activeOpacity={0.7}
                  accessibilityRole="button"
                  accessibilityState={{ selected: isSelected }}
                  accessibilityLabel={t(cat.labelKey)}
                >
                  <ShhText variant="body" style={styles.categoryEmoji}>
                    {cat.emoji}
                  </ShhText>
                  <ShhText
                    variant="body"
                    style={[
                      styles.categoryLabel,
                      isSelected && styles.categoryLabelSelected,
                    ]}
                    numberOfLines={2}
                  >
                    {t(cat.labelKey)}
                  </ShhText>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Optional message */}
          <TextInput
            style={styles.textInput}
            placeholder={t('feedback.optional_message')}
            placeholderTextColor={colors.whiteAlpha30}
            value={message}
            onChangeText={(text) => setMessage(text.slice(0, MAX_MESSAGE_LENGTH))}
            maxLength={MAX_MESSAGE_LENGTH}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
          <ShhText variant="body" style={styles.charCount}>
            {message.length}/{MAX_MESSAGE_LENGTH}
          </ShhText>

          {/* Send button */}
          <TouchableOpacity
            style={[
              styles.sendButton,
              (!selectedCategory || isSending) && styles.sendButtonDisabled,
            ]}
            onPress={handleSend}
            disabled={!selectedCategory || isSending}
            activeOpacity={0.8}
            accessibilityRole="button"
            accessibilityLabel={t('feedback.send')}
          >
            <ShhText variant="body" style={styles.sendButtonText}>
              {isSending ? '...' : t('feedback.send')}
            </ShhText>
          </TouchableOpacity>
        </Animated.View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

/* ─── Styles ─── */
const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: colors.blackAlpha60,
  },
  sheet: {
    backgroundColor: colors.cardDark,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingBottom: 40,
    borderTopWidth: 1,
    borderColor: colors.borderDark,
  },
  handleContainer: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.whiteAlpha20,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.white,
    textAlign: 'center',
    marginBottom: 20,
  },
  categoriesRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 16,
  },
  categoryButton: {
    flex: 1,
    backgroundColor: colors.borderDark,
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 8,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: 'transparent',
  },
  categoryButtonSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryAlpha08,
  },
  categoryEmoji: {
    fontSize: 24,
    marginBottom: 6,
  },
  categoryLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.whiteAlpha60,
    textAlign: 'center',
  },
  categoryLabelSelected: {
    color: colors.primary,
  },
  textInput: {
    backgroundColor: colors.borderDark,
    borderRadius: 12,
    padding: 14,
    color: colors.white,
    fontSize: 14,
    minHeight: 100,
    borderWidth: 1,
    borderColor: colors.gray,
  },
  charCount: {
    fontSize: 11,
    color: colors.whiteAlpha30,
    textAlign: 'right',
    marginTop: 4,
    marginBottom: 16,
  },
  sendButton: {
    backgroundColor: colors.primary,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
  },
  sendButtonDisabled: {
    opacity: 0.4,
  },
  sendButtonText: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.black,
  },
});
