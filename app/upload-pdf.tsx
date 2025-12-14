// app/upload-pdf.tsx
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as DocumentPicker from 'expo-document-picker';
import { useRouter } from 'expo-router';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { getDownloadURL, ref, uploadBytesResumable } from 'firebase/storage';
import React, { useState } from 'react';
import {
  Alert,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../contexts/ThemeContext';
const firebaseConfig: any = require('../config/firebase');
const { storage, auth } = firebaseConfig;

export default function UploadPDFScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const [selectedFile, setSelectedFile] = useState<any>(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState<number>(0);

  const pickDocument = async () => {
    try {
      console.log('Opening document picker...');
      const result = await DocumentPicker.getDocumentAsync({
        type: 'application/pdf',
        copyToCacheDirectory: true,
      });

      console.log('Document picker result:', result);
      if (!result.canceled && result.assets && result.assets.length > 0) {
        const file = result.assets[0];
        console.log('File selected:', file.name);

        // File is already in document picker cache, use it directly
        setSelectedFile(file);

        // Persist metadata list (most recent first) - use user-specific key
        try {
          const firebaseAuth: any = auth;
          const uid = firebaseAuth?.currentUser?.uid || 'anonymous';
          const storageKey = `localUploads_${uid}`;
          const stored = await AsyncStorage.getItem(storageKey);
          const uploads = stored ? JSON.parse(stored) : [];
          uploads.unshift({ name: file.name, uri: file.uri, size: file.size || null, mimeType: file.mimeType || 'application/pdf', createdAt: Date.now() });
          await AsyncStorage.setItem(storageKey, JSON.stringify(uploads));
        } catch (e) {
          console.warn('Could not persist local upload metadata', e);
        }

        // UI will display a ready state; avoid interruptive alerts
      } else {
        console.log('User cancelled document picker');
      }
    } catch (error) {
      console.error('Document picker error:', error);
      Alert.alert('Error', 'Failed to pick document');
    }
  };

  const uploadFileToFirebase = async (file: any) => {
    try {
      // fetch file as blob
      const res = await fetch(file.uri);
      const blob = await res.blob();

      const firebaseAuth: any = auth;
      const uid = firebaseAuth?.currentUser?.uid || 'anonymous';
      const filePath = `uploads/${uid}/${Date.now()}_${file.name}`;
      const storageRef = ref(storage, filePath);

      // upload with resumable upload to track progress
      const uploadTask = uploadBytesResumable(storageRef, blob, { contentType: file.mimeType || 'application/pdf' });

      const { downloadUrl, docId } = await new Promise<any>((resolve, reject) => {
        uploadTask.on('state_changed',
          (snapshot) => {
            const pct = snapshot.totalBytes ? Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100) : 0;
            setProgress(pct);
          },
          (error) => {
            // Silently reject - fallback to local file will handle it
            reject(error);
          },
          async () => {
            try {
              const url = await getDownloadURL(uploadTask.snapshot.ref);
              // Save metadata to Firestore under users/{uid}/uploads and return doc id
              const db = firebaseConfig.db;
              const docRef = await addDoc(collection(db, 'users', uid, 'uploads'), {
                fileName: file.name,
                url,
                size: file.size || null,
                createdAt: serverTimestamp(),
              });
              resolve({ downloadUrl: url, docId: docRef.id });
            } catch (e) {
              reject(e);
            }
          }
        );
      });

      return { downloadUrl, docId };
    } catch (e) {
      // Silently reject - fallback to local file will handle it
      throw e;
    }
  };

  const handleContinue = async () => {
    if (!selectedFile) {
      Alert.alert('No file selected', 'Please select a PDF file first');
      return;
    }

    setUploading(true);
    setProgress(0);
    try {
      // Try to upload to Firebase if storage is configured
      if (storage) {
        try {
          const { downloadUrl, docId } = await uploadFileToFirebase(selectedFile);
          const qs = `?fileUrl=${encodeURIComponent(downloadUrl)}&fileName=${encodeURIComponent(selectedFile.name)}${docId ? `&docId=${docId}` : ''}`;
          router.push(('/study-method' + qs) as any);
          return;
        } catch (uploadErr) {
          // Firebase unavailable or not configured - silently fall back to local file
          // fall through to local navigation
        }
      }

      // If storage not configured or upload failed, use local file URI (already copied in pickDocument)
      const localUri = selectedFile?.uri;
      if (localUri) {
        const qs = `?fileUri=${encodeURIComponent(localUri)}&fileName=${encodeURIComponent(selectedFile.name)}`;
        router.push((`/study-method${qs}`) as any);
      } else {
        Alert.alert('Upload failed', 'No local file available and cloud upload failed.');
      }
    } catch (e) {
      const err: any = e;
      console.error('handleContinue upload failed:', err, 'code:', err?.code || null, 'message:', err?.message || null);
      Alert.alert('Upload failed', 'An unexpected error occurred.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Upload Document</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Content */}
      <View style={styles.content}>
        {!selectedFile ? (
          // Initial upload screen
          <TouchableOpacity style={[styles.uploadArea, { borderColor: colors.primary, backgroundColor: colors.surface }]} onPress={pickDocument}>
            <Ionicons name="folder-open-outline" size={64} color={colors.primary} />
            <Text style={[styles.uploadText, { color: colors.text }]}>Tap to choose a PDF</Text>
            <Text style={[styles.uploadSubtext, { color: colors.textSecondary }]}>or browse files</Text>
            <View style={[styles.chooseButton, { backgroundColor: colors.card, borderColor: colors.border }] }>
              <Text style={[styles.chooseButtonText, { color: colors.primary }]}>choose file</Text>
            </View>
          </TouchableOpacity>
        ) : (
          // File ready screen
          <View style={[styles.readyArea, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Ionicons name="document-text-outline" size={48} color={colors.primary} />
            <Text style={[styles.readyTitle, { color: colors.text }]}>PDF ready</Text>
            <Text style={[styles.readyName, { color: colors.textSecondary }]} numberOfLines={2}>{selectedFile.name}</Text>
            <TouchableOpacity style={styles.chooseAnother} onPress={() => !uploading && setSelectedFile(null)} disabled={uploading}>
              <Text style={[styles.chooseAnotherText, uploading && { opacity: 0.5 }, { color: colors.primary }]}>choose another file</Text>
            </TouchableOpacity>
            <View style={{ width: '100%', marginTop: 8 }}>
              {uploading ? (
                <View style={{ alignItems: 'center' }}>
                  <View style={[styles.progressBarOuter, { backgroundColor: colors.card }]}>
                    <View style={[styles.progressBarInner, { width: `${progress}%`, backgroundColor: colors.success }]} />
                  </View>
                  <Text style={{ marginTop: 8, color: colors.textSecondary }}>{progress}%</Text>
                </View>
              ) : null}
            </View>
            <TouchableOpacity style={[styles.continueButton, uploading && styles.uploadButtonDisabled, { backgroundColor: colors.primary }]} onPress={handleContinue} disabled={uploading}>
              <Text style={[styles.continueButtonText, { color: colors.surface }]}>{uploading ? `Uploading ${progress}%` : 'Continue'}</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Quick access to Study Library */}
        <View style={styles.recentContainer}>
          <View style={styles.libraryHeader}>
            <Text style={[styles.recentTitle, { color: colors.text }]}>Study Library</Text>
            <TouchableOpacity onPress={() => router.push('/library' as any)}>
              <Ionicons name="arrow-forward" size={20} color={colors.primary} />
            </TouchableOpacity>
          </View>
          <TouchableOpacity
            style={[styles.libraryButton, { backgroundColor: colors.primary }]}
            onPress={() => router.push('/library' as any)}
          >
            <Ionicons name="library-outline" size={20} color={colors.surface} />
            <Text style={[styles.libraryButtonText, { color: colors.surface }]}>View All Study Materials</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 24,
  },
  uploadArea: {
    borderWidth: 2,
    borderStyle: 'dashed',
    borderRadius: 16,
    padding: 48,
    alignItems: 'center',
    
    marginBottom: 20,
  },
  uploadText: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 12,
  },
  uploadSubtext: {
    fontSize: 14,
    marginTop: 6,
  },
  chooseButton: {
    marginTop: 12,
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    
  },
  chooseButtonText: { fontWeight: '600' },

  // ready area
  readyArea: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    marginBottom: 20,
  },
  readyTitle: { fontSize: 18, fontWeight: '700', marginTop: 8 },
  readyName: { marginTop: 6 },
  chooseAnother: { marginTop: 10 },
  chooseAnotherText: {  },
  continueButton: {
    marginTop: 14,
    paddingHorizontal: 26,
    paddingVertical: 10,
    borderRadius: 10,
  },
  continueButtonText: { fontWeight: '700' },

  // recent
  recentContainer: { marginTop: 12 },
  recentTitle: { fontSize: 14, fontWeight: '700', marginBottom: 8 },
  recentItem: {
    borderWidth: 1,
    padding: 12,
    borderRadius: 8,
  },
  recentName: { fontWeight: '600' },
  recentMeta: { fontSize: 12, marginTop: 4 },

  // fallback file info styles used previously
  fileInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    
    padding: 16,
    borderRadius: 12,
    marginTop: 24,
  },
  fileDetails: {
    flex: 1,
    marginLeft: 12,
  },
  fileName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  fileSize: {
    fontSize: 12,
  },
  uploadButton: {
    
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 24,
  },
  uploadButtonDisabled: {
    
  },
  uploadButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  progressBarOuter: {
    width: '90%',
    height: 8,
    
    borderRadius: 6,
    overflow: 'hidden',
    marginTop: 6,
  },
  progressBarInner: {
    height: '100%',
  },
  libraryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  libraryButton: {
    flexDirection: 'row',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  libraryButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});