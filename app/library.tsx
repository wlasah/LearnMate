import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import React, { useCallback, useState } from 'react';
import {
    ActivityIndicator,
    FlatList,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView as SafeAreaViewContext } from 'react-native-safe-area-context';
import { useTheme } from '../contexts/ThemeContext';
import { StudyMaterial, StudyMaterialsManager } from '../utils/studyMaterialsManager';

export default function StudyLibrary() {
  const { colors } = useTheme();
  const router = useRouter();
  const [materials, setMaterials] = useState<StudyMaterial[]>([]);
  const [filteredMaterials, setFilteredMaterials] = useState<StudyMaterial[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterMethod, setFilterMethod] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'date' | 'reviews' | 'favorites'>('date');
  const [stats, setStats] = useState<any>(null);

  useFocusEffect(
    useCallback(() => {
      loadMaterials();
    }, [])
  );

  const loadMaterials = async () => {
    setLoading(true);
    try {
      let loaded: StudyMaterial[];
      
      if (filterMethod) {
        loaded = await StudyMaterialsManager.getMaterialsByMethod(filterMethod as any);
      } else {
        loaded = await StudyMaterialsManager.getAllMaterials();
      }

      // Sort
      if (sortBy === 'reviews') {
        loaded = await StudyMaterialsManager.getMaterialsSortedByReviewCount();
      } else if (sortBy === 'favorites') {
        loaded = loaded.filter(m => m.isFavorite);
      } else {
        loaded = await StudyMaterialsManager.getMaterialsSortedByDate(true);
      }

      // Search
      if (searchQuery) {
        loaded = loaded.filter(m =>
          m.fileName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          m.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()))
        );
      }

      setMaterials(loaded);
      setFilteredMaterials(loaded);

      // Load stats
      const statsData = await StudyMaterialsManager.getStudyStats();
      setStats(statsData);
    } catch (e) {
      console.error('Error loading materials:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const handleFilterMethod = (method: string | null) => {
    setFilterMethod(filterMethod === method ? null : method);
  };

  const handleDelete = async (id: string) => {
    try {
      await StudyMaterialsManager.deleteMaterial(id);
      loadMaterials();
    } catch (e) {
      console.error('Error deleting material:', e);
    }
  };

  const handleToggleFavorite = async (id: string) => {
    try {
      await StudyMaterialsManager.toggleFavorite(id);
      loadMaterials();
    } catch (e) {
      console.error('Error toggling favorite:', e);
    }
  };

  const getMethodIcon = (method: string) => {
    switch (method) {
      case 'summary':
        return 'document-text-outline';
      case 'quiz':
        return 'help-circle-outline';
      case 'flashcards':
        return 'albums-outline';
      case 'practice':
        return 'clipboard-outline';
      default:
        return 'document-outline';
    }
  };

  const getMethodColor = (method: string) => {
    switch (method) {
      case 'summary':
        return '#3B82F6';
      case 'quiz':
        return '#8B5CF6';
      case 'flashcards':
        return '#EC4899';
      case 'practice':
        return '#F59E0B';
      default:
        return colors.primary;
    }
  };

  const renderMaterial = ({ item }: { item: StudyMaterial }) => (
    <TouchableOpacity
      style={[styles.materialCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
      onPress={() => router.push(`/library/material-detail?id=${item.id}` as any)}
    >
      <View style={styles.cardHeader}>
        <View style={styles.cardIconContainer}>
          <Ionicons
            name={getMethodIcon(item.method) as any}
            size={24}
            color={getMethodColor(item.method)}
          />
        </View>
        <View style={styles.cardTitleContainer}>
          <Text style={[styles.cardTitle, { color: colors.text }]} numberOfLines={1}>
            {item.fileName}
          </Text>
          <Text style={[styles.cardMethod, { color: colors.textSecondary }]}>
            {item.method.charAt(0).toUpperCase() + item.method.slice(1)}
            {item.difficulty ? ` • ${item.difficulty}` : ''}
          </Text>
        </View>
        <TouchableOpacity onPress={() => handleToggleFavorite(item.id)}>
          <Ionicons
            name={item.isFavorite ? 'star' : 'star-outline'}
            size={20}
            color={item.isFavorite ? '#F59E0B' : colors.textSecondary}
          />
        </TouchableOpacity>
      </View>

      <View style={styles.cardFooter}>
        <View style={styles.statsContainer}>
          <Text style={[styles.stat, { color: colors.textSecondary }]}>
            <Ionicons name="eye-outline" size={14} /> {item.reviewCount} views
          </Text>
          {item.lastReviewedAt && (
            <Text style={[styles.stat, { color: colors.textSecondary }]}>
              <Ionicons name="calendar-outline" size={14} /> {new Date(item.lastReviewedAt).toLocaleDateString()}
            </Text>
          )}
        </View>
        <TouchableOpacity
          onPress={() => handleDelete(item.id)}
          style={[styles.deleteBtn, { backgroundColor: colors.card }]}
        >
          <Ionicons name="trash-outline" size={16} color={colors.textSecondary} />
        </TouchableOpacity>
      </View>

      {item.tags.length > 0 && (
        <View style={styles.tagsContainer}>
          {item.tags.map(tag => (
            <View key={tag} style={[styles.tag, { backgroundColor: colors.primary + '20' }]}>
              <Text style={[styles.tagText, { color: colors.primary }]}>{tag}</Text>
            </View>
          ))}
        </View>
      )}
    </TouchableOpacity>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="library-outline" size={64} color={colors.textSecondary} />
      <Text style={[styles.emptyTitle, { color: colors.text }]}>No Study Materials Yet</Text>
      <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
        Upload a PDF and generate study materials to get started!
      </Text>
      <TouchableOpacity
        style={[styles.emptyButton, { backgroundColor: colors.primary }]}
        onPress={() => router.push('/upload-pdf' as any)}
      >
        <Text style={[styles.emptyButtonText, { color: colors.surface }]}>Upload PDF</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaViewContext style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="chevron-back" size={28} color={colors.text} />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Study Library</Text>
          {stats && (
            <Text style={[styles.headerSubtitle, { color: colors.textSecondary }]}>
              {stats.totalMaterials} materials • {stats.totalReviews} reviews
            </Text>
          )}
        </View>
      </View>

      {/* Search */}
      <View style={[styles.searchContainer, { backgroundColor: colors.surface }]}>
        <Ionicons name="search-outline" size={20} color={colors.textSecondary} />
        <TextInput
          style={[styles.searchInput, { color: colors.text }]}
          placeholder="Search materials..."
          placeholderTextColor={colors.textSecondary}
          value={searchQuery}
          onChangeText={handleSearch}
        />
      </View>

      {/* Filters */}
      <View style={[styles.filterContainer, { backgroundColor: colors.surface }]}>
        <TouchableOpacity
          style={[
            styles.filterChip,
            filterMethod === 'summary' && { backgroundColor: colors.primary, borderColor: colors.primary },
            filterMethod !== 'summary' && { borderColor: colors.border },
          ]}
          onPress={() => handleFilterMethod('summary')}
        >
          <Text
            style={[
              styles.filterChipText,
              filterMethod === 'summary' ? { color: colors.surface } : { color: colors.text },
            ]}
          >
            Summary
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.filterChip,
            filterMethod === 'quiz' && { backgroundColor: colors.primary, borderColor: colors.primary },
            filterMethod !== 'quiz' && { borderColor: colors.border },
          ]}
          onPress={() => handleFilterMethod('quiz')}
        >
          <Text
            style={[
              styles.filterChipText,
              filterMethod === 'quiz' ? { color: colors.surface } : { color: colors.text },
            ]}
          >
            Quiz
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.filterChip,
            filterMethod === 'flashcards' && { backgroundColor: colors.primary, borderColor: colors.primary },
            filterMethod !== 'flashcards' && { borderColor: colors.border },
          ]}
          onPress={() => handleFilterMethod('flashcards')}
        >
          <Text
            style={[
              styles.filterChipText,
              filterMethod === 'flashcards' ? { color: colors.surface } : { color: colors.text },
            ]}
          >
            Flashcards
          </Text>
        </TouchableOpacity>
      </View>

      {/* Sort Options */}
      <View style={[styles.sortContainer, { backgroundColor: colors.card }]}>
        <Text style={[styles.sortLabel, { color: colors.text }]}>Sort by:</Text>
        <View style={styles.sortButtons}>
          <TouchableOpacity
            style={[styles.sortBtn, sortBy === 'date' && { backgroundColor: colors.primary }]}
            onPress={() => setSortBy('date')}
          >
            <Text style={[styles.sortBtnText, sortBy === 'date' && { color: colors.surface }]}>Date</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.sortBtn, sortBy === 'reviews' && { backgroundColor: colors.primary }]}
            onPress={() => setSortBy('reviews')}
          >
            <Text style={[styles.sortBtnText, sortBy === 'reviews' && { color: colors.surface }]}>Reviews</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.sortBtn, sortBy === 'favorites' && { backgroundColor: colors.primary }]}
            onPress={() => setSortBy('favorites')}
          >
            <Text style={[styles.sortBtnText, sortBy === 'favorites' && { color: colors.surface }]}>Favorites</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Materials List */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : filteredMaterials.length === 0 ? (
        renderEmptyState()
      ) : (
        <FlatList
          data={filteredMaterials}
          renderItem={renderMaterial}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContent}
          scrollEnabled={true}
        />
      )}
    </SafeAreaViewContext>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  backButton: {
    padding: 8,
    marginRight: 8,
  },
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
  },
  headerSubtitle: {
    fontSize: 12,
    marginTop: 4,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 8,
    height: 40,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 14,
  },
  filterContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
  },
  filterChipText: {
    fontSize: 12,
    fontWeight: '600',
  },
  sortContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 8,
  },
  sortLabel: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 8,
  },
  sortButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  sortBtn: {
    flex: 1,
    paddingVertical: 6,
    borderRadius: 6,
    alignItems: 'center',
    backgroundColor: '#F3F5F7',
  },
  sortBtnText: {
    fontSize: 12,
    fontWeight: '600',
  },
  listContent: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  materialCard: {
    borderRadius: 12,
    padding: 16,
    marginVertical: 8,
    borderWidth: 1,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  cardIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F3F5F7',
  },
  cardTitleContainer: {
    flex: 1,
    marginLeft: 12,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  cardMethod: {
    fontSize: 12,
    marginTop: 4,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statsContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  stat: {
    fontSize: 12,
  },
  deleteBtn: {
    width: 32,
    height: 32,
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 12,
  },
  tag: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  tagText: {
    fontSize: 11,
    fontWeight: '600',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginTop: 16,
  },
  emptySubtitle: {
    fontSize: 14,
    marginTop: 8,
    textAlign: 'center',
  },
  emptyButton: {
    marginTop: 24,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  emptyButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
