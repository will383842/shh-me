/**
 * ClueScreen — Yellow bg #DCFB4E clue display screen.
 * Day badge, clue cards, question card (sender only), demo data.
 */
import React, { useState, useCallback } from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';
import ShhText from '../../components/atoms/ShhText';
import ShhClueCard from '../../components/molecules/ShhClueCard';
import { colors } from '../../theme/colors';
import type { RootStackParamList } from '../../types';

type ClueRoute = RouteProp<RootStackParamList, 'Clue'>;
type Nav = NativeStackNavigationProp<RootStackParamList>;

/* Demo clues */
const DEMO_CLUES = [
  {
    id: '1',
    type: 'music' as const,
    content: 'Cette personne adore le jazz et le lo-fi.',
    time: '14h32',
    isNew: true,
  },
  {
    id: '2',
    type: 'habit' as const,
    content: 'Elle prend toujours un cappuccino le matin.',
    time: '13h15',
    isNew: false,
  },
  {
    id: '3',
    type: 'emoji' as const,
    content: 'Son emoji favori : 🌙',
    time: '12h01',
    isNew: false,
  },
];

const DEMO_QUESTION = {
  id: 'q1',
  text: 'Quel est ton souvenir le plus marquant avec cette personne ?',
  time: '9h00',
};

export default function ClueScreen() {
  const { t } = useTranslation();
  const navigation = useNavigation<Nav>();
  const route = useRoute<ClueRoute>();
  const { shhId, isSender } = route.params;

  const [answerText, setAnswerText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [questionAnswered, setQuestionAnswered] = useState(false);

  const dayNumber = 3;
  const clueCount = DEMO_CLUES.length;

  const handleSendAnswer = useCallback(async () => {
    if (!answerText.trim() || isSending) return;
    setIsSending(true);
    // Demo: simulate send
    await new Promise((resolve) => setTimeout(resolve, 600));
    setIsSending(false);
    setQuestionAnswered(true);
    setAnswerText('');
  }, [answerText, isSending]);

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Nav bar */}
      <View style={styles.navBar}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
        >
          <ShhText variant="body" style={styles.backArrow}>{'‹'}</ShhText>
        </TouchableOpacity>
        <ShhText variant="display" style={styles.navTitle}>
          {t('clue.screenTitle', { defaultValue: '🔍 Indices' })}
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
            {t('clue.dayBadge', {
              defaultValue: '📅 Jour {{day}} · {{count}} indices',
              day: dayNumber,
              count: clueCount,
            })}
          </ShhText>
        </View>

        {/* Clue cards */}
        {DEMO_CLUES.map((clue) => (
          <ShhClueCard
            key={clue.id}
            type={clue.type}
            content={clue.content}
            time={clue.time}
            isNew={clue.isNew}
          />
        ))}

        {/* Question card (sender only) */}
        {isSender && !questionAnswered && (
          <View style={styles.questionCard}>
            <ShhText variant="body" style={styles.questionLabel}>
              {t('clue.questionLabel', { defaultValue: '❓ Question' })} {DEMO_QUESTION.time}
            </ShhText>

            <ShhText variant="body" style={styles.questionText}>
              {DEMO_QUESTION.text}
            </ShhText>

            <View style={styles.answerInputWrapper}>
              <TextInput
                style={styles.answerInput}
                value={answerText}
                onChangeText={setAnswerText}
                placeholder={t('clue.answerPlaceholder', { defaultValue: 'Ta réponse...' })}
                placeholderTextColor="#444444"
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
                {t('clue.sendClue', { defaultValue: 'Envoyer l\'indice' })} {'🤫'}
              </ShhText>
            </TouchableOpacity>
          </View>
        )}

        {/* Question answered confirmation */}
        {isSender && questionAnswered && (
          <View style={styles.answeredCard}>
            <ShhText variant="body" style={styles.answeredText}>
              {'✓ '}{t('clue.answered', { defaultValue: 'Indice envoyé' })}
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
    backgroundColor: 'rgba(0,0,0,0.1)',
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

  /* Day badge */
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

  /* Question card */
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

  /* Answered confirmation */
  answeredCard: {
    backgroundColor: 'rgba(0,0,0,0.09)',
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
