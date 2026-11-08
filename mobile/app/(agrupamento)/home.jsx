import { useEffect, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { FlatList, StyleSheet, Text, View, Pressable } from 'react-native';
import {AppHeader,
  GemChip,
  GlassCard,
  SectionLabel,
  Tag,
} from '../../components';
import { colors, gameColor, radii, spacing, type } from '../../theme';
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
			<FlatList
				style={styles.list}
				contentContainerStyle={styles.content}
				data={decks}
				keyExtractor={(deck) => String(deck.id)}
				showsVerticalScrollIndicator={false}
				ListHeaderComponent={
					<>
						<AppHeader tagline="Deck It" style={styles.header} />
						<View style={styles.header}>
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
              renderItem={({ item }) => <GemChip label={item.name} game={item.slug} />}
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
            <SectionLabel style={styles.recentLabel}>{t('decks_recentes')}</SectionLabel>
						)}
					</>
				}
				renderItem={({ item }) => {
          const gem = gameColor(item.game.slug);
          return (
            <GlassCard glowColor={gem} onPress={() => {router.push({ pathname: '/decks', params: { deckId: String(item.id) } })}} style={styles.deckCard}>
              <View style={[styles.deckImage, { borderColor: `${gem}66` }]}>
                <Text style={[styles.imageLabel, { color: gem }]}>IMAGE</Text>
              </View>

              <View style={styles.deckInfo}>
                <Tag label={item.game.name} color={gem} style={styles.gameTag} />
                <Text style={styles.deckName} numberOfLines={1}>{item.name}</Text>
                <Text style={styles.cardCount}>
                  {item._count?.items ?? 0}
									{' '}
									{t((item._count?.items ?? 0) === 1 ? 'carta' : 'cartas').toLowerCase()}
                </Text>
              </View>

              <Text style={styles.age}>{formatAge(item.updatedAt)}</Text>
            </GlassCard>
          );
        }}
			/>
		</SafeAreaView>
	);
}

const styles = StyleSheet.create({
	safeArea: {
  flex: 1,
  backgroundColor: colors.bgDeep,
},
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
	addDeckButton: { paddingHorizontal: 8, paddingVertical: 5 },
	addDeckText: { color: '#a2a5cf', fontSize: 9, fontWeight: '600' },
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
