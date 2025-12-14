import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FileSystem from 'expo-file-system/legacy';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../contexts/ThemeContext';
import { StudyMaterialsManager } from '../utils/studyMaterialsManager';

// Update this to your AI server URL. For physical devices use your machine IP (below).
// If you prefer, set `global.AI_SERVER_URL` at runtime to override.
const AI_SERVER_URL = (global as any).AI_SERVER_URL || 'http://192.168.1.10:4000';

export default function AIProcessing() {
  const { colors } = useTheme();
  const params = useLocalSearchParams();
  const router = useRouter();
  const [status, setStatus] = useState('Uploading PDF...');

  useEffect(() => {
    (async () => {
      try {
        const methodRaw = params.method;
        const fileUrlRaw = params.fileUrl;
        const fileUriRaw = params.fileUri;
        const fileNameRaw = params.fileName;
        const docIdRaw = params.docId;
        const quantityRaw = params.quantity;
        const difficultyRaw = params.difficulty;

        const method = Array.isArray(methodRaw) ? methodRaw[0] : methodRaw ?? 'summary';
        const fileUrl = Array.isArray(fileUrlRaw) ? fileUrlRaw[0] : fileUrlRaw ?? '';
        const fileUri = Array.isArray(fileUriRaw) ? fileUriRaw[0] : fileUriRaw ?? '';
        const docId = Array.isArray(docIdRaw) ? docIdRaw[0] : docIdRaw ?? '';
        const quantity = Array.isArray(quantityRaw) ? parseInt(quantityRaw[0]) : parseInt(quantityRaw as any) || 3;
        const difficulty = Array.isArray(difficultyRaw) ? difficultyRaw[0] : difficultyRaw ?? 'medium';
        // prefer fileUrl (remote) otherwise use local fileUri
        let finalFileUri = fileUrl || fileUri;
        let fileName = Array.isArray(fileNameRaw) ? fileNameRaw[0] : fileNameRaw ?? 'file.pdf';

        // If no file data in params, try to get from temp storage
        if (!finalFileUri || !fileName) {
          try {
            const tempData = await AsyncStorage.getItem('tempFileData');
            if (tempData) {
              const { fileName: tempFileName, fileUrl: tempFileUrl } = JSON.parse(tempData);
              if (!finalFileUri) finalFileUri = tempFileUrl;
              if (!fileName) fileName = tempFileName;
              // Don't remove yet - we'll remove it after we're done processing
            }
          } catch (e) {
            console.warn('Could not retrieve temp file data:', e);
          }
        }

        setStatus('Preparing file...');

        // If using Firebase URL, first verify it's accessible and refresh if needed
        let fileToUse = finalFileUri;
        if (fileUrl && fileUrl.includes('firebase')) {
          try {
            setStatus('Verifying file access...');
            const headResp = await fetch(fileUrl, { method: 'HEAD' });
            if (!headResp.ok) {
              // Any non-ok response (404, 403, etc.) means we should try to refresh
              if (docId) {
                setStatus('Refreshing file access...');
                try {
                  const firebaseConfig: any = require('../config/firebase');
                  const db = firebaseConfig.db;
                  const auth = firebaseConfig.auth;
                  if (auth?.currentUser?.uid && db) {
                    const { getDoc, doc } = await import('firebase/firestore');
                    const docRef = await getDoc(doc(db, 'users', auth.currentUser.uid, 'uploads', docId));
                    if (docRef.exists()) {
                      const newUrl = docRef.data()?.url;
                      if (newUrl) fileToUse = newUrl;
                    }
                  }
                } catch (e) {
                  console.warn('Could not refresh Firebase URL:', e);
                }
              }
            }
          } catch (e) {
            console.warn('Could not verify file access, continuing:', e);
          }
        }

        // Prepare form data. React Native expects { uri, name, type } for files.
        const form = new FormData();
        form.append('method', method);
        form.append('quantity', quantity.toString());
        form.append('difficulty', difficulty);

        // If fileToUse is a local file:// URI, verify it exists and use it
        if (typeof fileToUse === 'string' && fileToUse.startsWith('file://')) {
          try {
            setStatus('Verifying local file...');
            const fileInfo = await FileSystem.getInfoAsync(fileToUse);
            if (!fileInfo.exists) {
              Alert.alert('File Not Found', `The local file no longer exists. Please re-upload the PDF.`);
              router.back();
              return;
            }
            console.log('Local file verified:', fileToUse);
            form.append('file', { uri: fileToUse, name: fileName, type: 'application/pdf' } as any);
          } catch (e: any) {
            console.error('Error verifying local file:', e?.message || e);
            Alert.alert('File Error', `Could not access local file: ${e?.message || 'Unknown error'}. Please re-upload the PDF.`);
            router.back();
            return;
          }
        } else {
          // For HTTP(S) URLs or other types, send directly to server
          console.log('Using file URI directly:', fileToUse);
          form.append('file', { uri: fileToUse, name: fileName, type: 'application/pdf' } as any);
        }

        setStatus('Uploading to AI server...');

        let resp;
        try {
          console.log('Sending to AI server', { url: AI_SERVER_URL + '/analyze', fileUri: fileToUse });
          resp = await fetch(`${AI_SERVER_URL}/analyze`, {
            method: 'POST',
            body: form,
          });
        } catch (netErr: any) {
          console.error('Network error sending to AI server', netErr);
          const errorMsg = netErr?.message || 'Network request failed';
          
          // Give helpful debugging info
          let helpText = `Could not reach AI server at ${AI_SERVER_URL}. Error: ${errorMsg}`;
          if (errorMsg.includes('Network')) {
            helpText += '\n\nTroubleshooting:\n1. Make sure the AI server is running (npm start in ai-server folder)\n2. Verify your machine IP is 192.168.1.10 (run ipconfig)\n3. Check your firewall allows port 4000';
          }
          
          Alert.alert('AI server unreachable', helpText);
          router.back();
          throw netErr;
        }

        if (!resp.ok) {
          const txt = await resp.text();
          console.error('AI server returned non-ok', { status: resp.status, text: txt });
          throw new Error(txt || 'AI server error');
        }

        setStatus('Processing AI response...');
        const json = await resp.json();

        // Save material to the study library
        try {
          const difficulty = Array.isArray(params.difficulty) ? params.difficulty[0] : (params.difficulty ?? undefined);
          await StudyMaterialsManager.saveMaterial({
            fileName,
            method: method as any,
            difficulty: difficulty as any,
            content: json.ai || json,
            extractedText: json.extractedText || '',
          });
        } catch (e) {
          console.warn('Could not save material to library:', e);
        }

        // Save to AsyncStorage for quick access (keep for backwards compatibility)
        const result = { method, fileName, ai: json.ai || json, extractedText: json.extractedText || '' };
        await AsyncStorage.setItem('lastAiResult', JSON.stringify(result));
        
        // Clean up temp file data now that we're done
        await AsyncStorage.removeItem('tempFileData');
        
        // Route to the appropriate screen based on method
        if (method === 'quiz') {
          router.replace(`/quiz-start?quizData=${encodeURIComponent(JSON.stringify(json.ai))}&fileName=${encodeURIComponent(fileName)}`);
        } else if (method === 'flashcards') {
          router.replace(`/flashcards?cardsData=${encodeURIComponent(JSON.stringify(json.ai))}&fileName=${encodeURIComponent(fileName)}`);
        } else {
          // summary or practice - use ai-result screen
          router.replace('/ai-result');
        }
      } catch (e: any) {
        console.error('AI processing failed', e);
        Alert.alert('AI error', e?.message || 'Network request failed. Please check your internet connection and try again.');
        // Clean up temp data on error too
        await AsyncStorage.removeItem('tempFileData').catch(() => {});
        router.back();
      }
    })();
  }, [params.method, params.fileUrl, params.fileName, router]);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}> 
      <View style={styles.center}>
        <ActivityIndicator size="large" />
        <Text style={[styles.title, { color: colors.text }]}>{status}</Text>
        <View style={styles.box}>
          <Text style={{ color: colors.textSecondary, textAlign: 'center' }}>AI is processing your PDF and generating personalized study materials. This may take 10–40 seconds.</Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  title: { fontSize: 18, fontWeight: '700', marginTop: 12, marginBottom: 16 },
  box: { marginTop: 16, padding: 14, borderRadius: 10, backgroundColor: '#F3F5F7', width: '100%' },
});
