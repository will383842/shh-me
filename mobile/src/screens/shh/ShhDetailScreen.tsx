/**
 * ShhDetailScreen — Conversation view for a single shh.
 * Shows blur photo, messages FlatList, text input, quick replies.
 * Receiver gets ShhGuessGame. Share icon top-right. Panic exit top-left.
 */
import React, { useEffect, useState, useCallback, useRef } from 'react';
import {
  View,
  FlatList,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';
import ShhText from '../../components/atoms/ShhText';
import ShhSkeleton from '../../components/atoms/ShhSkeleton';
import ShhBlurPhoto from '../../components/molecules/ShhBlurPhoto';
import ShhMessageBubble from '../../components/molecules/ShhMessageBubble';
import ShhQuickReplies from '../../components/molecules/ShhQuickReplies';
import ShhGuessGame from '../../components/organisms/ShhGuessGame';
import ShhBpmDisplay from '../../components/atoms/ShhBpmDisplay';
import { useShhStore } from '../../stores/useShhStore';
import { useBlurLevel } from '../../hooks/useBlurLevel';
import { useAuthStore } from '../../stores/useAuthStore';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import type { ShhMessage, RootStackParamList } from '../../types';

type DetailRoute = RouteProp<RootStackParamList, 'ShhDetail'>;
type Nav = NativeStackNavigationProp<RootStackParamList>;

export default function ShhDetailScreen() {
  const { t } = useTranslation();
  const route = useRoute<DetailRoute>();
  const navigation = useNavigation<Nav>();
  const { shhId } = route.params;

  const token = useAuthStore((s) => s.token);
  const { currentShh, messages, isLoading, fetchShhDetail, sendMessage } =
    useShhStore();

  const [input, setInput] = useState('');
  const flatListRef = useRef<FlatList<ShhMessage>>(null);

  const blurLevel = useBlurLevel(currentShh?.exchange_count ?? 0);

  // Determine if current user is receiver (to show guess game)
  const isReceiver = currentShh?.receiver_id === token;

  useEffect(() => {
    void fetchShhDetail(shhId);
  }, [shhId, fetchShhDetail]);

  const handleSend = useCallback(
    (content: string) => {
      if (!content.trim()) return;
      void sendMessage(shhId, content.trim());
      setInput('');
    },
    [shhId, sendMessage],
  );

  const handleInputSend = useCallback(() => {
    handleSend(input);
  }, [input, handleSend]);

  const renderMessage = useCallback(
    ({ item }: { item: ShhMessage }) => (
      <ShhMessageBubble
        content={item.content}
        isSender={item.sender_id !== currentShh?.receiver_id}
        reaction={item.reaction}
        timestamp={item.created_at}
      />
    ),
    [currentShh],
  );

  const keyExtractor = useCallback((item: ShhMessage) => item.id, []);

  if (isLoading && !currentShh) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ShhSkeleton width={200} height={200} borderRadius={100} />
          <ShhSkeleton width="80%" height={40} borderRadius={20} />
          <ShhSkeleton width="60%" height={40} borderRadius={20} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.navigate('Settings')}
          style={styles.headerButton}
        >
          <ShhText variant="body" style={styles.headerIcon}>
            {'\u26d4'}
          </ShhText>
        </TouchableOpacity>

        {currentShh && <ShhBpmDisplay bpm={currentShh.bpm} />}

        <TouchableOpacity style={styles.headerButton}>
          <ShhText variant="body" style={styles.headerIcon}>
            {'\ud83e\udd2b'}
          </ShhText>
        </TouchableOpacity>
      </View>

      {/* Blur photo */}
      {currentShh && (
        <View style={styles.photoSection}>
          <ShhBlurPhoto
            url={currentShh.photo_url ?? ''}
            blurLevel={blurLevel}
            size={160}
          />
        </View>
      )}

      <KeyboardAvoidingView
        style={styles.chatSection}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={90}
      >
        {/* Messages */}
        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderMessage}
          keyExtractor={keyExtractor}
          contentContainerStyle={styles.messagesList}
          showsVerticalScrollIndicator={false}
          onContentSizeChange={() =>
            flatListRef.current?.scrollToEnd({ animated: true })
          }
        />

        {/* Guess game (receiver only) */}
        {isReceiver && currentShh && (
          <ShhGuessGame shhId={currentShh.id} />
        )}

        {/* Quick replies */}
        <ShhQuickReplies shhId={shhId} onSend={handleSend} />

        {/* Text input */}
        <View style={styles.inputRow}>
          <TextInput
            style={styles.textInput}
            value={input}
            onChangeText={setInput}
            placeholder={t('shh.message.placeholder')}
            placeholderTextColor={colors.gray}
            maxLength={200}
            multiline
          />
          <TouchableOpacity
            style={[
              styles.sendButton,
              !input.trim() && styles.sendDisabled,
            ]}
            onPress={handleInputSend}
            disabled={!input.trim()}
            activeOpacity={0.7}
          >
            <ShhText variant="body" style={styles.sendIcon}>
              {'\ud83e\udd2b'}
            </ShhText>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.dark,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.lg,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.sm,
  },
  headerButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerIcon: {
    fontSize: 20,
  },
  photoSection: {
    alignItems: 'center',
    paddingVertical: spacing.base,
  },
  chatSection: {
    flex: 1,
  },
  messagesList: {
    paddingVertical: spacing.sm,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.sm,
    gap: spacing.sm,
  },
  textInput: {
    flex: 1,
    backgroundColor: colors.cardDark,
    borderRadius: 24,
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.sm,
    color: colors.textDark,
    fontSize: 15,
    maxHeight: 100,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendDisabled: {
    opacity: 0.3,
  },
  sendIcon: {
    fontSize: 20,
  },
});
