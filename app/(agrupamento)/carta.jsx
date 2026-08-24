import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
	Image,
	Pressable,
	ScrollView,
	StyleSheet,
	Text,
	View,
} from 'react-native';

export default function Carta() {
	return (
		<SafeAreaView style={styles.safeArea} edges={['top']}>
			<StatusBar style="light" />
			<ScrollView style={styles.screen} contentContainerStyle={styles.content}>
				<View style={styles.header}>
					  <Pressable style={styles.backButton} onPress={() => router.replace('/decks')} accessibilityLabel="Voltar">
						<Text style={styles.backIcon}>‹</Text>
					</Pressable>
					<Text style={styles.title}>Charizard Vmax</Text>
				</View>

				<Image
					source={require('../../assets/charizard.jpg')}
					style={styles.cardImage}
					resizeMode="contain"
				/>

				<View style={styles.tagRow}>
					<Tag label="Mythic Rare" highlighted />
					<Tag label="Magic" />
					<Tag label="Mythic Rare" highlighted />
					<Tag label="Magic" />
				</View>

				<Text style={styles.sectionLabel}>CARACTERÍSTICAS</Text>
				<View style={styles.descriptionBox}>
					<Text style={styles.description}>
						LOREM LOREM LOREM LOREM LOREM LOREM LOREM LOREM LOREM LOREM LOREM LOREM
					</Text>
				</View>

				<View style={styles.statsRow}>
					<View style={styles.statBox}>
						<Text style={styles.statText}>Carta{`\n`}Nº 643</Text>
					</View>
					<View style={styles.statBox}>
						<Text style={styles.statText}>Valor Estimado{`\n`}~R$ 56.46</Text>
					</View>
				</View>

				<View style={styles.actions}>
					<Pressable style={styles.actionButton}>
						<Text style={styles.actionText}>Apagar</Text>
					</Pressable>
					<Pressable style={styles.actionButton}>
						<Text style={styles.actionText}>Editar</Text>
					</Pressable>
				</View>
			</ScrollView>
		</SafeAreaView>
	);
}

function Tag({ label, highlighted }) {
	return (
		<View style={[styles.tag, highlighted && styles.highlightedTag]}>
			<Text style={styles.tagText}>{label}</Text>
		</View>
	);
}

const styles = StyleSheet.create({
	safeArea: { flex: 1, backgroundColor: '#101126' },
	screen: { flex: 1, backgroundColor: '#101126' },
	content: { paddingBottom: 20 },
	header: {
		height: 53,
		paddingHorizontal: 16,
		flexDirection: 'row',
		alignItems: 'center',
		borderTopWidth: 1,
		borderBottomWidth: 1,
		borderColor: '#292d62',
	},
	backButton: {
		width: 24,
		height: 24,
		borderRadius: 4,
		alignItems: 'center',
		justifyContent: 'center',
		backgroundColor: '#292d62',
		marginRight: 10,
	},
	backIcon: { color: '#f4f4fb', fontSize: 25, lineHeight: 23, marginTop: -2 },
	title: { color: '#f4f4fb', fontSize: 20, fontWeight: '800' },
	cardImage: {
		width: 120,
		height: 168,
		alignSelf: 'center',
		marginTop: 16,
	},
	tagRow: {
		flexDirection: 'row',
		gap: 7,
		marginHorizontal: 16,
		marginTop: 13,
	},
	tag: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 3, backgroundColor: '#292d62' },
	highlightedTag: { backgroundColor: '#353a78' },
	tagText: { color: '#e4e5f1', fontSize: 9, fontWeight: '600' },
	sectionLabel: { color: '#8588b3', fontSize: 10, fontWeight: '800', margin: 13 },
	descriptionBox: {
		minHeight: 68,
		marginHorizontal: 16,
		padding: 10,
		borderRadius: 7,
		backgroundColor: '#292d62',
		borderWidth: 1,
		borderColor: '#383e7b',
	},
	description: { color: '#a2a5cf', fontSize: 11, lineHeight: 16 },
	statsRow: { flexDirection: 'row', gap: 25, marginHorizontal: 16, marginTop: 21 },
	statBox: {
		flex: 1,
		minHeight: 53,
		borderRadius: 4,
		alignItems: 'center',
		justifyContent: 'center',
		backgroundColor: '#292d62',
	},
	statText: { color: '#f4f4fb', fontSize: 20, lineHeight: 24, fontWeight: '800', textAlign: 'center' },
	actions: { flexDirection: 'row', gap: 12, marginHorizontal: 13, marginTop: 154 },
	actionButton: {
		flex: 1,
		height: 34,
		borderRadius: 4,
		alignItems: 'center',
		justifyContent: 'center',
		backgroundColor: '#292d62',
	},
	actionText: { color: '#f4f4fb', fontSize: 11, fontWeight: '700' },
});
