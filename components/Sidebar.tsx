import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Modal,
  Dimensions,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';

interface SidebarProps {
  visible: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ visible, onClose }) => {
  const router = useRouter();
  const { user, logout } = useAuth();
  const { colors, isDarkMode } = useTheme();

  const handleNavigation = (route: string) => {
    onClose();
    router.push(route as any);
  };

  const handleLogout = async () => {
    const res = await logout();
    if (res.success) {
      router.replace('/(auth)/login');
    }
    onClose();
  };

  const menuItems = [
    { label: 'Account', icon: 'person', route: '/(tabs)/account' },
    { label: 'Settings', icon: 'settings', route: '/settings' },
    { label: 'Study Preferences', icon: 'school', route: '/study-preferences' },
    { label: 'Notification Settings', icon: 'notifications', route: '/notification-settings' },
    { label: 'Privacy & Security', icon: 'shield', route: '/privacy' },
    { label: 'Help & Support', icon: 'help-circle', route: '/help' },
    { label: 'About', icon: 'information-circle', route: '/about' },
  ];

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        {/* Sidebar */}
        <SafeAreaView style={[styles.sidebar, { backgroundColor: colors.surface }] }>
            {/* Top Logo */}
            <View style={[styles.sidebarTopLogoWrap, { borderBottomColor: colors.border, backgroundColor: colors.headerBg }]}>
              <Image
                source={require('../assets/images/LearnMate_logo.png')}
                style={[styles.sidebarTopLogo, { opacity: isDarkMode ? 1.2 : 1 }]}
              />
            </View>

            {/* Header */}
            <View style={[styles.sidebarHeader, { borderBottomColor: colors.border }] }>
              <View>
                <Text style={[styles.userGreeting, { color: colors.textSecondary }]}>Hello,</Text>
                <Text style={[styles.userName, { color: colors.text }]}>{user?.displayName || 'Learner'}</Text>
              </View>
              <TouchableOpacity onPress={onClose}>
                <Ionicons name="close" size={28} color={colors.text} />
              </TouchableOpacity>
            </View>

          {/* Menu Items */}
          <ScrollView showsVerticalScrollIndicator={false} style={styles.menuContainer}>
            {menuItems.map((item, index) => (
              <TouchableOpacity
                key={index}
                style={[styles.menuItem, { borderBottomColor: colors.card }]}
                onPress={() => handleNavigation(item.route)}
              >
                <Ionicons name={item.icon as any} size={24} color={colors.primary} />
                <Text style={[styles.menuLabel, { color: colors.text }]}>{item.label}</Text>
                <Ionicons name="chevron-forward" size={20} color={colors.info} />
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Divider */}
          <View style={[styles.divider, { backgroundColor: colors.border }]} />

          {/* Sign Out Button */}
          <TouchableOpacity style={[styles.signOutButton, { backgroundColor: colors.card, borderColor: colors.danger }]} onPress={handleLogout}>
            <Ionicons name="log-out" size={24} color={colors.danger} />
            <Text style={[styles.signOutText, { color: colors.danger }]}>Sign Out</Text>
          </TouchableOpacity>
        </SafeAreaView>

        {/* Close overlay area */}
        <TouchableOpacity style={styles.closeArea} onPress={onClose} />
      </View>
    </Modal>
  );
};

const screenWidth = Dimensions.get('window').width;

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    flexDirection: 'row',
  },
  sidebar: {
    width: screenWidth * 0.75,
    paddingBottom: 20,
    flexDirection: 'column',
  },
  sidebarTopLogoWrap: {
    paddingVertical: 14,
    paddingHorizontal: 18,
    borderBottomWidth: 1,
    alignItems: 'flex-start',
  },
  sidebarTopLogo: {
    width: 300,
    height: 150,
    resizeMode: 'contain',
    marginLeft: -40,
    marginTop: -50,
    marginBottom: -30,

  },
  sidebarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
  },
  userGreeting: {
    fontSize: 14,
    fontWeight: '500',
  },
  userName: {
    fontSize: 18,
    fontWeight: '700',
    marginTop: 4,
  },
  menuContainer: {
    flex: 1,
    paddingVertical: 12,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
  },
  menuLabel: {
    fontSize: 15,
    fontWeight: '600',
    marginLeft: 16,
    flex: 1,
  },
  divider: {
    height: 1,
    marginVertical: 12,
  },
  signOutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 20,
    marginHorizontal: 12,
    borderRadius: 10,
    borderWidth: 1,
  },
  signOutText: {
    fontSize: 15,
    fontWeight: '700',
    marginLeft: 12,
  },
  closeArea: {
    flex: 1,
  },
});
