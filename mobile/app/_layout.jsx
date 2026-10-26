import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { View } from 'react-native';
import '../i18n';
import { colors, fontAssets } from '../theme';

// Mantém a splash na tela até as fontes terminarem de carregar — evita o
// "flash" de fonte do sistema antes da Cinzel/Garamond/Quicksand entrarem.
SplashScreen.preventAutoHideAsync().catch(() => {});

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts(fontAssets);

  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync().catch(() => {});
    }
  }, [fontsLoaded, fontError]);

  // Se as fontes falharem, seguimos mesmo assim: o app cai no fallback do
  // sistema em vez de travar na splash.
  if (!fontsLoaded && !fontError) {
    return <View style={{ flex: 1, backgroundColor: colors.bgDeep }} />;
  }

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        // Evita o flash branco padrão entre telas: o fundo do stack já nasce
        // na cor "Noite Encantada" do guia de estilo.
        contentStyle: { backgroundColor: colors.bgDeep },
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen name="login" />
      <Stack.Screen name="cadastro" />
      <Stack.Screen name="(agrupamento)" />
      <Stack.Screen name="carta" />
    </Stack>
  );
}
