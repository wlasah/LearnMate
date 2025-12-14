import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { Sidebar } from '../components/Sidebar';
import { useTheme } from '../contexts/ThemeContext';

export default function HelpPage() {
  const router = useRouter();
  const { colors } = useTheme();
  const [sidebarVisible, setSidebarVisible] = useState(false);

  const faqs = [
    {
      question: 'How do I upload a PDF?',
      answer: 'Go to the Home screen and tap "Upload PDF" to select and upload your study materials.',
    },
    {
      question: 'How do I track my progress?',
      answer: 'Visit the Progress tab to see your study completion percentage and statistics.',
    },
    {
      question: 'Can I download my data?',
      answer: 'Yes! Go to Settings > Privacy & Security > Download Your Data to export all your information.',
    },
    {
      question: 'How do I change my profile information?',
      answer: 'Visit the Account tab to view and manage your profile details.',
    },
    {
      question: 'Where can I adjust notification preferences?',
      answer: 'Go to Settings > Notification Settings to customize which notifications you receive.',
    },
  ];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => setSidebarVisible(true)}>
          <Ionicons name="menu" size={28} color={colors.text} />
        </TouchableOpacity>

        <Text style={[styles.headerTitle, { color: colors.text }]}>Help & Support</Text>

        <TouchableOpacity onPress={() => router.back()} style={styles.closeButton}>
          <Ionicons name="close" size={28} color={colors.text} />
        </TouchableOpacity>
      </View>

      {/* Sidebar */}
      <Sidebar visible={sidebarVisible} onClose={() => setSidebarVisible(false)} />

      {/* Content */}
      <ScrollView showsVerticalScrollIndicator={false} style={styles.content}>
        <View style={[styles.introCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Ionicons name="help-circle" size={40} color={colors.primary} />
          <Text style={[styles.introTitle, { color: colors.text }]}>Frequently Asked Questions</Text>
          <Text style={[styles.introDesc, { color: colors.textSecondary }]}>Find answers to common questions about LearnMate</Text>
        </View>

        {faqs.map((item, index) => (
          <View key={index} style={[styles.faqItem, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <View style={styles.questionContainer}>
              <Ionicons name="help-circle" size={20} color={colors.primary} />
              <Text style={[styles.question, { color: colors.text }]}>{item.question}</Text>
            </View>
            <Text style={[styles.answer, { color: colors.textSecondary }]}>{item.answer}</Text>
          </View>
        ))}

        <View style={[styles.contactCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.contactTitle, { color: colors.text }]}>Still need help?</Text>
          <Text style={[styles.contactDesc, { color: colors.textSecondary }]}>Contact our support team at support@learnmate.com</Text>
          <TouchableOpacity style={[styles.contactButton, { backgroundColor: colors.primary }]}>
            <Ionicons name="mail" size={20} color={colors.surface} />
            <Text style={[styles.contactButtonText, { color: colors.surface }]}>Email Support</Text>
          </TouchableOpacity>
        </View>

        <View style={{ height: 30 }} />
      </ScrollView>
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
  },
  introCard: {
    borderRadius: 14,
    padding: 20,
    alignItems: 'center',
    marginBottom: 24,
    borderWidth: 1,
  },
  introTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginTop: 12,
  },
  introDesc: {
    fontSize: 13,
    marginTop: 8,
    textAlign: 'center',
    lineHeight: 18,
  },
  faqItem: {
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
  },
  questionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  question: {
    fontSize: 14,
    fontWeight: '700',
    marginLeft: 10,
    flex: 1,
  },
  answer: {
    fontSize: 13,
    lineHeight: 18,
    marginLeft: 30,
  },
  contactCard: {
    borderRadius: 12,
    padding: 16,
    marginTop: 16,
    alignItems: 'center',
    borderWidth: 1,
  },
  contactTitle: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 8,
  },
  contactDesc: {
    fontSize: 13,
    marginBottom: 12,
    textAlign: 'center',
  },
  contactButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 10,
    gap: 8,
  },
  contactButtonText: {
    fontSize: 13,
    fontWeight: '700',
  },
});
