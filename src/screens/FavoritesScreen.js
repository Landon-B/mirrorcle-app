import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  StatusBar,
  Pressable,
  ActivityIndicator,
  Platform,
  Share,
} from 'react-native';
import Animated, { FadeIn, FadeInUp } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { PrimaryButton, FloatingParticles, ScreenHeader } from '../components/common';
import { AFFIRMATIONS, getAffirmationById } from '../constants';
import { userProfileService } from '../services/user';
import { sessionService } from '../services/session';
import { useFavorites } from '../hooks/useFavorites';
import { useApp } from '../context/AppContext';
import { useHaptics } from '../hooks/useHaptics';
import { typography } from '../styles/typography';
import { formatRelativeDate } from '../utils/dateUtils';
import { getFocusAreaById, FOCUS_AREAS } from '../constants/focusAreas';
import { getMoodEmoji } from '../constants/feelings';

const SERIF_ITALIC = Platform.OS === 'ios' ? 'Georgia-Italic' : 'serif';

const COLORS = {
  background: '#F5F2EE',
  card: '#FFFFFF',
  textPrimary: '#2D2A26',
  textSecondary: '#7A756E',
  textMuted: '#B0AAA2',
  accent: '#C17666',
  accentLight: '#E8A090',
  peach: '#E8D0C6',
  warmTint: '#FDF5F2',
  border: '#E8E4DF',
  surfaceTertiary: '#F0ECE7',
};

// --- Helpers ---

/**
 * Cross-reference a favorite's timestamp with session data
 * to infer what mood/focus the user was in when they saved it.
 */
function inferFavoriteContext(favoritedAt, sessions) {
  if (!favoritedAt || !sessions || sessions.length === 0) return null;

  const favTime = new Date(favoritedAt).getTime();
  const WINDOW_MS = 30 * 60 * 1000;

  let closest = null;
  let closestDiff = Infinity;

  for (const session of sessions) {
    const sessionTime = new Date(session.createdAt || session.date).getTime();
    const diff = Math.abs(favTime - sessionTime);
    if (diff < WINDOW_MS && diff < closestDiff) {
      closestDiff = diff;
      closest = session;
    }
  }

  if (!closest) return null;

  const focusArea = closest.focusAreaId
    ? getFocusAreaById(closest.focusAreaId)
    : null;

  return {
    mood: closest.feeling?.label || closest.feeling || null,
    moodId: closest.feelingId || closest.feeling || null,
    focusArea: focusArea?.label || null,
    focusAreaId: closest.focusAreaId || null,
  };
}

/**
 * Get a reflective narrative based on the user's collection.
 */
function getCollectionNarrative(favorites) {
  if (!favorites || favorites.length === 0) return null;

  // Count focus areas across favorites
  const focusCounts = {};
  favorites.forEach(fav => {
    const focusId = fav.context?.focusAreaId;
    if (focusId) {
      focusCounts[focusId] = (focusCounts[focusId] || 0) + 1;
    }
  });

  const topFocus = Object.entries(focusCounts).sort((a, b) => b[1] - a[1])[0];
  if (topFocus && topFocus[1] >= 2) {
    const area = getFocusAreaById(topFocus[0]);
    if (area) {
      return `You've been drawn to ${area.label} most.`;
    }
  }

  if (favorites.length === 1) {
    return 'The first of many.';
  }
  if (favorites.length <= 3) {
    return 'A collection is forming.';
  }
  return 'These are the words that stayed with you.';
}

// --- Screen ---

export const FavoritesScreen = ({ navigation }) => {
  const { favorites, toggleFavorite } = useFavorites();
  const { user, stats } = useApp();
  const { selectionTap } = useHaptics();
  const [favoriteAffirmations, setFavoriteAffirmations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [removingId, setRemovingId] = useState(null);

  useEffect(() => {
    loadFavorites();
  }, [favorites, user]);

  const loadFavorites = async () => {
    try {
      if (user) {
        const [supabaseFavorites, userSessions] = await Promise.all([
          userProfileService.getFavorites(),
          sessionService.getSessions({ limit: 200 }),
        ]);

        if (supabaseFavorites && supabaseFavorites.length > 0) {
          const enriched = supabaseFavorites.map(fav => ({
            ...fav,
            context: inferFavoriteContext(fav.favoritedAt, userSessions),
          }));
          setFavoriteAffirmations(enriched);
        } else {
          setFavoriteAffirmations([]);
        }
      } else {
        const localFavorites = favorites
          .map(f => getAffirmationById(f.affirmationId))
          .filter(Boolean);
        setFavoriteAffirmations(localFavorites);
      }
    } catch (error) {
      console.log('Error loading favorites:', error.message);
      const localFavorites = favorites
        .map(f => getAffirmationById(f.affirmationId))
        .filter(Boolean);
      setFavoriteAffirmations(localFavorites);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveFavorite = async (affirmationId) => {
    selectionTap();
    // Show removing state briefly before actually removing
    setRemovingId(affirmationId);
    // Small delay so user sees the visual feedback
    setTimeout(async () => {
      await toggleFavorite(affirmationId);
      setFavoriteAffirmations(prev => prev.filter(a => a.id !== affirmationId));
      setRemovingId(null);
    }, 300);
  };

  const handleShare = async (affirmation) => {
    selectionTap();
    try {
      await Share.share({
        message: `"${affirmation.text}"\n\nA truth I'm holding onto.`,
      });
    } catch (error) {
      // User cancelled
    }
  };

  const collectionNarrative = useMemo(
    () => getCollectionNarrative(favoriteAffirmations),
    [favoriteAffirmations]
  );

  // --- Loading State ---
  if (isLoading) {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="dark-content" />
        <ScreenHeader
          title="Favorites"
          subtitle="Words that moved you"
          onBack={() => navigation.goBack()}
        />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.accent} />
        </View>
      </View>
    );
  }

  // --- Main Content ---
  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <ScreenHeader
        title="Favorites"
        subtitle="Words that moved you"
        onBack={() => navigation.goBack()}
      />

      {favoriteAffirmations.length > 0 && (
        <Animated.View entering={FadeIn.duration(400)} style={styles.narrativeHeader}>
          <Text style={styles.narrativeText}>{collectionNarrative}</Text>
          <Text style={styles.favoritesCount}>
            {favoriteAffirmations.length} affirmation{favoriteAffirmations.length !== 1 ? 's' : ''} saved
          </Text>
        </Animated.View>
      )}

      {favoriteAffirmations.length === 0 ? (
        /* Enriched Empty State */
        <Animated.View entering={FadeIn.duration(400)} style={styles.emptyState}>
          <FloatingParticles count={8} opacity={0.15} />
          <Ionicons name="heart-outline" size={48} color={COLORS.border} />
          <Text style={styles.emptyTitle}>Your Collection</Text>
          <Text style={styles.emptySubtitle}>
            {stats.totalSessions > 0
              ? `You've completed ${stats.totalSessions} session${stats.totalSessions !== 1 ? 's' : ''} \u2014 next time something resonates, hold it here.`
              : 'As you go through sessions, certain words will land differently. Save them here \u2014 over time, this becomes a mirror of what matters most to you.'}
          </Text>
          <PrimaryButton
            title="Begin a Session"
            onPress={() => navigation.navigate('AffirmTab', { screen: 'FocusSelection' })}
          />
        </Animated.View>
      ) : (
        /* Favorites List — warm card style */
        <FlatList
          data={favoriteAffirmations}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.content}
          renderItem={({ item: affirmation, index }) => {
            const entering = index < 10
              ? FadeInUp.delay(100 + index * 80).duration(400)
              : FadeInUp.duration(200);

            const contextLine = buildContextLine(affirmation);
            const moodEmoji = affirmation.context?.moodId
              ? getMoodEmoji(affirmation.context.moodId)
              : null;
            const isRemoving = removingId === affirmation.id;

            return (
              <Animated.View entering={entering} style={[isRemoving && { opacity: 0.4 }]}>
                <View style={styles.affirmationCard}>
                  {/* Context badge row */}
                  {(contextLine || moodEmoji) && (
                    <View style={styles.contextRow}>
                      {moodEmoji && (
                        <View style={styles.moodBadge}>
                          <Text style={styles.moodBadgeEmoji}>{moodEmoji}</Text>
                        </View>
                      )}
                      {contextLine && (
                        <Text style={styles.contextText}>{contextLine}</Text>
                      )}
                    </View>
                  )}

                  {/* Affirmation text */}
                  <Text style={styles.affirmationText}>{affirmation.text}</Text>

                  {/* Action row */}
                  <View style={styles.actionRow}>
                    <Pressable
                      onPress={() => handleShare(affirmation)}
                      style={styles.actionButton}
                      accessibilityRole="button"
                      accessibilityLabel="Share this affirmation"
                    >
                      <Ionicons name="share-outline" size={18} color={COLORS.textMuted} />
                    </Pressable>
                    <Pressable
                      onPress={() => handleRemoveFavorite(affirmation.id)}
                      style={styles.actionButton}
                      accessibilityRole="button"
                      accessibilityLabel="Remove from favorites"
                    >
                      <Ionicons
                        name={isRemoving ? 'heart-outline' : 'heart'}
                        size={18}
                        color={isRemoving ? COLORS.textMuted : COLORS.accent}
                      />
                    </Pressable>
                  </View>
                </View>
              </Animated.View>
            );
          }}
        />
      )}
    </View>
  );
};

// --- Context Line Builder ---

function buildContextLine(affirmation) {
  const relativeDate = affirmation.favoritedAt
    ? formatRelativeDate(affirmation.favoritedAt)
    : null;
  const focusLabel = affirmation.context?.focusArea;

  if (relativeDate && focusLabel) {
    return `Saved ${relativeDate} \u00B7 during ${focusLabel}`;
  }
  if (relativeDate) {
    return `Saved ${relativeDate}`;
  }
  return null;
}

// --- Styles ---

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },

  // Narrative header
  narrativeHeader: {
    paddingHorizontal: 20,
    marginBottom: 8,
  },
  narrativeText: {
    fontFamily: SERIF_ITALIC,
    fontSize: 16,
    fontStyle: 'italic',
    color: COLORS.textSecondary,
    lineHeight: 24,
    marginBottom: 6,
  },
  favoritesCount: {
    fontSize: 11,
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    color: COLORS.textMuted,
  },

  content: { padding: 20, gap: 14 },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Empty State
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
    paddingVertical: 60,
    paddingHorizontal: 32,
  },
  emptyTitle: {
    color: COLORS.textPrimary,
    fontSize: 20,
    fontWeight: '600',
  },
  emptySubtitle: {
    fontFamily: SERIF_ITALIC,
    fontSize: 15,
    fontStyle: 'italic',
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    maxWidth: 300,
  },

  // Affirmation Cards — warm, light, on-palette
  affirmationCard: {
    backgroundColor: COLORS.card,
    borderRadius: 20,
    padding: 20,
    borderLeftWidth: 3,
    borderLeftColor: COLORS.peach,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },

  // Context badge
  contextRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  moodBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: COLORS.surfaceTertiary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  moodBadgeEmoji: {
    fontSize: 12,
  },
  contextText: {
    fontSize: 12,
    fontWeight: '500',
    color: COLORS.textMuted,
    letterSpacing: 0.3,
  },

  // Affirmation text
  affirmationText: {
    fontFamily: SERIF_ITALIC,
    fontSize: 18,
    fontStyle: 'italic',
    color: COLORS.textPrimary,
    lineHeight: 28,
    letterSpacing: 0.2,
    marginBottom: 14,
  },

  // Action row
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    gap: 4,
  },
  actionButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.surfaceTertiary,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
