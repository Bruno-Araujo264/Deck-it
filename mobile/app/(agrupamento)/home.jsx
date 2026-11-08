<<<<<<< HEAD
=======
import { useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
>>>>>>> origin/dev
import { useTranslation } from 'react-i18next';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import {
<<<<<<< HEAD
  AppHeader,
  GemChip,
  GlassCard,
  Screen,
  SectionLabel,
  Tag,
} from '../../components';
import { colors, gameColor, radii, spacing, type } from '../../theme';

const categories = [
  { label: 'Magic', icon: '✣' },
  { label: 'Pokémon', icon: '☆' },
  { label: 'Yu-Gi-Oh', icon: '◈' },
  { label: 'Lorcana', icon: '✤' },
];

const decks = [
  { game: 'Magic', name: 'Commander Red Burn', cards: 100, age: '2h ago' },
  { game: 'Pokémon', name: 'Charizard Ex Deck', cards: 60, age: '1d ago' },
  { game: 'Yu-Gi-Oh', name: 'Blue-Eyes Dragon', cards: 40, age: '3d ago' },
];

export default function HomeScreen() {
  const { t } = useTranslation();

  return (
    <Screen>
      <FlatList
        style={styles.list}
        contentContainerStyle={styles.content}
        data={decks}
        keyExtractor={(deck) => deck.name}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <>
            <AppHeader tagline="Mesa Encantada TCG" style={styles.header} />

            <SectionLabel style={styles.realmLabel}>Filtrar por reino</SectionLabel>
            <FlatList
              horizontal
              data={categories}
              keyExtractor={(category) => category.label}
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.categoryList}
              renderItem={({ item }) => <GemChip label={item.label} game={item.label} />}
            />

            <SectionLabel style={styles.recentLabel}>{t('decks_recentes')}</SectionLabel>
          </>
        }
        renderItem={({ item }) => {
          const gem = gameColor(item.game);
          return (
            <GlassCard glowColor={gem} onPress={() => {}} style={styles.deckCard}>
              <View style={[styles.deckImage, { borderColor: `${gem}66` }]}>
                <Text style={[styles.imageLabel, { color: gem }]}>IMAGE</Text>
              </View>

              <View style={styles.deckInfo}>
                <Tag label={item.game} color={gem} style={styles.gameTag} />
                <Text style={styles.deckName} numberOfLines={1}>{item.name}</Text>
                <Text style={styles.cardCount}>
                  {item.cards}
                  {' '}
                  {t(item.cards === 1 ? 'carta' : 'cartas').toLowerCase()}
                </Text>
              </View>

              <Text style={styles.age}>{item.age}</Text>
            </GlassCard>
          );
        }}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  list: { flex: 1 },
  content: { paddingBottom: spacing.lg },
  header: { marginBottom: spacing.lg },
  realmLabel: { marginHorizontal: spacing.gutter },
  categoryList: {
    paddingHorizontal: spacing.gutter,
    gap: spacing.xs,
    paddingBottom: spacing.xs,
  },
  recentLabel: { marginHorizontal: spacing.gutter, marginTop: spacing.lg },
  deckCard: {
    marginHorizontal: spacing.gutter,
    marginBottom: spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  deckImage: {
    width: 52,
    height: 72,
    borderRadius: radii.sm,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.bgDeepest,
  },
  imageLabel: { ...type.labelSm, fontSize: 8, opacity: 0.8 },
  deckInfo: { flex: 1, gap: 3 },
  gameTag: { alignSelf: 'flex-start' },
  deckName: { ...type.headlineSm, color: colors.textPrimary },
  cardCount: { ...type.bodySm, color: colors.textSecondary },
  age: { ...type.labelSm, color: colors.textMuted, alignSelf: 'flex-start' },
=======
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
>>>>>>> origin/dev
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
