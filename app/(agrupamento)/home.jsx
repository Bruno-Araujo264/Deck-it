import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
	FlatList,
	Pressable,
	StyleSheet,
	Text,
	TextInput,
	View,
} from 'react-native';

const categories = [
	{ label: 'Magic', icon: '✣' },
	{ label: 'Pokémon', icon: '☆' },
	{ label: 'Yu-Gi-Oh', icon: '◈' },
	{ label: 'Lorcana', icon: '✤' },
];

const decks = [
	{ game: 'Magic', name: 'Commander Red Burn', cards: '100 Cards', age: '2h ago' },
	{ game: 'Pokémon', name: 'Charizard Ex Deck', cards: '60 Cards', age: '1d ago' },
	{ game: 'Yu-Gi-Oh', name: 'Blue-Eyes Dragon', cards: '40 Cards', age: '3d ago' },
];

export default function HomeScreen() {
	return (
		<SafeAreaView style={styles.safeArea} edges={['top']}>
			<StatusBar style="light" />
			<FlatList
				style={styles.list}
				contentContainerStyle={styles.content}
				data={decks}
				keyExtractor={(deck) => deck.name}
				showsVerticalScrollIndicator={false}
				ListHeaderComponent={
					<>
						<View style={styles.header}>
							<Text style={styles.title}>Deck-It</Text>
						</View>

						<View style={styles.searchBox}>
							<Text style={styles.searchIcon}>⌕</Text>
							<TextInput
								style={styles.searchInput}
								placeholder="Search decks or cards..."
								placeholderTextColor="#8588b3"
								returnKeyType="search"
							/>
						</View>

						<Text style={styles.sectionTitle}>Game Categories</Text>
						<FlatList
							horizontal
							data={categories}
							keyExtractor={(category) => category.label}
							showsHorizontalScrollIndicator={false}
							contentContainerStyle={styles.categoryList}
							renderItem={({ item }) => (
								<Pressable style={styles.category}>
									<Text style={styles.categoryIcon}>{item.icon}</Text>
									<Text style={styles.categoryText}>{item.label}</Text>
								</Pressable>
							)}
						/>
						<Text style={[styles.sectionTitle, styles.recentTitle]}>Recent Decks</Text>
					</>
				}
				renderItem={({ item }) => (
					<Pressable style={({ pressed }) => [styles.deckCard, pressed && styles.deckPressed]}>
						<View style={styles.deckImage}>
							<Text style={styles.imageLabel}>IMAGE</Text>
						</View>
						<View style={styles.deckInfo}>
							<Text style={styles.game}>{item.game}</Text>
							<Text style={styles.deckName}>{item.name}</Text>
							<Text style={styles.cardCount}>{item.cards}</Text>
						</View>
						<Text style={styles.age}>{item.age}</Text>
					</Pressable>
				)}
			/>
		</SafeAreaView>
	);
}

const styles = StyleSheet.create({
	safeArea: { flex: 1, backgroundColor: '#101126' },
	list: { flex: 1, backgroundColor: '#101126' },
	content: { paddingBottom: 20 },
	header: {
		height: 53,
		justifyContent: 'center',
		paddingHorizontal: 16,
		borderTopWidth: 1,
		borderBottomWidth: 1,
		borderColor: '#3767d9',
		borderStyle: 'dotted',
	},
	title: { color: '#f4f4fb', fontSize: 14, fontWeight: '800' },
	searchBox: {
		height: 33,
		marginHorizontal: 14,
		marginTop: 14,
		marginBottom: 17,
		paddingHorizontal: 9,
		flexDirection: 'row',
		alignItems: 'center',
		backgroundColor: '#292d62',
		borderRadius: 6,
	},
	searchIcon: { color: '#a2a5cf', fontSize: 22, marginRight: 5 },
	searchInput: { flex: 1, color: '#f4f4fb', fontSize: 11, padding: 0 },
	sectionTitle: { color: '#f4f4fb', fontSize: 11, fontWeight: '800', marginHorizontal: 14 },
	categoryList: { paddingHorizontal: 14, gap: 7, marginTop: 8 },
	category: {
		height: 24,
		paddingHorizontal: 10,
		borderRadius: 12,
		backgroundColor: '#292d62',
		flexDirection: 'row',
		alignItems: 'center',
		gap: 6,
	},
	categoryIcon: { color: '#b8bad8', fontSize: 12 },
	categoryText: { color: '#f4f4fb', fontSize: 10, fontWeight: '600' },
	recentTitle: { marginTop: 18, marginBottom: 8 },
	deckCard: {
		height: 60,
		marginHorizontal: 14,
		marginBottom: 9,
		padding: 8,
		borderRadius: 8,
		backgroundColor: '#292d62',
		flexDirection: 'row',
		alignItems: 'center',
		borderWidth: 1,
		borderColor: '#383e7b',
	},
	deckPressed: { opacity: 0.75 },
	deckImage: {
		width: 43,
		height: 43,
		borderWidth: 1,
		borderColor: '#41477f',
		alignItems: 'center',
		justifyContent: 'center',
	},
	imageLabel: { color: '#8588b3', fontSize: 7 },
	deckInfo: { flex: 1, marginLeft: 10 },
	game: { color: '#8588b3', fontSize: 8, marginBottom: 2 },
	deckName: { color: '#f4f4fb', fontSize: 12, fontWeight: '700' },
	cardCount: { color: '#8588b3', fontSize: 9, marginTop: 2 },
	age: { color: '#8588b3', fontSize: 8, alignSelf: 'flex-start', marginTop: 1 },
});
