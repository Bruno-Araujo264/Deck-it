import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

const cardNames = [
  'Lightning Bolt',
  'Mountain',
  'Goblin Guide',
  'Monastery Swiftspear',
  'Rift Bolt',
  'Lava Spike',
  'Eidolon of the Great Revel',
  'Searing Blaze',
];

export default function Decks() {
  const { source } = useLocalSearchParams();

  function goBack() {
    const previousRoute = source === 'buscar' ? '/buscar' : source === 'adicionar' ? '/adicionar' : '/home';
    router.replace(previousRoute);
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <StatusBar style="light" />
      <ScrollView
        style={styles.screen}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Pressable onPress={goBack}>
            <Text style={styles.backIcon}>‹</Text>
          </Pressable>
          <Text style={styles.deckTitle}>Pokemon Supremo</Text>
          <Pressable style={styles.editButton} accessibilityLabel="Editar deck">
            <Text style={styles.editIcon}>↗</Text>
          </Pressable>
        </View>

        <View style={styles.deckSummary}>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>CARTAS</Text>
            <Text style={styles.summaryValue}>60</Text>
          </View>
          <View style={styles.summaryDivider} />
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>JOGO</Text>
            <Text style={styles.summaryValue}>Magic</Text>
          </View>
        </View>

        <View style={styles.searchBox}>
          <Text style={styles.searchIcon}>⌕</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Search decks or cards..."
            placeholderTextColor="#8588b3"
          />
        </View>

        <View style={styles.cardsHeader}>
          <Text style={styles.sectionTitle}>Cartas no Deck</Text>
          <Pressable onPress={() => router.push('/adicionar')}>
            <Text style={styles.addCard}>＋ Adicionar Carta</Text>
          </Pressable>
        </View>

        <View style={styles.cardGrid}>
          {cardNames.map((name) => (
            <Pressable key={name} style={styles.cardItem} onPress={() => router.push('/carta')}>
              <Image
                source={require('../../assets/charizard.jpg')}
                style={styles.cardImage}
                resizeMode="contain"
              />
              <Text style={styles.cardName} numberOfLines={1}>{name}</Text>
            </Pressable>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#101126' },
  screen: { flex: 1, backgroundColor: '#101126' },
  content: { paddingBottom: 24 },
  header: {
    height: 44,
    paddingHorizontal: 13,
    flexDirection: 'row',
    alignItems: 'center',
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#292d62',
  },
  backIcon: { color: '#d7d8ea', fontSize: 27, lineHeight: 25, marginRight: 9 },
  deckTitle: { flex: 1, color: '#f4f4fb', fontSize: 14, fontWeight: '800' },
  editButton: {
    width: 22,
    height: 22,
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#292d62',
  },
  editIcon: { color: '#e3e4f1', fontSize: 16, transform: [{ rotate: '-45deg' }] },
  deckSummary: {
    height: 41,
    marginHorizontal: 13,
    marginTop: 15,
    borderRadius: 6,
    backgroundColor: '#292d62',
    flexDirection: 'row',
    alignItems: 'center',
  },
  summaryItem: { flex: 1, alignItems: 'center' },
  summaryLabel: { color: '#8588b3', fontSize: 8, marginBottom: 1 },
  summaryValue: { color: '#f4f4fb', fontSize: 11, fontWeight: '700' },
  summaryDivider: { width: 1, height: 25, backgroundColor: '#383e7b' },
  searchBox: {
    height: 33,
    marginHorizontal: 13,
    marginTop: 14,
    paddingHorizontal: 9,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#292d62',
    borderRadius: 6,
  },
  searchIcon: { color: '#a2a5cf', fontSize: 21, marginRight: 5 },
  searchInput: { flex: 1, color: '#f4f4fb', fontSize: 11, padding: 0 },
  cardsHeader: {
    marginHorizontal: 14,
    marginTop: 18,
    marginBottom: 11,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sectionTitle: { color: '#f4f4fb', fontSize: 11, fontWeight: '800' },
  addCard: { color: '#a2a5cf', fontSize: 9, fontWeight: '600' },
  cardGrid: {
    paddingHorizontal: 13,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: 18,
  },
  cardItem: { width: '50%', alignItems: 'center' },
  cardImage: {
    width: 150,
    height: 200,
    borderRadius: 2,
    backgroundColor: '#292d62',
  },
  cardName: {
    width: '100%',
    marginTop: 4,
    color: '#f4f4fb',
    fontSize: 8,
    textAlign: 'center',
  },
});
