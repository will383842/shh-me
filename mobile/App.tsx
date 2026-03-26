import React, { useCallback } from 'react';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useFonts, Baloo2_600SemiBold, Baloo2_700Bold, Baloo2_800ExtraBold } from '@expo-google-fonts/baloo-2';
import { DMSans_400Regular, DMSans_500Medium, DMSans_600SemiBold, DMSans_700Bold } from '@expo-google-fonts/dm-sans';
import RootNavigator from './src/navigation/RootNavigator';
import './src/i18n';
import { useOfflineQueue } from './src/hooks/useOfflineQueue';
import { usePushNotifications } from './src/hooks/usePushNotifications';
import { ensureInstallDateRecorded } from './src/services/ReviewService';
import { apiRequest } from './src/services/api';
import { useAuthStore } from './src/stores/useAuthStore';
import type { QueuedAction } from './src/types';

ensureInstallDateRecorded();

function AppShell() {
  const token = useAuthStore((s) => s.token);

  const executor = useCallback(
    async (action: QueuedAction) => {
      if (!token) return;
      switch (action.type) {
        case 'send_shh':
          await apiRequest('/shh', { method: 'POST', body: action.payload, token });
          break;
        case 'send_message': {
          const { shhId, ...rest } = action.payload as { shhId: string; content: string };
          await apiRequest(`/shh/${shhId}/messages`, { method: 'POST', body: rest, token });
          break;
        }
        case 'submit_guess': {
          const { shhId: guessShh, ...guessRest } = action.payload as { shhId: string; identifier: string };
          await apiRequest(`/shh/${guessShh}/guess`, { method: 'POST', body: guessRest, token });
          break;
        }
      }
    },
    [token],
  );

  useOfflineQueue({ executor });
  usePushNotifications();

  return <RootNavigator />;
}

export default function App() {
  const [fontsLoaded] = useFonts({
    Baloo2_600SemiBold,
    Baloo2_700Bold,
    Baloo2_800ExtraBold,
    DMSans_400Regular,
    DMSans_500Medium,
    DMSans_600SemiBold,
    DMSans_700Bold,
  });

  if (!fontsLoaded) {
    return null;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <StatusBar style="light" />
      <AppShell />
    </GestureHandlerRootView>
  );
}
