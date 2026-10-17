import { Tabs } from 'expo-router';
import { Text } from 'react-native';

const tabIcons = {
  home: '⌂',
  buscar: '⌕',
  decks: '□',
  adicionar: '+',
  perfil: '♙',
};

export default function GroupLayout() {
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
      <Tabs.Screen name="home" options={{ title: 'Home' }} />
      <Tabs.Screen name="buscar" options={{ title: 'Busca' }} />
      <Tabs.Screen name="decks" options={{ title: 'Decks' }} />
      <Tabs.Screen name="adicionar" options={{ title: 'Adicionar' }} />
      <Tabs.Screen name="perfil" options={{ title: 'Perfil' }} />
      <Tabs.Screen name="carta" options={{ href: null }} />
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