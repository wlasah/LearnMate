// app/quiz-select.tsx
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
import { Ionicons } from '@expo/vector-icons';

interface Subject {
  id: string;
  name: string;
  icon: string;
  color: string;
  backgroundColor: string;
  questionsCount: number;
}

export default function QuizSelectScreen() {
  const router = useRouter();

  const subjects: Subject[] = [
    {
      id: '1',
      name: 'Internet of Things',
      icon: 'wifi',
      color: '#6EC1E4',
      backgroundColor: '#E3F5FF',
      questionsCount: 45,
    },
    {
      id: '2',
      name: 'Mathematics',
      icon: 'calculator',
      color: '#9B59B6',
      backgroundColor: '#F3E5F5',
      questionsCount: 60,
    },
    {
      id: '3',
      name: 'Programming',
      icon: 'code-slash',
      color: '#3498DB',
      backgroundColor: '#E3F2FD',
      questionsCount: 75,
    },
    {
      id: '4',
      name: 'Physics',
      icon: 'flash',
      color: '#E74C3C',
      backgroundColor: '#FFEBEE',
      questionsCount: 50,
    },
    {
      id: '5',
      name: 'Chemistry',
      icon: 'flask',
      color: '#2ECC71',
      backgroundColor: '#E8F5E9',
      questionsCount: 55,
    },
    {
      id: '6',
      name: 'History',
      icon: 'book',
      color: '#F39C12',
      backgroundColor: '#FFF3E0',
      questionsCount: 40,
    },
  ];

  const handleSubjectSelect = (subject: Subject) => {
    router.push({
      pathname: '/quiz-start',
      params: { subject: subject.name, subjectId: subject.id },
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Select Subject</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Content */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        <Text style={styles.subtitle}>Choose a subject to start your quiz</Text>

        <View style={styles.subjectsGrid}>
          {subjects.map((subject) => (
            <TouchableOpacity
              key={subject.id}
              style={[styles.subjectCard, { backgroundColor: subject.backgroundColor }]}
              onPress={() => handleSubjectSelect(subject)}
            >
              <View style={[styles.iconContainer, { backgroundColor: subject.color }]}>
                <Ionicons name={subject.icon as any} size={32} color="#FFFFFF" />
              </View>
              <Text style={styles.subjectName}>{subject.name}</Text>
              <Text style={styles.questionsCount}>
                {subject.questionsCount} questions
              </Text>
            </TouchableOpacity>
          ))}
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
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 24,
    textAlign: 'center',
  },
  subjectsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  subjectCard: {
    width: '48%',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    alignItems: 'center',
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  subjectName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
    marginBottom: 8,
  },
  questionsCount: {
    fontSize: 12,
    color: '#666',
  },
});