import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useTheme } from '../contexts/ThemeContext';
import { Sidebar } from '../components/Sidebar';

export default function PrivacyPage() {
  const router = useRouter();
  const [sidebarVisible, setSidebarVisible] = useState(false);
  const { colors } = useTheme();

  const privacyItems = [
    {
      title: 'Data Privacy',
      description: 'Learn how we collect, use, and protect your data',
      icon: 'shield',
    },
    {
      title: 'Privacy Policy',
      description: 'Read our complete privacy policy',
      icon: 'document-text',
    },
    {
      title: 'Terms of Service',
      description: 'Review our terms and conditions',
      icon: 'checkbox',
    },
    {
      title: 'Cookie Settings',
      description: 'Manage your cookie preferences',
      icon: 'settings',
    },
  ];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.headerBg, borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => setSidebarVisible(true)}>
          <Ionicons name="menu" size={28} color={colors.text} />
        </TouchableOpacity>

        <Text style={[styles.headerTitle, { color: colors.text }]}>Privacy & Security</Text>

        <TouchableOpacity onPress={() => router.back()} style={styles.closeButton}>
          <Ionicons name="close" size={28} color="#333" />
        </TouchableOpacity>
      </View>

      {/* Sidebar */}
      <Sidebar visible={sidebarVisible} onClose={() => setSidebarVisible(false)} />

      {/* Content */}
      <ScrollView showsVerticalScrollIndicator={false} style={[styles.content, { backgroundColor: colors.background }]}>
        <View style={styles.introCard}>
          <Ionicons name="lock-closed" size={40} color="#2B9AF3" />
          <Text style={styles.introTitle}>Your Privacy Matters</Text>
          <Text style={styles.introDesc}>
            We're committed to protecting your personal information and maintaining your trust.
          </Text>
        </View>

        {privacyItems.map((item, index) => (
          <TouchableOpacity key={index} style={styles.privacyItem}>
            <View style={styles.itemLeft}>
              <View style={styles.itemIcon}>
                <Ionicons name={item.icon as any} size={24} color="#2B9AF3" />
              </View>
              <View style={styles.itemContent}>
                <Text style={styles.itemTitle}>{item.title}</Text>
                <Text style={styles.itemDesc}>{item.description}</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#87CAF3" />
          </TouchableOpacity>
        ))}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Data Management</Text>
          <TouchableOpacity style={styles.dataItem}>
            <Ionicons name="download" size={24} color="#2B9AF3" />
            <Text style={styles.dataLabel}>Download Your Data</Text>
            <Ionicons name="chevron-forward" size={20} color="#87CAF3" />
          </TouchableOpacity>

          <TouchableOpacity style={[styles.dataItem, styles.dataItemDanger]}>
            <Ionicons name="trash" size={24} color="#FF4B4B" />
            <Text style={[styles.dataLabel, styles.dataLabelDanger]}>Delete My Account</Text>
            <Ionicons name="chevron-forward" size={20} color="#FF4B4B" />
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
    backgroundColor: '#E6F4FF',
    borderRadius: 14,
    padding: 20,
    alignItems: 'center',
    marginBottom: 28,
    borderWidth: 1,
    borderColor: '#87CAF3',
  },
  introTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#2C3E50',
    marginTop: 12,
  },
  introDesc: {
    fontSize: 13,
    color: '#6B7B84',
    marginTop: 8,
    textAlign: 'center',
    lineHeight: 18,
  },
  privacyItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F6FBFF',
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#E6EEF6',
  },
  itemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  itemIcon: {
    width: 44,
    height: 44,
    borderRadius: 10,
    backgroundColor: '#E6F4FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  itemContent: {
    flex: 1,
  },
  itemTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#2C3E50',
  },
  itemDesc: {
    fontSize: 12,
    color: '#6B7B84',
    marginTop: 2,
  },
  section: {
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#2C3E50',
    marginBottom: 12,
  },
  dataItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F6FBFF',
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#E6EEF6',
  },
  dataItemDanger: {
    backgroundColor: '#FFE6E6',
    borderColor: '#FF4B4B',
  },
  dataLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: '#2B9AF3',
    marginLeft: 12,
    flex: 1,
  },
  dataLabelDanger: {
    color: '#FF4B4B',
  },
});
