// app/quiz-start.tsx
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function QuizStartScreen() {
  const router = useRouter();
  const { subject } = useLocalSearchParams<{ subject: string }>();

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Quiz Setup</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Content */}
      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <Ionicons name="school" size={80} color="#6EC1E4" />
        </View>

        <Text style={styles.title}>{subject}</Text>
        <Text style={styles.subtitle}>Get ready to test your knowledge!</Text>

        <View style={styles.infoContainer}>
          <View style={styles.infoRow}>
            <Ionicons name="help-circle-outline" size={24} color="#666" />
            <View style={styles.infoText}>
              <Text style={styles.infoLabel}>Questions</Text>
              <Text style={styles.infoValue}>10 questions</Text>
            </View>
          </View>

          <View style={styles.infoRow}>
            <Ionicons name="time-outline" size={24} color="#666" />
            <View style={styles.infoText}>
              <Text style={styles.infoLabel}>Duration</Text>
              <Text style={styles.infoValue}>15 minutes</Text>
            </View>
          </View>

          <View style={styles.infoRow}>
            <Ionicons name="checkmark-circle-outline" size={24} color="#666" />
            <View style={styles.infoText}>
              <Text style={styles.infoLabel}>Passing Score</Text>
              <Text style={styles.infoValue}>70%</Text>
            </View>
          </View>
        </View>

        <TouchableOpacity
          style={styles.startButton}
          onPress={() => {
            // Here you would start the actual quiz
            // For now, just show an alert
            alert('Quiz will start here! Implement quiz logic.');
          }}
        >
          <Text style={styles.startButtonText}>Start Quiz</Text>
          <Ionicons name="arrow-forward" size={20} color="#FFFFFF" />
        </TouchableOpacity>
      </View>
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
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 40,
    alignItems: 'center',
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#E3F5FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#333',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 40,
  },
  infoContainer: {
    width: '100%',
    backgroundColor: '#F8F9FA',
    borderRadius: 16,
    padding: 24,
    marginBottom: 40,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  infoText: {
    marginLeft: 16,
    flex: 1,
  },
  infoLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  startButton: {
    flexDirection: 'row',
    backgroundColor: '#6EC1E4',
    borderRadius: 12,
    padding: 18,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    gap: 8,
  },
  startButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});