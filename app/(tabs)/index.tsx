// app/(tabs)/index.tsx
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../../contexts/AuthContext';
import { Ionicons } from '@expo/vector-icons';

export default function HomeScreen() {
  const router = useRouter();
  const { user } = useAuth();

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.welcomeText}>Welcome to</Text>
          <Text style={styles.appName}>
            Learn<Text style={styles.appNameBold}>Mate</Text>
          </Text>
        </View>

        {/* Continue Learning Card */}
        <TouchableOpacity
          style={styles.continueCard}
          onPress={() => router.push('/quiz-select' as any)}
        >
          <Text style={styles.continueTitle}>Continue Learning</Text>
          <Text style={styles.continueSubtitle}>
            Pick up where you left off and
          </Text>
          <Text style={styles.continueSubtitle}>master new concepts</Text>
          <View style={styles.questionsCompleted}>
            <Text style={styles.questionsText}>370 questions completed</Text>
          </View>
        </TouchableOpacity>

        {/* Action Buttons Grid */}
        <View style={styles.gridContainer}>
          <View style={styles.gridRow}>
            <TouchableOpacity
              style={styles.gridItem}
              onPress={() => router.push('/upload-pdf' as any)}
            >
              <View style={[styles.iconContainer, { backgroundColor: '#FFE4E4' }]}> 
                <Ionicons name="cloud-upload-outline" size={32} color="#FF6B6B" />
              </View>
              <Text style={styles.gridLabel}>Upload PDF</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.gridItem}
              onPress={() => router.push('/progress')}
            >
              <View style={[styles.iconContainer, { backgroundColor: '#E4F5FF' }]}> 
                <Ionicons name="trending-up-outline" size={32} color="#4A90E2" />
              </View>
              <Text style={styles.gridLabel}>My Progress</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.gridRow}>
            <TouchableOpacity
              style={styles.gridItem}
              onPress={() => router.push('/study' as any)}
            >
              <View style={[styles.iconContainer, { backgroundColor: '#E4F0FF' }]}> 
                <Ionicons name="book-outline" size={32} color="#5B8DEE" />
              </View>
              <Text style={styles.gridLabel}>Study Plan</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.gridItem}
              onPress={() => router.push('/notes' as any)}
            >
              <View style={[styles.iconContainer, { backgroundColor: '#FFF4E4' }]}> 
                <Ionicons name="document-text-outline" size={32} color="#F5A623" />
              </View>
              <Text style={styles.gridLabel}>Saved Notes</Text>
            </TouchableOpacity>
          </View>
        </View>
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
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 24,
  },
  welcomeText: {
    fontSize: 28,
    color: '#333',
    fontWeight: '400',
  },
  appName: {
    fontSize: 28,
    color: '#333',
    fontWeight: '300',
  },
  appNameBold: {
    fontWeight: '700',
  },
  continueCard: {
    backgroundColor: '#6EC1E4',
    marginHorizontal: 24,
    borderRadius: 20,
    padding: 24,
    marginBottom: 32,
  },
  continueTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  continueSubtitle: {
    fontSize: 14,
    color: '#FFFFFF',
    opacity: 0.9,
  },
  questionsCompleted: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    alignSelf: 'flex-start',
    marginTop: 16,
  },
  questionsText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  gridContainer: {
    paddingHorizontal: 24,
  },
  gridRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  gridItem: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  gridLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
  },
});
