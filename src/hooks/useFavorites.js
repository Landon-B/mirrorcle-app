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
      // Optimistic UI — update heart immediately
      if (isCurrentlyFavorite) {
        setFavorites(prev => prev.filter(f => f.affirmationId !== affirmationId && f.id !== affirmationId));
      } else {
        setFavorites(prev => [...prev, { affirmationId, id: affirmationId }]);
      }

      // Sync to Supabase in background, revert on failure
      try {
        if (isCurrentlyFavorite) {
          await userProfileService.removeFavorite(affirmationId);
        } else {
          await userProfileService.addFavorite(affirmationId);
        }
      } catch (error) {
        console.error('Error toggling favorite in Supabase:', error);
        // Revert optimistic update
        if (isCurrentlyFavorite) {
          setFavorites(prev => [...prev, { affirmationId, id: affirmationId }]);
        } else {
          setFavorites(prev => prev.filter(f => f.affirmationId !== affirmationId && f.id !== affirmationId));
        }
        return isCurrentlyFavorite;
      }
    } else {
      // Use local storage for unauthenticated users
      if (isCurrentlyFavorite) {
        setFavorites(prev => prev.filter(f => f.affirmationId !== affirmationId));
        await storageService.removeFavorite(affirmationId);
      } else {
        setFavorites(prev => [...prev, { affirmationId, id: affirmationId }]);
        const newFavorite = await storageService.saveFavorite(affirmationId);
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
