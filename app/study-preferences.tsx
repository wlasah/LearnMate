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
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { Sidebar } from '../components/Sidebar';
import { useTheme } from '../contexts/ThemeContext';

export default function StudyPreferencesPage() {
  const router = useRouter();
  const [sidebarVisible, setSidebarVisible] = useState(false);
  const { colors } = useTheme();
  const [saving, setSaving] = useState(false);
  const [showTimeModal, setShowTimeModal] = useState(false);
  const [showCustomTime, setShowCustomTime] = useState(false);
  const [customTimeStartHour, setCustomTimeStartHour] = useState('');
  const [customTimeStartMin, setCustomTimeStartMin] = useState('');
  const [customTimeStartPeriod, setCustomTimeStartPeriod] = useState('PM');
  const [customTimeEndHour, setCustomTimeEndHour] = useState('');
  const [customTimeEndMin, setCustomTimeEndMin] = useState('');
  const [customTimeEndPeriod, setCustomTimeEndPeriod] = useState('PM');

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
  const [preferences, setPreferences] = useState({
    studyDifficulty: 'medium',
    studyDuration: '45min',
    studyTimeStart: '18:00',
    studyTimeEnd: '22:00',
    customTimeStart: '',
    customTimeEnd: '',
    categories: ['Mathematics', 'Science'],
  });

  const timeSlots = [
    { label: 'Morning (6 AM - 12 PM)', value: 'morning' },
    { label: 'Afternoon (12 PM - 6 PM)', value: 'afternoon' },
    { label: 'Evening (6 PM - 10 PM)', value: 'evening' },
    { label: 'Night (10 PM - 12 AM)', value: 'night' },
    { label: 'Custom', value: 'custom' },
  ];

  // Load preferences from AsyncStorage on mount
  useEffect(() => {
    loadPreferences();
  }, []);

  const loadPreferences = async () => {
    try {
      const saved = await AsyncStorage.getItem('studyPreferences');
      if (saved) {
        setPreferences(JSON.parse(saved));
      }
    } catch (e) {
      console.error('Failed to load study preferences', e);
    }
  };

  const savePreferences = async () => {
    setSaving(true);
    try {
      await AsyncStorage.setItem('studyPreferences', JSON.stringify(preferences));
      Alert.alert('Success', 'Study preferences saved');
    } catch (e) {
      Alert.alert('Error', 'Failed to save preferences');
    } finally {
      setSaving(false);
    }
  };

  const difficultyOptions = [
    { label: 'Beginner', value: 'beginner' },
    { label: 'Intermediate', value: 'medium' },
    { label: 'Advanced', value: 'advanced' },
  ];

  const durationOptions = [
    { label: '15 min', value: '15min' },
    { label: '30 min', value: '30min' },
    { label: '45 min', value: '45min' },
    { label: '60+ min', value: '60min' },
  ];


  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.headerBg, borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => setSidebarVisible(true)}>
          <Ionicons name="menu" size={28} color={colors.text} />
        </TouchableOpacity>

        <Text style={[styles.headerTitle, { color: colors.text }]}>Study Preferences</Text>

        <TouchableOpacity onPress={() => router.back()} style={styles.closeButton}>
          <Ionicons name="close" size={28} color={colors.text} />
        </TouchableOpacity>
      </View>

      {/* Sidebar */}
      <Sidebar visible={sidebarVisible} onClose={() => setSidebarVisible(false)} />

      {/* Content */}
      <ScrollView showsVerticalScrollIndicator={false} style={[styles.content, { backgroundColor: colors.background }]}>
        {/* Difficulty Level */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Study Difficulty</Text>
          <View style={styles.optionsContainer}>
            {difficultyOptions.map((option) => (
              <TouchableOpacity
                key={option.value}
                style={[
                  styles.optionButton,
                  preferences.studyDifficulty === option.value && styles.optionButtonActive,
                  { backgroundColor: preferences.studyDifficulty === option.value ? colors.primary : colors.surface, borderColor: colors.border }
                ]}
                onPress={() =>
                  setPreferences({ ...preferences, studyDifficulty: option.value })
                }
              >
                <Text
                  style={[
                    styles.optionText,
                    preferences.studyDifficulty === option.value &&
                      styles.optionTextActive,
                    { color: preferences.studyDifficulty === option.value ? '#FFF' : colors.text }
                  ]}
                >
                  {option.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Study Duration */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Preferred Session Duration</Text>
          <View style={styles.optionsContainer}>
            {durationOptions.map((option) => (
              <TouchableOpacity
                key={option.value}
                style={[
                  styles.optionButton,
                  preferences.studyDuration === option.value && styles.optionButtonActive,
                  { backgroundColor: preferences.studyDuration === option.value ? colors.primary : colors.surface, borderColor: colors.border }
                ]}
                onPress={() =>
                  setPreferences({ ...preferences, studyDuration: option.value })
                }
              >
                <Text
                  style={[
                    styles.optionText,
                    preferences.studyDuration === option.value &&
                      styles.optionTextActive,
                    { color: preferences.studyDuration === option.value ? '#FFF' : colors.text }
                  ]}
                >
                  {option.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Preferred Study Time */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Preferred Study Time</Text>
          <TouchableOpacity 
            style={[styles.timeCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
            onPress={() => setShowTimeModal(true)}
          >
            <Ionicons name="time" size={24} color={colors.primary} />
            <View style={{ marginLeft: 12, flex: 1 }}>
              <Text style={[styles.timeLabel, { color: colors.text }]}>{preferences.studyTimeStart} - {preferences.studyTimeEnd}</Text>
              <Text style={[styles.timeDesc, { color: colors.textSecondary }]}>
                We'll send reminders during your preferred study hours
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>

        <View style={{ height: 20 }} />
      </ScrollView>

      {/* Time Modal */}
      <Modal
        visible={showTimeModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowTimeModal(false)}
      >
        <SafeAreaView style={[styles.modalContainer, { backgroundColor: colors.background }]}>
          <View style={[styles.modalHeader, { backgroundColor: colors.headerBg, borderBottomColor: colors.border }]}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>Set Study Time</Text>
            <TouchableOpacity onPress={() => setShowTimeModal(false)}>
              <Ionicons name="close" size={28} color={colors.text} />
            </TouchableOpacity>
          </View>

          <ScrollView style={[styles.modalContent, { backgroundColor: colors.background }]}>
            {timeSlots.map((slot) => (
              <TouchableOpacity
                key={slot.value}
                style={[
                  styles.timeOption,
                  { backgroundColor: colors.surface, borderColor: colors.border }
                ]}
                onPress={() => {
                  if (slot.value === 'custom') {
                    setShowCustomTime(true);
                  } else {
                    // Set approximate times for each slot
                    const times: any = {
                      'morning': { start: '06:00', end: '12:00' },
                      'afternoon': { start: '12:00', end: '18:00' },
                      'evening': { start: '18:00', end: '22:00' },
                      'night': { start: '22:00', end: '00:00' },
                    };
                    setPreferences({
                      ...preferences,
                      studyTimeStart: times[slot.value].start,
                      studyTimeEnd: times[slot.value].end,
                    });
                    setShowTimeModal(false);
                  }
                }}
              >
                <Ionicons name={slot.value === 'custom' ? 'settings' : 'time'} size={24} color={colors.primary} />
                <Text style={[styles.timeOptionLabel, { color: colors.text }]}>{slot.label}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </SafeAreaView>
      </Modal>

      {/* Custom Study Time Modal */}
      <Modal
        visible={showCustomTime}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowCustomTime(false)}
      >
        <SafeAreaView style={[styles.modalContainer, { backgroundColor: colors.background }]}>
          <View style={[styles.modalHeader, { backgroundColor: colors.headerBg, borderBottomColor: colors.border }]}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>Custom Study Time</Text>
            <TouchableOpacity onPress={() => setShowCustomTime(false)}>
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
                    placeholder="6"
                    placeholderTextColor={colors.textSecondary}
                    value={customTimeStartHour}
                    onChangeText={(text) => {
                      const num = parseInt(text) || 0;
                      if (num >= 1 && num <= 12) setCustomTimeStartHour(num.toString());
                      else if (text === '') setCustomTimeStartHour('');
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
                    value={customTimeStartMin}
                    onChangeText={(text) => {
                      const num = parseInt(text) || 0;
                      if (num >= 0 && num <= 59) setCustomTimeStartMin(num.toString().padStart(2, '0'));
                      else if (text === '') setCustomTimeStartMin('');
                    }}
                    maxLength={2}
                    keyboardType="number-pad"
                  />
                </View>

                <View style={{ flex: 1, justifyContent: 'flex-end', marginBottom: 0 }}>
                  <View style={{ flexDirection: 'row', gap: 6 }}>
                    <TouchableOpacity
                      style={[styles.periodButton, customTimeStartPeriod === 'AM' && { backgroundColor: colors.primary }]}
                      onPress={() => setCustomTimeStartPeriod('AM')}
                    >
                      <Text style={[styles.periodButtonText, { color: customTimeStartPeriod === 'AM' ? '#FFF' : colors.text }]}>AM</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.periodButton, customTimeStartPeriod === 'PM' && { backgroundColor: colors.primary }]}
                      onPress={() => setCustomTimeStartPeriod('PM')}
                    >
                      <Text style={[styles.periodButtonText, { color: customTimeStartPeriod === 'PM' ? '#FFF' : colors.text }]}>PM</Text>
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
                    placeholder="10"
                    placeholderTextColor={colors.textSecondary}
                    value={customTimeEndHour}
                    onChangeText={(text) => {
                      const num = parseInt(text) || 0;
                      if (num >= 1 && num <= 12) setCustomTimeEndHour(num.toString());
                      else if (text === '') setCustomTimeEndHour('');
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
                    value={customTimeEndMin}
                    onChangeText={(text) => {
                      const num = parseInt(text) || 0;
                      if (num >= 0 && num <= 59) setCustomTimeEndMin(num.toString().padStart(2, '0'));
                      else if (text === '') setCustomTimeEndMin('');
                    }}
                    maxLength={2}
                    keyboardType="number-pad"
                  />
                </View>

                <View style={{ flex: 1, justifyContent: 'flex-end', marginBottom: 0 }}>
                  <View style={{ flexDirection: 'row', gap: 6 }}>
                    <TouchableOpacity
                      style={[styles.periodButton, customTimeEndPeriod === 'AM' && { backgroundColor: colors.primary }]}
                      onPress={() => setCustomTimeEndPeriod('AM')}
                    >
                      <Text style={[styles.periodButtonText, { color: customTimeEndPeriod === 'AM' ? '#FFF' : colors.text }]}>AM</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.periodButton, customTimeEndPeriod === 'PM' && { backgroundColor: colors.primary }]}
                      onPress={() => setCustomTimeEndPeriod('PM')}
                    >
                      <Text style={[styles.periodButtonText, { color: customTimeEndPeriod === 'PM' ? '#FFF' : colors.text }]}>PM</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>

              <TouchableOpacity 
                style={[styles.setTimeButton, { backgroundColor: colors.primary, opacity: customTimeStartHour && customTimeStartMin && customTimeEndHour && customTimeEndMin ? 1 : 0.5 }]}
                onPress={() => {
                  if (customTimeStartHour && customTimeStartMin && customTimeEndHour && customTimeEndMin) {
                    const start = convertTo24Hour(customTimeStartHour, customTimeStartMin, customTimeStartPeriod);
                    const end = convertTo24Hour(customTimeEndHour, customTimeEndMin, customTimeEndPeriod);
                    setPreferences({
                      ...preferences,
                      studyTimeStart: start,
                      studyTimeEnd: end,
                    });
                    setShowCustomTime(false);
                    setShowTimeModal(false);
                    setCustomTimeStartHour('');
                    setCustomTimeStartMin('');
                    setCustomTimeEndHour('');
                    setCustomTimeEndMin('');
                  }
                }}
                disabled={!customTimeStartHour || !customTimeStartMin || !customTimeEndHour || !customTimeEndMin}
              >
                <Text style={styles.setTimeButtonText}>Set Custom Study Time</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </SafeAreaView>
      </Modal>

      {/* Save Button */}
      <View style={[styles.footer, { borderTopColor: colors.border }]}>
        <TouchableOpacity
          style={[styles.saveBtn, saving && { opacity: 0.6 }]}
          onPress={savePreferences}
          disabled={saving}
        >
          <Text style={styles.saveBtnText}>{saving ? 'Saving...' : 'Save Preferences'}</Text>
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
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 12,
  },
  optionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  optionButton: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1,
  },
  optionButtonActive: {
    borderWidth: 1,
  },
  optionText: {
    fontSize: 13,
    fontWeight: '600',
  },
  optionTextActive: {
    color: '#FFFFFF',
  },
  styleCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 12,
  },
  styleLabel: {
    fontSize: 15,
    fontWeight: '700',
  },
  styleDesc: {
    fontSize: 12,
    marginTop: 4,
  },
  changeButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 14,
    borderRadius: 10,
    borderWidth: 1,
  },
  changeButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  timeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 14,
    borderRadius: 12,
    borderWidth: 1,
  },
  timeLabel: {
    fontSize: 15,
    fontWeight: '700',
    marginLeft: 12,
  },
  timeDesc: {
    fontSize: 12,
    marginTop: 4,
    marginLeft: 12,
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
  styleOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 14,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 10,
    gap: 12,
  },
  styleOptionIcon: {
    width: 50,
    height: 50,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  styleOptionLabel: {
    fontSize: 15,
    fontWeight: '700',
  },
  styleOptionDesc: {
    fontSize: 12,
    marginTop: 4,
  },
  timeOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 14,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 10,
    gap: 12,
  },
  timeOptionLabel: {
    fontSize: 15,
    fontWeight: '600',
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
