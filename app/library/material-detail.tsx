import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    ScrollView,
    Share,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView as SafeAreaViewContext } from 'react-native-safe-area-context';
import { useTheme } from '../../contexts/ThemeContext';
import { StudyMaterial, StudyMaterialsManager } from '../../utils/studyMaterialsManager';

export default function MaterialDetail() {
  const { colors } = useTheme();
  const router = useRouter();
  const params = useLocalSearchParams();
  const materialId = Array.isArray(params.id) ? params.id[0] : params.id;

  const [material, setMaterial] = useState<StudyMaterial | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMaterial();
  }, [materialId]);

  const loadMaterial = async () => {
    setLoading(true);
    try {
      const data = await StudyMaterialsManager.getMaterial(materialId);
      if (data) {
        // Record the review
        await StudyMaterialsManager.recordReview(materialId);
        setMaterial(data);
      } else {
        Alert.alert('Error', 'Material not found');
        router.back();
      }
    } catch (e) {
      console.error('Error loading material:', e);
      Alert.alert('Error', 'Could not load material');
      router.back();
    } finally {
      setLoading(false);
    }
  };

  const handleToggleFavorite = async () => {
    if (!material) return;
    try {
      const updated = await StudyMaterialsManager.toggleFavorite(material.id);
      if (updated) {
        setMaterial(updated);
      }
    } catch (e) {
      Alert.alert('Error', 'Could not update favorite status');
    }
  };

  const handleExport = async () => {
    if (!material) return;
    try {
      const json = await StudyMaterialsManager.exportMaterialJSON(material.id);
      if (json) {
        await Share.share({
          message: json,
          title: `${material.fileName} - ${material.method}`,
        });
      }
    } catch (e) {
      Alert.alert('Error', 'Could not export material');
    }
  };

  const handleAddTag = () => {
    Alert.prompt('Add Tag', 'Enter a new tag', [
      { text: 'Cancel', onPress: () => {}, style: 'cancel' },
      {
        text: 'Add',
        onPress: async (tag: string | undefined) => {
          if (material && tag && tag.trim()) {
            try {
              const updated = await StudyMaterialsManager.addTags(material.id, [tag.trim()]);
              if (updated) {
                setMaterial(updated);
              }
            } catch (e) {
              Alert.alert('Error', 'Could not add tag');
            }
          }
        },
      },
    ]);
  };

  const handleDelete = () => {
    Alert.alert('Delete Material', 'Are you sure you want to delete this material?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await StudyMaterialsManager.deleteMaterial(materialId);
            router.back();
          } catch (e) {
            Alert.alert('Error', 'Could not delete material');
          }
        },
      },
    ]);
  };

  if (loading) {
    return (
      <SafeAreaViewContext style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </SafeAreaViewContext>
    );
  }

  if (!material) {
    return (
      <SafeAreaViewContext style={[styles.container, { backgroundColor: colors.background }]}>
        <Text style={{ color: colors.text }}>Material not found</Text>
      </SafeAreaViewContext>
    );
  }

  return (
    <SafeAreaViewContext style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>{material.fileName}</Text>
        <TouchableOpacity onPress={handleToggleFavorite}>
          <Ionicons
            name={material.isFavorite ? 'star' : 'star-outline'}
            size={24}
            color={material.isFavorite ? '#F59E0B' : colors.textSecondary}
          />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        {/* Meta Info */}
        <View style={[styles.metaCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={styles.metaRow}>
            <View style={styles.metaItem}>
              <Ionicons name="document-outline" size={16} color={colors.primary} />
              <Text style={[styles.metaLabel, { color: colors.textSecondary }]}>Type</Text>
              <Text style={[styles.metaValue, { color: colors.text }]}>
                {material.method.charAt(0).toUpperCase() + material.method.slice(1)}
              </Text>
            </View>
            <View style={styles.metaItem}>
              <Ionicons name="eye-outline" size={16} color={colors.primary} />
              <Text style={[styles.metaLabel, { color: colors.textSecondary }]}>Reviewed</Text>
              <Text style={[styles.metaValue, { color: colors.text }]}>{material.reviewCount}</Text>
            </View>
            <View style={styles.metaItem}>
              <Ionicons name="calendar-outline" size={16} color={colors.primary} />
              <Text style={[styles.metaLabel, { color: colors.textSecondary }]}>Created</Text>
              <Text style={[styles.metaValue, { color: colors.text }]}>
                {new Date(material.createdAt).toLocaleDateString()}
              </Text>
            </View>
          </View>

          {material.difficulty && (
            <View style={[styles.difficultyBadge, { backgroundColor: colors.card }]}>
              <Text style={[styles.difficultyText, { color: colors.text }]}>
                Difficulty: {material.difficulty.charAt(0).toUpperCase() + material.difficulty.slice(1)}
              </Text>
            </View>
          )}
        </View>

        {/* Content */}
        <View style={styles.contentSection}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Content</Text>
          <View style={[styles.contentBox, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            {material.method === 'summary' ? (
              <Text style={[styles.contentText, { color: colors.text }]}>
                {typeof material.content === 'string' ? material.content : JSON.stringify(material.content, null, 2)}
              </Text>
            ) : material.method === 'quiz' ? (
              renderQuizContent()
            ) : material.method === 'flashcards' ? (
              renderFlashcardsContent()
            ) : (
              <Text style={[styles.contentText, { color: colors.text }]}>
                {JSON.stringify(material.content, null, 2)}
              </Text>
            )}
          </View>
        </View>

        {/* Extracted Text (if available) */}
        {material.extractedText && (
          <View style={styles.contentSection}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Original Text</Text>
            <View style={[styles.extractedBox, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Text style={[styles.extractedText, { color: colors.textSecondary }]} numberOfLines={4}>
                {material.extractedText}
              </Text>
            </View>
          </View>
        )}

        {/* Tags */}
        <View style={styles.contentSection}>
          <View style={styles.tagsHeader}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Tags</Text>
            <TouchableOpacity onPress={handleAddTag}>
              <Ionicons name="add-circle-outline" size={20} color={colors.primary} />
            </TouchableOpacity>
          </View>
          <View style={styles.tagsContainer}>
            {material.tags.length === 0 ? (
              <Text style={[styles.noTagsText, { color: colors.textSecondary }]}>No tags yet</Text>
            ) : (
              material.tags.map(tag => (
                <View key={tag} style={[styles.tag, { backgroundColor: colors.primary + '20' }]}>
                  <Text style={[styles.tagText, { color: colors.primary }]}>{tag}</Text>
                </View>
              ))
            )}
          </View>
        </View>

        {/* Actions */}
        <View style={styles.actionsSection}>
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: colors.primary }]}
            onPress={handleExport}
          >
            <Ionicons name="share-social-outline" size={20} color={colors.surface} />
            <Text style={[styles.actionText, { color: colors.surface }]}>Export</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: colors.card, borderColor: colors.border, borderWidth: 1 }]}
            onPress={handleDelete}
          >
            <Ionicons name="trash-outline" size={20} color={colors.textSecondary} />
            <Text style={[styles.actionText, { color: colors.textSecondary }]}>Delete</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaViewContext>
  );
}

function renderQuizContent() {
  const { colors } = useTheme();
  const material = null; // This would come from parent

  return (
    <View>
      <Text style={[{ color: colors.text }, { marginBottom: 8 }]}>Quiz Questions</Text>
      {/* Render quiz items */}
    </View>
  );
}

function renderFlashcardsContent() {
  const { colors } = useTheme();

  return (
    <View>
      <Text style={[{ color: colors.text }, { marginBottom: 8 }]}>Flashcards</Text>
      {/* Render flashcards */}
    </View>
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
    fontWeight: '700',
    flex: 1,
    marginHorizontal: 12,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  metaCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 12,
  },
  metaItem: {
    alignItems: 'center',
  },
  metaLabel: {
    fontSize: 11,
    marginTop: 4,
  },
  metaValue: {
    fontSize: 13,
    fontWeight: '700',
    marginTop: 2,
  },
  difficultyBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  difficultyText: {
    fontSize: 12,
    fontWeight: '600',
  },
  contentSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 12,
  },
  contentBox: {
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
  },
  contentText: {
    fontSize: 14,
    lineHeight: 22,
  },
  extractedBox: {
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
  },
  extractedText: {
    fontSize: 13,
    lineHeight: 20,
  },
  tagsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tag: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  tagText: {
    fontSize: 12,
    fontWeight: '600',
  },
  noTagsText: {
    fontSize: 14,
    fontStyle: 'italic',
  },
  actionsSection: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 32,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  actionText: {
    fontSize: 14,
    fontWeight: '600',
  },
});
