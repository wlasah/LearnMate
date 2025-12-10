import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useSearchParams } from 'expo-router';
const firebaseConfig: any = require('../config/firebase');
import { getDoc, doc as firestoreDoc } from 'firebase/firestore';

const methods = [
  { id: 'quiz', label: 'Quiz', icon: 'help-circle-outline' },
  { id: 'summary', label: 'Summary', icon: 'document-text-outline' },
  { id: 'flashcards', label: 'Flashcards', icon: 'albums-outline' },
  { id: 'practice', label: 'Practice Test', icon: 'clipboard-outline' },
];

export default function StudyMethod() {
  const [selectedMethod, setSelectedMethod] = useState<string>('quiz');
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('easy');
  const router = useRouter();
  const params = useSearchParams();
  const [uploadedFile, setUploadedFile] = useState<{ fileName?: string; url?: string; docId?: string } | null>(null);

  useEffect(() => {
    const docId = params.docId;
    const fileUrl = params.fileUrl;
    const fileName = params.fileName;

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

    if (fileUrl || fileName) {
      setUploadedFile({ fileName, url: fileUrl, docId: docId ?? undefined });
    }
  }, [params]);

  const handleGenerate = () => {
    // When Quiz is selected we navigate to the quiz start page
    const qs = `?method=${selectedMethod}&difficulty=${difficulty}${uploadedFile?.docId ? `&docId=${uploadedFile.docId}` : uploadedFile?.url ? `&fileUrl=${encodeURIComponent(uploadedFile.url)}` : ''}`;
    router.push(('/quiz-start' + qs) as any);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Choose Study Method</Text>
        <Text style={styles.subtitle}>How would you like to study?</Text>
      </View>

      <View style={styles.grid}>
        {methods.map((m) => {
          const active = selectedMethod === m.id;
          return (
            <TouchableOpacity
              key={m.id}
              style={[styles.card, active && styles.cardActive]}
              onPress={() => setSelectedMethod(m.id)}
            >
              <Ionicons name={m.icon as any} size={28} color={active ? '#2FB46E' : '#2F80ED'} />
              <Text style={[styles.cardLabel, active && styles.cardLabelActive]}>{m.label}</Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <View style={styles.difficultyArea}>
        <Text style={styles.diffLabel}>Difficulty Level</Text>
        <View style={styles.diffButtons}>
          <TouchableOpacity
            style={[styles.diffBtn, difficulty === 'easy' && styles.diffBtnActive]}
            onPress={() => setDifficulty('easy')}
          >
            <Text style={[styles.diffBtnText, difficulty === 'easy' && styles.diffBtnTextActive]}>Easy</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.diffBtn, difficulty === 'medium' && styles.diffBtnActive]}
            onPress={() => setDifficulty('medium')}
          >
            <Text style={[styles.diffBtnText, difficulty === 'medium' && styles.diffBtnTextActive]}>Medium</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.diffBtn, difficulty === 'hard' && styles.diffBtnActive]}
            onPress={() => setDifficulty('hard')}
          >
            <Text style={[styles.diffBtnText, difficulty === 'hard' && styles.diffBtnTextActive]}>Hard</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.footer}>
        {uploadedFile ? (
          <View style={{ paddingHorizontal: 20, marginBottom: 12 }}>
            <Text style={{ fontWeight: '600' }}>{uploadedFile.fileName}</Text>
            <Text style={{ color: '#666', fontSize: 12 }}>{uploadedFile.url}</Text>
          </View>
        ) : null}
        <TouchableOpacity style={styles.generateBtn} onPress={handleGenerate}>
          <Text style={styles.generateText}>Generate Quiz</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: { paddingHorizontal: 20, paddingTop: 18 },
  title: { fontSize: 20, fontWeight: '700', color: '#111' },
  subtitle: { color: '#666', marginTop: 6 },

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
    borderColor: '#E6EEF6',
    backgroundColor: '#FBFDFF',
    alignItems: 'center',
    marginBottom: 12,
  },
  cardActive: {
    borderColor: '#D6F4E1',
    backgroundColor: '#F1FFF5',
  },
  cardLabel: { marginTop: 10, color: '#333', fontWeight: '600' },
  cardLabelActive: { color: '#2FB46E' },

  difficultyArea: { paddingHorizontal: 20, marginTop: 8 },
  diffLabel: { fontWeight: '600', marginBottom: 8, color: '#333' },
  diffButtons: { flexDirection: 'row', justifyContent: 'space-between' },
  diffBtn: {
    flex: 1,
    marginHorizontal: 6,
    paddingVertical: 10,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#E6EEF6',
    alignItems: 'center',
    backgroundColor: '#FFF',
  },
  diffBtnActive: { backgroundColor: '#2FB46E' },
  diffBtnText: { color: '#333', fontWeight: '600' },
  diffBtnTextActive: { color: '#fff' },

  footer: { padding: 20 },
  generateBtn: {
    backgroundColor: '#2FB46E',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  generateText: { color: '#fff', fontWeight: '700' },
});
