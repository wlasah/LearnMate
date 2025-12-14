import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    Alert,
    Modal,
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

export default function NotificationSettings() {
  const router = useRouter();
  const { colors } = useTheme();
  const [sidebarVisible, setSidebarVisible] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showQuietHoursModal, setShowQuietHoursModal] = useState(false);
  const [showCustomQuietHours, setShowCustomQuietHours] = useState(false);
  const [customQuietStart, setCustomQuietStart] = useState('');
  const [customQuietEnd, setCustomQuietEnd] = useState('');
  const [settings, setSettings] = useState({
    push: true,
    uploadReminder: true,
    studyReminder: true,
    achievements: true,
    weeklyReport: true,
    newFeatures: false,
    quietHoursStart: '22:00',
    quietHoursEnd: '08:00',
  });

  const quietHourPresets = [
    { label: 'No Quiet Hours', start: '', end: '' },
    { label: 'Evening (10 PM - 8 AM)', start: '22:00', end: '08:00' },
    { label: 'Night (11 PM - 9 AM)', start: '23:00', end: '09:00' },
    { label: 'Custom', start: 'custom', end: 'custom' },
  ];

  // Load settings from AsyncStorage on mount
  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const saved = await AsyncStorage.getItem('notificationSettings');
      if (saved) {
        setSettings(JSON.parse(saved));
      }
    } catch (e) {
      console.error('Failed to load notification settings', e);
    }
  };

  const toggleSetting = (key: any) => {
    setSettings((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const saveSettings = async () => {
    setSaving(true);
    try {
      await AsyncStorage.setItem('notificationSettings', JSON.stringify(settings));
      Alert.alert('Success', 'Notification settings saved');
    } catch (e) {
      Alert.alert('Error', 'Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const settingItems: { key: any; label: string; icon: string }[] = [
    { key: 'push', label: 'Push Notifications', icon: 'notifications' },
    { key: 'uploadReminder', label: 'Upload Reminders', icon: 'cloud-upload' },
    { key: 'studyReminder', label: 'Study Reminders', icon: 'alarm' },
    { key: 'achievements', label: 'Achievements & Badges', icon: 'star' },
    { key: 'weeklyReport', label: 'Weekly Progress Reports', icon: 'bar-chart' },
    { key: 'newFeatures', label: 'New Features & Updates', icon: 'bulb' },
  ];

  const getQuietHoursDisplay = () => {
    const start = settings.quietHoursStart;
    const end = settings.quietHoursEnd;
    if (!start || !end) return 'No quiet hours set';
    return `${start} - ${end}`;
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.headerBg, borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => setSidebarVisible(true)}>
          <Ionicons name="menu" size={28} color={colors.text} />
        </TouchableOpacity>

        <Text style={[styles.headerTitle, { color: colors.text }]}>Notification Settings</Text>

        <TouchableOpacity onPress={() => router.back()} style={styles.closeButton}>
          <Ionicons name="close" size={28} color={colors.text} />
        </TouchableOpacity>
      </View>

      {/* Sidebar */}
      <Sidebar visible={sidebarVisible} onClose={() => setSidebarVisible(false)} />

      {/* Content */}
      <ScrollView showsVerticalScrollIndicator={false} style={[styles.content, { backgroundColor: colors.background }]}>
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Notification Preferences</Text>

          {settingItems.map((item) => (
            <View key={item.key} style={[styles.settingItem, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <View style={styles.settingLeft}>
                <Ionicons name={item.icon as any} size={24} color={colors.primary} />
                <Text style={[styles.settingLabel, { color: colors.text }]}>{item.label}</Text>
              </View>
              <Switch
                value={settings[item.key as keyof typeof settings] as boolean}
                onValueChange={() => toggleSetting(item.key)}
                trackColor={{ false: colors.border, true: colors.primary + '40' }}
                thumbColor={settings[item.key as keyof typeof settings] as boolean ? colors.primary : '#ccc'}
              />
            </View>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Quiet Hours</Text>
          <Text style={[styles.sectionDescription, { color: colors.textSecondary }]}>
            Choose when you don't want to receive notifications
          </Text>

          <TouchableOpacity 
            style={[styles.quietHoursCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
            onPress={() => setShowQuietHoursModal(true)}
          >
            <View style={styles.settingLeft}>
              <Ionicons name="moon" size={24} color={colors.primary} />
              <View>
                <Text style={[styles.settingLabel, { color: colors.text }]}>Quiet Hours</Text>
                <Text style={[styles.quietHoursTime, { color: colors.textSecondary }]}>{getQuietHoursDisplay()}</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.primary} />
          </TouchableOpacity>
        </View>

        <View style={{ height: 20 }} />
      </ScrollView>

      {/* Quiet Hours Modal */}
      <Modal
        visible={showQuietHoursModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowQuietHoursModal(false)}
      >
        <SafeAreaView style={[styles.modalContainer, { backgroundColor: colors.background }]}>
          <View style={[styles.modalHeader, { backgroundColor: colors.headerBg, borderBottomColor: colors.border }]}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>Set Quiet Hours</Text>
            <TouchableOpacity onPress={() => setShowQuietHoursModal(false)}>
              <Ionicons name="close" size={28} color={colors.text} />
            </TouchableOpacity>
          </View>

          <ScrollView style={[styles.modalContent, { backgroundColor: colors.background }]}>
            <Text style={[styles.modalSubtitle, { color: colors.textSecondary }]}>Select a preset or customize</Text>
            {quietHourPresets.map((preset, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.quietHoursOption,
                  { backgroundColor: colors.surface, borderColor: colors.border },
                  settings.quietHoursStart === preset.start && settings.quietHoursEnd === preset.end && 
                    { borderColor: colors.primary, borderWidth: 2 }
                ]}
                onPress={() => {
                  if (preset.label === 'Custom') {
                    setShowCustomQuietHours(true);
                  } else {
                    setSettings({
                      ...settings,
                      quietHoursStart: preset.start,
                      quietHoursEnd: preset.end,
                    });
                    setShowQuietHoursModal(false);
                  }
                }}
              >
                <View>
                  <Text style={[styles.quietHoursOptionLabel, { color: colors.text }]}>{preset.label}</Text>
                  {preset.start && preset.start !== 'custom' && <Text style={[styles.quietHoursOptionTime, { color: colors.textSecondary }]}>{preset.start} - {preset.end}</Text>}
                </View>
                {settings.quietHoursStart === preset.start && settings.quietHoursEnd === preset.end && (
                  <Ionicons name="checkmark-circle" size={24} color={colors.primary} />
                )}
              </TouchableOpacity>
            ))}
          </ScrollView>
        </SafeAreaView>
      </Modal>

      {/* Save Button */}
      <View style={[styles.footer, { borderTopColor: colors.border }]}>
        <TouchableOpacity
          style={[styles.saveBtn, saving && { opacity: 0.6 }]}
          onPress={saveSettings}
          disabled={saving}
        >
          <Text style={styles.saveBtnText}>{saving ? 'Saving...' : 'Save Settings'}</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
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
  closeButton: {
    padding: 4,
  },
  content: {
    padding: 20,
    flex: 1,
  },
  footer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
  },
  saveBtn: {
    backgroundColor: '#2FB46E',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  saveBtnText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  },
  section: {
    marginBottom: 28,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 12,
  },
  sectionDescription: {
    fontSize: 13,
    marginBottom: 12,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 14,
    borderRadius: 12,
    marginBottom: 10,
    borderWidth: 1,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingLabel: {
    fontSize: 15,
    fontWeight: '600',
    marginLeft: 12,
  },
  quietHoursCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 14,
    borderRadius: 12,
    borderWidth: 1,
  },
  quietHoursTime: {
    fontSize: 12,
    marginTop: 2,
  },

  // Modal Styles
  modalContainer: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  modalContent: {
    padding: 20,
    flex: 1,
  },
  modalSubtitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 16,
  },
  quietHoursOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 14,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 10,
  },
  quietHoursOptionLabel: {
    fontSize: 15,
    fontWeight: '600',
  },
  quietHoursOptionTime: {
    fontSize: 12,
    marginTop: 4,
  },
});
