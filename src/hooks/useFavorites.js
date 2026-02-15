import { useCallback } from 'react';
import { useApp } from '../context/AppContext';
import { storageService } from '../services/storage';
import { userProfileService } from '../services/user';

export const useFavorites = () => {
  const { favorites, setFavorites, user } = useApp();

  const isFavorite = useCallback((affirmationId) => {
    return favorites.some(f => f.affirmationId === affirmationId || f.id === affirmationId);
  }, [favorites]);

  const toggleFavorite = useCallback(async (affirmationId) => {
    const isCurrentlyFavorite = isFavorite(affirmationId);

    if (user) {
      // Use Supabase for authenticated users
      try {
        if (isCurrentlyFavorite) {
          await userProfileService.removeFavorite(affirmationId);
          setFavorites(prev => prev.filter(f => f.affirmationId !== affirmationId && f.id !== affirmationId));
        } else {
          await userProfileService.addFavorite(affirmationId);
          setFavorites(prev => [...prev, { affirmationId, id: affirmationId }]);
        }
      } catch (error) {
        console.error('Error toggling favorite in Supabase:', error);
        // Don't update local state if Supabase fails
        return isCurrentlyFavorite;
      }
    } else {
      // Use local storage for unauthenticated users
      if (isCurrentlyFavorite) {
        await storageService.removeFavorite(affirmationId);
        setFavorites(prev => prev.filter(f => f.affirmationId !== affirmationId));
      } else {
        const newFavorite = await storageService.saveFavorite(affirmationId);
        setFavorites(prev => [...prev, newFavorite]);
      }
    }

    return !isCurrentlyFavorite;
  }, [isFavorite, setFavorites, user]);

  const getFavoriteAffirmations = useCallback(() => {
    return favorites.map(f => f.affirmationId || f.id);
  }, [favorites]);

  return {
    favorites,
    isFavorite,
    toggleFavorite,
    getFavoriteAffirmations,
    favoritesCount: favorites.length,
  };
};
