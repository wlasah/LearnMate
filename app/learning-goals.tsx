import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    Alert,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { Sidebar } from '../components/Sidebar';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';

interface Goal {
  id: string;
  text: string;
  completed: boolean;
  createdAt: number;
}

export default function LearningGoalsPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { colors } = useTheme();
  const [sidebarVisible, setSidebarVisible] = useState(false);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [newGoal, setNewGoal] = useState('');
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  useEffect(() => {
    loadGoals();
  }, [user?.uid]);

  const loadGoals = async () => {
    try {
      const uid = user?.uid || 'anonymous';
      const goalsKey = `learningGoals_${uid}`;
      const saved = await AsyncStorage.getItem(goalsKey);
      if (saved) {
        setGoals(JSON.parse(saved));
      } else {
        setGoals([]);
      }
    } catch (e) {
      console.error('Failed to load goals', e);
      setGoals([]);
    }
  };

  const addGoal = async () => {
    if (!newGoal.trim()) {
      Alert.alert('Error', 'Please enter a goal');
      return;
    }

    const newGoalObj: Goal = {
      id: Date.now().toString(),
      text: newGoal.trim(),
      completed: false,
      createdAt: Date.now(),
    };

    const updatedGoals = [...goals, newGoalObj];
    setGoals(updatedGoals);
    setNewGoal('');

    try {
      const uid = user?.uid || 'anonymous';
      const goalsKey = `learningGoals_${uid}`;
      await AsyncStorage.setItem(goalsKey, JSON.stringify(updatedGoals));
    } catch (e) {
      Alert.alert('Error', 'Failed to save goal');
    }
  };

  const toggleGoal = async (id: string) => {
    const updatedGoals = goals.map(g => 
      g.id === id ? { ...g, completed: !g.completed } : g
    );
    setGoals(updatedGoals);

    try {
      const uid = user?.uid || 'anonymous';
      const goalsKey = `learningGoals_${uid}`;
      await AsyncStorage.setItem(goalsKey, JSON.stringify(updatedGoals));
    } catch (e) {
      Alert.alert('Error', 'Failed to update goal');
    }
  };

  const deleteGoal = async (id: string) => {
    const updatedGoals = goals.filter(g => g.id !== id);
    setGoals(updatedGoals);

    try {
      const uid = user?.uid || 'anonymous';
      const goalsKey = `learningGoals_${uid}`;
      await AsyncStorage.setItem(goalsKey, JSON.stringify(updatedGoals));
    } catch (e) {
      Alert.alert('Error', 'Failed to delete goal');
    }
  };

  const editGoal = async (id: string, newText: string) => {
    if (!newText.trim()) {
      Alert.alert('Error', 'Goal cannot be empty');
      return;
    }

    const updatedGoals = goals.map(g =>
      g.id === id ? { ...g, text: newText.trim() } : g
    );
    setGoals(updatedGoals);
    setEditingId(null);

    try {
      const uid = user?.uid || 'anonymous';
      const goalsKey = `learningGoals_${uid}`;
      await AsyncStorage.setItem(goalsKey, JSON.stringify(updatedGoals));
    } catch (e) {
      Alert.alert('Error', 'Failed to edit goal');
    }
  };

  const getCompletedCount = () => {
    return goals.filter(g => g.completed).length;
  };

  const getProgressPercentage = () => {
    if (goals.length === 0) return 0;
    return Math.round((getCompletedCount() / goals.length) * 100);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.headerBg, borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => setSidebarVisible(true)}>
          <Ionicons name="menu" size={28} color={colors.text} />
        </TouchableOpacity>

        <Text style={[styles.headerTitle, { color: colors.text }]}>Learning Goals</Text>

        <TouchableOpacity onPress={() => router.back()} style={styles.closeButton}>
          <Ionicons name="close" size={28} color={colors.text} />
        </TouchableOpacity>
      </View>

      {/* Sidebar */}
      <Sidebar visible={sidebarVisible} onClose={() => setSidebarVisible(false)} />

      {/* Content */}
      <ScrollView style={[styles.content, { backgroundColor: colors.background }]}>
        {/* Info Card */}
        <View style={[styles.infoCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Ionicons name="flag" size={24} color={colors.primary} />
          <View style={{ marginLeft: 12, flex: 1 }}>
            <Text style={[styles.infoTitle, { color: colors.text }]}>Set Your Learning Goals</Text>
            <Text style={[styles.infoDesc, { color: colors.textSecondary }]}>
              Define what you want to achieve and track your progress
            </Text>
          </View>
        </View>

        {/* Progress Card */}
        {goals.length > 0 && (
          <View style={[styles.progressCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={styles.progressHeader}>
              <Text style={[styles.progressLabel, { color: colors.text }]}>Overall Progress</Text>
              <Text style={[styles.progressPercent, { color: colors.primary }]}>{getProgressPercentage()}%</Text>
            </View>
            <View style={[styles.progressBarContainer, { backgroundColor: colors.surface }]}>
              <View 
                style={[
                  styles.progressBarFill, 
                  { backgroundColor: colors.success, width: `${getProgressPercentage()}%` }
                ]} 
              />
            </View>
            <Text style={[styles.progressText, { color: colors.textSecondary }]}>
              {getCompletedCount()} of {goals.length} goals completed
            </Text>
          </View>
        )}

        {/* Add Goal Section */}
        <View style={styles.addGoalSection}>
          <View style={[styles.inputRow, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Ionicons name="add-circle" size={20} color={colors.primary} />
            <TextInput
              style={[styles.goalInput, { color: colors.text }]}
              placeholder="Add a new goal..."
              value={newGoal}
              onChangeText={setNewGoal}
              placeholderTextColor={colors.textSecondary}
              editable={!loading}
            />
            <TouchableOpacity onPress={addGoal} disabled={!newGoal.trim()}>
              <Ionicons name="checkmark" size={20} color={newGoal.trim() ? colors.primary : colors.textSecondary} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Goals List */}
        {goals.length > 0 ? (
          <View style={styles.goalsList}>
            <Text style={[styles.listTitle, { color: colors.text }]}>
              Your Goals ({goals.length}) · {getCompletedCount()} Done
            </Text>
            {goals.map((goal) => (
              <View 
                key={goal.id} 
                style={[
                  styles.goalItem, 
                  { 
                    backgroundColor: colors.surface, 
                    borderColor: goal.completed ? colors.success : colors.border,
                    borderLeftColor: goal.completed ? colors.success : colors.primary,
                    borderLeftWidth: 4,
                  }
                ]}
              >
                <TouchableOpacity 
                  style={styles.checkboxContainer}
                  onPress={() => toggleGoal(goal.id)}
                >
                  <View 
                    style={[
                      styles.checkbox,
                      {
                        backgroundColor: goal.completed ? colors.success : 'transparent',
                        borderColor: goal.completed ? colors.success : colors.textSecondary,
                      }
                    ]}
                  >
                    {goal.completed && (
                      <Ionicons name="checkmark" size={16} color="#fff" />
                    )}
                  </View>
                </TouchableOpacity>

                <View style={{ flex: 1, marginLeft: 12 }}>
                  {editingId === goal.id ? (
                    <TextInput
                      style={[styles.editInput, { color: colors.text, borderColor: colors.primary }]}
                      value={goal.text}
                      onChangeText={(text) => {
                        const updatedGoals = goals.map(g =>
                          g.id === goal.id ? { ...g, text } : g
                        );
                        setGoals(updatedGoals);
                      }}
                      onBlur={() => editGoal(goal.id, goal.text)}
                      autoFocus
                      placeholderTextColor={colors.textSecondary}
                    />
                  ) : (
                    <TouchableOpacity onLongPress={() => setEditingId(goal.id)}>
                      <Text 
                        style={[
                          styles.goalText, 
                          { 
                            color: colors.text,
                            textDecorationLine: goal.completed ? 'line-through' : 'none',
                            opacity: goal.completed ? 0.6 : 1,
                          }
                        ]}
                      >
                        {goal.text}
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>

                <TouchableOpacity onPress={() => deleteGoal(goal.id)} style={styles.deleteBtn}>
                  <Ionicons name="trash-outline" size={18} color="#FF4B4B" />
                </TouchableOpacity>
              </View>
            ))}
          </View>
        ) : (
          <View style={[styles.emptyState, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Ionicons name="flag-outline" size={40} color={colors.textSecondary} />
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>No goals yet</Text>
            <Text style={[styles.emptySubtext, { color: colors.textSecondary }]}>Add your first goal to get started</Text>
          </View>
        )}

        <View style={{ height: 20 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    flex: 1,
    textAlign: 'center',
  },
  closeButton: {
    padding: 4,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 16,
    paddingHorizontal: 14,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 24,
  },
  infoTitle: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 4,
  },
  infoDesc: {
    fontSize: 12,
  },
  progressCard: {
    paddingVertical: 16,
    paddingHorizontal: 14,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 20,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  progressLabel: {
    fontSize: 14,
    fontWeight: '600',
  },
  progressPercent: {
    fontSize: 18,
    fontWeight: '700',
  },
  progressBarContainer: {
    height: 8,
    borderRadius: 4,
    marginBottom: 10,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 12,
  },
  addGoalSection: {
    marginBottom: 24,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    gap: 8,
  },
  goalInput: {
    flex: 1,
    fontSize: 14,
  },
  goalsList: {
    marginBottom: 20,
  },
  listTitle: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 12,
  },
  goalItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 10,
  },
  checkboxContainer: {
    padding: 4,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  editInput: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    fontSize: 14,
    fontWeight: '500',
  },
  goalText: {
    fontSize: 14,
    fontWeight: '500',
  },
  deleteBtn: {
    padding: 4,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
    borderRadius: 12,
    borderWidth: 1,
  },
  emptyText: {
    fontSize: 15,
    fontWeight: '600',
    marginTop: 12,
  },
  emptySubtext: {
    fontSize: 12,
    marginTop: 4,
  },
  footer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
  },
  saveBtn: {
    backgroundColor: '#2FB46E',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  saveBtnText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  },
});
