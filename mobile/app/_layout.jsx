import { Stack } from 'expo-router';
import '../i18n';

export default function RootLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="login" />
      <Stack.Screen name="cadastro" />
      <Stack.Screen name="(agrupamento)" />
      <Stack.Screen name="carta" />
    </Stack>
  );
}