/**
 * RootNavigator — Main stack navigation.
 * Splash → Auth → BirthYear → Home (main flow)
 * Home FAB → SendShh, card tap → ShhDetail, menu → Settings
 */
import React, { lazy, Suspense } from 'react';
import { View, StyleSheet } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { NavigationContainer } from '@react-navigation/native';
import ShhSkeleton from '../components/atoms/ShhSkeleton';
import ShhErrorBoundary from '../components/organisms/ShhErrorBoundary';
import { colors } from '../theme/colors';
import type { RootStackParamList } from '../types';

const SplashScreen = lazy(() => import('../screens/SplashScreen'));
const AuthScreen = lazy(() => import('../screens/auth/AuthScreen'));
const BirthYearScreen = lazy(
  () => import('../screens/onboarding/BirthYearScreen'),
);
const HomeScreen = lazy(() => import('../screens/home/HomeScreen'));
const SendShhScreen = lazy(() => import('../screens/shh/SendShhScreen'));
const ShhDetailScreen = lazy(
  () => import('../screens/shh/ShhDetailScreen'),
);
const SettingsScreen = lazy(
  () => import('../screens/settings/SettingsScreen'),
);

const Stack = createNativeStackNavigator<RootStackParamList>();

function ScreenFallback() {
  return (
    <View style={styles.fallback}>
      <ShhSkeleton width={200} height={200} borderRadius={100} />
    </View>
  );
}

function withSuspense(Component: React.ComponentType) {
  return function SuspenseWrapper() {
    return (
      <Suspense fallback={<ScreenFallback />}>
        <Component />
      </Suspense>
    );
  };
}

export default function RootNavigator() {
  return (
    <ShhErrorBoundary>
      <NavigationContainer>
        <Stack.Navigator
          initialRouteName="Splash"
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: colors.dark },
            animation: 'fade',
          }}
        >
          <Stack.Screen
            name="Splash"
            component={withSuspense(SplashScreen)}
          />
          <Stack.Screen
            name="Auth"
            component={withSuspense(AuthScreen)}
          />
          <Stack.Screen
            name="BirthYear"
            component={withSuspense(BirthYearScreen)}
          />
          <Stack.Screen
            name="Home"
            component={withSuspense(HomeScreen)}
          />
          <Stack.Screen
            name="SendShh"
            component={withSuspense(SendShhScreen)}
            options={{ animation: 'slide_from_bottom' }}
          />
          <Stack.Screen
            name="ShhDetail"
            component={withSuspense(ShhDetailScreen)}
            options={{ animation: 'slide_from_right' }}
          />
          <Stack.Screen
            name="Settings"
            component={withSuspense(SettingsScreen)}
            options={{ animation: 'slide_from_right' }}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </ShhErrorBoundary>
  );
}

const styles = StyleSheet.create({
  fallback: {
    flex: 1,
    backgroundColor: colors.dark,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
