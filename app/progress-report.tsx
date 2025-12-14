import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { collection, onSnapshot, query } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
const firebaseConfig: any = require('../config/firebase');

export default function ProgressReport() {
  const router = useRouter();
  const { user } = useAuth();
  const { colors } = useTheme();
  const [uploadsCount, setUploadsCount] = useState(0);
  const [notesCount, setNotesCount] = useState(0);
  const [completedQuizzes, setCompletedQuizzes] = useState(0);
  const [studiedPDFs, setStudiedPDFs] = useState(0);
  const [aiResults, setAiResults] = useState(0);

  useEffect(() => {
    if (!user?.uid) return; // Wait for user to be loaded
    
    const db = firebaseConfig.db;
    const uid = user.uid;

    try {
      const uploadsQ = query(collection(db, 'users', uid, 'uploads'));
      const unsubUploads = onSnapshot(uploadsQ, (snap) => setUploadsCount(snap.size));

      const notesQ = query(collection(db, 'users', uid, 'notes'));
      const unsubNotes = onSnapshot(notesQ, (snap) => setNotesCount(snap.size));

      return () => {
        unsubUploads();
        unsubNotes();
      };
    } catch (e) {
      console.error('Progress report listeners error', e);
    }
  }, [user?.uid]);

  useEffect(() => {
    (async () => {
      try {
        const uid = user?.uid || 'anonymous';

        // Load uploads from AsyncStorage
        const uploadsKey = `localUploads_${uid}`;
        const stored = await AsyncStorage.getItem(uploadsKey);
        const local = stored ? JSON.parse(stored) : [];
        if (Array.isArray(local) && local.length > uploadsCount) {
          setUploadsCount(Math.max(uploadsCount, local.length));
        }

        // Load notes from AsyncStorage
        const notesKey = `localNotes_${uid}`;
        const notesStored = await AsyncStorage.getItem(notesKey);
        const localNotes = notesStored ? JSON.parse(notesStored) : [];
        if (Array.isArray(localNotes) && localNotes.length > notesCount) {
          setNotesCount(Math.max(notesCount, localNotes.length));
        }

        // Load quiz completion
        const quizKey = `lastQuiz_${uid}`;
        const quizData = await AsyncStorage.getItem(quizKey);
        if (quizData) {
          const quiz = JSON.parse(quizData);
          setCompletedQuizzes(quiz.completed ? 1 : 0);
        } else {
          setCompletedQuizzes(0);
        }

        // Load study history
        const studyHistoryKey = `studyHistory_${uid}`;
        const studyHistory = await AsyncStorage.getItem(studyHistoryKey);
        if (studyHistory) {
          const history = JSON.parse(studyHistory);
          if (Array.isArray(history)) {
            setStudiedPDFs(history.length);
          }
        } else {
          setStudiedPDFs(0);
        }

        // Load AI results
        const aiResultsKey = `aiResults_${uid}`;
        const aiResultsData = await AsyncStorage.getItem(aiResultsKey);
        if (aiResultsData) {
          const results = JSON.parse(aiResultsData);
          if (Array.isArray(results)) {
            setAiResults(results.filter((r: any) => r.completed).length);
          }
        } else {
          setAiResults(0);
        }
      } catch (e) {
        console.error('Error loading report data', e);
      }
    })();
  }, [user?.uid]);

  const metrics = [
    { label: 'Uploaded PDFs', value: uploadsCount, icon: 'document', color: colors.primary },
    { label: 'Saved Notes', value: notesCount, icon: 'create', color: colors.info },
    { label: 'PDFs Studied', value: studiedPDFs, icon: 'book', color: colors.success },
    { label: 'Quizzes Completed', value: completedQuizzes, icon: 'checkmark-circle', color: colors.warning },
    { label: 'AI Generations', value: aiResults, icon: 'sparkles', color: colors.primary },
  ];

  // Option 2: Weighted Learning Activities
  // 40% - Studying materials, 25% - Quizzes, 20% - Notes, 15% - AI Tools
  const studyProgress = uploadsCount > 0 ? (studiedPDFs / uploadsCount) * 40 : 0;
  const quizProgress = Math.min(25, completedQuizzes * 12.5);
  const notesProgress = Math.min(20, notesCount * 10);
  const aiProgress = Math.min(15, aiResults * 7.5);
  const completionPercent = Math.min(100, studyProgress + quizProgress + notesProgress + aiProgress);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.headerBg, borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Detailed Report</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        {/* Overall Progress */}
        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.cardTitle, { color: colors.text }]}>Overall Progress</Text>
          <View style={[styles.progressBarOuter, { backgroundColor: colors.card }]}>
            <View style={[styles.progressBarInner, { width: `${completionPercent}%`, backgroundColor: colors.success }]} />
          </View>
          <Text style={[styles.progressPercent, { color: colors.textSecondary }]}>{Math.round(completionPercent)}% completed</Text>
        </View>

        {/* Metrics Grid */}
        <View style={styles.metricsGrid}>
          {metrics.map((metric, idx) => (
            <View key={idx} style={[styles.metricCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <View style={[styles.metricIcon, { backgroundColor: metric.color + '15' }]}>
                <Ionicons name={metric.icon as any} size={24} color={metric.color} />
              </View>
              <Text style={[styles.metricValue, { color: colors.text }]}>{metric.value}</Text>
              <Text style={[styles.metricLabel, { color: colors.textSecondary }]}>{metric.label}</Text>
            </View>
          ))}
        </View>

        {/* Summary */}
        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.cardTitle, { color: colors.text }]}>Summary</Text>
          <View style={styles.summaryRow}>
            <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>Total Study Items:</Text>
            <Text style={[styles.summaryValue, { color: colors.primary }]}>{uploadsCount + notesCount + studiedPDFs}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>Content Generated:</Text>
            <Text style={[styles.summaryValue, { color: colors.primary }]}>{completedQuizzes + aiResults}</Text>
          </View>
          <View style={[styles.summaryRow, { borderBottomWidth: 0 }]}>
            <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>Study Score:</Text>
            <Text style={[styles.summaryValue, { color: colors.success, fontWeight: '700' }]}>{Math.round(completionPercent)} pts</Text>
          </View>
        </View>

        {/* Tips */}
        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.cardTitle, { color: colors.text }]}>💡 Keep Learning</Text>
          <Text style={[styles.tipText, { color: colors.textSecondary }]}>
            • Upload more PDFs to expand your study materials{'\n'}
            • Create notes while studying to improve retention{'\n'}
            • Complete quizzes to test your knowledge{'\n'}
            • Use AI features to generate summaries and flashcards
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
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
  content: { padding: 20 },
  contentContainer: { paddingBottom: 20 },
  card: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 16,
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 12,
  },
  progressBarOuter: {
    height: 12,
    borderRadius: 6,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressBarInner: { height: '100%' },
  progressPercent: {
    fontSize: 13,
    fontWeight: '600',
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 16,
  },
  metricCard: {
    flex: 1,
    minWidth: 100,
    borderRadius: 12,
    borderWidth: 1,
    padding: 16,
    alignItems: 'center',
  },
  metricIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  metricValue: {
    fontSize: 20,
    fontWeight: '700',
  },
  metricLabel: {
    fontSize: 11,
    fontWeight: '600',
    marginTop: 4,
    textAlign: 'center',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  summaryLabel: {
    fontSize: 14,
    fontWeight: '500',
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: '700',
  },
  tipText: {
    fontSize: 13,
    lineHeight: 20,
    fontWeight: '500',
  },
});
