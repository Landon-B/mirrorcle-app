import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, StatusBar, Pressable,
  TextInput, ActivityIndicator, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { GradientBackground, PrimaryButton, GhostButton, Card } from '../components/common';
import { useApp } from '../context/AppContext';
import { customAffirmationService } from '../services/personalization';

const MAX_LENGTH = 150;
const FREE_MAX_COUNT = 3;

export const CustomAffirmationsScreen = ({ navigation }) => {
  const { user, isPro } = useApp();
  const [affirmations, setAffirmations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [newText, setNewText] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editText, setEditText] = useState('');

  useEffect(() => {
    loadAffirmations();
  }, []);

  const loadAffirmations = async () => {
    if (!user?.id) return;
    try {
      const data = await customAffirmationService.getAll(user.id);
      setAffirmations(data);
    } catch (error) {
      console.error('Error loading custom affirmations:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAdd = async () => {
    const trimmed = newText.trim();
    if (!trimmed) return;

    if (!isPro && affirmations.length >= FREE_MAX_COUNT) {
      Alert.alert('Upgrade to Pro', 'Free users can create up to 3 custom affirmations. Upgrade to Pro for unlimited.');
      return;
    }

    try {
      const created = await customAffirmationService.create(user.id, trimmed);
      setAffirmations(prev => [created, ...prev]);
      setNewText('');
    } catch (error) {
      console.error('Error creating custom affirmation:', error);
    }
  };

  const handleToggleActive = async (item) => {
    try {
      const updated = await customAffirmationService.update(item.id, user.id, {
        isActive: !item.isActive,
      });
      setAffirmations(prev => prev.map(a => a.id === item.id ? updated : a));
    } catch (error) {
      console.error('Error toggling affirmation:', error);
    }
  };

  const handleDelete = async (item) => {
    Alert.alert('Delete Affirmation', 'Are you sure you want to delete this affirmation?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await customAffirmationService.delete(item.id, user.id);
            setAffirmations(prev => prev.filter(a => a.id !== item.id));
          } catch (error) {
            console.error('Error deleting affirmation:', error);
          }
        },
      },
    ]);
  };

  const handleSaveEdit = async () => {
    const trimmed = editText.trim();
    if (!trimmed || !editingId) return;

    try {
      const updated = await customAffirmationService.update(editingId, user.id, {
        text: trimmed,
      });
      setAffirmations(prev => prev.map(a => a.id === editingId ? updated : a));
      setEditingId(null);
      setEditText('');
    } catch (error) {
      console.error('Error updating affirmation:', error);
    }
  };

  const startEditing = (item) => {
    setEditingId(item.id);
    setEditText(item.text);
  };

  const canAdd = isPro || affirmations.length < FREE_MAX_COUNT;

  if (isLoading) {
    return (
      <GradientBackground>
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#A855F7" />
          </View>
        </SafeAreaView>
      </GradientBackground>
    );
  }

  return (
    <GradientBackground>
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="light-content" />
        <View style={styles.header}>
          <Pressable onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </Pressable>
          <Text style={styles.title}>My Affirmations</Text>
          <View style={styles.placeholder} />
        </View>

        <ScrollView contentContainerStyle={styles.content}>
          <Card style={styles.inputCard}>
            <Text style={styles.inputLabel}>Create New Affirmation</Text>
            <TextInput
              style={styles.textInput}
              placeholder="I am..."
              placeholderTextColor="#64748B"
              value={newText}
              onChangeText={setNewText}
              maxLength={MAX_LENGTH}
              multiline
            />
            <View style={styles.inputFooter}>
              <Text style={styles.charCount}>{newText.length}/{MAX_LENGTH}</Text>
              <PrimaryButton
                title="Add"
                icon="add"
                onPress={handleAdd}
                disabled={!newText.trim() || !canAdd}
                style={styles.addButton}
              />
            </View>
            {!isPro && (
              <Text style={styles.limitText}>
                {affirmations.length}/{FREE_MAX_COUNT} free affirmations used
              </Text>
            )}
          </Card>

          {affirmations.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="create-outline" size={48} color="#475569" />
              <Text style={styles.emptyTitle}>No custom affirmations yet</Text>
              <Text style={styles.emptySubtitle}>
                Create your own affirmations that will appear in your mirror sessions
              </Text>
            </View>
          ) : (
            affirmations.map((item) => (
              <Card key={item.id} style={styles.affirmationCard}>
                {editingId === item.id ? (
                  <View>
                    <TextInput
                      style={styles.editInput}
                      value={editText}
                      onChangeText={setEditText}
                      maxLength={MAX_LENGTH}
                      multiline
                      autoFocus
                    />
                    <View style={styles.editActions}>
                      <GhostButton title="Cancel" onPress={() => setEditingId(null)} style={styles.editButton} />
                      <PrimaryButton title="Save" onPress={handleSaveEdit} style={styles.editButton} />
                    </View>
                  </View>
                ) : (
                  <View>
                    <Text style={[styles.affirmationText, !item.isActive && styles.affirmationTextInactive]}>
                      "{item.text}"
                    </Text>
                    <View style={styles.affirmationActions}>
                      <Pressable onPress={() => handleToggleActive(item)} style={styles.actionButton}>
                        <Ionicons
                          name={item.isActive ? 'checkmark-circle' : 'ellipse-outline'}
                          size={22}
                          color={item.isActive ? '#34D399' : '#475569'}
                        />
                        <Text style={[styles.actionText, item.isActive && styles.actionTextActive]}>
                          {item.isActive ? 'Active' : 'Inactive'}
                        </Text>
                      </Pressable>
                      <View style={styles.rightActions}>
                        <Pressable onPress={() => startEditing(item)} style={styles.iconAction}>
                          <Ionicons name="pencil" size={18} color="#94A3B8" />
                        </Pressable>
                        <Pressable onPress={() => handleDelete(item)} style={styles.iconAction}>
                          <Ionicons name="trash-outline" size={18} color="#EF4444" />
                        </Pressable>
                      </View>
                    </View>
                  </View>
                )}
              </Card>
            ))
          )}
        </ScrollView>
      </SafeAreaView>
    </GradientBackground>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  loadingContainer: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  backButton: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: 'rgba(30, 41, 59, 0.6)',
    alignItems: 'center', justifyContent: 'center',
  },
  title: { color: '#fff', fontSize: 20, fontWeight: '600' },
  placeholder: { width: 40 },
  content: { padding: 20, gap: 16 },
  inputCard: { gap: 12 },
  inputLabel: { color: '#fff', fontSize: 16, fontWeight: '600' },
  textInput: {
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    borderRadius: 12,
    padding: 14,
    color: '#fff',
    fontSize: 16,
    borderWidth: 1,
    borderColor: 'rgba(71, 85, 105, 0.6)',
    minHeight: 60,
    textAlignVertical: 'top',
  },
  inputFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  charCount: { color: '#64748B', fontSize: 12 },
  addButton: { minWidth: 100 },
  limitText: { color: '#94A3B8', fontSize: 12, marginTop: 4 },
  emptyState: { alignItems: 'center', paddingVertical: 40, gap: 12 },
  emptyTitle: { color: '#CBD5F5', fontSize: 18, fontWeight: '600' },
  emptySubtitle: { color: '#94A3B8', fontSize: 14, textAlign: 'center' },
  affirmationCard: { gap: 12 },
  affirmationText: { color: '#fff', fontSize: 16, fontStyle: 'italic', lineHeight: 24 },
  affirmationTextInactive: { color: '#64748B' },
  affirmationActions: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  actionButton: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  actionText: { color: '#475569', fontSize: 13 },
  actionTextActive: { color: '#34D399' },
  rightActions: { flexDirection: 'row', gap: 16 },
  iconAction: { padding: 4 },
  editInput: {
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    borderRadius: 12,
    padding: 14,
    color: '#fff',
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#A855F7',
    minHeight: 60,
    textAlignVertical: 'top',
  },
  editActions: { flexDirection: 'row', gap: 8, marginTop: 8 },
  editButton: { flex: 1 },
});
