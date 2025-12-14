import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Sidebar } from '../../components/Sidebar';
import { useAuth } from '../../contexts/AuthContext';
import { useNotifications } from '../../contexts/NotificationContext';
import { useTheme } from '../../contexts/ThemeContext';

export default function Account() {
	const { user, logout } = useAuth();
	const router = useRouter();
	const [sidebarVisible, setSidebarVisible] = useState(false);
	const { unreadCount } = useNotifications();
	const { colors } = useTheme();

	const handleSignOut = async () => {
		const res = await logout();
		if (res.success) {
			router.replace('/(auth)/login');
		} else {
			Alert.alert('Sign out failed', res.error || 'Please try again');
		}
	};

	const AccountMenuItem = ({ icon, label, value, onPress, showArrow = true }: any) => (
		<TouchableOpacity
			style={[styles.menuItem, { backgroundColor: colors.surface, borderColor: colors.border }]}
			onPress={onPress}
		>
			<View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 }}>
				<View style={[styles.iconBox, { backgroundColor: colors.primary + '20' }]}>
					<Ionicons name={icon} size={20} color={colors.primary} />
				</View>
				<View style={{ flex: 1 }}>
					<Text style={[styles.menuLabel, { color: colors.text }]}>{label}</Text>
					{value && <Text style={[styles.menuValue, { color: colors.textSecondary }]}>{value}</Text>}
				</View>
			</View>
			{showArrow && <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />}
		</TouchableOpacity>
	);

	return (
		<SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
			{/* Header */}
			<View style={[styles.header, { backgroundColor: colors.headerBg, borderBottomColor: colors.border }]}>
				<TouchableOpacity onPress={() => setSidebarVisible(true)}>
					<Ionicons name="menu" size={28} color={colors.text} />
				</TouchableOpacity>

				<Text style={[styles.headerTitle, { color: colors.text }]}>Account</Text>

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
				{/* Profile Card */}
				<View style={[styles.profileCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
					<View style={styles.profileRow}>
						<View style={[styles.avatar, { backgroundColor: colors.primary }]}>
							<Text style={styles.avatarText}>{user?.email ? user.email[0].toUpperCase() : 'U'}</Text>
						</View>
						<View style={{ flex: 1 }}>
							<Text style={[styles.profileName, { color: colors.text }]}>{user?.displayName || 'Learner'}</Text>
							<Text style={[styles.profileEmail, { color: colors.textSecondary }]}>{user?.email || 'Not signed in'}</Text>
							<Text style={[styles.profileStatus, { color: colors.success }]}>● Active</Text>
						</View>
					</View>
				</View>

				{/* Account Security Section */}
				<View>
					<Text style={[styles.sectionTitle, { color: colors.text }]}>Security</Text>
					<AccountMenuItem
						icon="key"
						label="Change Password"
						value="Update your password"
						onPress={() => router.push('/change-password' as any)}
					/>
				</View>

				{/* Learning Section */}
				<View style={{ marginTop: 24 }}>
					<Text style={[styles.sectionTitle, { color: colors.text }]}>Learning</Text>
					<AccountMenuItem
					icon="flag"
						label="Learning Goals"
						value="Set and track goals"
						onPress={() => router.push('/learning-goals' as any)}
					/>
					<AccountMenuItem
						icon="settings"
						label="Study Preferences"
						value="Customize your experience"
						onPress={() => router.push('/study-preferences' as any)}
					/>
					<AccountMenuItem
						icon="notifications-outline"
						label="Notifications"
						value="Manage preferences"
						onPress={() => router.push('/notification-settings' as any)}
					/>
				</View>

				{/* App Section */}
				<View style={{ marginTop: 24 }}>
					<Text style={[styles.sectionTitle, { color: colors.text }]}>App</Text>
					<AccountMenuItem
						icon="information-circle"
						label="About"
						value="Version 1.0.0"
						onPress={() => router.push('/about' as any)}
					/>
					<AccountMenuItem
						icon="help-circle"
						label="Help & Support"
						onPress={() => router.push('/help' as any)}
					/>
					<AccountMenuItem
						icon="shield-checkmark"
						label="Privacy Policy"
						onPress={() => router.push('/privacy' as any)}
					/>
				</View>

				{/* Sign Out Section */}
				<View style={{ marginTop: 28, marginBottom: 20 }}>
					<TouchableOpacity
						style={[styles.signOutButton, { backgroundColor: '#FF4B4B' }]}
						onPress={handleSignOut}
					>
						<Ionicons name="log-out" size={20} color="#FFFFFF" />
						<Text style={styles.signOutText}>Sign Out</Text>
					</TouchableOpacity>
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
		backgroundColor: '#FF4B4B',
		borderRadius: 10,
		minWidth: 20,
		height: 20,
		justifyContent: 'center',
		alignItems: 'center',
		borderWidth: 2,
		borderColor: '#FFFFFF',
	},
	notificationBadgeText: {
		color: '#FFFFFF',
		fontWeight: '700',
		fontSize: 11,
	},
	content: { flex: 1 },
	contentContainer: { padding: 20, paddingBottom: 20 },

	// Profile Card
	profileCard: {
		padding: 18,
		borderRadius: 14,
		borderWidth: 1,
		marginBottom: 28,
	},
	profileRow: { flexDirection: 'row', alignItems: 'center' },
	avatar: {
		width: 70,
		height: 70,
		borderRadius: 35,
		justifyContent: 'center',
		alignItems: 'center',
		marginRight: 14,
	},
	avatarText: { color: '#FFF', fontWeight: '700', fontSize: 24 },
	profileName: { fontSize: 16, fontWeight: '700' },
	profileEmail: { marginTop: 4, fontSize: 14 },
	profileStatus: { marginTop: 6, fontSize: 12, fontWeight: '600' },

	// Section
	sectionTitle: {
		fontSize: 13,
		fontWeight: '700',
		marginBottom: 10,
		marginTop: 12,
		textTransform: 'uppercase',
		letterSpacing: 0.5,
	},

	// Menu Items
	menuItem: {
		flexDirection: 'row',
		alignItems: 'center',
		paddingVertical: 14,
		paddingHorizontal: 14,
		borderRadius: 12,
		borderWidth: 1,
		marginBottom: 8,
	},
	iconBox: {
		width: 40,
		height: 40,
		borderRadius: 10,
		justifyContent: 'center',
		alignItems: 'center',
	},
	menuLabel: {
		fontSize: 15,
		fontWeight: '600',
	},
	menuValue: {
		fontSize: 12,
		marginTop: 2,
	},

	// Sign Out Button
	signOutButton: {
		paddingVertical: 14,
		paddingHorizontal: 16,
		borderRadius: 12,
		alignItems: 'center',
		flexDirection: 'row',
		justifyContent: 'center',
		gap: 8,
	},
	signOutText: { color: '#FFF', fontWeight: '700', fontSize: 16 },
});
