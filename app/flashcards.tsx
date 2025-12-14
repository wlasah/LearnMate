import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../contexts/ThemeContext';

interface Flashcard {
  id: number;
  front: string;
  back: string;
  learned?: boolean;
}

export default function Flashcards() {
  const { colors } = useTheme();
  const params = useLocalSearchParams();
  const router = useRouter();

  const [cards, setCards] = useState<Flashcard[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [learned, setLearned] = useState<boolean[]>([]);
  const [fileName, setFileName] = useState('Flashcards');
  const [finished, setFinished] = useState(false);

  useEffect(() => {
    try {
      const rawCards = params.cardsData;
      const cardsDataStr = Array.isArray(rawCards) ? rawCards[0] : rawCards ?? '[]';
      const cardsData = JSON.parse(decodeURIComponent(cardsDataStr));
      setCards(Array.isArray(cardsData) ? cardsData : []);
      setLearned(new Array(Array.isArray(cardsData) ? cardsData.length : 0).fill(false));
      if (params.fileName) {
        const fn = Array.isArray(params.fileName) ? params.fileName[0] : params.fileName;
        setFileName(decodeURIComponent(fn));
      }
    } catch (e) {
      console.error('Failed to parse flashcard data', e);
      Alert.alert('Error', 'Failed to load flashcards');
      router.back();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.cardsData, params.fileName]);

  if (cards.length === 0) return null;

  const current = cards[currentIndex];
  const learnedCount = learned.filter(Boolean).length;

  const handleMarkLearned = () => {
    const newLearned = [...learned];
    newLearned[currentIndex] = !newLearned[currentIndex];
    setLearned(newLearned);
  };

  const handleNext = () => {
    if (currentIndex < cards.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setFlipped(false);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setFlipped(false);
    }
  };

  const handleRestart = () => {
    setCurrentIndex(0);
    setFlipped(false);
    setLearned(new Array(cards.length).fill(false));
    setFinished(false);
  };

  // Get performance level and feedback based on learned cards
  const getFlashcardPerformance = (learnedCount: number, totalCards: number) => {
    const percentage = Math.round((learnedCount / totalCards) * 100);
    
    if (percentage === 100) {
      return {
        level: 'Perfect Mastery!',
        icon: '🏆',
        bgColor: '#FFD700',
        message: 'Outstanding! You\'ve mastered all the flashcards!',
        subColor: '#FFA500',
      };
    } else if (percentage >= 80) {
      return {
        level: 'Excellent Progress',
        icon: '⭐',
        bgColor: '#4CAF50',
        message: 'Great job! You\'ve learned most of the material.',
        subColor: '#45a049',
      };
    } else if (percentage >= 60) {
      return {
        level: 'Good Progress',
        icon: '✨',
        bgColor: '#2196F3',
        message: 'You\'re making solid progress! Keep reviewing.',
        subColor: '#0b7dda',
      };
    } else if (percentage >= 40) {
      return {
        level: 'Keep Going',
        icon: '💪',
        bgColor: '#FF9800',
        message: 'Nice effort! Review the remaining cards and try again.',
        subColor: '#F57C00',
      };
    } else {
      return {
        level: 'Getting Started',
        icon: '🌱',
        bgColor: '#E91E63',
        message: 'You\'re on your learning journey! Repeat the flashcards to improve.',
        subColor: '#C2185B',
      };
    }
  };

  const flashcardPerformance = getFlashcardPerformance(learnedCount, cards.length);

  // Flashcard completion screen
  if (finished) {
    const percentage = Math.round((learnedCount / cards.length) * 100);
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <ScrollView contentContainerStyle={styles.resultContent}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="chevron-back" size={24} color={colors.text} />
          </TouchableOpacity>

          <View style={[styles.celebrateIcon, { backgroundColor: flashcardPerformance.bgColor + '30' }]}>
            <Text style={styles.celebrateEmoji}>{flashcardPerformance.icon}</Text>
          </View>

          <Text style={[styles.resultTitle, { color: colors.text }]}>{flashcardPerformance.level}</Text>
          <Text style={[styles.resultMessage, { color: colors.textSecondary }]}>
            {flashcardPerformance.message}
          </Text>

          <View style={[styles.scoreBox, { backgroundColor: flashcardPerformance.bgColor }]}>
            <Text style={styles.scoreText}>{percentage}%</Text>
            <Text style={styles.scoreLabel}>Mastery</Text>
          </View>

          <View style={styles.perfBox}>
            <Text style={[styles.perfTitle, { color: colors.text }]}>Your Results</Text>
            <View style={styles.perfRow}>
              <Text style={[styles.perfLabel, { color: colors.textSecondary }]}>Cards Learned</Text>
              <Text style={[styles.perfValue, { color: flashcardPerformance.bgColor }]}>{learnedCount}/{cards.length}</Text>
            </View>
            <View style={styles.perfRow}>
              <Text style={[styles.perfLabel, { color: colors.textSecondary }]}>Mastery Rate</Text>
              <Text style={[styles.perfValue, { color: flashcardPerformance.bgColor }]}>{percentage}%</Text>
            </View>
            {percentage < 100 && (
              <View style={styles.perfRow}>
                <Text style={[styles.perfLabel, { color: colors.textSecondary }]}>Cards to Review</Text>
                <Text style={[styles.perfValue, { color: '#FF9800' }]}>{cards.length - learnedCount}</Text>
              </View>
            )}
          </View>

          {percentage < 80 && (
            <View style={[styles.suggestedActionsBox, { backgroundColor: colors.card, borderColor: flashcardPerformance.bgColor }]}>
              <Text style={[styles.suggestedTitle, { color: colors.text }]}>Suggested Next Steps</Text>
              <View style={styles.suggestionItem}>
                <Ionicons name="reload" size={18} color={flashcardPerformance.bgColor} />
                <Text style={[styles.suggestionText, { color: colors.text }]}>Review the cards you missed</Text>
              </View>
              <View style={styles.suggestionItem}>
                <Ionicons name="time-outline" size={18} color={flashcardPerformance.bgColor} />
                <Text style={[styles.suggestionText, { color: colors.text }]}>Practice again in a few hours</Text>
              </View>
              <View style={styles.suggestionItem}>
                <Ionicons name="bulb-outline" size={18} color={flashcardPerformance.bgColor} />
                <Text style={[styles.suggestionText, { color: colors.text }]}>Focus on difficult terms</Text>
              </View>
            </View>
          )}

          <TouchableOpacity style={[styles.button, { backgroundColor: flashcardPerformance.bgColor }]} onPress={handleRestart}>
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
        {/* Progress */}
        <View style={styles.progressContainer}>
          <View style={[styles.progressBar, { width: `${((currentIndex + 1) / cards.length) * 100}%`, backgroundColor: colors.primary }]} />
        </View>
        <Text style={[styles.progressText, { color: colors.textSecondary }]}>
          Card {currentIndex + 1} of {cards.length} • Learned: {learnedCount}
        </Text>

        {/* Flashcard */}
        <TouchableOpacity
          style={[styles.card, { backgroundColor: flipped ? '#20B2AA' : colors.primary }]}
          onPress={() => setFlipped(!flipped)}
          activeOpacity={0.8}
        >
          <View style={styles.cardContent}>
            <Text style={styles.cardLabel}>{flipped ? 'Definition' : 'Term'}</Text>
            <Text style={styles.cardText}>{flipped ? current.back : current.front}</Text>
            <Text style={styles.cardHint}>Tap to flip</Text>
          </View>
        </TouchableOpacity>

        {/* Mark Learned Button */}
        <TouchableOpacity
          style={[styles.learnedBtn, { backgroundColor: learned[currentIndex] ? '#2FB46E' : '#E3E3E3' }]}
          onPress={handleMarkLearned}
        >
          <Ionicons name={(learned[currentIndex] ? 'checkmark-circle' : 'circle-outline') as any} size={20} color={learned[currentIndex] ? '#FFF' : colors.text} />
          <Text style={[styles.learnedBtnText, { color: learned[currentIndex] ? '#FFF' : colors.text }]}>
            {learned[currentIndex] ? 'Learned' : 'Mark as Learned'}
          </Text>
        </TouchableOpacity>

        {/* Navigation */}
        <View style={styles.navButtons}>
          <TouchableOpacity
            style={[styles.navBtn, { backgroundColor: currentIndex === 0 ? '#E3E3E3' : colors.primary }]}
            onPress={handlePrev}
            disabled={currentIndex === 0}
          >
            <Ionicons name="chevron-back" size={20} color={currentIndex === 0 ? '#999' : '#FFF'} />
            <Text style={[styles.navBtnText, { color: currentIndex === 0 ? '#999' : '#FFF' }]}>Previous</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.navBtn, { backgroundColor: currentIndex === cards.length - 1 ? '#2FB46E' : colors.primary }]}
            onPress={handleNext}
            disabled={currentIndex === cards.length - 1}
          >
            <Text style={[styles.navBtnText, { color: '#FFF' }]}>
              {currentIndex === cards.length - 1 ? 'Done' : 'Next'}
            </Text>
            {currentIndex < cards.length - 1 && <Ionicons name="chevron-forward" size={20} color="#FFF" />}
          </TouchableOpacity>
        </View>

        {/* Finish Button */}
        {currentIndex === cards.length - 1 && (
          <TouchableOpacity style={[styles.finishBtn, { backgroundColor: flashcardPerformance.bgColor }]} onPress={() => setFinished(true)}>
            <Ionicons name="checkmark-circle" size={20} color="#FFF" style={{ marginRight: 8 }} />
            <Text style={styles.finishBtnText}>See Results</Text>
          </TouchableOpacity>
        )}
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
  progressText: { fontSize: 12, marginBottom: 24 },
  card: { height: 280, borderRadius: 16, padding: 24, justifyContent: 'center', alignItems: 'center', marginBottom: 24, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.15, shadowRadius: 8, elevation: 5 },
  cardContent: { alignItems: 'center' },
  cardLabel: { color: 'rgba(255,255,255,0.7)', fontSize: 12, fontWeight: '600', marginBottom: 12 },
  cardText: { color: '#FFF', fontSize: 24, fontWeight: '700', textAlign: 'center', lineHeight: 32 },
  cardHint: { color: 'rgba(255,255,255,0.5)', fontSize: 11, marginTop: 16 },
  learnedBtn: { flexDirection: 'row', paddingVertical: 12, paddingHorizontal: 16, borderRadius: 10, alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 16 },
  learnedBtnText: { fontWeight: '600', fontSize: 14 },
  navButtons: { flexDirection: 'row', justifyContent: 'space-between', gap: 12, marginBottom: 16 },
  navBtn: { flex: 1, flexDirection: 'row', paddingVertical: 12, borderRadius: 10, alignItems: 'center', justifyContent: 'center', gap: 6 },
  navBtnText: { fontWeight: '700', fontSize: 14 },
  finishBtn: { paddingVertical: 14, borderRadius: 10, alignItems: 'center', flexDirection: 'row', justifyContent: 'center', marginBottom: 20 },
  finishBtnText: { color: '#FFF', fontWeight: '700', fontSize: 15 },
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
