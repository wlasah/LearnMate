import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    Alert,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Switch,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { Sidebar } from '../components/Sidebar';
import { useTheme } from '../contexts/ThemeContext';

export default function SettingsPage() {
  const router = useRouter();
  const [sidebarVisible, setSidebarVisible] = useState(false);
  const { colors, isDarkMode, toggleDarkMode } = useTheme();
  const [cacheSize, setCacheSize] = useState('0 KB');
  const [cachedResultsCount, setCachedResultsCount] = useState(0);

  useEffect(() => {
    checkCacheSize();
  }, []);

  const checkCacheSize = async () => {
    try {
      const lastAiResult = await AsyncStorage.getItem('lastAiResult');
      const localUploads = await AsyncStorage.getItem('localUploads');
      const localNotes = await AsyncStorage.getItem('localNotes');

      let totalSize = 0;
      let count = 0;

      if (lastAiResult) {
        totalSize += lastAiResult.length;
        count += 1;
      }
      if (localUploads) {
        totalSize += localUploads.length;
        count += JSON.parse(localUploads).length || 0;
      }
      if (localNotes) {
        totalSize += localNotes.length;
      }

      const sizeInKB = (totalSize / 1024).toFixed(2);
      setCacheSize(`${sizeInKB} KB`);
      setCachedResultsCount(count);
    } catch (e) {
      console.error('Failed to check cache', e);
    }
  };

  const clearCache = () => {
    Alert.alert('Clear Cache', 'Are you sure you want to clear all cached AI results and local data?', [
      { text: 'Cancel', onPress: () => {} },
      {
        text: 'Clear',
        onPress: async () => {
          try {
            await AsyncStorage.removeItem('lastAiResult');
            await AsyncStorage.removeItem('localUploads');
            await AsyncStorage.removeItem('localNotes');
            setCacheSize('0 KB');
            setCachedResultsCount(0);
            Alert.alert('Success', 'Cache cleared');
          } catch (e) {
            Alert.alert('Error', 'Failed to clear cache');
          }
        },
      },
    ]);
  };

  const settingsSections = [
    {
      title: 'Account',
      items: [
        { label: 'Account Settings', icon: 'person', route: '/(tabs)/account' },
        { label: 'Change Password', icon: 'lock-closed', route: '/change-password' },
      ],
    },
    {
      title: 'Learning',
      items: [
        { label: 'Study Preferences', icon: 'school', route: '/study-preferences' },
        { label: 'Learning Goals', icon: 'target', route: '/learning-goals' },
      ],
    },
    {
      title: 'App',
      items: [
        { label: 'Notifications', icon: 'notifications', route: '/notification-settings' },
      ],
    },
    {
      title: 'Support',
      items: [
        { label: 'Help & Support', icon: 'help-circle', route: '/help' },
        { label: 'Privacy Policy', icon: 'shield', route: '/privacy' },
        { label: 'About LearnMate', icon: 'information-circle', route: '/about' },
      ],
    },
  ];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.headerBg, borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => setSidebarVisible(true)}>
          <Ionicons name="menu" size={28} color={colors.text} />
        </TouchableOpacity>

        <Text style={[styles.headerTitle, { color: colors.text }]}>Settings</Text>

        <TouchableOpacity onPress={() => router.back()} style={styles.closeButton}>
          <Ionicons name="close" size={28} color={colors.text} />
        </TouchableOpacity>
      </View>

      {/* Sidebar */}
      <Sidebar visible={sidebarVisible} onClose={() => setSidebarVisible(false)} />

      {/* Content */}
      <ScrollView showsVerticalScrollIndicator={false} style={[styles.content, { backgroundColor: colors.background }]}>
        {/* Dark mode toggle (restored) */}
        <View style={[styles.darkModeSection]}>
          <View style={[styles.darkModeHeader, { backgroundColor: colors.surface, borderColor: colors.border }]}> 
            <View style={styles.darkModeLeft}>
              <View style={[styles.iconContainer, { backgroundColor: colors.info }]}> 
                <Ionicons name={isDarkMode ? 'moon' : 'sunny'} size={20} color="#FFFFFF" />
              </View>
              <View style={{ marginLeft: 12 }}>
                <Text style={[styles.settingLabel, { color: colors.text }]}>Dark Mode</Text>
                <Text style={{ color: colors.textSecondary, fontSize: 12 }}>Toggle dark theme for the app</Text>
              </View>
            </View>

            <Switch value={isDarkMode} onValueChange={toggleDarkMode} thumbColor={isDarkMode ? colors.primary : undefined} />
          </View>
        </View>

        {/* Cached AI Results Panel */}
        <View style={[styles.section, { marginBottom: 28 }]}>
          <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>CACHE & QUOTA</Text>
          <View style={[styles.cachePanel, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <View style={styles.cachePanelLeft}>
              <View style={[styles.cacheIcon, { backgroundColor: colors.info }]}>
                <Ionicons name="archive" size={20} color="#FFFFFF" />
              </View>
              <View style={{ marginLeft: 12, flex: 1 }}>
                <Text style={[styles.cacheLabel, { color: colors.text }]}>Cached AI Results & Data</Text>
                <Text style={[styles.cacheInfo, { color: colors.textSecondary }]}>Size: {cacheSize} • {cachedResultsCount} item(s)</Text>
              </View>
            </View>
            <TouchableOpacity 
              style={[styles.clearBtn, { backgroundColor: colors.danger + '20' }]}
              onPress={clearCache}
            >
              <Text style={{ color: colors.danger, fontSize: 12, fontWeight: '600' }}>Clear</Text>
            </TouchableOpacity>
          </View>
          <Text style={[styles.cacheNote, { color: colors.textSecondary }]}>
            Local cache helps the app work offline and reduces API calls. Clear to free up space.
          </Text>
        </View>
        {settingsSections.map((section, sectionIndex) => (
          <View key={sectionIndex} style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>{section.title}</Text>

            {section.items.map((item, itemIndex) => (
              <TouchableOpacity
                key={itemIndex}
                style={[styles.settingItem, { backgroundColor: colors.surface, borderColor: colors.border }]}
                onPress={() => router.push(item.route as any)}
              >
                <View style={styles.settingLeft}>
                  <View style={[styles.iconContainer, { backgroundColor: colors.info }]}>
                    <Ionicons name={item.icon as any} size={22} color="#FFFFFF" />
                  </View>
                  <Text style={[styles.settingLabel, { color: colors.text }]}>{item.label}</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
              </TouchableOpacity>
            ))}
          </View>
        ))}

        <View style={[styles.appInfo, { borderTopColor: colors.border }]}>
          <Text style={[styles.appName, { color: colors.primary }]}>LearnMate</Text>
          <Text style={[styles.appVersion, { color: colors.textSecondary }]}>Version 1.0.0</Text>
        </View>

        <View style={{ height: 30 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#E6EEF6',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#2C3E50',
    flex: 1,
    textAlign: 'center',
  },
  closeButton: {
    padding: 4,
  },
  content: {
    padding: 20,
  },
  section: {
    marginBottom: 24,
  },
  darkModeSection: {
    marginBottom: 32,
  },
  darkModeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F6FBFF',
    paddingVertical: 14,
    paddingHorizontal: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E6EEF6',
  },
  darkModeLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#6B7B84',
    textTransform: 'uppercase',
    marginBottom: 10,
    letterSpacing: 0.5,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F6FBFF',
    paddingVertical: 14,
    paddingHorizontal: 14,
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#E6EEF6',
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: '#E6F4FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  settingLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: '#2C3E50',
  },
  appInfo: {
    alignItems: 'center',
    paddingVertical: 40,
    borderTopWidth: 1,
    borderTopColor: '#E6EEF6',
    marginTop: 20,
  },
  appName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#2B9AF3',
  },
  appVersion: {
    fontSize: 12,
    color: '#6B7B84',
    marginTop: 4,
  },
  cachePanel: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F6FBFF',
    paddingVertical: 14,
    paddingHorizontal: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E6EEF6',
    marginBottom: 10,
  },
  cachePanelLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  cacheIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: '#E6F4FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  cacheLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: '#2C3E50',
  },
  cacheInfo: {
    fontSize: 12,
    color: '#6B7B84',
    marginTop: 4,
  },
  clearBtn: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  cacheNote: {
    fontSize: 11,
    color: '#6B7B84',
    fontStyle: 'italic',
    paddingHorizontal: 4,
  },
});
