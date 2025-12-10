// app/upload-pdf.tsx
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';
const firebaseConfig: any = require('../config/firebase');
const { storage, auth } = firebaseConfig;
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { addDoc, collection, serverTimestamp, query, orderBy, limit, onSnapshot, getDoc, doc } from 'firebase/firestore';

export default function UploadPDFScreen() {
  const router = useRouter();
  const [selectedFile, setSelectedFile] = useState<any>(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState<number>(0);
  const [recentUploads, setRecentUploads] = useState<any[]>([]);

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
        setSelectedFile(file);
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
            // Provide more detailed logging for Firebase Storage errors
            console.error('UploadTask error', error, 'code:', (error && error.code) || null, 'message:', (error && error.message) || null);
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
      const err: any = e;
      console.error('Upload error', err, 'code:', err.code || null, 'message:', err.message || null);
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
      const { downloadUrl, docId } = await uploadFileToFirebase(selectedFile);
      // Navigate to study-method and include the uploaded file URL and name as query params
      const qs = `?fileUrl=${encodeURIComponent(downloadUrl)}&fileName=${encodeURIComponent(selectedFile.name)}${docId ? `&docId=${docId}` : ''}`;
      router.push(('/study-method' + qs) as any);
    } catch (e) {
      const err: any = e;
      console.error('handleContinue upload failed:', err, 'code:', err.code || null, 'message:', err.message || null);
      const msg = err && err.message ? `${err.message}` : 'There was a problem uploading the PDF.';
      Alert.alert('Upload failed', msg);
    } finally {
      setUploading(false);
    }
  };

  useEffect(() => {
    const firebaseAuth: any = auth;
    const uid = firebaseAuth?.currentUser?.uid || 'anonymous';
    const db = firebaseConfig.db;
    try {
      const q = query(collection(db, 'users', uid, 'uploads'), orderBy('createdAt', 'desc'), limit(5));
      const unsub = onSnapshot(q, (snap) => {
        const items: any[] = [];
        snap.forEach((d) => items.push({ id: d.id, ...d.data() }));
        setRecentUploads(items);
      }, (err) => console.error('recent uploads err', err));
      return () => unsub();
    } catch (e) {
      console.error('recent uploads setup failed', e);
    }
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Upload Document</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Content */}
      <View style={styles.content}>
        {!selectedFile ? (
          // Initial upload screen
          <TouchableOpacity style={styles.uploadArea} onPress={pickDocument}>
            <Ionicons name="folder-open-outline" size={64} color="#6EC1E4" />
            <Text style={styles.uploadText}>Drag & Drop your PDF</Text>
            <Text style={styles.uploadSubtext}>or tap to browse files</Text>
            <View style={styles.chooseButton}>
              <Text style={styles.chooseButtonText}>choose file</Text>
            </View>
          </TouchableOpacity>
        ) : (
          // File ready screen
          <View style={styles.readyArea}>
            <Ionicons name="document-text-outline" size={48} color="#6EC1E4" />
            <Text style={styles.readyTitle}>PDF ready</Text>
            <Text style={styles.readyName}>{selectedFile.name}</Text>
            <TouchableOpacity style={styles.chooseAnother} onPress={() => !uploading && setSelectedFile(null)} disabled={uploading}>
              <Text style={[styles.chooseAnotherText, uploading && { opacity: 0.5 }]}>choose another file</Text>
            </TouchableOpacity>
            <View style={{ width: '100%', marginTop: 8 }}>
              {uploading ? (
                <View style={{ alignItems: 'center' }}>
                  <View style={styles.progressBarOuter}>
                    <View style={[styles.progressBarInner, { width: `${progress}%` }]} />
                  </View>
                  <Text style={{ marginTop: 8 }}>{progress}%</Text>
                </View>
              ) : null}
            </View>
            <TouchableOpacity style={[styles.continueButton, uploading && styles.uploadButtonDisabled]} onPress={handleContinue} disabled={uploading}>
              <Text style={styles.continueButtonText}>{uploading ? `Uploading ${progress}%` : 'continue'}</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Recent uploads placeholder */}
        <View style={styles.recentContainer}>
          <Text style={styles.recentTitle}>Recent Uploads</Text>
          {recentUploads.length === 0 ? (
            <Text style={{ color: '#666' }}>No recent uploads</Text>
          ) : (
            recentUploads.map((r) => (
              <TouchableOpacity key={r.id} style={styles.recentItem} onPress={() => router.push((`/study-method?docId=${r.id}&fileName=${encodeURIComponent(r.fileName)}&fileUrl=${encodeURIComponent(r.url)}`) as any)}>
                <Text style={styles.recentName}>{r.fileName}</Text>
                <Text style={styles.recentMeta}>{r.createdAt?.toDate ? r.createdAt.toDate().toLocaleString() : ''}</Text>
              </TouchableOpacity>
            ))
          )}
        </View>
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
    paddingTop: 24,
  },
  uploadArea: {
    borderWidth: 2,
    borderColor: '#6EC1E4',
    borderStyle: 'dashed',
    borderRadius: 16,
    padding: 48,
    alignItems: 'center',
    backgroundColor: '#F8FCFF',
    marginBottom: 20,
  },
  uploadText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginTop: 12,
  },
  uploadSubtext: {
    fontSize: 14,
    color: '#666',
    marginTop: 6,
  },
  chooseButton: {
    marginTop: 12,
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#E0EAF3',
  },
  chooseButtonText: { color: '#2F80ED', fontWeight: '600' },

  // ready area
  readyArea: {
    borderWidth: 1,
    borderColor: '#E6EEF6',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    backgroundColor: '#FBFDFF',
    marginBottom: 20,
  },
  readyTitle: { fontSize: 18, fontWeight: '700', marginTop: 8 },
  readyName: { marginTop: 6, color: '#444' },
  chooseAnother: { marginTop: 10 },
  chooseAnotherText: { color: '#2F80ED' },
  continueButton: {
    marginTop: 14,
    backgroundColor: '#2FB46E',
    paddingHorizontal: 26,
    paddingVertical: 10,
    borderRadius: 10,
  },
  continueButtonText: { color: '#fff', fontWeight: '700' },

  // recent
  recentContainer: { marginTop: 12 },
  recentTitle: { fontSize: 14, fontWeight: '700', marginBottom: 8 },
  recentItem: {
    borderWidth: 1,
    borderColor: '#EEE',
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#FFF',
  },
  recentName: { fontWeight: '600' },
  recentMeta: { fontSize: 12, color: '#666', marginTop: 4 },

  // fallback file info styles used previously
  fileInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
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
    color: '#333',
    marginBottom: 4,
  },
  fileSize: {
    fontSize: 12,
    color: '#666',
  },
  uploadButton: {
    backgroundColor: '#6EC1E4',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 24,
  },
  uploadButtonDisabled: {
    backgroundColor: '#D1D1D1',
  },
  uploadButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  progressBarOuter: {
    width: '90%',
    height: 8,
    backgroundColor: '#E6EEF6',
    borderRadius: 6,
    overflow: 'hidden',
    marginTop: 6,
  },
  progressBarInner: {
    height: '100%',
    backgroundColor: '#2FB46E',
  },
});