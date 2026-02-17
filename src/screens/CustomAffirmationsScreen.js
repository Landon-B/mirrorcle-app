import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, StatusBar, Pressable,
  TextInput, ActivityIndicator, Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { PrimaryButton, GhostButton, Card, ScreenHeader } from '../components/common';
import { useApp } from '../context/AppContext';
import { customAffirmationService } from '../services/personalization';
import { useColors } from '../hooks/useColors';

const MAX_LENGTH = 150;
const FREE_MAX_COUNT = 3;

export const CustomAffirmationsScreen = ({ navigation }) => {
  const { user, isPro } = useApp();
  const c = useColors();
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
      <View style={[styles.container, { backgroundColor: c.background }]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={c.accentRust} />
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: c.background }]}>
        <StatusBar barStyle={c.statusBarStyle} />
        <ScreenHeader title="My Affirmations" onBack={() => navigation.goBack()} />

        <ScrollView contentContainerStyle={styles.content}>
          <Card style={styles.inputCard}>
            <Text style={[styles.inputLabel, { color: c.textPrimary }]}>Create New Affirmation</Text>
            <TextInput
              style={[styles.textInput, { backgroundColor: c.inputBackground, color: c.textPrimary, borderColor: c.inputBorder }]}
              placeholder="I am..."
              placeholderTextColor={c.inputPlaceholder}
              value={newText}
              onChangeText={setNewText}
              maxLength={MAX_LENGTH}
              multiline
            />
            <View style={styles.inputFooter}>
              <Text style={[styles.charCount, { color: c.textMuted }]}>{newText.length}/{MAX_LENGTH}</Text>
              <PrimaryButton
                title="Add"
                icon="add"
                onPress={handleAdd}
                disabled={!newText.trim() || !canAdd}
                style={styles.addButton}
              />
            </View>
            {!isPro && (
              <Text style={[styles.limitText, { color: c.textSecondary }]}>
                {affirmations.length}/{FREE_MAX_COUNT} free affirmations used
              </Text>
            )}
          </Card>

          {affirmations.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="create-outline" size={48} color={c.border} />
              <Text style={[styles.emptyTitle, { color: c.textPrimary }]}>No custom affirmations yet</Text>
              <Text style={[styles.emptySubtitle, { color: c.textSecondary }]}>
                Create your own affirmations that will appear in your mirror sessions
              </Text>
            </View>
          ) : (
            affirmations.map((item) => (
              <Card key={item.id} style={styles.affirmationCard}>
                {editingId === item.id ? (
                  <View>
                    <TextInput
                      style={[styles.editInput, { backgroundColor: c.inputBackground, color: c.textPrimary, borderColor: c.inputBorderFocused }]}
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
                    <Text style={[styles.affirmationText, { color: c.textPrimary }, !item.isActive && { color: c.textMuted }]}>
                      "{item.text}"
                    </Text>
                    <View style={styles.affirmationActions}>
                      <Pressable onPress={() => handleToggleActive(item)} style={styles.actionButton}>
                        <Ionicons
                          name={item.isActive ? 'checkmark-circle' : 'ellipse-outline'}
                          size={22}
                          color={item.isActive ? c.success : c.border}
                        />
                        <Text style={[styles.actionText, { color: c.textMuted }, item.isActive && { color: c.success }]}>
                          {item.isActive ? 'Active' : 'Inactive'}
                        </Text>
                      </Pressable>
                      <View style={styles.rightActions}>
                        <Pressable onPress={() => startEditing(item)} style={styles.iconAction}>
                          <Ionicons name="pencil" size={18} color={c.textSecondary} />
                        </Pressable>
                        <Pressable onPress={() => handleDelete(item)} style={styles.iconAction}>
                          <Ionicons name="trash-outline" size={18} color={c.error} />
                        </Pressable>
                      </View>
                    </View>
                  </View>
                )}
              </Card>
            ))
          )}
        </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  loadingContainer: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  content: { padding: 20, gap: 16 },
  inputCard: { gap: 12 },
  inputLabel: { fontSize: 16, fontWeight: '600' },
  textInput: {
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
    borderWidth: 1,
    minHeight: 60,
    textAlignVertical: 'top',
  },
  inputFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  charCount: { fontSize: 12 },
  addButton: { minWidth: 100 },
  limitText: { fontSize: 12, marginTop: 4 },
  emptyState: { alignItems: 'center', paddingVertical: 40, gap: 12 },
  emptyTitle: { fontSize: 18, fontWeight: '600' },
  emptySubtitle: { fontSize: 14, textAlign: 'center' },
  affirmationCard: { gap: 12 },
  affirmationText: { fontSize: 16, fontStyle: 'italic', lineHeight: 24 },
  affirmationActions: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  actionButton: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  actionText: { fontSize: 13 },
  rightActions: { flexDirection: 'row', gap: 16 },
  iconAction: { padding: 4 },
  editInput: {
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
    borderWidth: 1,
    minHeight: 60,
    textAlignVertical: 'top',
  },
  editActions: { flexDirection: 'row', gap: 8, marginTop: 8 },
  editButton: { flex: 1 },
});
