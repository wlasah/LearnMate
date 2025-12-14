//homescreen index.tsx
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect, useRouter } from 'expo-router';
import React, { useCallback, useState } from 'react';
import {
  Image,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Sidebar } from '../../components/Sidebar';
import { useAuth } from '../../contexts/AuthContext';
import { useNotifications } from '../../contexts/NotificationContext';
import { useTheme } from '../../contexts/ThemeContext';

interface ContinueLearning {
  title: string;
  progress: number;
  total: number;
  lastAccessed?: number;
}

export default function HomeScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { unreadCount } = useNotifications();
  const { colors, isDarkMode } = useTheme();
  const [sidebarVisible, setSidebarVisible] = useState(false);
  const [continueData, setContinueData] = useState<ContinueLearning>({
    title: 'Upload a PDF to start learning',
    progress: 0,
    total: 1,
    lastAccessed: Date.now(),
  });
  const [hasContent, setHasContent] = useState(true);

  // Load continue learning data on focus
  useFocusEffect(
    useCallback(() => {
      loadContinueLearning();
    }, [])
  );

  const loadContinueLearning = async () => {
    try {
      let found = false;

      // Try to load from ai-processing results first (most recent)
      const aiResults = await AsyncStorage.getItem('aiResults');
      if (aiResults) {
        const results = JSON.parse(aiResults);
        if (results && results.length > 0) {
          const lastResult = results[results.length - 1];
          setContinueData({
            title: lastResult.title || 'Continue with AI Generated Content',
            progress: lastResult.completed ? lastResult.items || 1 : 0,
            total: lastResult.items || 10,
            lastAccessed: lastResult.timestamp || Date.now(),
          });
          setHasContent(true);
          return;
        }
      }

      // Try to load from quiz data
      const quizSaved = await AsyncStorage.getItem('lastQuiz');
      if (quizSaved) {
        const quizData = JSON.parse(quizSaved);
        setContinueData({
          title: quizData.title || 'Continue Quiz',
          progress: quizData.completed || 0,
          total: quizData.total || 10,
          lastAccessed: quizData.lastAccessed || Date.now(),
        });
        setHasContent(true);
        return;
      }

      // Try to load from notes
      const notesSaved = await AsyncStorage.getItem('localNotes');
      if (notesSaved) {
        const notes = JSON.parse(notesSaved);
        if (notes.length > 0) {
          const lastNote = notes[notes.length - 1];
          setContinueData({
            title: lastNote.title || 'Continue Reading Notes',
            progress: 1,
            total: 1,
            lastAccessed: lastNote.timestamp || Date.now(),
          });
          setHasContent(true);
          return;
        }
      }

      // Try to load from flashcards
      const cardsSaved = await AsyncStorage.getItem('flashcards');
      if (cardsSaved) {
        const cards = JSON.parse(cardsSaved);
        if (cards.length > 0) {
          setContinueData({
            title: 'Review Flashcards',
            progress: Math.ceil(cards.length / 2),
            total: cards.length,
            lastAccessed: Date.now(),
          });
          setHasContent(true);
          return;
        }
      }

      // No content found
      setContinueData({
        title: 'Upload a PDF to start learning',
        progress: 0,
        total: 1,
        lastAccessed: Date.now(),
      });
      setHasContent(false);
    } catch (e) {
      console.error('Failed to load continue learning data', e);
      setHasContent(false);
    }
  };

  const handleContinuePress = async () => {
    try {
      // Check what type of content to open
      const quizSaved = await AsyncStorage.getItem('lastQuiz');
      if (quizSaved) {
        router.push('/quiz-start' as any);
        return;
      }

      const notesSaved = await AsyncStorage.getItem('localNotes');
      if (notesSaved) {
        router.push('/notes' as any);
        return;
      }

      const cardsSaved = await AsyncStorage.getItem('flashcards');
      if (cardsSaved) {
        router.push('/flashcards' as any);
        return;
      }

      // Default to upload if nothing found
      router.push('/upload-pdf' as any);
    } catch (e) {
      console.error('Error navigating', e);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.headerBg, borderBottomColor: colors.border }]}>
        <TouchableOpacity 
          onPress={() => setSidebarVisible(true)}
          style={styles.menuButton}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="menu" size={28} color={colors.text} />
        </TouchableOpacity>

        <View style={styles.headerCenter}>
        <Text style={[styles.welcomeToText, { color: colors.textSecondary }]}>Welcome to</Text>
          <Image
            source={require('../../assets/images/LearnMate_logo.png')}
            style={[styles.learnmateLogo, { opacity: isDarkMode ? 1.0 : 1 }]}
          />
          <View style={{ position: 'relative' }}>
            <Image
              source={require('../../assets/images/title_logo.png')}
              style={[styles.headerLogo, { opacity: isDarkMode ? 1.0 : 1, zIndex: 1 }]}
            />
            {isDarkMode && (
              <View style={{ position: 'absolute', zIndex: 2, flexDirection: 'row' }}>
                <Text style={styles.learnText}>Learn</Text>
                <Text style={styles.mateText}>Mate</Text>
              </View>
            )}
          </View>
        </View>

        <TouchableOpacity
          onPress={() => router.push('/notifications' as any)}
          style={styles.notificationButton}
        >
          <Ionicons name="notifications" size={28} color={colors.text} />
          {unreadCount > 0 && (
            <View style={[styles.notificationBadge, { backgroundColor: colors.danger, borderColor: colors.surface }]}>
              <Text style={[styles.notificationBadgeText, { color: '#FFFFFF' }]}>
                {unreadCount > 9 ? '9+' : unreadCount}
              </Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {/* Sidebar */}
      <Sidebar visible={sidebarVisible} onClose={() => setSidebarVisible(false)} />

      <ScrollView showsVerticalScrollIndicator={false} style={{ backgroundColor: colors.background }}>
        {/* Continue Learning Card */}
        <TouchableOpacity 
          style={[
            styles.continueCard, 
            { 
              backgroundColor: hasContent ? colors.surface : colors.card,
              borderColor: colors.border 
            }
          ]}
          onPress={handleContinuePress}
          activeOpacity={0.8}
        >
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <View style={{ flex: 1 }}>
              <Text style={[styles.continueTitle, { color: colors.text }]}>
                {hasContent ? 'Continue Learning' : 'Start Learning'}
              </Text>
              <Text 
                style={[styles.continueSubtitle, { color: colors.textSecondary }]} 
                numberOfLines={2}
              >
                {continueData.title}
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.primary} />
          </View>
          
          {/* Progress Bar */}
          {hasContent && (
            <>
              <View style={[styles.progressBarContainer, { backgroundColor: colors.card }]}>
                <View 
                  style={[
                    styles.progressBarFill, 
                    { 
                      backgroundColor: colors.success,
                      width: `${(continueData.progress / continueData.total) * 100}%`
                    }
                  ]} 
                />
              </View>
              
              <Text style={[styles.questionsText, { color: colors.textSecondary }]}>
                {continueData.progress}/{continueData.total} items completed
              </Text>
            </>
          )}
        </TouchableOpacity>

        {/* Action Buttons Grid */}
        <View style={styles.gridContainer}>
          {/* Row 1 */}
          <View style={styles.gridRow}>
            <TouchableOpacity 
              style={[styles.gridItem, { backgroundColor: colors.card, borderColor: colors.primary }]}
              onPress={() => router.push('/upload-pdf')}
            >
                <View style={[styles.iconCircle, { backgroundColor: colors.info, borderColor: colors.border }] }>
                  <Image
                    source={require('../../assets/images/homescreen/pdf upload.png')}
                    style={styles.gridIcon}
                  />
                </View>
              <Text style={[styles.gridLabel, { color: colors.text }]}>Upload{'\n'}PDF</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.gridItem, { backgroundColor: colors.card, borderColor: colors.primary }]}
              onPress={() => router.push('/progress')}
            >
              <View style={[styles.iconCircle, { backgroundColor: colors.info, borderColor: colors.border }] }>
                <Image
                  source={require('../../assets/images/homescreen/white circle.png')}
                  style={styles.whiteCircle}
                />
                <Image
                  source={require('../../assets/images/homescreen/progress.png')}
                  style={[styles.gridIcon, { position: 'absolute' }]}
                />
              </View>
              <Text style={[styles.gridLabel, { color: colors.text }]}>My{'\n'}Progress</Text>
            </TouchableOpacity>
          </View>

          {/* Row 2 */}
          <View style={styles.gridRow}>
            <TouchableOpacity 
              style={[styles.gridItem, { backgroundColor: colors.card, borderColor: colors.primary }]}
              onPress={() => router.push('/learning-goals')}
            >
              <View style={[styles.iconCircle, { backgroundColor: colors.info, borderColor: colors.border }] }>
                <Image
                  source={require('../../assets/images/homescreen/study.png')}
                  style={styles.gridIcon}
                />
              </View>
              <Text style={[styles.gridLabel, { color: colors.text }]}>Study{'\n'}Plan</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.gridItem, { backgroundColor: colors.card, borderColor: colors.primary }]}
              onPress={() => router.push('/notes')}
            >
              <View style={[styles.iconCircle, { backgroundColor: colors.info, borderColor: colors.border }] }>
                <Image
                  source={require('../../assets/images/homescreen/notes.png')}
                  style={styles.gridIcon}
                />
              </View>
              <Text style={[styles.gridLabel, { color: colors.text }]}>Saved{'\n'}Notes</Text>
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
    backgroundColor: '#fdfdfdff',
  },
  header: {
    paddingHorizontal: 10,
    paddingVertical: 50,
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#E6EEF6',
    marginTop: -30,
    marginBottom: 5,
  },
  menuButton: {
    zIndex: 10,
    minWidth: 44,
    minHeight: 44,
    justifyContent: 'center',
    alignItems: 'center',
    top: -20,
  },
  headerCenter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    marginHorizontal: 8,
  },
  welcomeToText: {
    fontSize: 22,
    fontWeight: '500',
    marginRight: -300,
    marginLeft: 210,
    marginTop: -90,
    marginBottom: -110,
  },
  learnmateLogo: {
    width: 300,
    height: 150,
    resizeMode: 'contain',
    marginRight: -10,
    marginLeft: 30,
    marginTop: -80,
    marginBottom: -150,
  },
  headerLogo: {
    width: 300,
    height: 150,
    resizeMode: 'contain',
    marginRight: 80,
    marginLeft: -200,
    marginTop: -6,
    marginBottom: -145,
  },
  titleLogoText: {
    position: 'absolute',
    fontWeight: '900',
    fontSize: 18,
    zIndex: 0,
    top: 45,
    left: 0,
  },
  learnText: {
    fontWeight: '900',
    fontSize: 22.1,
    color: '#90EE90',
    top: 35,
    left: -98,
    letterSpacing: -0.5,

  },
  mateText: {
    fontWeight: '900',
    fontSize: 22,
    color: '#20B2AA',
    top: 35,
    left: -100,
  },
  notificationButton: {
    position: 'relative',
    padding: 20,
    top: -20,
  },
  notificationBadge: {
    position: 'absolute',
    top: 0,
    right: 5,
    backgroundColor: '#FF4B4B',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  notificationBadgeText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 11,
  },
  continueCard: {
    backgroundColor: '#99d8ffff',
    marginHorizontal: 30,
    marginTop: 12,
    marginBottom: 12,
    borderRadius: 16,
    padding: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 2,
    shadowRadius: 8,
    elevation: 15,
    borderWidth: 1,
    borderColor: '#b1b1b1ff',
  },
  continueTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#000000',
    marginBottom: 2,
  },
  continueSubtitle: {
    fontSize: 12,
    color: '#2C3E50',
    marginBottom: 8,
  },
  progressBarContainer: {
    height: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
    borderRadius: 4,
    marginBottom: 8,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    width: '90%',
    backgroundColor: '#4CAF50',
    borderRadius: 4,
  },
  questionsText: {
    fontSize: 12,
    color: '#2C3E50',
    fontWeight: '500',
  },
  gridContainer: {
    paddingHorizontal: 40,
    paddingBottom: 10,
  },
  gridRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
    marginTop: 10,
  },
  gridItem: {
    width: '48%',
    aspectRatio: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 10,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000000ff',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 12,
    borderWidth: 1,
    borderColor: '#1B9602',
  },
  iconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#87CAF3',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    elevation: 10,
    borderWidth: 1,
    borderColor: '#3ec232ff',
  },
  gridLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#2C3E50',
    textAlign: 'center',
    lineHeight: 16,
  },
  gridIcon: {
    width: 40,
    height: 40,
    resizeMode: 'contain',
  },
  whiteCircle: {
    width: 32,  
    height: 32,
    resizeMode: 'contain',
  },
});