import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Sidebar } from '../../components/Sidebar';
import { useNotifications } from '../../contexts/NotificationContext';
import { useTheme } from '../../contexts/ThemeContext';

export default function Study() {
	const router = useRouter();
	const [sidebarVisible, setSidebarVisible] = useState(false);
	const { unreadCount } = useNotifications();
	const { colors } = useTheme();

	return (
		<SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
			{/* Header */}
			<View style={[styles.header, { backgroundColor: colors.headerBg, borderBottomColor: colors.border }]}>
				<TouchableOpacity onPress={() => setSidebarVisible(true)}>
					<Ionicons name="menu" size={28} color={colors.text} />
				</TouchableOpacity>

				<Text style={[styles.headerTitle, { color: colors.text }]}>Study Materials</Text>

				<TouchableOpacity
					onPress={() => router.push('/(tabs)/index' as any)}
					style={styles.notificationButton}
				>
					<Ionicons name="notifications" size={28} color={colors.text} />
					{unreadCount > 0 && (
						<View style={styles.notificationBadge}>
							<Text style={styles.notificationBadgeText}>
								{unreadCount > 9 ? '9+' : unreadCount}
							</Text>
						</View>
					)}
				</TouchableOpacity>
			</View>

			{/* Sidebar */}
			<Sidebar visible={sidebarVisible} onClose={() => setSidebarVisible(false)} />

			<ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
			{/* Quick access to Study Library */}
			<TouchableOpacity
				style={[styles.libraryQuickAccess, { backgroundColor: colors.primary }]}
				onPress={() => router.push('/library' as any)}
			>
				<Ionicons name="library-outline" size={20} color={colors.surface} />
				<View style={{ flex: 1, marginLeft: 12 }}>
					<Text style={[styles.quickAccessTitle, { color: colors.surface }]}>Study Library</Text>
					<Text style={[styles.quickAccessSubtitle, { color: colors.surface + '99' }]}>View all your saved materials</Text>
				</View>
				<Ionicons name="arrow-forward" size={20} color={colors.surface} />
			</TouchableOpacity>

			{/* Info message */}
			<View style={[styles.infoBox, { backgroundColor: colors.card }]}>
				<Ionicons name="information-circle" size={20} color={colors.primary} />
				<Text style={[styles.infoText, { color: colors.text }]}>
					All your generated materials are automatically saved to the Study Library
				</Text>
			</View>
			</ScrollView>
		</SafeAreaView>
	);
}

const styles = StyleSheet.create({
	container: { flex: 1 },
	header: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		paddingHorizontal: 20,
		paddingVertical: 14,
		borderBottomWidth: 1,
	},
	headerTitle: {
		fontSize: 18,
		fontWeight: '700',
		flex: 1,
		textAlign: 'center',
	},
	notificationButton: {
		position: 'relative',
		padding: 8,
	},
	notificationBadge: {
		position: 'absolute',
		top: 0,
		right: 0,
		borderRadius: 10,
		minWidth: 20,
		height: 20,
		justifyContent: 'center',
		alignItems: 'center',
		borderWidth: 2,
	},
	notificationBadgeText: {
		fontWeight: '700',
		fontSize: 11,
	},
	content: { padding: 20 },
	contentContainer: { paddingBottom: 20 },
	emptyState: { padding: 24, alignItems: 'center', borderRadius: 12, borderWidth: 1 },
	emptyTitle: { fontSize: 16, fontWeight: '700', marginBottom: 6 },
	emptySub: { textAlign: 'center' },
	docCard: { padding: 12, borderRadius: 10, marginBottom: 12, borderWidth: 1 },
	docRow: { flexDirection: 'row', alignItems: 'center' },
	docThumb: { width: 48, height: 48, resizeMode: 'contain' },
	docTitle: { fontSize: 14, fontWeight: '700' },
	docMeta: { fontSize: 12, marginTop: 4 },
	libraryQuickAccess: {
		flexDirection: 'row',
		alignItems: 'center',
		padding: 16,
		borderRadius: 12,
		marginBottom: 20,
	},
	quickAccessTitle: {
		fontSize: 14,
		fontWeight: '700',
	},
	quickAccessSubtitle: {
		fontSize: 12,
		marginTop: 2,
	},
	infoBox: {
		flexDirection: 'row',
		alignItems: 'center',
		padding: 14,
		borderRadius: 10,
		marginBottom: 20,
	},
	infoText: {
		fontSize: 13,
		marginLeft: 10,
		flex: 1,
	},
});
