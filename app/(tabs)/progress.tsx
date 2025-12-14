import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect, useRouter } from 'expo-router';
import { collection, onSnapshot, query } from 'firebase/firestore';
import React, { useCallback, useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Sidebar } from '../../components/Sidebar';
import { useAuth } from '../../contexts/AuthContext';
import { useNotifications } from '../../contexts/NotificationContext';
import { useTheme } from '../../contexts/ThemeContext';
import { StudyMaterialsManager } from '../../utils/studyMaterialsManager';
const firebaseConfig: any = require('../../config/firebase');

export default function Progress() {
	const [uploadsCount, setUploadsCount] = useState(0);
	const [notesCount, setNotesCount] = useState(0);
	const [completedQuizzes, setCompletedQuizzes] = useState(0);
	const [studiedPDFs, setStudiedPDFs] = useState(0);
	const [libraryStats, setLibraryStats] = useState<any>(null);
	const [sidebarVisible, setSidebarVisible] = useState(false);
	const router = useRouter();
	const { user } = useAuth();
	const { unreadCount } = useNotifications();
	const { colors } = useTheme();

	// Load completion data from AsyncStorage (user-scoped)
	useEffect(() => {
		(async () => {
			try {
				const uid = user?.uid || 'anonymous';
				const quizKey = `lastQuiz_${uid}`;
				const quizData = await AsyncStorage.getItem(quizKey);
				if (quizData) {
					const quiz = JSON.parse(quizData);
					if (quiz.completed) setCompletedQuizzes(1);
				} else {
					setCompletedQuizzes(0);
				}

				const studyHistoryKey = `studyHistory_${uid}`;
				const studyHistory = await AsyncStorage.getItem(studyHistoryKey);
				if (studyHistory) {
					const history = JSON.parse(studyHistory);
					if (Array.isArray(history)) {
						setStudiedPDFs(history.length);
					}
				} else {
					setStudiedPDFs(0);
				}
			} catch (e) {
				console.error('Error loading completion data', e);
				setCompletedQuizzes(0);
				setStudiedPDFs(0);
			}
		})();
	}, [user?.uid]);

	// Firestore listeners with fallback to local storage
	useFocusEffect(
		useCallback(() => {
			const db = firebaseConfig.db;
			const auth: any = firebaseConfig.auth;
			const uid = auth?.currentUser?.uid || 'anonymous';

			try {
				const uploadsQ = query(collection(db, 'users', uid, 'uploads'));
				const unsubUploads = onSnapshot(uploadsQ, async (snap) => {
					const count = snap.size;
					setUploadsCount(count);
					
					// If Firebase shows 0 but we have local uploads, use local count
					if (count === 0) {
						try {
							const storageKey = `localUploads_${uid}`;
							const stored = await AsyncStorage.getItem(storageKey);
							const local = stored ? JSON.parse(stored) : [];
							if (Array.isArray(local) && local.length > 0) {
								setUploadsCount(local.length);
							}
						} catch (e) {
							// ignore
						}
					}
				});

				const notesQ = query(collection(db, 'users', uid, 'notes'));
				const unsubNotes = onSnapshot(notesQ, async (snap) => {
					const count = snap.size;
					setNotesCount(count);
					
					// If Firebase shows 0 but we have local notes, use local count
					if (count === 0) {
						try {
							const storageKey = `localNotes_${uid}`;
							const notesStored = await AsyncStorage.getItem(storageKey);
							const localNotes = notesStored ? JSON.parse(notesStored) : [];
							if (Array.isArray(localNotes) && localNotes.length > 0) {
								setNotesCount(localNotes.length);
							}
						} catch (e) {
							// ignore
						}
					}
				});

				return () => {
					unsubUploads();
					unsubNotes();
				};
			} catch (e) {
				console.error('Progress listeners error', e);
				// fallback to local storage
				(async () => {
					try {
						const storageKey = `localUploads_${uid}`;
						const stored = await AsyncStorage.getItem(storageKey);
						const local = stored ? JSON.parse(stored) : [];
						if (Array.isArray(local)) setUploadsCount(local.length);

						const notesStorageKey = `localNotes_${uid}`;
						const notesStored = await AsyncStorage.getItem(notesStorageKey);
						const localNotes = notesStored ? JSON.parse(notesStored) : [];
						if (Array.isArray(localNotes)) setNotesCount(localNotes.length);
					} catch (e) {
						// ignore
					}
				})();
			}
		}, [])
	);

	// Load library stats for better completion tracking
	useEffect(() => {
		(async () => {
			try {
				const stats = await StudyMaterialsManager.getStudyStats();
				setLibraryStats(stats);
			} catch (e) {
				console.warn('Error loading library stats:', e);
			}
		})();
	}, []);

	// Enhanced Weighted Learning Activities
	// 35% - Generated Study Materials, 30% - Material Reviews, 20% - Notes, 15% - Quiz Completions
	const libraryMaterials = libraryStats?.totalMaterials || 0;
	const materialsProgress = Math.min(35, libraryMaterials * 7); // 7 points per material (max 35)
	const reviewsProgress = Math.min(30, (libraryStats?.totalReviews || 0) * 2); // 2 points per review (max 30)
	const notesProgress = Math.min(20, notesCount * 5); // 5 points per note (max 20)
	const quizProgress = Math.min(15, completedQuizzes * 3.75); // 3.75 points per quiz (max 15)
	const completionPercent = Math.min(100, materialsProgress + reviewsProgress + notesProgress + quizProgress);

	const handleViewReport = () => {
		router.push('/progress-report' as any);
	};

	return (
		<SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
			{/* Header */}
			<View style={[styles.header, { backgroundColor: colors.headerBg, borderBottomColor: colors.border }]}>
				<TouchableOpacity onPress={() => setSidebarVisible(true)}>
					<Ionicons name="menu" size={28} color={colors.text} />
				</TouchableOpacity>

				<Text style={[styles.headerTitle, { color: colors.text }]}>My Progress</Text>

				<TouchableOpacity
					onPress={() => router.push('/(tabs)/index' as any)}
					style={styles.notificationButton}
				>
					<Ionicons name="notifications" size={28} color={colors.text} />
					{unreadCount > 0 && (
						<View style={[styles.notificationBadge, { backgroundColor: colors.danger, borderColor: colors.surface }] }>
							<Text style={[styles.notificationBadgeText, { color: colors.surface }] }>
								{unreadCount > 9 ? '9+' : unreadCount}
							</Text>
						</View>
					)}
				</TouchableOpacity>
			</View>

			{/* Sidebar */}
			<Sidebar visible={sidebarVisible} onClose={() => setSidebarVisible(false)} />

			<ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
				<View style={styles.cardsRow}>
					<View style={[styles.statCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
						<Text style={[styles.statNumber, { color: colors.primary }]}>{uploadsCount}</Text>
						<Text style={[styles.statLabel, { color: colors.textSecondary }]}>Uploaded PDFs</Text>
					</View>

					<View style={[styles.statCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
						<Text style={[styles.statNumber, { color: colors.primary }]}>{notesCount}</Text>
						<Text style={[styles.statLabel, { color: colors.textSecondary }]}>Saved Notes</Text>
					</View>
				</View>

				<View style={[styles.progressCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
					<Text style={[styles.progressTitle, { color: colors.text }]}>Study Completion</Text>
					<View style={[styles.progressBarOuter, { backgroundColor: colors.card }]}>
						<View style={[styles.progressBarInner, { width: `${completionPercent}%`, backgroundColor: colors.success }]} />
					</View>
					<Text style={[styles.progressPercent, { color: colors.textSecondary }]}>{completionPercent}% completed</Text>
				</View>

				<TouchableOpacity style={[styles.actionButton, { backgroundColor: colors.primary }]} onPress={handleViewReport}>
					<Ionicons name="bar-chart" size={24} color={colors.surface} />
					<Text style={[styles.actionText, { color: colors.surface }]}>View detailed report</Text>
				</TouchableOpacity>
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
	cardsRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 },
	statCard: {
		flex: 1,
		padding: 16,
		borderRadius: 12,
		alignItems: 'center',
		marginRight: 8,
		borderWidth: 1,
	},
	statNumber: { fontSize: 28, fontWeight: '700' },
	statLabel: { fontSize: 12, marginTop: 6, textAlign: 'center', fontWeight: '600' },
	progressCard: { padding: 16, borderRadius: 12, borderWidth: 1, marginBottom: 16 },
	progressTitle: { fontSize: 15, fontWeight: '700', marginBottom: 12 },
	progressBarOuter: { height: 8, borderRadius: 4, overflow: 'hidden', marginBottom: 8 },
	progressBarInner: { height: '100%' },
	progressPercent: { fontSize: 13, fontWeight: '500' },
	actionButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: 12, padding: 14, borderRadius: 12, gap: 8 },
	actionText: { fontWeight: '700', fontSize: 15 },
});
