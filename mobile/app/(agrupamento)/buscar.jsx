import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useMemo, useState } from 'react';
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

const allDecks = [
  { name: 'Sliver Overlord', cards: '100 cards', image: require('../../assets/yugioh-back.jpg') },
  { name: 'Blue Counterspell', cards: '60 cards', image: require('../../assets/yugioh-back.jpg') },
  { name: 'Goblins Aggro', cards: '60 cards', image: require('../../assets/pokemon-back.jpg') },
  { name: 'DECK SUPREMO', cards: '100 cards', image: require('../../assets/pokemon-back.jpg') },
  { name: 'Sliver Overlord', cards: '100 cards', image: require('../../assets/yugioh-back.jpg') },
  { name: 'Blue Counterspell', cards: '60 cards', image: require('../../assets/pokemon-back.jpg') },
  { name: 'Goblins Aggro', cards: '60 cards', image: require('../../assets/pokemon-back.jpg') },
  { name: 'Selesnya Lifegain', cards: '100 cards', image: require('../../assets/yugioh-back.jpg') },
];

function useDeckSearch(query) {
  return useMemo(
    () => allDecks.filter((deck) => deck.name.toLowerCase().includes(query.toLowerCase())),
    [query],
  );
}

export default function Buscar() {
  const [query, setQuery] = useState('');
  const decks = useDeckSearch(query);

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <StatusBar style="light" />
      <ScrollView
        style={styles.screen}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header} />
        <View style={styles.searchBox}>
          <Text style={styles.searchIcon}>⌕</Text>
          <TextInput
            value={query}
            onChangeText={setQuery}
            style={styles.searchInput}
            placeholder="Search decks or cards..."
            placeholderTextColor="#8588b3"
            returnKeyType="search"
          />
        </View>

        <View style={styles.deckGrid}>
          {decks.map((deck, index) => (
            <Pressable
              key={`${deck.name}-${index}`}
              style={({ pressed }) => [styles.deckCard, pressed && styles.deckPressed]}
              onPress={() => router.push({ pathname: '/decks', params: { source: 'buscar' } })}
            >
              <View style={styles.imagePlaceholder}>
                <Image
                  source={deck.image}
                  style={styles.deckImage}
                  resizeMode="cover"
                />
              </View>
              <Text style={styles.deckName} numberOfLines={1}>{deck.name}</Text>
              <Text style={styles.cardCount}>{deck.cards}</Text>
            </Pressable>
          ))}
        </View>
        {decks.length === 0 && <Text style={styles.emptyText}>No decks found</Text>}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#101126' },
  screen: { flex: 1, backgroundColor: '#101126' },
  content: { paddingBottom: 24 },
  header: {
    height: 43,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#292d62',
  },
  searchBox: {
    height: 36,
    marginHorizontal: 16,
    marginTop: 24,
    marginBottom: 30,
    paddingHorizontal: 9,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#292d62',
    borderRadius: 7,
  },
  searchIcon: { color: '#a2a5cf', fontSize: 22, marginRight: 5 },
  searchInput: { flex: 1, color: '#f4f4fb', fontSize: 12, padding: 0 },
  deckGrid: {
    paddingHorizontal: 16,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: 13,
  },
  deckCard: {
    width: '47%',
    height: 133,
    padding: 9,
    borderRadius: 9,
    backgroundColor: '#292d62',
    borderWidth: 1,
    borderColor: '#383e7b',
  },
  deckPressed: { opacity: 0.75 },
  imagePlaceholder: {
    height: 73,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#292d62',
    borderBottomWidth: 1,
    borderColor: '#383e7b',
  },
  deckImage: {
    width: '100%',
    height: '100%',
  },
  deckName: { color: '#f4f4fb', fontSize: 12, fontWeight: '700', marginTop: 8 },
  cardCount: { color: '#8588b3', fontSize: 10, marginTop: 3 },
  emptyText: { color: '#8588b3', textAlign: 'center', marginTop: 25, fontSize: 12 },
});