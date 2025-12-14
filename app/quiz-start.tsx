import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';

interface Question {
  id: number;
  question: string;
  options: string[];
  correctIndex: number;
  explanation?: string;
}

export default function QuizStart() {
  const { colors } = useTheme();
  const { user } = useAuth();
  const params = useLocalSearchParams();
  const router = useRouter();

  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<(number | null)[]>([]);
  const [finished, setFinished] = useState(false);
  const [fileName, setFileName] = useState('Quiz');

  useEffect(() => {
    try {
      const rawQuiz = params.quizData;
      const rawFileName = params.fileName;
      const quizDataStr = Array.isArray(rawQuiz) ? rawQuiz[0] : rawQuiz ?? '[]';
      const quizData = JSON.parse(decodeURIComponent(quizDataStr));
      setQuestions(Array.isArray(quizData) ? quizData : []);
      setSelectedAnswers(new Array(Array.isArray(quizData) ? quizData.length : 0).fill(null));
      if (rawFileName) {
        const fn = Array.isArray(rawFileName) ? rawFileName[0] : rawFileName;
        setFileName(decodeURIComponent(fn));
      }
    } catch (e) {
      console.error('Failed to parse quiz data', e);
      Alert.alert('Error', 'Failed to load quiz');
      router.back();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.quizData, params.fileName]);

  if (questions.length === 0) return null;

  const current = questions[currentIndex];
  const answered = selectedAnswers[currentIndex] !== null;
  const score = selectedAnswers.filter((ans, idx) => ans === questions[idx]?.correctIndex).length;
  const percentage = Math.round((score / questions.length) * 100);

  const handleSelectAnswer = (index: number) => {
    const newAnswers = [...selectedAnswers];
    newAnswers[currentIndex] = index;
    setSelectedAnswers(newAnswers);
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      setFinished(true);
      // Save quiz completion
      const finalScore = selectedAnswers.filter((ans, idx) => ans === questions[idx]?.correctIndex).length;
      (async () => {
        try {
          const uid = user?.uid || 'anonymous';
          const quizKey = `lastQuiz_${uid}`;
          await AsyncStorage.setItem(quizKey, JSON.stringify({
            title: fileName,
            completed: true,
            score: finalScore,
            total: questions.length,
            percentage: Math.round((finalScore / questions.length) * 100),
            timestamp: Date.now(),
          }));
        } catch (e) {
          console.warn('Failed to save quiz completion', e);
        }
      })();
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) setCurrentIndex(currentIndex - 1);
  };

  const handleRestart = () => {
    setCurrentIndex(0);
    setSelectedAnswers(new Array(questions.length).fill(null));
    setFinished(false);
  };

  // Get performance level and feedback based on score
  const getPerformanceLevel = (percentage: number) => {
    if (percentage === 100) {
      return {
        level: 'Perfect!',
        icon: '🏆',
        bgColor: '#FFD700',
        message: 'Absolutely outstanding! You have complete mastery of this material.',
        tone: 'celebratory',
        subColor: '#FFA500',
      };
    } else if (percentage >= 90) {
      return {
        level: 'Excellent',
        icon: '⭐',
        bgColor: '#4CAF50',
        message: 'Fantastic work! You have excellent understanding of the concepts.',
        tone: 'celebratory',
        subColor: '#45a049',
      };
    } else if (percentage >= 80) {
      return {
        level: 'Great',
        icon: '✨',
        bgColor: '#2196F3',
        message: 'Very good job! You have a solid grasp of the material.',
        tone: 'positive',
        subColor: '#0b7dda',
      };
    } else if (percentage >= 70) {
      return {
        level: 'Good',
        icon: '👍',
        bgColor: '#00BCD4',
        message: 'Nice work! You\'re on the right track. Keep up the momentum!',
        tone: 'positive',
        subColor: '#0097a7',
      };
    } else if (percentage >= 60) {
      return {
        level: 'Fair',
        icon: '💪',
        bgColor: '#FF9800',
        message: 'Good effort! You\'re making progress. Review the material and try again to improve.',
        tone: 'motivating',
        subColor: '#F57C00',
      };
    } else if (percentage >= 50) {
      return {
        level: 'Need Practice',
        icon: '🌱',
        bgColor: '#FF6F00',
        message: 'You\'re on the journey! Each attempt helps you learn. Review the key concepts and try again.',
        tone: 'motivating',
        subColor: '#E65100',
      };
    } else {
      return {
        level: 'Getting Started',
        icon: '🚀',
        bgColor: '#E91E63',
        message: 'Don\'t worry! Learning takes time. Review the material carefully and give it another shot.',
        tone: 'supportive',
        subColor: '#C2185B',
      };
    }
  };

  const performance = getPerformanceLevel(percentage);

  // Result screen
  if (finished) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <ScrollView contentContainerStyle={styles.resultContent}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="chevron-back" size={24} color={colors.text} />
          </TouchableOpacity>

          <View style={[styles.celebrateIcon, { backgroundColor: performance.bgColor + '30' }]}>
            <Text style={styles.celebrateEmoji}>{performance.icon}</Text>
          </View>

          <Text style={[styles.resultTitle, { color: colors.text }]}>{performance.level}</Text>
          <Text style={[styles.resultMessage, { color: colors.textSecondary }]}>
            {performance.message}
          </Text>

          <View style={[styles.scoreBox, { backgroundColor: performance.bgColor }]}>
            <Text style={styles.scoreText}>{percentage}%</Text>
            <Text style={styles.scoreLabel}>Score</Text>
          </View>

          <View style={styles.perfBox}>
            <Text style={[styles.perfTitle, { color: colors.text }]}>How You Did</Text>
            <View style={styles.perfRow}>
              <Text style={[styles.perfLabel, { color: colors.textSecondary }]}>Correct Answers</Text>
              <Text style={[styles.perfValue, { color: performance.bgColor }]}>{score}/{questions.length}</Text>
            </View>
            <View style={styles.perfRow}>
              <Text style={[styles.perfLabel, { color: colors.textSecondary }]}>Accuracy</Text>
              <Text style={[styles.perfValue, { color: performance.bgColor }]}>{percentage}%</Text>
            </View>
            {percentage < 100 && (
              <View style={styles.perfRow}>
                <Text style={[styles.perfLabel, { color: colors.textSecondary }]}>Questions to Review</Text>
                <Text style={[styles.perfValue, { color: '#FF9800' }]}>{questions.length - score}</Text>
              </View>
            )}
          </View>

          {percentage < 70 && (
            <View style={[styles.suggestedActionsBox, { backgroundColor: colors.card, borderColor: performance.bgColor }]}>
              <Text style={[styles.suggestedTitle, { color: colors.text }]}>Suggested Next Steps</Text>
              <View style={styles.suggestionItem}>
                <Ionicons name="book-outline" size={18} color={performance.bgColor} />
                <Text style={[styles.suggestionText, { color: colors.text }]}>Review the material carefully</Text>
              </View>
              <View style={styles.suggestionItem}>
                <Ionicons name="time-outline" size={18} color={performance.bgColor} />
                <Text style={[styles.suggestionText, { color: colors.text }]}>Take a break and try again later</Text>
              </View>
              <View style={styles.suggestionItem}>
                <Ionicons name="bulb-outline" size={18} color={performance.bgColor} />
                <Text style={[styles.suggestionText, { color: colors.text }]}>Focus on the difficult concepts</Text>
              </View>
            </View>
          )}

          <TouchableOpacity style={[styles.button, { backgroundColor: performance.bgColor }]} onPress={handleRestart}>
            <Ionicons name="reload" size={20} color="#FFF" style={{ marginRight: 8 }} />
            <Text style={styles.buttonText}>Try Again</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.button, { backgroundColor: colors.border }]} onPress={() => router.push('/(tabs)/study' as any)}>
            <Ionicons name="arrow-back" size={20} color={colors.text} style={{ marginRight: 8 }} />
            <Text style={[styles.buttonText, { color: colors.text }]}>Back to Study</Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // Quiz screen
  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>
          {fileName.length > 20 ? fileName.substring(0, 17) + '...' : fileName}
        </Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.progressContainer}>
          <View style={[styles.progressBar, { width: `${((currentIndex + 1) / questions.length) * 100}%`, backgroundColor: colors.primary }]} />
        </View>
        <Text style={[styles.progressText, { color: colors.textSecondary }]}>
          Question {currentIndex + 1} of {questions.length}
        </Text>

        <Text style={[styles.questionText, { color: colors.text }]}>{current.question}</Text>

        <View style={styles.optionsContainer}>
          {current.options.map((option, idx) => {
            const isSelected = selectedAnswers[currentIndex] === idx;
            const isCorrect = idx === current.correctIndex;
            const showResult = answered && (isSelected || isCorrect);
            const bgColor = showResult
              ? isCorrect
                ? '#D4EDDA'
                : isSelected && !isCorrect
                ? '#F8D7DA'
                : 'transparent'
              : isSelected
              ? '#E3F2FD'
              : 'transparent';
            const borderColor = isSelected ? colors.primary : colors.border;

            return (
              <TouchableOpacity
                key={idx}
                style={[styles.option, { backgroundColor: bgColor, borderColor, borderWidth: 1 }]}
                onPress={() => handleSelectAnswer(idx)}
                disabled={answered}
              >
                <Text style={[styles.optionText, { color: colors.text }]}>{option}</Text>
                {showResult && isCorrect && <Ionicons name="checkmark-circle" size={20} color="#28A745" />}
                {showResult && isSelected && !isCorrect && <Ionicons name="close-circle" size={20} color="#DC3545" />}
              </TouchableOpacity>
            );
          })}
        </View>

        {answered && current.explanation && (
          <View style={[styles.explanationBox, { backgroundColor: '#F3F5F7' }]}>
            <Text style={[styles.explanationTitle, { color: colors.text }]}>Explanation</Text>
            <Text style={[styles.explanationText, { color: colors.textSecondary }]}>{current.explanation}</Text>
          </View>
        )}

        <View style={styles.navButtons}>
          <TouchableOpacity
            style={[styles.navBtn, { backgroundColor: currentIndex === 0 ? '#E3E3E3' : colors.primary }]}
            onPress={handlePrev}
            disabled={currentIndex === 0}
          >
            <Text style={styles.navBtnText}>Previous</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.navBtn, { backgroundColor: answered ? colors.primary : '#E3E3E3' }]}
            onPress={handleNext}
            disabled={!answered}
          >
            <Text style={styles.navBtnText}>{currentIndex === questions.length - 1 ? 'Finish' : 'Next'}</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1 },
  headerTitle: { fontSize: 16, fontWeight: '600', flex: 1, textAlign: 'center' },
  content: { padding: 16 },
  progressContainer: { height: 4, borderRadius: 2, backgroundColor: '#E3E3E3', marginBottom: 8, overflow: 'hidden' },
  progressBar: { height: '100%' },
  progressText: { fontSize: 12, marginBottom: 16 },
  questionText: { fontSize: 18, fontWeight: '700', marginBottom: 20, lineHeight: 24 },
  optionsContainer: { marginBottom: 24 },
  option: { padding: 14, borderRadius: 10, marginBottom: 12, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  optionText: { fontSize: 14, fontWeight: '500', flex: 1 },
  explanationBox: { padding: 12, borderRadius: 10, marginBottom: 16 },
  explanationTitle: { fontWeight: '700', marginBottom: 6 },
  explanationText: { fontSize: 13, lineHeight: 18 },
  navButtons: { flexDirection: 'row', justifyContent: 'space-between', gap: 12, marginTop: 20, marginBottom: 20 },
  navBtn: { flex: 1, paddingVertical: 12, borderRadius: 10, alignItems: 'center' },
  navBtnText: { color: '#FFF', fontWeight: '700', fontSize: 14 },
  resultContent: { padding: 20, alignItems: 'center' },
  backBtn: { alignSelf: 'flex-start', marginBottom: 16 },
  celebrateIcon: { width: 80, height: 80, borderRadius: 40, justifyContent: 'center', alignItems: 'center', marginBottom: 20 },
  celebrateEmoji: { fontSize: 48 },
  resultTitle: { fontSize: 28, fontWeight: '800', marginBottom: 8 },
  resultMessage: { fontSize: 14, marginBottom: 24, textAlign: 'center', lineHeight: 20 },
  scoreBox: { width: '100%', paddingVertical: 28, borderRadius: 16, alignItems: 'center', marginBottom: 24, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 5 },
  scoreText: { fontSize: 56, fontWeight: '800', color: '#FFF' },
  scoreLabel: { color: '#FFF', fontWeight: '600', fontSize: 14, marginTop: 4 },
  perfBox: { width: '100%', padding: 16, borderRadius: 12, backgroundColor: '#F3F5F7', marginBottom: 20 },
  perfTitle: { fontWeight: '700', marginBottom: 14, fontSize: 14 },
  perfRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12, paddingBottom: 12, borderBottomWidth: 1, borderBottomColor: '#E0E0E0' },
  perfLabel: { fontSize: 13 },
  perfValue: { fontWeight: '700', fontSize: 13 },
  suggestedActionsBox: { width: '100%', padding: 16, borderRadius: 12, borderLeftWidth: 4, marginBottom: 20 },
  suggestedTitle: { fontWeight: '700', marginBottom: 12, fontSize: 14 },
  suggestionItem: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  suggestionText: { fontSize: 13, marginLeft: 10, flex: 1 },
  button: { width: '100%', paddingVertical: 14, borderRadius: 10, alignItems: 'center', justifyContent: 'center', marginBottom: 12, flexDirection: 'row' },
  buttonText: { color: '#FFF', fontWeight: '700', fontSize: 15 },
});
