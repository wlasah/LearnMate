import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../contexts/ThemeContext';

// Parse markdown-style headers and formatting
const parseMarkdownContent = (text: string) => {
  if (!text) return [];

  const lines = text.split('\n');
  const sections = [];
  let currentSection = null;

  lines.forEach((line) => {
    const trimmed = line.trim();
    if (trimmed.startsWith('##')) {
      if (currentSection) sections.push(currentSection);
      currentSection = {
        type: 'section',
        title: trimmed.replace(/^##\s+/, ''),
        content: [],
      };
    } else if (trimmed.startsWith('-') && currentSection) {
      currentSection.content.push(trimmed.replace(/^-\s+/, ''));
    } else if (trimmed && currentSection) {
      currentSection.content.push(trimmed);
    } else if (trimmed && !currentSection) {
      sections.push({ type: 'text', content: trimmed });
    }
  });

  if (currentSection) sections.push(currentSection);
  return sections;
};

export default function AIResult() {
  const { colors } = useTheme();
  const router = useRouter();
  const [data, setData] = useState<any>(null);
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [userAnswers, setUserAnswers] = useState<Record<number, number>>({});
  const [isQuizComplete, setIsQuizComplete] = useState(false);

  useEffect(() => {
    (async () => {
      const raw = await AsyncStorage.getItem('lastAiResult');
      if (raw) setData(JSON.parse(raw));
    })();
  }, []);

  // Get performance level based on score
  const getPerformanceLevel = (percentage: number, method: string) => {
    const suffix = method === 'practice' ? 'Practice Test' : 'Quiz';
    
    if (percentage === 100) {
      return {
        level: 'Perfect!',
        icon: '🏆',
        bgColor: '#FFD700',
        message: `Absolutely outstanding! You scored 100% on this ${suffix}!`,
        tone: 'celebratory',
        subColor: '#FFA500',
      };
    } else if (percentage >= 90) {
      return {
        level: 'Excellent',
        icon: '⭐',
        bgColor: '#4CAF50',
        message: `Fantastic work! You have excellent understanding for this ${suffix}.`,
        tone: 'celebratory',
        subColor: '#45a049',
      };
    } else if (percentage >= 80) {
      return {
        level: 'Great',
        icon: '✨',
        bgColor: '#2196F3',
        message: `Very good job! You have a solid grasp of this ${suffix} material.`,
        tone: 'positive',
        subColor: '#0b7dda',
      };
    } else if (percentage >= 70) {
      return {
        level: 'Good',
        icon: '👍',
        bgColor: '#00BCD4',
        message: `Nice work! You're on the right track. Keep practicing!`,
        tone: 'positive',
        subColor: '#0097a7',
      };
    } else if (percentage >= 60) {
      return {
        level: 'Fair',
        icon: '💪',
        bgColor: '#FF9800',
        message: `Good effort! You're making progress. Review and try again to improve.`,
        tone: 'motivating',
        subColor: '#F57C00',
      };
    } else if (percentage >= 50) {
      return {
        level: 'Need Practice',
        icon: '🌱',
        bgColor: '#FF6F00',
        message: `You're learning! Each attempt helps. Review the material and try again.`,
        tone: 'motivating',
        subColor: '#E65100',
      };
    } else {
      return {
        level: 'Getting Started',
        icon: '🚀',
        bgColor: '#E91E63',
        message: `Don't worry! Learning takes time. Review carefully and try again.`,
        tone: 'supportive',
        subColor: '#C2185B',
      };
    }
  };

  if (!data) return null;

  const { ai, method } = data;
  const isQuestionBased = Array.isArray(ai) && (method === 'quiz' || method === 'practice');
  const isSummary = method === 'summary';
  const isFlashcard = method === 'flashcards';

  // Handle summary or flashcard display (show all at once)
  if (isSummary || isFlashcard) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <ScrollView contentContainerStyle={styles.content}>
          <Text style={[styles.heading, { color: colors.text }]}>Study Results</Text>
          <Text style={[styles.sub, { color: colors.textSecondary }]}>
            Method: {getMethodName(method)}
          </Text>

          {isSummary && renderSummary(ai, colors)}
          {isFlashcard && renderFlashcards(ai, colors)}

          <TouchableOpacity style={[styles.button, { backgroundColor: colors.primary }]} onPress={() => router.push('/(tabs)/study' as any)}>
            <Text style={[styles.buttonText, { color: colors.surface }]}>Back to Study</Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // Question-based display (quiz/practice - one per page)
  if (isQuestionBased && Array.isArray(ai)) {
    const currentQuestion = ai[currentQuestionIdx];
    const totalQuestions = ai.length;
    const selectedAnswer = userAnswers[currentQuestionIdx];
    const isLastQuestion = currentQuestionIdx === totalQuestions - 1;

    if (isQuizComplete) {
      const correctCount = Object.keys(userAnswers).filter(idx => userAnswers[+idx] === ai[+idx].correctIndex).length;
      const percentage = Math.round((correctCount / totalQuestions) * 100);
      const performance = getPerformanceLevel(percentage, method);

      return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
          <ScrollView contentContainerStyle={styles.resultHeaderSection}>
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
                <Text style={[styles.perfValue, { color: performance.bgColor }]}>{correctCount}/{totalQuestions}</Text>
              </View>
              <View style={styles.perfRow}>
                <Text style={[styles.perfLabel, { color: colors.textSecondary }]}>Accuracy</Text>
                <Text style={[styles.perfValue, { color: performance.bgColor }]}>{percentage}%</Text>
              </View>
              {percentage < 100 && (
                <View style={styles.perfRow}>
                  <Text style={[styles.perfLabel, { color: colors.textSecondary }]}>Questions to Review</Text>
                  <Text style={[styles.perfValue, { color: '#FF9800' }]}>{totalQuestions - correctCount}</Text>
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
                  <Text style={[styles.suggestionText, { color: colors.text }]}>Focus on the difficult questions</Text>
                </View>
              </View>
            )}

            <View style={styles.buttonGroup}>
              <TouchableOpacity style={[styles.button, { backgroundColor: performance.bgColor }]} onPress={() => setIsQuizComplete(false)}>
                <Ionicons name="reload" size={20} color="#FFF" style={{ marginRight: 8 }} />
                <Text style={styles.buttonText}>Try Again</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.button, { backgroundColor: colors.border }]} onPress={() => router.push('/(tabs)/study' as any)}>
                <Ionicons name="arrow-back" size={20} color={colors.text} style={{ marginRight: 8 }} />
                <Text style={[styles.buttonText, { color: colors.text }]}>Back to Study</Text>
              </TouchableOpacity>
            </View>

            <Text style={[styles.answersHeading, { color: colors.text }]}>Review Your Answers</Text>
          </ScrollView>

          <ScrollView contentContainerStyle={styles.answersSection}>
            {/* Show all answers */}
            {ai.map((question, idx) => {
              const userAnswer = userAnswers[idx];
              const isCorrect = userAnswer === question.correctIndex;
              return (
                <View key={idx} style={[styles.resultCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                  <Text style={[styles.itemNumber, { color: colors.primary }]}>Question {idx + 1}</Text>
                  <Text style={[styles.itemText, { color: colors.text }]}>{question.question}</Text>
                  
                  {question.options && (
                    <>
                      <Text style={[styles.label, { color: colors.textSecondary, marginTop: 8 }]}>Options:</Text>
                      {question.options.map((opt, oidx) => {
                        const isUserSelected = userAnswer === oidx;
                        const isCorrectAnswer = oidx === question.correctIndex;
                        const bgColor = isUserSelected 
                          ? (isCorrect ? colors.success || '#10b981' : '#ef4444')
                          : (isCorrectAnswer ? colors.success || '#10b981' : 'transparent');
                        
                        return (
                          <View 
                            key={oidx} 
                            style={[
                              styles.resultOption,
                              { 
                                backgroundColor: bgColor,
                                borderColor: colors.border,
                                opacity: isUserSelected || isCorrectAnswer ? 1 : 0.6
                              }
                            ]}
                          >
                            <Text style={[styles.resultOptionText, { color: isUserSelected || isCorrectAnswer ? '#fff' : colors.text }]}>
                              {opt}
                            </Text>
                          </View>
                        );
                      })}
                    </>
                  )}

                  <View style={{ marginTop: 12 }}>
                    <Text style={[styles.label, { color: colors.textSecondary }]}>
                      {isCorrect ? '✓ Correct!' : `✗ Incorrect. Correct answer: ${String.fromCharCode(65 + question.correctIndex)}`}
                    </Text>
                  </View>
                </View>
              );
            })}

            <TouchableOpacity style={[styles.button, { backgroundColor: colors.primary }]} onPress={() => router.push('/(tabs)/study' as any)}>
              <Text style={[styles.buttonText, { color: colors.surface }]}>Done</Text>
            </TouchableOpacity>
          </ScrollView>
        </SafeAreaView>
      );
    }

    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <ScrollView contentContainerStyle={styles.content}>
          <View style={styles.header}>
            <Text style={[styles.heading, { color: colors.text }]}>
              Question {currentQuestionIdx + 1} of {totalQuestions}
            </Text>
            <View style={[styles.progressBar, { backgroundColor: colors.border }]}>
              <View 
                style={[
                  styles.progressFill, 
                  { 
                    backgroundColor: colors.primary,
                    width: `${((currentQuestionIdx + 1) / totalQuestions) * 100}%`
                  }
                ]} 
              />
            </View>
          </View>

          <Text style={[styles.sub, { color: colors.textSecondary }]}>
            Method: {getMethodName(method)}
          </Text>

          {/* Question Card */}
          <View style={[styles.questionCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Text style={[styles.questionText, { color: colors.text }]}>
              {currentQuestion.question}
            </Text>

            {currentQuestion.difficulty && (
              <Text style={[styles.difficulty, { color: colors.textSecondary, marginTop: 8 }]}>
                Difficulty: {currentQuestion.difficulty}
              </Text>
            )}

            {/* Answer Options */}
            {currentQuestion.options && (
              <View style={{ marginTop: 16 }}>
                <Text style={[styles.label, { color: colors.textSecondary, marginBottom: 12 }]}>
                  Select your answer:
                </Text>
                {currentQuestion.options.map((option, oidx) => {
                  const isSelected = selectedAnswer === oidx;
                  return (
                    <TouchableOpacity
                      key={oidx}
                      onPress={() => setUserAnswers({ ...userAnswers, [currentQuestionIdx]: oidx })}
                      style={[
                        styles.answerOption,
                        {
                          backgroundColor: isSelected ? colors.primary : colors.background,
                          borderColor: isSelected ? colors.primary : colors.border,
                          borderWidth: isSelected ? 2 : 1,
                        }
                      ]}
                    >
                      <Text style={[
                        styles.answerText,
                        { color: isSelected ? colors.surface : colors.text }
                      ]}>
                        {option}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            )}
          </View>

          {/* Navigation Buttons */}
          <View style={styles.buttonGroup}>
            <TouchableOpacity
              style={[
                styles.navButton,
                { 
                  backgroundColor: currentQuestionIdx === 0 ? colors.border : colors.primary,
                  opacity: currentQuestionIdx === 0 ? 0.5 : 1,
                }
              ]}
              onPress={() => setCurrentQuestionIdx(currentQuestionIdx - 1)}
              disabled={currentQuestionIdx === 0}
            >
              <Text style={[styles.navButtonText, { color: colors.surface }]}>← Previous</Text>
            </TouchableOpacity>

            {isLastQuestion ? (
              <TouchableOpacity
                style={[styles.navButton, { backgroundColor: colors.success || '#10b981' }]}
                onPress={() => setIsQuizComplete(true)}
              >
                <Text style={[styles.navButtonText, { color: colors.surface }]}>Finish →</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={[styles.navButton, { backgroundColor: colors.primary }]}
                onPress={() => setCurrentQuestionIdx(currentQuestionIdx + 1)}
              >
                <Text style={[styles.navButtonText, { color: colors.surface }]}>Next →</Text>
              </TouchableOpacity>
            )}
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // Fallback
  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={[styles.heading, { color: colors.text }]}>Study Results</Text>
        <TouchableOpacity style={[styles.button, { backgroundColor: colors.primary }]} onPress={() => router.push('/(tabs)/study' as any)}>
          <Text style={[styles.buttonText, { color: colors.surface }]}>Back to Study</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const getMethodName = (method: string) => {
  const methodMap: Record<string, string> = {
    quiz: 'Quiz',
    practice: 'Practice Test',
    flashcards: 'Flashcards',
    summary: 'Summary',
  };
  return methodMap[method] || method;
};

const renderSummary = (ai: any, colors: any) => {
  const sections = parseMarkdownContent(ai);
  return (
    <View>
      {sections.map((section, idx) =>
        section.type === 'section' ? (
          <View key={idx} style={[styles.summarySection, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Text style={[styles.sectionTitle, { color: colors.primary }]}>{section.title}</Text>
            {section.content.map((line, lidx) => (
              <Text key={lidx} style={[styles.sectionText, { color: colors.text }]}>
                {line.startsWith('-') ? `  • ${line.replace(/^-\s+/, '')}` : line}
              </Text>
            ))}
          </View>
        ) : (
          <Text key={idx} style={[styles.sectionText, { color: colors.text }]}>
            {section.content}
          </Text>
        )
      )}
    </View>
  );
};

const renderFlashcards = (ai: any, colors: any) => {
  return (
    <View>
      {ai.map((item, idx) => (
        <View key={idx} style={[styles.itemCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.itemNumber, { color: colors.primary }]}>
            Card {item.id || idx + 1}
          </Text>
          <Text style={[styles.label, { color: colors.textSecondary }]}>Term:</Text>
          <Text style={[styles.itemText, { color: colors.text }]}>{item.front}</Text>
          <Text style={[styles.label, { color: colors.textSecondary, marginTop: 8 }]}>Definition:</Text>
          <Text style={[styles.itemText, { color: colors.text }]}>{item.back}</Text>
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 20, paddingBottom: 40 },
  header: { marginBottom: 16 },
  heading: { fontSize: 20, fontWeight: '800', marginBottom: 8 },
  sub: { marginBottom: 16, fontSize: 14 },
  
  // Result header section (scrollable)
  resultHeaderSection: { padding: 20, paddingBottom: 40, alignItems: 'center' },
  answersSection: { padding: 20, paddingBottom: 40 },
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
  answersHeading: { fontSize: 18, fontWeight: '800', marginBottom: 16, marginTop: 8 },
  
  // Progress bar
  progressBar: { height: 6, borderRadius: 3, overflow: 'hidden', marginBottom: 12 },
  progressFill: { height: '100%', borderRadius: 3 },
  
  // Question card (single page view)
  questionCard: {
    padding: 20,
    borderRadius: 12,
    marginBottom: 24,
    borderWidth: 1,
  },
  questionText: { fontSize: 16, fontWeight: '600', lineHeight: 24 },
  difficulty: { fontSize: 12, fontWeight: '500' },
  
  // Answer options (clickable)
  label: { fontSize: 12, fontWeight: '600', marginBottom: 6, marginTop: 8 },
  answerOption: {
    padding: 14,
    borderRadius: 10,
    marginBottom: 10,
    borderWidth: 1,
    minHeight: 50,
    justifyContent: 'center',
  },
  answerText: { fontSize: 14, fontWeight: '500', lineHeight: 20 },
  
  // Result display
  resultCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
  },
  resultOption: {
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 1,
  },
  resultOptionText: { fontSize: 14, lineHeight: 18, fontWeight: '500' },
  
  // Navigation buttons
  buttonGroup: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  navButton: {
    flex: 1,
    padding: 14,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  navButtonText: { fontWeight: '700', fontSize: 14 },
  
  // Item cards (for flashcards/all-at-once view)
  itemCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderLeftWidth: 4,
  },
  itemNumber: { fontWeight: '700', fontSize: 14, marginBottom: 8 },
  itemText: { fontSize: 15, lineHeight: 22, marginBottom: 8, fontWeight: '500' },
  option: { fontSize: 14, lineHeight: 18, marginBottom: 6, paddingLeft: 12 },
  explanation: { fontSize: 13, marginTop: 8, paddingLeft: 8 },
  correct: { fontSize: 13, fontWeight: '600', marginTop: 8, paddingLeft: 8 },
  
  // Summary content
  summarySection: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderLeftWidth: 4,
  },
  sectionTitle: { fontSize: 16, fontWeight: '700', marginBottom: 12 },
  sectionText: { fontSize: 14, lineHeight: 22, marginBottom: 6 },
  
  // General button
  button: { padding: 14, borderRadius: 10, alignItems: 'center', justifyContent: 'center', marginBottom: 12, flexDirection: 'row' },
  buttonText: { fontWeight: '700', fontSize: 15 },
});
