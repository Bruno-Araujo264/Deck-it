import { Tabs } from 'expo-router';
import { Text } from 'react-native';
import { useTranslation } from 'react-i18next';

const tabIcons = {
  home: '⌂',
  buscar: '⌕',
  decks: '□',
  adicionar: '+',
  perfil: '♙',
};

export default function GroupLayout() {
  const { t } = useTranslation();

  return (
    <Tabs
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: '#f4f4fb',
        tabBarInactiveTintColor: '#8588b3',
        tabBarStyle: {
          height: 72,
          paddingTop: 6,
          paddingBottom: 10,
          backgroundColor: '#101126',
          borderTopColor: '#292d62',
        },
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: '600',
        },
        tabBarIcon: ({ color, focused }) => (
          <TextIcon color={color} focused={focused} symbol={tabIcons[route.name]} />
        ),
      })}
    >
      <Tabs.Screen name="home" options={{ title: t('inicio') }} />
      <Tabs.Screen name="buscar" options={{ title: t('buscar') }} />
      <Tabs.Screen name="decks" options={{ title: t('decks') }} />
      <Tabs.Screen name="adicionar" options={{ title: t('adicionar') }} />
      <Tabs.Screen name="perfil" options={{ title: t('perfil') }} />
    </Tabs>
  );
}

function TextIcon({ color, focused, symbol }) {
  return (
    <Text style={{ color, fontSize: focused ? 25 : 23, lineHeight: 25 }}>
      {symbol}
    </Text>
  );
}