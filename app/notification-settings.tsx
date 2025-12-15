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
    TextInput,
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
  const [customQuietStartHour, setCustomQuietStartHour] = useState('');
  const [customQuietStartMin, setCustomQuietStartMin] = useState('');
  const [customQuietStartPeriod, setCustomQuietStartPeriod] = useState('PM');
  const [customQuietEndHour, setCustomQuietEndHour] = useState('');
  const [customQuietEndMin, setCustomQuietEndMin] = useState('');
  const [customQuietEndPeriod, setCustomQuietEndPeriod] = useState('AM');
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

  // Convert 24-hour to 12-hour format
  const convertTo12Hour = (time24: string) => {
    const [hours, minutes] = time24.split(':');
    let hour = parseInt(hours);
    const period = hour >= 12 ? 'PM' : 'AM';
    if (hour > 12) hour -= 12;
    if (hour === 0) hour = 12;
    return {
      hour: hour.toString().padStart(2, '0'),
      minute: minutes,
      period,
    };
  };

  // Convert 12-hour to 24-hour format
  const convertTo24Hour = (hour: string, minute: string, period: string) => {
    let h = parseInt(hour);
    if (period === 'PM' && h !== 12) h += 12;
    if (period === 'AM' && h === 12) h = 0;
    return `${h.toString().padStart(2, '0')}:${minute}`;
  };

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

      {/* Custom Quiet Hours Modal */}
      <Modal
        visible={showCustomQuietHours}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowCustomQuietHours(false)}
      >
        <SafeAreaView style={[styles.modalContainer, { backgroundColor: colors.background }]}>
          <View style={[styles.modalHeader, { backgroundColor: colors.headerBg, borderBottomColor: colors.border }]}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>Custom Quiet Hours</Text>
            <TouchableOpacity onPress={() => setShowCustomQuietHours(false)}>
              <Ionicons name="close" size={28} color={colors.text} />
            </TouchableOpacity>
          </View>

          <ScrollView style={[styles.modalContent, { backgroundColor: colors.background }]}>
            <View style={{ paddingHorizontal: 20, paddingVertical: 20 }}>
              <Text style={[styles.customTimeLabel, { color: colors.text }]}>Start Time</Text>
              
              {/* Start Time Picker */}
              <View style={{ flexDirection: 'row', gap: 10, marginBottom: 24, alignItems: 'center' }}>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 12, color: colors.textSecondary, marginBottom: 6 }}>Hour (1-12)</Text>
                  <TextInput
                    style={[styles.timePickerInput, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.text }]}
                    placeholder="12"
                    placeholderTextColor={colors.textSecondary}
                    value={customQuietStartHour}
                    onChangeText={(text) => {
                      const num = parseInt(text) || 0;
                      if (num >= 1 && num <= 12) setCustomQuietStartHour(num.toString());
                      else if (text === '') setCustomQuietStartHour('');
                    }}
                    maxLength={2}
                    keyboardType="number-pad"
                  />
                </View>

                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 12, color: colors.textSecondary, marginBottom: 6 }}>Minute</Text>
                  <TextInput
                    style={[styles.timePickerInput, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.text }]}
                    placeholder="00"
                    placeholderTextColor={colors.textSecondary}
                    value={customQuietStartMin}
                    onChangeText={(text) => {
                      const num = parseInt(text) || 0;
                      if (num >= 0 && num <= 59) setCustomQuietStartMin(num.toString().padStart(2, '0'));
                      else if (text === '') setCustomQuietStartMin('');
                    }}
                    maxLength={2}
                    keyboardType="number-pad"
                  />
                </View>

                <View style={{ flex: 1, justifyContent: 'flex-end', marginBottom: 0 }}>
                  <View style={{ flexDirection: 'row', gap: 6 }}>
                    <TouchableOpacity
                      style={[styles.periodButton, customQuietStartPeriod === 'AM' && { backgroundColor: colors.primary }]}
                      onPress={() => setCustomQuietStartPeriod('AM')}
                    >
                      <Text style={[styles.periodButtonText, { color: customQuietStartPeriod === 'AM' ? '#FFF' : colors.text }]}>AM</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.periodButton, customQuietStartPeriod === 'PM' && { backgroundColor: colors.primary }]}
                      onPress={() => setCustomQuietStartPeriod('PM')}
                    >
                      <Text style={[styles.periodButtonText, { color: customQuietStartPeriod === 'PM' ? '#FFF' : colors.text }]}>PM</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>

              <Text style={[styles.customTimeLabel, { color: colors.text }]}>End Time</Text>
              
              {/* End Time Picker */}
              <View style={{ flexDirection: 'row', gap: 10, marginBottom: 24, alignItems: 'center' }}>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 12, color: colors.textSecondary, marginBottom: 6 }}>Hour (1-12)</Text>
                  <TextInput
                    style={[styles.timePickerInput, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.text }]}
                    placeholder="12"
                    placeholderTextColor={colors.textSecondary}
                    value={customQuietEndHour}
                    onChangeText={(text) => {
                      const num = parseInt(text) || 0;
                      if (num >= 1 && num <= 12) setCustomQuietEndHour(num.toString());
                      else if (text === '') setCustomQuietEndHour('');
                    }}
                    maxLength={2}
                    keyboardType="number-pad"
                  />
                </View>

                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 12, color: colors.textSecondary, marginBottom: 6 }}>Minute</Text>
                  <TextInput
                    style={[styles.timePickerInput, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.text }]}
                    placeholder="00"
                    placeholderTextColor={colors.textSecondary}
                    value={customQuietEndMin}
                    onChangeText={(text) => {
                      const num = parseInt(text) || 0;
                      if (num >= 0 && num <= 59) setCustomQuietEndMin(num.toString().padStart(2, '0'));
                      else if (text === '') setCustomQuietEndMin('');
                    }}
                    maxLength={2}
                    keyboardType="number-pad"
                  />
                </View>

                <View style={{ flex: 1, justifyContent: 'flex-end', marginBottom: 0 }}>
                  <View style={{ flexDirection: 'row', gap: 6 }}>
                    <TouchableOpacity
                      style={[styles.periodButton, customQuietEndPeriod === 'AM' && { backgroundColor: colors.primary }]}
                      onPress={() => setCustomQuietEndPeriod('AM')}
                    >
                      <Text style={[styles.periodButtonText, { color: customQuietEndPeriod === 'AM' ? '#FFF' : colors.text }]}>AM</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.periodButton, customQuietEndPeriod === 'PM' && { backgroundColor: colors.primary }]}
                      onPress={() => setCustomQuietEndPeriod('PM')}
                    >
                      <Text style={[styles.periodButtonText, { color: customQuietEndPeriod === 'PM' ? '#FFF' : colors.text }]}>PM</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>

              <TouchableOpacity 
                style={[styles.setTimeButton, { backgroundColor: colors.primary, opacity: customQuietStartHour && customQuietStartMin && customQuietEndHour && customQuietEndMin ? 1 : 0.5 }]}
                onPress={() => {
                  if (customQuietStartHour && customQuietStartMin && customQuietEndHour && customQuietEndMin) {
                    const start = convertTo24Hour(customQuietStartHour, customQuietStartMin, customQuietStartPeriod);
                    const end = convertTo24Hour(customQuietEndHour, customQuietEndMin, customQuietEndPeriod);
                    setSettings({
                      ...settings,
                      quietHoursStart: start,
                      quietHoursEnd: end,
                    });
                    setShowCustomQuietHours(false);
                    setCustomQuietStartHour('');
                    setCustomQuietStartMin('');
                    setCustomQuietEndHour('');
                    setCustomQuietEndMin('');
                  }
                }}
                disabled={!customQuietStartHour || !customQuietStartMin || !customQuietEndHour || !customQuietEndMin}
              >
                <Text style={styles.setTimeButtonText}>Set Custom Quiet Hours</Text>
              </TouchableOpacity>
            </View>
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
  customTimeLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  timeInput: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 12,
  },
  timeInputText: {
    fontSize: 14,
    fontWeight: '500',
  },
  timePickerInput: {
    paddingHorizontal: 10,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  periodButton: {
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#ccc',
    alignItems: 'center',
  },
  periodButtonText: {
    fontSize: 12,
    fontWeight: '600',
  },
  setTimeButton: {
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginVertical: 20,
  },
  setTimeButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  timeHint: {
    fontSize: 12,
    marginTop: 8,
    textAlign: 'center',
  },
});
