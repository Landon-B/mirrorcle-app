import React from 'react';
import { View, Text, StyleSheet, ScrollView, StatusBar, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { GradientBackground, PrimaryButton, Card } from '../components/common';
import { AFFIRMATIONS, getAffirmationById } from '../constants';
import { useFavorites } from '../hooks/useFavorites';

export const FavoritesScreen = ({ navigation }) => {
  const { favorites, toggleFavorite } = useFavorites();

  const favoriteAffirmations = favorites
    .map(f => getAffirmationById(f.affirmationId))
    .filter(Boolean);

  return (
    <GradientBackground>
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="light-content" />
        <View style={styles.header}>
          <Pressable onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </Pressable>
          <Text style={styles.title}>Favorites</Text>
          <View style={styles.placeholder} />
        </View>

        <ScrollView contentContainerStyle={styles.content}>
          {favoriteAffirmations.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="heart-outline" size={64} color="#475569" />
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
            <View style={styles.grid}>
              {favoriteAffirmations.map((affirmation) => (
                <Card key={affirmation.id} style={styles.affirmationCard}>
                  <LinearGradient
                    colors={affirmation.colors}
                    style={styles.cardGradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                  >
                    <Text style={styles.affirmationText}>"{affirmation.text}"</Text>
                    <Pressable
                      onPress={() => toggleFavorite(affirmation.id)}
                      style={styles.heartButton}
                    >
                      <Ionicons name="heart" size={20} color="#fff" />
                    </Pressable>
                  </LinearGradient>
                </Card>
              ))}
            </View>
          )}
        </ScrollView>
      </SafeAreaView>
    </GradientBackground>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(30, 41, 59, 0.6)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: { color: '#fff', fontSize: 20, fontWeight: '600' },
  placeholder: { width: 40 },
  content: { padding: 20, flexGrow: 1 },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
    paddingVertical: 60,
  },
  emptyTitle: { color: '#fff', fontSize: 20, fontWeight: '600' },
  emptySubtitle: { color: '#94A3B8', textAlign: 'center', maxWidth: 250 },
  grid: { gap: 16 },
  affirmationCard: { padding: 0, overflow: 'hidden' },
  cardGradient: { padding: 20, borderRadius: 20 },
  affirmationText: { color: '#fff', fontSize: 18, lineHeight: 26, marginBottom: 12 },
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
