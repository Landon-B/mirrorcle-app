import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  FlatList,
  StyleSheet,
} from 'react-native';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { MOODS, getQuadrantById, getFeelingColor } from '../../constants/feelings';
import { useColors } from '../../hooks/useColors';

/**
 * Full-screen overlay for searching emotions by name.
 *
 * Props:
 *   visible     — show/hide the overlay
 *   onSelect(emotionId) — called when a result is tapped
 *   onClose()   — called when the overlay is dismissed
 */
export const BubbleSearchOverlay = ({ visible, onSelect, onClose }) => {
  const c = useColors();
  const [query, setQuery] = useState('');

  // Filter moods (exclude unsure) by label match
  const results = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase().trim();
    return MOODS
      .filter(m => m.quadrant !== null) // exclude 'unsure'
      .filter(m => m.label.toLowerCase().includes(q) || m.definition.toLowerCase().includes(q))
      .slice(0, 15);
  }, [query]);

  if (!visible) return null;

  return (
    <Animated.View
      entering={FadeIn.duration(200)}
      exiting={FadeOut.duration(150)}
      style={[styles.overlay, { backgroundColor: c.background }]}
    >
      {/* Header with close button and search input */}
      <View style={styles.header}>
        <Pressable onPress={onClose} hitSlop={12} style={styles.closeButton}>
          <Ionicons name="close" size={24} color={c.textPrimary} />
        </Pressable>

        <View style={[styles.searchBar, { backgroundColor: c.surface, borderColor: c.border }]}>
          <Ionicons name="search" size={18} color={c.textMuted} />
          <TextInput
            style={[styles.searchInput, { color: c.textPrimary }]}
            placeholder="Search emotions..."
            placeholderTextColor={c.inputPlaceholder}
            value={query}
            onChangeText={setQuery}
            autoFocus
            returnKeyType="search"
          />
          {query.length > 0 && (
            <Pressable onPress={() => setQuery('')} hitSlop={8}>
              <Ionicons name="close-circle" size={18} color={c.textMuted} />
            </Pressable>
          )}
        </View>
      </View>

      {/* Results */}
      {query.trim().length > 0 && results.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={[styles.emptyText, { color: c.textMuted }]}>
            No emotions match "{query}"
          </Text>
        </View>
      ) : (
        <FlatList
          data={results}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.resultsList}
          renderItem={({ item }) => {
            const quadrant = getQuadrantById(item.quadrant);
            const color = getFeelingColor(item.id);
            return (
              <Pressable
                onPress={() => {
                  onSelect(item.id);
                  setQuery('');
                }}
                style={[styles.resultRow, { borderBottomColor: c.border }]}
              >
                <View style={[styles.colorDot, { backgroundColor: color }]} />
                <View style={styles.resultText}>
                  <Text style={[styles.resultLabel, { color: c.textPrimary }]}>
                    {item.label}
                  </Text>
                  <Text style={[styles.resultDefinition, { color: c.textMuted }]} numberOfLines={1}>
                    {item.definition}
                  </Text>
                </View>
                <Text style={[styles.resultQuadrant, { color: quadrant?.colorPrimary }]}>
                  {quadrant?.label}
                </Text>
              </Pressable>
            );
          }}
        />
      )}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 100,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 60,
    paddingBottom: 12,
    gap: 12,
  },
  closeButton: {
    padding: 4,
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 12,
    height: 44,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    height: 44,
  },
  resultsList: {
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  resultRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    gap: 12,
  },
  colorDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
  },
  resultText: {
    flex: 1,
  },
  resultLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  resultDefinition: {
    fontSize: 13,
  },
  resultQuadrant: {
    fontSize: 12,
    fontWeight: '500',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 60,
  },
  emptyText: {
    fontSize: 15,
  },
});
