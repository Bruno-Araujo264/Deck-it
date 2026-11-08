import { Tabs } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import { colors, fonts, radii, shadows, sizes, type } from '../../theme';

const tabIcons = {
  home: '⌂',
  buscar: '⌕',
  decks: '□',
  adicionar: '+',
  perfil: '♙',
};

/** "Adicionar" é a ação primária: ganha o orbe dourado do guia de estilo. */
const PRIMARY_TAB = 'adicionar';

export default function GroupLayout() {
  return (
    <Tabs
      screenOptions={({ route }) => ({
        headerShown: false,
        sceneStyle: { backgroundColor: colors.bgDeep },
        tabBarActiveTintColor: colors.gold,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarStyle: styles.tabBar,
        tabBarLabelStyle: styles.tabLabel,
        tabBarItemStyle: styles.tabItem,
        tabBarIcon: ({ color, focused }) => (
          <TabIcon
            color={color}
            focused={focused}
            symbol={tabIcons[route.name]}
            primary={route.name === PRIMARY_TAB}
          />
        ),
      })}
    >
      <Tabs.Screen name="home" options={{ title: 'Home' }} />
      <Tabs.Screen name="buscar" options={{ title: 'Busca' }} />
      <Tabs.Screen name="decks" options={{ title: 'Decks' }} />
      <Tabs.Screen name="adicionar" options={{ title: 'Adicionar' }} />
      <Tabs.Screen name="perfil" options={{ title: 'Perfil' }} />
    </Tabs>
  );
}

function TabIcon({ color, focused, symbol, primary }) {
  if (primary) {
    return (
      <View style={styles.orb}>
        <Text style={styles.orbIcon}>{symbol}</Text>
      </View>
    );
  }

  return (
    <Text style={[styles.icon, { color, fontSize: focused ? 24 : 22 }]}>{symbol}</Text>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    height: sizes.tabBar,
    paddingTop: 8,
    paddingBottom: 12,
    backgroundColor: colors.glassNav,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    ...shadows.elevated,
  },
  tabItem: { paddingTop: 2 },
  tabLabel: { ...type.labelSm, marginTop: 2 },
  icon: { lineHeight: 26 },
  orb: {
    width: 42,
    height: 42,
    borderRadius: radii.pill,
    marginTop: -10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.gold,
    ...shadows.gold,
  },
  orbIcon: {
    color: colors.textOnLight,
    fontSize: 26,
    lineHeight: 29,
    fontFamily: fonts.bodyBold,
  },
});
