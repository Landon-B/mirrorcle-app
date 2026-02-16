import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useFavorites } from '../../hooks/useFavorites';
import { getCardColors, CARD_GRADIENTS } from '../../constants/cardPalette';
import { typography } from '../../styles/typography';

// Simple hash to get a stable index from an affirmation id
const hashIndex = (id) => {
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = ((hash << 5) - hash + id.charCodeAt(i)) | 0;
  }
  return Math.abs(hash) % CARD_GRADIENTS.length;
};

export const AffirmationCard = ({ affirmation, onShare, compact = false, index }) => {
  const { isFavorite, toggleFavorite } = useFavorites();
  const isLiked = isFavorite(affirmation.id);
  const colors = index != null ? getCardColors(index) : getCardColors(hashIndex(affirmation.id));

  return (
    <View style={[styles.container, compact && styles.containerCompact]}>
      <LinearGradient
        colors={colors}
        style={[styles.card, compact && styles.cardCompact]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <Text style={[styles.text, compact && styles.textCompact]}>
          {affirmation.text}
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
  card: {
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  cardCompact: {
    borderRadius: 16,
    padding: 16,
  },
  text: {
    color: '#FFFFFF',
    fontFamily: typography.fontFamily.display,
    fontSize: 22,
    textAlign: 'center',
    lineHeight: 34,
    letterSpacing: 0.3,
  },
  textCompact: {
    fontSize: 16,
    lineHeight: 24,
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
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionButtonActive: {
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
  },
});
