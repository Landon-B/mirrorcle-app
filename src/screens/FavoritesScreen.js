import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, StatusBar, Pressable, ActivityIndicator, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeIn, FadeInUp } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { PrimaryButton, FloatingParticles } from '../components/common';
import { AFFIRMATIONS, getAffirmationById } from '../constants';
import { userProfileService } from '../services/user';
import { sessionService } from '../services/session';
import { useFavorites } from '../hooks/useFavorites';
import { useApp } from '../context/AppContext';
import { getCardColors } from '../constants/cardPalette';
import { typography } from '../styles/typography';
import { formatRelativeDate } from '../utils/dateUtils';
import { getFocusAreaById } from '../constants/focusAreas';

const SERIF_ITALIC = Platform.OS === 'ios' ? 'Georgia-Italic' : 'serif';

// --- Helpers ---

/**
 * Cross-reference a favorite's timestamp with session data
 * to infer what mood/focus the user was in when they saved it.
 * Returns null if no session is within the 30-minute window.
 */
function inferFavoriteContext(favoritedAt, sessions) {
  if (!favoritedAt || !sessions || sessions.length === 0) return null;

  const favTime = new Date(favoritedAt).getTime();
  const WINDOW_MS = 30 * 60 * 1000; // 30-minute window

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
    mood: closest.feeling?.label || null,
    focusArea: focusArea?.label || null,
  };
}

// --- Screen ---

export const FavoritesScreen = ({ navigation }) => {
  const { favorites, toggleFavorite } = useFavorites();
  const { user } = useApp();
  const [favoriteAffirmations, setFavoriteAffirmations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadFavorites();
  }, [favorites, user]);

  const loadFavorites = async () => {
    try {
      if (user) {
        // Fetch favorites + full session data in parallel for context inference
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
        // For unauthenticated users, look up affirmations from local constants
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
    await toggleFavorite(affirmationId);
    setFavoriteAffirmations(prev => prev.filter(a => a.id !== affirmationId));
  };

  // --- Loading State ---
  if (isLoading) {
    return (
      <View style={styles.container}>
        <SafeAreaView style={styles.safeArea}>
          <StatusBar barStyle="dark-content" />
          <View style={styles.header}>
            <Pressable onPress={() => navigation.goBack()} style={styles.backButton}>
              <Ionicons name="chevron-back" size={20} color="#7A756E" />
            </Pressable>
            <View style={styles.headerCenter}>
              <Text style={styles.title}>Favorites</Text>
              <Text style={styles.headerSubtitle}>Words that moved you</Text>
            </View>
            <View style={styles.placeholder} />
          </View>
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#C17666" />
          </View>
        </SafeAreaView>
      </View>
    );
  }

  // --- Main Content ---
  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="dark-content" />

        {/* Emotional Header */}
        <View style={styles.header}>
          <Pressable onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="chevron-back" size={20} color="#7A756E" />
          </Pressable>
          <View style={styles.headerCenter}>
            <Text style={styles.title}>Favorites</Text>
            <Text style={styles.headerSubtitle}>Words that moved you</Text>
          </View>
          <View style={styles.placeholder} />
        </View>

        {favoriteAffirmations.length > 0 && (
          <Text style={styles.favoritesCount}>
            {favoriteAffirmations.length} affirmation{favoriteAffirmations.length !== 1 ? 's' : ''} saved
          </Text>
        )}

        {favoriteAffirmations.length === 0 ? (
          /* Enriched Empty State */
          <Animated.View entering={FadeIn.duration(400)} style={styles.emptyState}>
            <FloatingParticles count={8} opacity={0.15} />
            <Ionicons name="heart-outline" size={48} color="#E8E4DF" />
            <Text style={styles.emptyTitle}>Your Collection</Text>
            <Text style={styles.emptySubtitle}>
              As you go through sessions, certain words will land differently.
              Save them here — over time, this becomes a mirror of what matters most to you.
            </Text>
            <PrimaryButton
              title="Begin a Session"
              onPress={() => navigation.navigate('AffirmTab', { screen: 'FocusSelection' })}
            />
          </Animated.View>
        ) : (
          /* Favorites List with Context */
          <FlatList
            data={favoriteAffirmations}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.content}
            renderItem={({ item: affirmation, index }) => {
              // Stagger first 10 cards, then instant
              const entering = index < 10
                ? FadeInUp.delay(100 + index * 120).duration(400)
                : FadeInUp.duration(200);

              const contextLine = buildContextLine(affirmation);

              return (
                <Animated.View entering={entering}>
                  <LinearGradient
                    colors={affirmation.colors || getCardColors(index)}
                    style={styles.affirmationCard}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                  >
                    <Text style={styles.affirmationText}>{affirmation.text}</Text>
                    {contextLine && (
                      <Text style={styles.contextText}>{contextLine}</Text>
                    )}
                    <Pressable
                      onPress={() => handleRemoveFavorite(affirmation.id)}
                      style={styles.heartButton}
                      accessibilityRole="button"
                      accessibilityLabel="Remove from favorites"
                    >
                      <Ionicons name="heart" size={20} color="#fff" />
                    </Pressable>
                  </LinearGradient>
                </Animated.View>
              );
            }}
          />
        )}
      </SafeAreaView>
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
    return `Saved ${relativeDate} · during a ${focusLabel} session`;
  }
  if (relativeDate) {
    return `Saved ${relativeDate}`;
  }
  return null;
}

// --- Styles ---

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F2EE' },
  safeArea: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  backButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#F0ECE7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerCenter: {
    alignItems: 'center',
  },
  title: { color: '#2D2A26', fontSize: 20, fontWeight: '600' },
  headerSubtitle: {
    fontFamily: SERIF_ITALIC,
    fontSize: 13,
    fontStyle: 'italic',
    color: '#7A756E',
    marginTop: 2,
  },
  placeholder: { width: 42 },
  favoritesCount: {
    fontSize: 11,
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    color: '#B0AAA2',
    paddingHorizontal: 20,
    marginBottom: 8,
  },
  content: { padding: 20, gap: 16 },
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
    color: '#2D2A26',
    fontSize: 20,
    fontWeight: '600',
  },
  emptySubtitle: {
    fontFamily: SERIF_ITALIC,
    fontSize: 15,
    fontStyle: 'italic',
    color: '#7A756E',
    textAlign: 'center',
    lineHeight: 24,
    maxWidth: 300,
  },

  // Affirmation Cards
  affirmationCard: {
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  affirmationText: {
    color: '#FFFFFF',
    fontFamily: typography.fontFamily.display,
    fontSize: 18,
    lineHeight: 28,
    letterSpacing: 0.3,
    marginBottom: 8,
  },
  contextText: {
    fontSize: 12,
    fontWeight: '500',
    color: 'rgba(255, 255, 255, 0.7)',
    marginBottom: 8,
  },
  heartButton: {
    alignSelf: 'flex-end',
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
