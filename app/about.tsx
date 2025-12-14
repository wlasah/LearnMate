import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { Sidebar } from '../components/Sidebar';
import { useTheme } from '../contexts/ThemeContext';

export default function AboutPage() {
  const router = useRouter();
  const [sidebarVisible, setSidebarVisible] = useState(false);
  const { colors } = useTheme();

  const features = [
    { icon: 'document', title: 'PDF Management', desc: 'Upload and organize your study materials' },
    { icon: 'bar-chart', title: 'Progress Tracking', desc: 'Monitor your learning journey' },
    { icon: 'star', title: 'Achievements', desc: 'Earn badges and celebrate milestones' },
    { icon: 'bell', title: 'Smart Reminders', desc: 'Never miss your study sessions' },
  ];

  const socialLinks = [
    { icon: 'logo-twitter', label: 'Twitter' },
    { icon: 'logo-facebook', label: 'Facebook' },
    { icon: 'logo-linkedin', label: 'LinkedIn' },
    { icon: 'mail', label: 'Email' },
  ];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.headerBg, borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => setSidebarVisible(true)}>
          <Ionicons name="menu" size={28} color={colors.text} />
        </TouchableOpacity>

        <Text style={[styles.headerTitle, { color: colors.text }]}>About LearnMate</Text>

        <TouchableOpacity onPress={() => router.back()} style={styles.closeButton}>
          <Ionicons name="close" size={28} color={colors.text} />
        </TouchableOpacity>
      </View>

      {/* Sidebar */}
      <Sidebar visible={sidebarVisible} onClose={() => setSidebarVisible(false)} />

      {/* Content */}
      <ScrollView showsVerticalScrollIndicator={false} style={[styles.content, { backgroundColor: colors.background }]}>
        {/* App Info */}
        <View style={[styles.appInfoCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.appName, { color: colors.text }]}>LearnMate</Text>
          <Text style={[styles.tagline, { color: colors.textSecondary }]}>Your Personal Learning Companion</Text>
          <Text style={[styles.version, { color: colors.textSecondary }]}>Version 1.0.0</Text>
        </View>

        {/* Mission */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Our Mission</Text>
          <Text style={[styles.sectionText, { color: colors.textSecondary }]}>
            LearnMate empowers learners worldwide to organize, track, and master their educational journey. We believe learning should be accessible, engaging, and rewarding.
          </Text>
        </View>

        {/* Features */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Key Features</Text>
          <View style={styles.featuresGrid}>
            {features.map((feature, index) => (
              <View key={index} style={[styles.featureCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                <View style={[styles.featureIcon, { backgroundColor: colors.primary + '20' }]}>
                  <Ionicons name={feature.icon as any} size={28} color={colors.primary} />
                </View>
                <Text style={[styles.featureTitle, { color: colors.text }]}>{feature.title}</Text>
                <Text style={[styles.featureDesc, { color: colors.textSecondary }]}>{feature.desc}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Legal */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Legal</Text>
          <TouchableOpacity style={[styles.legalLink, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Text style={[styles.legalLinkText, { color: colors.text }]}>Terms of Service</Text>
            <Ionicons name="chevron-forward" size={18} color={colors.primary} />
          </TouchableOpacity>
          <TouchableOpacity style={[styles.legalLink, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Text style={[styles.legalLinkText, { color: colors.text }]}>Privacy Policy</Text>
            <Ionicons name="chevron-forward" size={18} color={colors.primary} />
          </TouchableOpacity>
        </View>

        {/* Follow Us */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Follow Us</Text>
          <View style={styles.socialContainer}>
            {socialLinks.map((link, index) => (
              <TouchableOpacity key={index} style={[styles.socialButton, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                <Ionicons name={link.icon as any} size={28} color={colors.primary} />
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Credits */}
        <View style={[styles.creditsCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.creditsTitle, { color: colors.text }]}>Made with ❤️ by the LearnMate Team</Text>
          <Text style={[styles.creditsText, { color: colors.textSecondary }]}>
            © 2025 LearnMate. All rights reserved.
          </Text>
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
  appInfoCard: {
    borderRadius: 14,
    padding: 24,
    alignItems: 'center',
    marginBottom: 28,
    borderWidth: 1,
  },
  appName: {
    fontSize: 32,
    fontWeight: '700',
    marginTop: 0,
  },
  tagline: {
    fontSize: 15,
    marginTop: 8,
    fontWeight: '500',
  },
  version: {
    fontSize: 12,
    marginTop: 8,
  },
  section: {
    marginBottom: 28,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 12,
  },
  sectionText: {
    fontSize: 14,
    lineHeight: 20,
  },
  featuresGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  featureCard: {
    width: '48%',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    borderWidth: 1,
  },
  featureIcon: {
    width: 50,
    height: 50,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  featureTitle: {
    fontSize: 13,
    fontWeight: '700',
    textAlign: 'center',
  },
  featureDesc: {
    fontSize: 11,
    marginTop: 4,
    textAlign: 'center',
    lineHeight: 14,
  },
  legalLink: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 10,
    marginBottom: 8,
    borderWidth: 1,
  },
  legalLinkText: {
    fontSize: 14,
    fontWeight: '600',
  },
  socialContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 12,
  },
  socialButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
  },
  creditsCard: {
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    marginTop: 12,
  },
  creditsTitle: {
    fontSize: 14,
    fontWeight: '700',
  },
  creditsText: {
    fontSize: 12,
    marginTop: 8,
  },
});
