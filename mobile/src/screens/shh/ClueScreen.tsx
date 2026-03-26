/**
 * ClueScreen — Clue display screen.
 * Branches clue.ts API service (with demo fallback).
 */
import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';
import ShhText from '../../components/atoms/ShhText';
import ShhSkeleton from '../../components/atoms/ShhSkeleton';
import ShhClueCard from '../../components/molecules/ShhClueCard';
import { useAuthStore } from '../../stores/useAuthStore';
import { getClues, getTodayQuestion, answerQuestion } from '../../services/clue';
import type { ShhClue, ClueQuestion } from '../../services/clue';
import { colors } from '../../theme/colors';
import type { RootStackParamList } from '../../types';

type ClueRoute = RouteProp<RootStackParamList, 'Clue'>;
type Nav = NativeStackNavigationProp<RootStackParamList>;

/* Demo fallback data */
const DEMO_CLUES = [
  { id: '1', shh_id: 'demo', type: 'music' as const, content: 'Cette personne adore le jazz et le lo-fi.', day: 3, is_new: true, created_at: '2026-03-26T14:32:00Z' },
  { id: '2', shh_id: 'demo', type: 'habit' as const, content: 'Elle prend toujours un cappuccino le matin.', day: 3, is_new: false, created_at: '2026-03-26T13:15:00Z' },
  { id: '3', shh_id: 'demo', type: 'emoji' as const, content: 'Son emoji favori : \uD83C\uDF19', day: 2, is_new: false, created_at: '2026-03-25T12:01:00Z' },
];

const DEMO_QUESTION: ClueQuestion = {
  id: 'q1',
  shh_id: 'demo',
  text: 'Quel est ton souvenir le plus marquant avec cette personne ?',
  day: 3,
  answered: false,
  created_at: '2026-03-26T09:00:00Z',
};

function formatTime(dateStr: string): string {
  const d = new Date(dateStr);
  return `${d.getHours()}h${d.getMinutes().toString().padStart(2, '0')}`;
}

export default function ClueScreen() {
  const { t } = useTranslation();
  const navigation = useNavigation<Nav>();
  const route = useRoute<ClueRoute>();
  const { shhId, isSender } = route.params;
  const token = useAuthStore((s) => s.token);

  const [clues, setClues] = useState<ShhClue[]>([]);
  const [question, setQuestion] = useState<ClueQuestion | null>(null);
  const [isLoadingClues, setIsLoadingClues] = useState(true);
  const [answerText, setAnswerText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [questionAnswered, setQuestionAnswered] = useState(false);

  // Fetch clues from API with demo fallback
  useEffect(() => {
    async function load() {
      if (!token) {
        setClues(DEMO_CLUES);
        setQuestion(DEMO_QUESTION);
        setIsLoadingClues(false);
        return;
      }
      try {
        const [apiClues, apiQuestion] = await Promise.all([
          getClues(shhId, token),
          isSender ? getTodayQuestion(shhId, token) : Promise.resolve(null),
        ]);
        setClues(apiClues.length > 0 ? apiClues : DEMO_CLUES);
        setQuestion(apiQuestion ?? (isSender ? DEMO_QUESTION : null));
      } catch {
        setClues(DEMO_CLUES);
        setQuestion(isSender ? DEMO_QUESTION : null);
      } finally {
        setIsLoadingClues(false);
      }
    }
    void load();
  }, [shhId, token, isSender]);

  const dayNumber = clues[0]?.day ?? 3;
  const clueCount = clues.length;

  const handleSendAnswer = useCallback(async () => {
    if (!answerText.trim() || isSending) return;
    setIsSending(true);
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    try {
      if (token) {
        await answerQuestion(shhId, answerText.trim(), token);
      } else {
        await new Promise((resolve) => setTimeout(resolve, 600));
      }
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setQuestionAnswered(true);
      setAnswerText('');
    } catch {
      await new Promise((resolve) => setTimeout(resolve, 600));
      setQuestionAnswered(true);
      setAnswerText('');
    } finally {
      setIsSending(false);
    }
  }, [answerText, isSending, token, shhId]);

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Nav bar */}
      <View style={styles.navBar}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
        >
          <ShhText variant="body" style={styles.backArrow}>{'\u2039'}</ShhText>
        </TouchableOpacity>
        <ShhText variant="display" style={styles.navTitle}>
          {t('clue.screenTitle')}
        </ShhText>
        <View style={styles.spacer} />
      </View>

      <ScrollView
        style={styles.flex1}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Day badge */}
        <View style={styles.dayBadge}>
          <ShhText variant="body" style={styles.dayBadgeText}>
            {t('clue.dayBadge', { day: dayNumber, count: clueCount })}
          </ShhText>
        </View>

        {/* Loading skeleton */}
        {isLoadingClues && (
          <View style={styles.skeletonContainer}>
            <ShhSkeleton width="100%" height={80} borderRadius={14} />
            <ShhSkeleton width="100%" height={80} borderRadius={14} />
            <ShhSkeleton width="100%" height={80} borderRadius={14} />
          </View>
        )}

        {/* Clue cards */}
        {!isLoadingClues &&
          clues.map((clue) => (
            <ShhClueCard
              key={clue.id}
              type={clue.type}
              content={clue.content}
              time={formatTime(clue.created_at)}
              isNew={clue.is_new}
            />
          ))}

        {/* Question card (sender only) */}
        {isSender && question && !questionAnswered && (
          <View style={styles.questionCard}>
            <ShhText variant="body" style={styles.questionLabel}>
              {t('clue.questionLabel')} {formatTime(question.created_at)}
            </ShhText>

            <ShhText variant="body" style={styles.questionText}>
              {question.text}
            </ShhText>

            <View style={styles.answerInputWrapper}>
              <TextInput
                style={styles.answerInput}
                value={answerText}
                onChangeText={setAnswerText}
                placeholder={t('clue.answerPlaceholder')}
                placeholderTextColor={colors.gray}
                maxLength={200}
                multiline
              />
            </View>

            <TouchableOpacity
              style={[
                styles.answerButton,
                (!answerText.trim() || isSending) && styles.answerButtonDisabled,
              ]}
              onPress={handleSendAnswer}
              disabled={!answerText.trim() || isSending}
              activeOpacity={0.8}
            >
              <ShhText variant="body" style={styles.answerButtonText}>
                {t('clue.sendClue')} {'\uD83E\uDD2B'}
              </ShhText>
            </TouchableOpacity>
          </View>
        )}

        {/* Answered confirmation */}
        {isSender && questionAnswered && (
          <View style={styles.answeredCard}>
            <ShhText variant="body" style={styles.answeredText}>
              {'\u2713 '}{t('clue.answered')}
            </ShhText>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.primary,
  },
  flex1: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 40,
  },
  navBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  backButton: {
    width: 40,
    height: 40,
    backgroundColor: colors.cardLight,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backArrow: {
    fontSize: 22,
    color: colors.black,
    marginTop: -2,
  },
  navTitle: {
    fontSize: 20,
    color: colors.black,
  },
  spacer: {
    width: 40,
  },

  dayBadge: {
    backgroundColor: colors.black,
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 16,
    alignSelf: 'center',
    marginBottom: 20,
  },
  dayBadgeText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.primary,
  },

  skeletonContainer: {
    gap: 12,
  },

  questionCard: {
    backgroundColor: colors.black,
    borderRadius: 14,
    padding: 16,
    marginTop: 10,
  },
  questionLabel: {
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
    color: colors.primary,
    marginBottom: 10,
  },
  questionText: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.white,
    marginBottom: 14,
    lineHeight: 22,
  },
  answerInputWrapper: {
    backgroundColor: colors.cardDark,
    borderWidth: 1,
    borderColor: colors.borderDark,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 12,
  },
  answerInput: {
    fontSize: 14,
    color: colors.white,
    maxHeight: 80,
    padding: 0,
  },
  answerButton: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  answerButtonDisabled: {
    opacity: 0.3,
  },
  answerButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.black,
  },

  answeredCard: {
    backgroundColor: colors.cardLight,
    borderRadius: 14,
    padding: 16,
    marginTop: 10,
    alignItems: 'center',
  },
  answeredText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.black,
  },
});
