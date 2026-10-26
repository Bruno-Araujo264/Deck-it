import { useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import {
	FlatList,
	Pressable,
	StyleSheet,
	Text,
	View,
} from 'react-native';
import { router } from 'expo-router';
import { getDecks, getGames } from '../../api/client';

export default function HomeScreen() {
	const { t } = useTranslation();
	const [categories, setCategories] = useState([]);
	const [decks, setDecks] = useState([]);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState('');

	useEffect(() => {
		let isMounted = true;

		async function loadHome() {
			try {
				const [games, userDecks] = await Promise.all([getGames(), getDecks()]);
				if (!isMounted) {
					return;
				}

				setCategories(games.map((game) => ({
					...game,
					icon: getGameIcon(game.slug),
				})));
				setDecks(userDecks);
			} catch (requestError) {
				if (isMounted) {
					setError(requestError.message);
				}
			} finally {
				if (isMounted) {
					setIsLoading(false);
				}
			}
		}

		loadHome();

		return () => {
			isMounted = false;
		};
	}, []);

	return (
		<SafeAreaView style={styles.safeArea} edges={['top']}>
			<StatusBar style="light" />
			<FlatList
				style={styles.list}
				contentContainerStyle={styles.content}
				data={decks}
				keyExtractor={(deck) => String(deck.id)}
				showsVerticalScrollIndicator={false}
				ListHeaderComponent={
					<>
						<View style={styles.header}>
							<Text style={styles.title}>Deck-It</Text>
							<Pressable
								style={styles.addDeckButton}
								onPress={() => router.push('/criar-deck')}
								accessibilityRole="button"
								accessibilityLabel={t('criar_deck')}
							>
								<Text style={styles.addDeckText}>＋ {t('criar_deck')}</Text>
							</Pressable>
						</View>

						<FlatList
							horizontal
							data={categories}
							keyExtractor={(category) => String(category.id)}
							showsHorizontalScrollIndicator={false}
							contentContainerStyle={styles.categoryList}
							renderItem={({ item }) => (
								<Pressable style={styles.category}>
									<Text style={styles.categoryIcon}>{item.icon}</Text>
									<Text style={styles.categoryText}>{item.name}</Text>
								</Pressable>
							)}
						/>
						{isLoading ? (
							<Text style={[styles.statusText, styles.recentTitle]}>Carregando...</Text>
						) : error ? (
							<Text style={styles.errorText}>{error}</Text>
						) : decks.length === 0 ? (
							<View style={styles.emptyState}>
								<Text style={styles.emptyTitle}>{t('sem_decks')}</Text>
								<Pressable style={styles.createButton} onPress={() => router.push('/criar-deck')}>
									<Text style={styles.createButtonText}>{t('criar_primeiro_deck')}</Text>
								</Pressable>
							</View>
						) : (
							<Text style={[styles.sectionTitle, styles.recentTitle]}>{t('decks_recentes')}</Text>
						)}
					</>
				}
				renderItem={({ item }) => (
					<Pressable
						style={({ pressed }) => [styles.deckCard, pressed && styles.deckPressed]}
						onPress={() => router.push({ pathname: '/decks', params: { deckId: String(item.id) } })}
					>
						<View style={styles.deckImage}>
							<Text style={styles.imageLabel}>IMAGE</Text>
						</View>
						<View style={styles.deckInfo}>
							<Text style={styles.game}>{item.game?.name}</Text>
							<Text style={styles.deckName}>{item.name}</Text>
							<Text style={styles.cardCount}>
								{item._count?.items ?? 0}
								{' '}
								{t((item._count?.items ?? 0) === 1 ? 'carta' : 'cartas').toLowerCase()}
							</Text>
						</View>
						<Text style={styles.age}>{formatAge(item.updatedAt)}</Text>
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
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between',
		paddingHorizontal: 16,
		borderTopWidth: 1,
		borderBottomWidth: 1,
		borderColor: '#3767d9',
		borderStyle: 'dotted',
	},
	title: { color: '#f4f4fb', fontSize: 18, fontWeight: '800' },
	addDeckButton: { paddingHorizontal: 8, paddingVertical: 5 },
	addDeckText: { color: '#a2a5cf', fontSize: 9, fontWeight: '600' },
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
	statusText: { color: '#8588b3', fontSize: 11, marginHorizontal: 14 },
	categoryList: { paddingHorizontal: 14, gap: 10, marginTop: 15 },
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
	emptyState: { alignItems: 'center', paddingHorizontal: 14, paddingTop: 30, paddingBottom: 18 },
	emptyTitle: { color: '#f4f4fb', fontSize: 14, fontWeight: '700', textAlign: 'center' },
	createButton: {
		marginTop: 16,
		paddingHorizontal: 30,
		paddingVertical: 10,
		borderRadius: 20,
		backgroundColor: '#625ff0',
	},
	createButtonText: { color: '#ffffff', fontSize: 12, fontWeight: '700' },
	errorText: { color: '#ff8f9c', fontSize: 11, textAlign: 'center', marginHorizontal: 14, marginTop: 14 },
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

function getGameIcon(slug = '') {
	const icons = {
		magic: '✣',
		pokemon: '☆',
		'yu-gi-oh': '◈',
		lorcana: '✤',
	};

	return icons[slug.toLowerCase()] ?? '◈';
}

function formatAge(dateValue) {
	if (!dateValue) {
		return '';
	}

	const elapsedMinutes = Math.max(0, Math.floor((Date.now() - new Date(dateValue).getTime()) / 60000));
	if (elapsedMinutes < 60) {
		return `${elapsedMinutes}min`;
	}

	const elapsedHours = Math.floor(elapsedMinutes / 60);
	if (elapsedHours < 24) {
		return `${elapsedHours}h`;
	}

	return `${Math.floor(elapsedHours / 24)}d`;
}
