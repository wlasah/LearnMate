import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { deleteDoc, doc as firestoreDoc, getDoc, serverTimestamp, setDoc } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import {
    Alert,
    KeyboardAvoidingView,
    Platform,
    SafeAreaView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
const firebaseConfig: any = require('../config/firebase');

export default function NoteDetailScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { user } = useAuth();
  const { colors } = useTheme();
  
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [topic, setTopic] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [saving, setSaving] = useState(false);
  const [isNew, setIsNew] = useState(true);
  const [noteId, setNoteId] = useState<string | null>(null);

  // Load existing note if editing
  useEffect(() => {
    const noteIdParam = params.id;
    const isNewParam = params.new === 'true';

    if (isNewParam) {
      setIsNew(true);
      setNoteId(null);
    } else if (noteIdParam && user?.uid) {
      setIsNew(false);
      setNoteId(noteIdParam as string);
      loadNote(noteIdParam as string);
    }
  }, [params.id, params.new, user?.uid]);

  const loadNote = async (id: string) => {
    if (!user?.uid) return;
    try {
      const db = firebaseConfig.db;
      const noteRef = firestoreDoc(db, 'users', user.uid, 'notes', id);
      const snap = await getDoc(noteRef);
      if (snap.exists()) {
        const data = snap.data();
        setTitle(data.title || '');
        setContent(data.content || '');
        setTopic(data.topic || '');
        setTags(data.tags || []);
      }
    } catch (e) {
      console.error('Failed to load note', e);
      Alert.alert('Error', 'Failed to load note');
    }
  };

  const saveNote = async () => {
    if (!title.trim() && !content.trim()) {
      Alert.alert('Empty note', 'Please add a title or content');
      return;
    }

    setSaving(true);
    try {
      const noteIdToSave = noteId || `note_${Date.now()}`;
      const noteData: any = {
        id: noteIdToSave,
        title: title.trim() || 'Untitled',
        content: content.trim(),
        topic: topic.trim() || null,
        tags: tags.length > 0 ? tags : [],
        updatedAt: new Date(),
        isLocal: !user?.uid,
      };

      if (isNew && user?.uid) {
        noteData.createdAt = serverTimestamp();
      } else if (isNew && !user?.uid) {
        noteData.createdAt = new Date();
      }

      // Try to save to Firestore if user is authenticated
      if (user?.uid) {
        try {
          const db = firebaseConfig.db;
          const noteRef = firestoreDoc(db, 'users', user.uid, 'notes', noteIdToSave);
          await setDoc(noteRef, noteData, { merge: true });
        } catch (firebaseError) {
          console.warn('Firestore save failed, using local storage', firebaseError);
          // Fall back to local storage
          await saveLocalNote(noteData);
        }
      } else {
        // Save locally if no user
        await saveLocalNote(noteData);
      }

      Alert.alert('Success', user?.uid ? 'Note saved to cloud' : 'Note saved locally');
      router.back();
    } catch (e) {
      console.error('Failed to save note', e);
      Alert.alert('Error', 'Failed to save note');
    } finally {
      setSaving(false);
    }
  };

  const saveLocalNote = async (noteData: any) => {
    try {
      const raw = await AsyncStorage.getItem('localNotes');
      const localNotes = raw ? JSON.parse(raw) : [];
      const existingIdx = localNotes.findIndex((n: any) => n.id === noteData.id);
      if (existingIdx >= 0) {
        localNotes[existingIdx] = noteData;
      } else {
        localNotes.push(noteData);
      }
      await AsyncStorage.setItem('localNotes', JSON.stringify(localNotes));
    } catch (e) {
      console.error('Failed to save local note', e);
    }
  };

  const deleteNote = async () => {
    if (isNew || !noteId) return;

    Alert.alert('Delete note?', 'This cannot be undone', [
      { text: 'Cancel', onPress: () => {} },
      {
        text: 'Delete',
        onPress: async () => {
          if (!user?.uid) return;
          try {
            const db = firebaseConfig.db;
            await deleteDoc(firestoreDoc(db, 'users', user.uid, 'notes', noteId));
            Alert.alert('Deleted', 'Note deleted');
            router.back();
          } catch (e) {
            console.error('Failed to delete note', e);
            Alert.alert('Error', 'Failed to delete note');
          }
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        {/* Header */}
        <View style={[styles.header, { backgroundColor: colors.headerBg, borderBottomColor: colors.border }]}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="chevron-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.text }]}>{isNew ? 'New Note' : 'Edit Note'}</Text>
          {!isNew && (
            <TouchableOpacity onPress={deleteNote}>
              <Ionicons name="trash-outline" size={24} color={colors.danger} />
            </TouchableOpacity>
          )}
        </View>

        {/* Form */}
        <View style={[styles.form, { backgroundColor: colors.background }]}>
          <TextInput
            style={[styles.titleInput, { borderBottomColor: colors.border, color: colors.text }]}
            placeholder="Title"
            placeholderTextColor={colors.textSecondary}
            value={title}
            onChangeText={setTitle}
          />
          <TextInput
            style={[styles.topicInput, { borderBottomColor: colors.border, color: colors.text }]}
            placeholder="Topic (optional)"
            placeholderTextColor={colors.textSecondary}
            value={topic}
            onChangeText={setTopic}
          />

          {/* Tags input */}
          <View style={styles.tagsContainer}>
            <View style={styles.tagsInputRow}>
              <TextInput
                style={[styles.tagInput, { borderBottomColor: colors.border, color: colors.text }]}
                placeholder="Add tag (e.g., Important, Review)"
                placeholderTextColor={colors.textSecondary}
                value={tagInput}
                onChangeText={setTagInput}
              />
              <TouchableOpacity
                style={styles.addTagBtn}
                onPress={() => {
                  if (tagInput.trim() && !tags.includes(tagInput.trim())) {
                    setTags([...tags, tagInput.trim()]);
                    setTagInput('');
                  }
                }}
              >
                <Ionicons name="add" size={20} color={colors.primary} />
              </TouchableOpacity>
            </View>
            {tags.length > 0 && (
              <View style={styles.tagsList}>
                {tags.map((tag, idx) => (
                  <View key={idx} style={[styles.tag, { backgroundColor: colors.surface, borderColor: colors.border, borderWidth: 1 }]}>
                    <Text style={[styles.tagText, { color: colors.primary }]}>{tag}</Text>
                    <TouchableOpacity onPress={() => setTags(tags.filter((_, i) => i !== idx))}>
                      <Ionicons name="close" size={16} color={colors.textSecondary} />
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            )}
          </View>

          <TextInput
            style={[styles.contentInput, { color: colors.text }]}
            placeholder="Note content..."
            placeholderTextColor={colors.textSecondary}
            value={content}
            onChangeText={setContent}
            multiline
            textAlignVertical="top"
          />
        </View>

        {/* Save button */}
        <View style={[styles.footer, { backgroundColor: colors.background }]}>
          <TouchableOpacity
            style={[styles.saveBtn, { backgroundColor: colors.primary }, saving && { opacity: 0.6 }]}
            onPress={saveNote}
            disabled={saving}
          >
            <Text style={[styles.saveBtnText, { color: colors.surface }]}>{saving ? 'Saving...' : 'Save Note'}</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
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
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  form: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  titleInput: {
    fontSize: 18,
    fontWeight: '600',
    paddingVertical: 8,
    marginBottom: 12,
    borderBottomWidth: 1,
  },
  topicInput: {
    fontSize: 13,
    paddingVertical: 6,
    marginBottom: 12,
    borderBottomWidth: 1,
  },
  contentInput: {
    flex: 1,
    fontSize: 14,
    paddingVertical: 8,
    lineHeight: 20,
  },
  footer: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  saveBtn: {
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  saveBtnText: {
    fontWeight: '700',
    fontSize: 16,
  },
  tagsContainer: {
    marginBottom: 12,
  },
  tagsInputRow: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
    marginBottom: 8,
  },
  tagInput: {
    flex: 1,
    fontSize: 13,
    borderBottomWidth: 1,
    paddingVertical: 6,
  },
  addTagBtn: {
    padding: 6,
  },
  tagsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 6,
    gap: 6,
  },
  tagText: {
    fontSize: 12,
    fontWeight: '500',
  },
});
