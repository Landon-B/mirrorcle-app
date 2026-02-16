import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, StatusBar, Pressable, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { PrimaryButton } from '../components/common';
import { AFFIRMATIONS, getAffirmationById } from '../constants';
import { userProfileService } from '../services/user';
import { useFavorites } from '../hooks/useFavorites';
import { useApp } from '../context/AppContext';
import { getCardColors } from '../constants/cardPalette';
import { typography } from '../styles/typography';

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
        // For authenticated users, favorites from context already have full affirmation data
        const supabaseFavorites = await userProfileService.getFavorites();
        if (supabaseFavorites && supabaseFavorites.length > 0) {
          setFavoriteAffirmations(supabaseFavorites);
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
      // Fallback to local lookup
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
    // Remove from local state immediately for responsive UI
    setFavoriteAffirmations(prev => prev.filter(a => a.id !== affirmationId));
  };

  if (isLoading) {
    return (
      <View style={styles.container}>
        <SafeAreaView style={styles.safeArea}>
          <StatusBar barStyle="dark-content" />
          <View style={styles.header}>
            <Pressable onPress={() => navigation.goBack()} style={styles.backButton}>
              <Ionicons name="chevron-back" size={20} color="#7A756E" />
            </Pressable>
            <Text style={styles.title}>Favorites</Text>
            <View style={styles.placeholder} />
          </View>
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#C17666" />
          </View>
        </SafeAreaView>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="dark-content" />
        <View style={styles.header}>
          <Pressable onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="chevron-back" size={20} color="#7A756E" />
          </Pressable>
          <Text style={styles.title}>Favorites</Text>
          <View style={styles.placeholder} />
        </View>

        {favoriteAffirmations.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="heart-outline" size={64} color="#E8E4DF" />
            <Text style={styles.emptyTitle}>No favorites yet</Text>
            <Text style={styles.emptySubtitle}>
              Tap the heart icon on affirmations to save them here
            </Text>
            <PrimaryButton
              title="Browse Affirmations"
              onPress={() => navigation.navigate('AffirmationHome')}
            />
          </View>
        ) : (
          <FlatList
            data={favoriteAffirmations}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.content}
            renderItem={({ item: affirmation, index }) => (
              <LinearGradient
                colors={getCardColors(index)}
                style={styles.affirmationCard}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <Text style={styles.affirmationText}>{affirmation.text}</Text>
                <Pressable
                  onPress={() => handleRemoveFavorite(affirmation.id)}
                  style={styles.heartButton}
                  accessibilityRole="button"
                  accessibilityLabel="Remove from favorites"
                >
                  <Ionicons name="heart" size={20} color="#fff" />
                </Pressable>
              </LinearGradient>
            )}
          />
        )}
      </SafeAreaView>
    </View>
  );
};

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
  title: { color: '#2D2A26', fontSize: 20, fontWeight: '600' },
  placeholder: { width: 42 },
  content: { padding: 20, gap: 16 },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
    paddingVertical: 60,
  },
  emptyTitle: { color: '#2D2A26', fontSize: 20, fontWeight: '600' },
  emptySubtitle: { color: '#7A756E', textAlign: 'center', maxWidth: 250 },
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
    marginBottom: 12,
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
