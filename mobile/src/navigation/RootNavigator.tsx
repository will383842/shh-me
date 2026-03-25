import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { NavigationContainer } from '@react-navigation/native';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../theme/colors';

const Stack = createNativeStackNavigator();

function PlaceholderScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Shh Me 🤫</Text>
      <Text style={styles.subtitle}>Infrastructure ready</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 36,
    fontWeight: '800',
    color: colors.black,
  },
  subtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    marginTop: 8,
  },
});

export default function RootNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Placeholder" component={PlaceholderScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
