import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useFavorites } from '../../hooks/useFavorites';

export const AffirmationCard = ({ affirmation, onShare, compact = false }) => {
  const { isFavorite, toggleFavorite } = useFavorites();
  const isLiked = isFavorite(affirmation.id);

  return (
    <View style={[styles.container, compact && styles.containerCompact]}>
      <LinearGradient
        colors={affirmation.colors}
        style={[styles.gradient, compact && styles.gradientCompact]}
      >
        <View style={[styles.card, compact && styles.cardCompact]}>
          <Text style={[styles.text, compact && styles.textCompact]}>
            "{affirmation.text}"
          </Text>
          {!compact && (
            <View style={styles.actions}>
              <Pressable
                onPress={() => toggleFavorite(affirmation.id)}
                style={[styles.actionButton, isLiked && styles.actionButtonActive]}
              >
                <Ionicons
                  name={isLiked ? 'heart' : 'heart-outline'}
                  size={22}
                  color="#fff"
                />
              </Pressable>
              {onShare && (
                <Pressable onPress={onShare} style={styles.actionButton}>
                  <Ionicons name="share-social" size={22} color="#fff" />
                </Pressable>
              )}
            </View>
          )}
        </View>
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  containerCompact: {
    width: 'auto',
  },
  gradient: {
    borderRadius: 24,
    padding: 2,
  },
  gradientCompact: {
    borderRadius: 16,
  },
  card: {
    backgroundColor: 'rgba(15, 23, 42, 0.9)',
    borderRadius: 22,
    padding: 24,
    alignItems: 'center',
  },
  cardCompact: {
    borderRadius: 14,
    padding: 16,
  },
  text: {
    color: '#fff',
    fontSize: 22,
    textAlign: 'center',
    lineHeight: 30,
  },
  textCompact: {
    fontSize: 16,
    lineHeight: 22,
  },
  actions: {
    flexDirection: 'row',
    gap: 16,
    marginTop: 20,
  },
  actionButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(30, 41, 59, 0.6)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionButtonActive: {
    backgroundColor: '#EF4444',
  },
});
