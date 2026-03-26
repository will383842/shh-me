/**
 * ConnectVideoScreen — Post-connection video screen.
 * Branches ReviewService for share trigger.
 */
import React, { useEffect, useCallback } from 'react';
import { View, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';
import ShhText from '../../components/atoms/ShhText';
import { useShareContent } from '../../hooks/useShareContent';
import { maybeRequestReview } from '../../services/ReviewService';
import * as HappinessScore from '../../services/HappinessScore';
import { colors } from '../../theme/colors';
import type { RootStackParamList } from '../../types';

type ConnectVideoRoute = RouteProp<RootStackParamList, 'ConnectVideo'>;
type Nav = NativeStackNavigationProp<RootStackParamList>;

/* Confetti bounce */
function ConfettiBounce() {
  const bounce = useSharedValue(0);

  useEffect(() => {
    bounce.value = withRepeat(
      withSequence(
        withTiming(-6, { duration: 500, easing: Easing.out(Easing.ease) }),
        withTiming(0, { duration: 500, easing: Easing.inOut(Easing.ease) }),
      ),
      -1,
      true,
    );
  }, [bounce]);

  const style = useAnimatedStyle(() => ({
    transform: [{ translateY: bounce.value }],
  }));

  return (
    <Animated.View style={style}>
      <ShhText variant="display" style={styles.confettiText}>
        {'\uD83C\uDF89\u2728\uD83E\uDD2B\u2728\uD83C\uDF89'}
      </ShhText>
    </Animated.View>
  );
}

export default function ConnectVideoScreen() {
  const { t } = useTranslation();
  const navigation = useNavigation<Nav>();
  const route = useRoute<ConnectVideoRoute>();
  const { shhId } = route.params;

  const { shareContent, isSharing } = useShareContent();

  const handleSendAnother = useCallback(() => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    navigation.navigate('SendShh');
  }, [navigation]);

  const handleShareVideo = useCallback(async () => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    await shareContent({
      caption: t('share.videoCaption'),
      uri: `demo://connect_video_${shhId}.mp4`,
    });
    HappinessScore.track('share_completed');
    void maybeRequestReview('share_completed');
  }, [shareContent, shhId, t]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        style={styles.flex1}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <ConfettiBounce />

        <ShhText variant="display" style={styles.bpmText}>
          {'\u2665 94 bpm \u2192 \u221E'}
        </ShhText>

        <ShhText variant="display" style={styles.title}>
          {'\uD83E\uDD2B '}{t('connect.connected')}
        </ShhText>

        <ShhText variant="body" style={styles.subtitle}>
          {t('connect.videoSubtitle')}
        </ShhText>

        <View style={styles.videoBox}>
          <ShhText variant="body" style={styles.videoIcon}>{'\uD83C\uDFAC'}</ShhText>
          <ShhText variant="body" style={styles.videoLabel}>
            {t('connect.videoLabel')}
          </ShhText>
        </View>

        <View style={styles.buttons}>
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={handleSendAnother}
            activeOpacity={0.8}
          >
            <ShhText variant="body" style={styles.primaryButtonText}>
              {t('connect.sendAnother')} {'\uD83E\uDD2B'}
            </ShhText>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={handleShareVideo}
            disabled={isSharing}
            activeOpacity={0.7}
          >
            <ShhText variant="body" style={styles.secondaryButtonText}>
              {'\uD83D\uDCE4 '}{t('connect.shareVideo')}
            </ShhText>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.dark,
  },
  flex1: {
    flex: 1,
  },
  content: {
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 60,
  },

  confettiText: {
    fontSize: 36,
    textAlign: 'center',
    marginBottom: 20,
  },

  bpmText: {
    fontSize: 14,
    color: colors.primary,
    marginBottom: 16,
  },

  title: {
    fontSize: 30,
    color: colors.primary,
    textAlign: 'center',
    marginBottom: 10,
  },

  subtitle: {
    fontSize: 14,
    color: colors.gray,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 40,
  },

  videoBox: {
    width: '100%',
    backgroundColor: colors.cardDark,
    borderWidth: 1,
    borderColor: colors.borderDark,
    borderRadius: 24,
    paddingVertical: 48,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 40,
  },
  videoIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  videoLabel: {
    fontSize: 14,
    color: colors.gray,
  },

  buttons: {
    width: '100%',
    gap: 12,
  },
  primaryButton: {
    backgroundColor: colors.primary,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.black,
  },
  secondaryButton: {
    borderWidth: 1,
    borderColor: colors.borderDark,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  secondaryButtonText: {
    fontSize: 14,
    color: colors.gray,
  },
});
