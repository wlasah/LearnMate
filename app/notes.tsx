import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { collection, onSnapshot, orderBy, query } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  FlatList,
  SafeAreaView,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { exportAsMarkdown, exportAsText } from '../utils/exportNotes';
const firebaseConfig: any = require('../config/firebase');

interface Note {
  id: string;
  title: string;
  content: string;
  topic?: string;
  tags?: string[];
  createdAt: any;
  updatedAt?: any;
}

export default function NotesScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { colors } = useTheme();
  const [searchText, setSearchText] = useState('');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [notes, setNotes] = useState<Note[]>([]);
  const [filteredNotes, setFilteredNotes] = useState<Note[]>([]);
  const [allTags, setAllTags] = useState<string[]>([]);

  // Subscribe to notes from Firestore for current user
  useEffect(() => {
    if (!user?.uid) {
      // Load local notes fallback
      (async () => {
        try {
          const raw = await AsyncStorage.getItem('localNotes');
          const localNotes = raw ? JSON.parse(raw) : [];
          setNotes(localNotes || []);
        } catch (e) {
          console.error('failed loading local notes', e);
        }
      })();
      return;
    }

    const db = firebaseConfig.db;
    try {
      const q = query(
        collection(db, 'users', user.uid, 'notes'),
        orderBy('updatedAt', 'desc')
      );
      const unsub = onSnapshot(q, (snap) => {
        const items: Note[] = [];
        const tags = new Set<string>();
        snap.forEach((d) => {
          const noteData = d.data();
          items.push({
            id: d.id,
            title: noteData?.title || 'Untitled',
            content: noteData?.content || '',
            topic: noteData?.topic,
            tags: noteData?.tags || [],
            createdAt: noteData?.createdAt,
            updatedAt: noteData?.updatedAt,
          });
          if (noteData?.tags && Array.isArray(noteData.tags)) {
            noteData.tags.forEach((t: string) => tags.add(t));
          }
        });
        setNotes(items);
        setAllTags(Array.from(tags).sort());
      }, (err) => console.error('notes fetch error', err));
      return () => unsub();
    } catch (e) {
      console.error('notes setup failed', e);
    }
  }, [user?.uid]);

  // Filter notes by search text and selected tag
  useEffect(() => {
    let filtered = notes;

    // Filter by tag
    if (selectedTag) {
      filtered = filtered.filter(n => n.tags && n.tags.includes(selectedTag));
    }

    // Filter by search text
    if (searchText.trim()) {
      const lower = searchText.toLowerCase();
      filtered = filtered.filter(
        (n) =>
          n.title.toLowerCase().includes(lower) ||
          n.content.toLowerCase().includes(lower) ||
          (n.topic && n.topic.toLowerCase().includes(lower))
      );
    }

    setFilteredNotes(filtered);
  }, [searchText, notes, selectedTag]);

  const handleNotePress = (note: Note) => {
    // Navigate to note detail/edit page (you can create this later)
    router.push((`/note-detail?id=${note.id}`) as any);
  };

  const handleExportNote = (note: Note) => {
    Alert.alert('Export note', 'Choose format', [
      {
        text: 'Text',
        onPress: async () => {
          const text = exportAsText(note.title, note.content, note.topic, note.tags);
          await Share.share({ message: text, title: note.title });
        },
      },
      {
        text: 'Markdown',
        onPress: async () => {
          const md = exportAsMarkdown(note.title, note.content, note.topic, note.tags);
          await Share.share({ message: md, title: note.title });
        },
      },
      { text: 'Cancel', onPress: () => {} },
    ]);
  };

  const renderNoteCard = ({ item }: { item: Note }) => {
    const preview = item.content.substring(0, 80) + (item.content.length > 80 ? '...' : '');
    const dateStr = item.updatedAt?.toDate ? item.updatedAt.toDate().toLocaleDateString() : '';

    return (
      <View style={styles.noteCardContainer}>
        <TouchableOpacity style={[styles.noteCard, { backgroundColor: colors.surface, borderColor: colors.border }]} onPress={() => handleNotePress(item)}>
          {/* Title and Icon Row */}
          <View style={styles.noteHeader}>
            <Text style={[styles.noteTitle, { color: colors.text }]} numberOfLines={2}>{item.title}</Text>
            <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} style={{ marginLeft: 8 }} />
          </View>
          
          {/* Topic as Label */}
          {item.topic && (
            <View style={[styles.topicLabel, { backgroundColor: colors.primary + '15' }]}>
              <Text style={[styles.topicLabelText, { color: colors.primary }]}>{item.topic}</Text>
            </View>
          )}
          
          {/* Preview Text */}
          <Text style={[styles.notePreview, { color: colors.textSecondary }]} numberOfLines={2}>{preview}</Text>
          
          {/* Tags Row */}
          {item.tags && item.tags.length > 0 && (
            <View style={styles.tagsRow}>
              {item.tags.slice(0, 3).map((tag, idx) => (
                <View key={idx} style={[styles.tagChip, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                  <Text style={[styles.tagChipText, { color: colors.primary }]}>{tag}</Text>
                </View>
              ))}
              {item.tags.length > 3 && (
                <Text style={[styles.moreTagsText, { color: colors.textSecondary }]}>+{item.tags.length - 3}</Text>
              )}
            </View>
          )}
          
          {/* Date Footer */}
          <Text style={[styles.noteDate, { color: colors.textSecondary }]}>{dateStr}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.exportBtn} onPress={() => handleExportNote(item)}>
          <Ionicons name="download-outline" size={20} color={colors.primary} />
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header with back button */}
      <View style={[styles.header, { backgroundColor: colors.headerBg, borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Notes</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Search bar */}
      <View style={[styles.searchContainer, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <Ionicons name="search" size={18} color={colors.textSecondary} style={styles.searchIcon} />
        <TextInput
          style={[styles.searchInput, { color: colors.text }]}
          placeholder="Search notes..."
          placeholderTextColor={colors.textSecondary}
          value={searchText}
          onChangeText={setSearchText}
        />
      </View>

      {/* Tags filter */}
      {allTags.length > 0 && (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tagsFilter}>
          <TouchableOpacity
            style={[styles.tagFilterBtn, selectedTag === null && styles.tagFilterBtnActive]}
            onPress={() => setSelectedTag(null)}
          >
            <Text style={[styles.tagFilterText, selectedTag === null && styles.tagFilterTextActive, { color: selectedTag === null ? '#fff' : colors.text }]}>All</Text>
          </TouchableOpacity>
          {allTags.map((tag) => (
            <TouchableOpacity
              key={tag}
              style={[styles.tagFilterBtn, selectedTag === tag && styles.tagFilterBtnActive, { backgroundColor: selectedTag === tag ? colors.primary : colors.surface, borderColor: selectedTag === tag ? colors.primary : colors.border }]}
              onPress={() => setSelectedTag(selectedTag === tag ? null : tag)}
            >
              <Text style={[styles.tagFilterText, selectedTag === tag && styles.tagFilterTextActive, { color: selectedTag === tag ? '#fff' : colors.text }]}>{tag}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}

      {/* Notes list */}
      <View style={[styles.content, { backgroundColor: colors.background }]}>
        {filteredNotes.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="document-text-outline" size={48} color={colors.primary} />
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
              {notes.length === 0 ? 'No notes yet' : 'No matching notes'}
            </Text>
          </View>
        ) : (
          <FlatList
            data={filteredNotes}
            keyExtractor={(item) => item.id}
            renderItem={renderNoteCard}
            scrollEnabled={true}
            contentContainerStyle={{ gap: 8 }}
          />
        )}
      </View>

      {/* Floating action button to create new note */}
      <TouchableOpacity
        style={[styles.fab, { backgroundColor: colors.primary }]}
        onPress={() => router.push('/note-detail?new=true' as any)}
      >
        <Ionicons name="add" size={28} color={colors.surface} />
      </TouchableOpacity>
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
  },
  headerTitle: {
    fontSize: 20, fontWeight: '600'
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 20,
    borderWidth: 1,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 10,
    fontSize: 14,
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  noteCard: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 14,
    marginBottom: 8,
    flex: 1,
  },
  noteHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  noteTitle: {
    fontSize: 16,
    fontWeight: '700',
    flex: 1,
    lineHeight: 22,
  },
  topicLabel: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    marginBottom: 8,
  },
  topicLabelText: {
    fontSize: 12,
    fontWeight: '600',
  },
  noteTopic: {
    fontSize: 12,
    fontWeight: '500',
    marginTop: 4,
  },
  notePreview: {
    fontSize: 13,
    marginBottom: 8,
    lineHeight: 18,
  },
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 8,
  },
  tagChip: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
  },
  tagChipText: {
    fontSize: 11,
    fontWeight: '500',
  },
  moreTagsText: {
    fontSize: 11,
    fontWeight: '600',
    paddingHorizontal: 4,
    paddingVertical: 4,
  },
  noteDate: {
    fontSize: 11,
    fontWeight: '500',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    marginTop: 12,
    fontSize: 14,
    color: '#999',
  },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  tagsFilter: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  tagFilterBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
    borderRadius: 16,
    borderWidth: 1,
  },
  tagFilterBtnActive: {
  },
  tagFilterText: {
    fontSize: 12,
    fontWeight: '500',
  },
  tagFilterTextActive: {
  },
  noteCardContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
    gap: 8,
  },
  exportBtn: {
    padding: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
