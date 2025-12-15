import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { doc as firestoreDoc, getDoc } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import {
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
const firebaseConfig: any = require('../config/firebase');

const methods = [
  { id: 'quiz', label: 'Quiz', icon: 'help-circle-outline', description: 'Test your knowledge with questions' },
  { id: 'summary', label: 'Summary', icon: 'document-text-outline', description: 'Get a concise overview of the content' },
  { id: 'flashcards', label: 'Flashcards', icon: 'albums-outline', description: 'Learn with interactive flashcards' },
  { id: 'practice', label: 'Practice Test', icon: 'clipboard-outline', description: 'Practice with exam-style questions' },
];

export default function StudyMethod() {
  const { colors } = useTheme();
  const { user } = useAuth();
  const insets = useSafeAreaInsets();
  const [selectedMethod, setSelectedMethod] = useState<string>('quiz');
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('easy');
  const [quantity, setQuantity] = useState<number>(10);
  const router = useRouter();
  const params = useLocalSearchParams();
  const [uploadedFile, setUploadedFile] = useState<{ fileName?: string; url?: string; docId?: string } | null>(null);

  useEffect(() => {
    const rawDocId = params.docId;
    const rawFileUrl = params.fileUrl;
    const rawFileUri = params.fileUri; // local file fallback
    const rawFileName = params.fileName;
    const rawRecentFileId = params.recentFileId;

    const docId = Array.isArray(rawDocId) ? rawDocId[0] : rawDocId;
    const fileUrl = Array.isArray(rawFileUrl) ? rawFileUrl[0] : rawFileUrl;
    const fileUri = Array.isArray(rawFileUri) ? rawFileUri[0] : rawFileUri;
    const fileName = Array.isArray(rawFileName) ? rawFileName[0] : rawFileName;
    const recentFileId = Array.isArray(rawRecentFileId) ? rawRecentFileId[0] : rawRecentFileId;

    // If reusing a recent file, retrieve its data from AsyncStorage
    if (recentFileId) {
      (async () => {
        try {
          const tempData = await AsyncStorage.getItem('tempFileData');
          if (tempData) {
            const { fileName, fileUrl } = JSON.parse(tempData);
            setUploadedFile({ fileName, url: fileUrl, docId: recentFileId });
            // Don't remove - ai-processing needs it too
          }
        } catch (e) {
          console.error('Failed to load temp file data', e);
        }
      })();
      return;
    }

    if (docId) {
      // fetch metadata from Firestore
      const db = firebaseConfig.db;
      (async () => {
        try {
          const d = await getDoc(firestoreDoc(db, 'users', (firebaseConfig.auth?.currentUser?.uid || 'anonymous'), 'uploads', docId));
          if (d.exists()) setUploadedFile({ docId: d.id, fileName: d.data()?.fileName, url: d.data()?.url });
        } catch (e) {
          console.error('Failed to load uploaded file metadata', e);
        }
      })();
      return;
    }

    if (fileUrl || fileUri || fileName) {
      // prefer cloud fileUrl, otherwise use local fileUri
      setUploadedFile({ fileName, url: fileUrl ?? fileUri, docId: docId ?? undefined });
    }
  }, [params.docId, params.fileUrl, params.fileName, params.recentFileId]);

  const handleGenerate = async () => {
    // Record study history
    try {
      const uid = user?.uid || 'anonymous';
      const studyHistoryKey = `studyHistory_${uid}`;
      const studyHistory = await AsyncStorage.getItem(studyHistoryKey);
      const history = studyHistory ? JSON.parse(studyHistory) : [];
      history.push({
        fileName: uploadedFile?.fileName || 'Unknown PDF',
        method: selectedMethod,
        difficulty,
        quantity,
        timestamp: Date.now(),
      });
      await AsyncStorage.setItem(studyHistoryKey, JSON.stringify(history));
    } catch (e) {
      console.warn('Failed to record study history', e);
    }

    // Navigate to AI processing screen which will call the AI server
    const params = new URLSearchParams();
    params.append('method', selectedMethod);
    params.append('difficulty', difficulty);
    params.append('quantity', displayQuantity.toString());
    if (uploadedFile?.docId) params.append('docId', uploadedFile.docId);
    if (uploadedFile?.url) params.append('fileUrl', uploadedFile.url);
    if (uploadedFile?.fileName) params.append('fileName', uploadedFile.fileName);
    // if local file uri is available it's passed as fileUrl param as well
    router.push(`/ai-processing?${params.toString()}` as any);
  };

  const fileSourceLabel = uploadedFile ? (uploadedFile.url?.startsWith('file://') ? 'Local file (on device)' : (uploadedFile.docId ? 'Uploaded to cloud' : 'File selected')) : '';

  // Determine if difficulty is needed for this method
  const needsDifficulty = ['quiz', 'practice'].includes(selectedMethod);
  const showDifficultyForFlashcards = selectedMethod === 'flashcards';
  
  // Get quantity label and range based on method
  const getQuantityLabel = () => {
    if (selectedMethod === 'flashcards') return 'Number of Flashcards';
    if (selectedMethod === 'quiz') return 'Number of Questions';
    if (selectedMethod === 'practice') return 'Number of Questions';
    if (selectedMethod === 'summary') return 'Summary Detail Level';
    return 'Quantity';
  };

  // Get quantity hint based on method
  const getQuantityHint = () => {
    if (selectedMethod === 'summary') {
      const hints = ['Super Brief (Key Points Only)', 'Brief (Quick Overview)', 'Balanced (Recommended)', 'Detailed (Comprehensive)', 'Exhaustive (Complete Analysis)'];
      return hints[quantity - 1] || hints[2];
    }
    return `${Math.max(3, selectedMethod === 'flashcards' ? 5 : 3)} - ${selectedMethod === 'flashcards' ? 20 : 15} items`;
  };
  
  const maxQuantity = selectedMethod === 'summary' ? 5 : (selectedMethod === 'flashcards' ? 20 : 15);
  const minQuantity = selectedMethod === 'summary' ? 1 : 3;
  
  // Set quantity to optimal value
  const displayQuantity = selectedMethod === 'summary' ? quantity : quantity;

  // Get button text based on selected method
  const getButtonText = () => {
    const labels: Record<string, string> = {
      quiz: 'Generate Quiz',
      summary: 'Generate Summary',
      flashcards: 'Create Flashcards',
      practice: 'Start Practice Test',
    };
    return labels[selectedMethod] || 'Generate';
  };

  // Get method description
  const getMethodDescription = () => {
    const method = methods.find(m => m.id === selectedMethod);
    return method?.description || '';
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }] }>
      <ScrollView contentContainerStyle={{ paddingBottom: 120 + insets.bottom }} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.text }]}>Choose Study Method</Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>How would you like to study?</Text>
        </View>

        <View style={styles.grid}>
        {methods.map((m) => {
          const active = selectedMethod === m.id;
          return (
            <TouchableOpacity
              key={m.id}
              style={[
                styles.card,
                {
                  backgroundColor: active ? colors.card : colors.surface,
                  borderColor: active ? colors.success : colors.border,
                },
              ]}
              onPress={() => setSelectedMethod(m.id)}
            >
              <Ionicons name={m.icon as any} size={28} color={active ? colors.success : colors.primary} />
              <Text style={[styles.cardLabel, { color: active ? colors.success : colors.text }]}>{m.label}</Text>
            </TouchableOpacity>
          );
        })}
        </View>

        {/* Method Description */}
        {getMethodDescription() && (
          <View style={{ paddingHorizontal: 20, marginTop: 12, marginBottom: 8 }}>
            <Text style={{ fontSize: 13, color: colors.textSecondary, fontStyle: 'italic' }}>
              {getMethodDescription()}
            </Text>
          </View>
        )}

        {/* Difficulty Level - Only show for quiz, practice, and flashcards methods */}
        {(needsDifficulty || showDifficultyForFlashcards) && (
        <View style={styles.difficultyArea}>
          <Text style={[styles.diffLabel, { color: colors.text }]}>Difficulty Level</Text>
          <View style={styles.diffButtons}>
            <TouchableOpacity
              style={[
                styles.diffBtn,
                {
                  borderColor: colors.border,
                  backgroundColor: difficulty === 'easy' ? colors.primary : colors.surface,
                },
              ]}
              onPress={() => setDifficulty('easy')}
            >
              <Text style={[styles.diffBtnText, { color: difficulty === 'easy' ? '#fff' : colors.text } ]}>Easy</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.diffBtn,
                {
                  borderColor: colors.border,
                  backgroundColor: difficulty === 'medium' ? colors.primary : colors.surface,
                },
              ]}
              onPress={() => setDifficulty('medium')}
            >
              <Text style={[styles.diffBtnText, { color: difficulty === 'medium' ? '#fff' : colors.text } ]}>Medium</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.diffBtn,
                {
                  borderColor: colors.border,
                  backgroundColor: difficulty === 'hard' ? colors.primary : colors.surface,
                },
              ]}
              onPress={() => setDifficulty('hard')}
            >
              <Text style={[styles.diffBtnText, { color: difficulty === 'hard' ? '#fff' : colors.text } ]}>Hard</Text>
            </TouchableOpacity>
          </View>
        </View>
        )}

        {/* Quantity Selection - Hidden for Summary */}
        {selectedMethod !== 'summary' && (
          <View style={styles.quantityArea}>
          <Text style={[styles.quantityLabel, { color: colors.text }]}>{getQuantityLabel()}</Text>
          <View style={styles.quantityContainer}>
            <TouchableOpacity
              style={[styles.quantityBtn, { backgroundColor: colors.surface, borderColor: colors.border }]}
              onPress={() => setQuantity(Math.max(minQuantity, quantity - 1))}
            >
              <Text style={[styles.quantityBtnText, { color: colors.text }]}>−</Text>
            </TouchableOpacity>
            <View style={[styles.quantityDisplay, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Text style={[styles.quantityValue, { color: colors.text }]}>{quantity}</Text>
            </View>
            <TouchableOpacity
              style={[styles.quantityBtn, { backgroundColor: colors.primary }]}
              onPress={() => setQuantity(Math.min(maxQuantity, quantity + 1))}
            >
              <Text style={[styles.quantityBtnText, { color: '#FFF' }]}>+</Text>
            </TouchableOpacity>
          </View>
          <Text style={[styles.quantityHint, { color: colors.textSecondary }]}>3 - {maxQuantity} items</Text>
        </View>
        )}

        {/* Summary Detail Level Selection - Only for Summary */}
        {selectedMethod === 'summary' && (
        <View style={styles.quantityArea}>
          <Text style={[styles.quantityLabel, { color: colors.text }]}>{getQuantityLabel()}</Text>
          <Text style={[styles.summaryDescriptionHint, { color: colors.textSecondary }]}>
            Choose how much detail you want in your summary
          </Text>
          <View style={styles.summaryLevelsContainer}>
            {[
              { level: 1, label: 'Level 1', description: 'Super Brief - Just the essentials' },
              { level: 2, label: 'Level 2', description: 'Brief - Quick overview' },
              { level: 3, label: 'Level 3', description: 'Balanced - Recommended' },
              { level: 4, label: 'Level 4', description: 'Detailed - Comprehensive' },
              { level: 5, label: 'Level 5', description: 'Exhaustive - Complete analysis' },
            ].map((item) => (
              <TouchableOpacity
                key={item.level}
                style={[
                  styles.summaryLevelCard,
                  {
                    backgroundColor: quantity === item.level ? colors.primary : colors.surface,
                    borderColor: quantity === item.level ? colors.primary : colors.border,
                  },
                ]}
                onPress={() => setQuantity(item.level)}
              >
                <Text
                  style={[
                    styles.summaryLevelLabel,
                    { color: quantity === item.level ? '#FFF' : colors.text },
                  ]}
                >
                  {item.label}
                </Text>
                <Text
                  style={[
                    styles.summaryLevelDesc,
                    { color: quantity === item.level ? '#FFF' : colors.textSecondary },
                  ]}
                >
                  {item.description}
                </Text>
              </TouchableOpacity>
            ))}
            </View>
          </View>
        )}
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: insets.bottom }]}>
        {uploadedFile ? (
          <View style={{ paddingHorizontal: 20, marginBottom: 12 }}>
            <Text style={{ fontWeight: '600', color: colors.text }}>{uploadedFile.fileName}</Text>
            <Text style={{ color: colors.textSecondary, fontSize: 12 }}>{fileSourceLabel}</Text>
          </View>
        ) : null}
        <TouchableOpacity style={[styles.generateBtn, { backgroundColor: colors.primary }]} onPress={handleGenerate}>
          <Text style={styles.generateText}>{getButtonText()}</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingHorizontal: 20, paddingTop: 18 },
  title: { fontSize: 20, fontWeight: '700' },
  subtitle: { marginTop: 6 },

  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    padding: 16,
    marginTop: 18,
  },
  card: {
    width: '48%',
    padding: 18,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    marginBottom: 12,
  },
  cardActive: {
  },
  cardLabel: { marginTop: 10, fontWeight: '600' },
  cardLabelActive: {  },

  difficultyArea: { paddingHorizontal: 20, marginTop: 8 },
  diffLabel: { fontWeight: '600', marginBottom: 8 },
  diffButtons: { flexDirection: 'row', justifyContent: 'space-between' },
  diffBtn: {
    flex: 1,
    marginHorizontal: 6,
    paddingVertical: 10,
    borderRadius: 24,
    borderWidth: 1,
    alignItems: 'center',
    
  },
  diffBtnActive: {  },
  diffBtnText: { fontWeight: '600' },
  diffBtnTextActive: {  },

  quantityArea: { paddingHorizontal: 20, marginTop: 16 },
  quantityLabel: { fontWeight: '600', marginBottom: 10, fontSize: 14 },
  quantityContainer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 12 },
  quantityBtn: { width: 44, height: 44, borderRadius: 12, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  quantityBtnText: { fontWeight: '700', fontSize: 20 },
  quantityDisplay: { flex: 1, height: 44, borderRadius: 12, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  quantityValue: { fontWeight: '700', fontSize: 16 },
  quantityHint: { fontSize: 12, marginTop: 6, textAlign: 'center' },

  summaryDescriptionHint: { fontSize: 12, marginBottom: 12, fontStyle: 'italic' },
  summaryLevelsContainer: { gap: 10 },
  summaryLevelCard: {
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 10,
    borderWidth: 2,
    marginBottom: 4,
  },
  summaryLevelLabel: { fontWeight: '700', fontSize: 13 },
  summaryLevelDesc: { fontSize: 11, marginTop: 3 },

  footer: { padding: 20 },
  generateBtn: {
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  generateText: { fontWeight: '700' },
});
