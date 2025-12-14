import AsyncStorage from '@react-native-async-storage/async-storage';

export interface StudyMaterial {
  id: string;
  fileName: string;
  method: 'summary' | 'quiz' | 'flashcards' | 'practice';
  difficulty?: 'easy' | 'medium' | 'hard';
  content: any; // The actual AI-generated content
  extractedText?: string;
  isFavorite: boolean;
  tags: string[];
  createdAt: number;
  updatedAt: number;
  reviewCount: number;
  lastReviewedAt?: number;
}

const STORAGE_KEY = 'studyMaterials';

export const StudyMaterialsManager = {
  /**
   * Save a new study material
   */
  async saveMaterial(material: Omit<StudyMaterial, 'id' | 'createdAt' | 'updatedAt' | 'isFavorite' | 'tags' | 'reviewCount'>): Promise<StudyMaterial> {
    const now = Date.now();
    const newMaterial: StudyMaterial = {
      ...material,
      id: `material_${now}_${Math.random().toString(36).substr(2, 9)}`,
      isFavorite: false,
      tags: [],
      createdAt: now,
      updatedAt: now,
      reviewCount: 0,
    };

    const materials = await this.getAllMaterials();
    materials.push(newMaterial);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(materials));
    
    return newMaterial;
  },

  /**
   * Get all study materials
   */
  async getAllMaterials(): Promise<StudyMaterial[]> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      console.error('Error loading materials:', e);
      return [];
    }
  },

  /**
   * Get a single material by ID
   */
  async getMaterial(id: string): Promise<StudyMaterial | null> {
    const materials = await this.getAllMaterials();
    return materials.find(m => m.id === id) || null;
  },

  /**
   * Update a material
   */
  async updateMaterial(id: string, updates: Partial<StudyMaterial>): Promise<StudyMaterial | null> {
    const materials = await this.getAllMaterials();
    const index = materials.findIndex(m => m.id === id);
    
    if (index === -1) return null;

    const updated = {
      ...materials[index],
      ...updates,
      id: materials[index].id, // Don't allow ID to be changed
      createdAt: materials[index].createdAt, // Don't allow creation date to change
      updatedAt: Date.now(),
    };

    materials[index] = updated;
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(materials));
    
    return updated;
  },

  /**
   * Delete a material
   */
  async deleteMaterial(id: string): Promise<boolean> {
    const materials = await this.getAllMaterials();
    const filtered = materials.filter(m => m.id !== id);
    
    if (filtered.length === materials.length) return false;
    
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
    return true;
  },

  /**
   * Toggle favorite status
   */
  async toggleFavorite(id: string): Promise<StudyMaterial | null> {
    const material = await this.getMaterial(id);
    if (!material) return null;
    
    return this.updateMaterial(id, { isFavorite: !material.isFavorite });
  },

  /**
   * Add tags to a material
   */
  async addTags(id: string, newTags: string[]): Promise<StudyMaterial | null> {
    const material = await this.getMaterial(id);
    if (!material) return null;
    
    const tags = Array.from(new Set([...material.tags, ...newTags]));
    return this.updateMaterial(id, { tags });
  },

  /**
   * Record a review
   */
  async recordReview(id: string): Promise<StudyMaterial | null> {
    const material = await this.getMaterial(id);
    if (!material) return null;
    
    return this.updateMaterial(id, {
      reviewCount: material.reviewCount + 1,
      lastReviewedAt: Date.now(),
    });
  },

  /**
   * Get materials by method
   */
  async getMaterialsByMethod(method: StudyMaterial['method']): Promise<StudyMaterial[]> {
    const materials = await this.getAllMaterials();
    return materials.filter(m => m.method === method);
  },

  /**
   * Search materials by filename or tags
   */
  async searchMaterials(query: string): Promise<StudyMaterial[]> {
    const materials = await this.getAllMaterials();
    const lowerQuery = query.toLowerCase();
    
    return materials.filter(m =>
      m.fileName.toLowerCase().includes(lowerQuery) ||
      m.tags.some(tag => tag.toLowerCase().includes(lowerQuery))
    );
  },

  /**
   * Get favorite materials
   */
  async getFavoriteMaterials(): Promise<StudyMaterial[]> {
    const materials = await this.getAllMaterials();
    return materials.filter(m => m.isFavorite);
  },

  /**
   * Get materials sorted by date (newest first)
   */
  async getMaterialsSortedByDate(desc = true): Promise<StudyMaterial[]> {
    const materials = await this.getAllMaterials();
    return materials.sort((a, b) => desc ? b.createdAt - a.createdAt : a.createdAt - b.createdAt);
  },

  /**
   * Get materials sorted by review count
   */
  async getMaterialsSortedByReviewCount(): Promise<StudyMaterial[]> {
    const materials = await this.getAllMaterials();
    return materials.sort((a, b) => b.reviewCount - a.reviewCount);
  },

  /**
   * Get study statistics
   */
  async getStudyStats() {
    const materials = await this.getAllMaterials();
    
    return {
      totalMaterials: materials.length,
      byMethod: {
        summary: materials.filter(m => m.method === 'summary').length,
        quiz: materials.filter(m => m.method === 'quiz').length,
        flashcards: materials.filter(m => m.method === 'flashcards').length,
        practice: materials.filter(m => m.method === 'practice').length,
      },
      favorites: materials.filter(m => m.isFavorite).length,
      totalReviews: materials.reduce((sum, m) => sum + m.reviewCount, 0),
      lastActivity: materials.length > 0 ? Math.max(...materials.map(m => m.updatedAt)) : null,
    };
  },

  /**
   * Export material as JSON
   */
  async exportMaterialJSON(id: string): Promise<string | null> {
    const material = await this.getMaterial(id);
    if (!material) return null;
    
    return JSON.stringify(material, null, 2);
  },

  /**
   * Export all materials as JSON
   */
  async exportAllMaterials(): Promise<string> {
    const materials = await this.getAllMaterials();
    return JSON.stringify(materials, null, 2);
  },

  /**
   * Clear all materials (use with caution!)
   */
  async clearAllMaterials(): Promise<void> {
    await AsyncStorage.removeItem(STORAGE_KEY);
  },
};
